import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import {
  CURRENCY,
  MARKET_FEE,
  ORDER_INTENT,
  PAYMENT_METHOD,
  PAYPAL_FEE,
  RECIPIENT_TYPE,
  STARTING_BALANCE,
  WITHDRAWAL_DAYS,
  WITHDRAWAL_TITLE,
} from '../constants/constants';
import {
  APPROVAL_STATUS,
  BILLING_STATUS,
  BILLING_TYPE,
  CONTRACT_PROGRESS_ENUM,
} from '../constants/enum';
import { ERRORS, WALLET_ERROR } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { Cart } from '../models/Cart';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { RefundRequest } from '../models/RefundRequest';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import CourseService from './course.service';
import WalletService from './wallet.service';

export interface MentorPass extends MentorshipListing {
  CartToMentorshipListing: {
    cartId: string;
    mentorshipListingId: string;
    numSlots: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RefundDetails {
  amount: {
    currency: string;
    total: string;
  };
}

export interface RefundsToMake {
  billing: Billing;
  paymentId: string;
  refund_details: RefundDetails;
}

export default class PaypalService {
  // ============================== Withdrawals ==============================
  public static async createPayout(application: Billing, email: string) {
    const unixTime = Date.now();
    const sender_batch_id =
      application.senderWalletId + application.receiverWalletId + unixTime;
    const note = `Withdrawal for billingId: ${application.billingId} has been successfully approved. Please expect the payment to your paypal account at email address: ${email} shortly.`;
    const payout_json = {
      sender_batch_header: {
        sender_batch_id: `${sender_batch_id}`,
        email_subject: `${WITHDRAWAL_TITLE}`,
      },
      items: [
        {
          recipient_type: `${RECIPIENT_TYPE}`,
          amount: {
            value: application.amount,
            currency: application.currency,
          },
          receiver: `${email}`,
          note: `${note}`,
        },
      ],
    };

    return payout_json;
  }

  // ============================== Refunds ==============================
  // =============== Request Refunds ===============
  public static async cancelRefundRequest(
    refundRequestId: string,
    accountId: string
  ) {
    const existingRefund = await RefundRequest.findByPk(refundRequestId);
    if (!existingRefund) throw new Error(WALLET_ERROR.MISSING_REFUND_REQUEST);
    if (existingRefund.studentId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await existingRefund.destroy();
  }

  public static async requestRefund(
    contractId: string,
    contractType: string,
    accountId: string
  ) {
    try {
      const user = await User.findByPk(accountId);
      if (!user) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

      // Today - 120 days to be compared against createdAt; if createdAt is > today - 120 then it is still refundable
      const refundablePeriod = new Date();
      refundablePeriod.setDate(refundablePeriod.getDate() - WITHDRAWAL_DAYS);

      if (contractType === BILLING_TYPE.COURSE)
        return await this.requestCourseRefund(
          contractId,
          user,
          refundablePeriod
        );

      return await this.requestMentorPassRefund(
        contractId,
        user,
        refundablePeriod
      );
    } catch (e) {
      throw e;
    }
  }

  public static async requestCourseRefund(
    contractId: string,
    user: User,
    refundablePeriod: Date
  ) {
    const accountId = user.accountId;

    const existingRefund = await RefundRequest.findOne({
      where: { contractId, studentId: accountId },
    });

    if (existingRefund) {
      if (existingRefund.approvalStatus === APPROVAL_STATUS.APPROVED) {
        throw new Error(WALLET_ERROR.REFUNDED); // alr refund
      }
      throw new Error(WALLET_ERROR.EXISTING_REFUND); // pending refund
    }

    const billing = await Billing.findOne({
      where: {
        contractId,
        senderWalletId: user.walletId,
        status: BILLING_STATUS.PAID,
        billingType: BILLING_TYPE.COURSE,
      },
    });

    if (billing.createdAt < refundablePeriod)
      throw new Error(WALLET_ERROR.REFUND_PERIOD_OVER);

    const refundRequest = await new RefundRequest({
      contractId,
      studentId: accountId,
      contractType: BILLING_TYPE.COURSE,
    }).save();

    return await RefundRequest.findOne({
      where: { refundRequestId: refundRequest.refundRequestId },
      include: [
        {
          model: Billing,
          as: 'OriginalBillings',
          on: { billingId: billing.billingId },
          include: [{ model: Course, as: 'Course' }],
        },
      ],
    });
  }

  public static async requestMentorPassRefund(
    contractId: string,
    user: User,
    refundablePeriod: Date
  ) {
    const accountId = user.accountId;

    const existingRefunds = await RefundRequest.findAll({
      where: { contractId, studentId: accountId },
      order: [['createdAt', 'DESC']],
    });

    const mentorshipContract = await MentorshipContract.findByPk(contractId);

    if (existingRefunds.length >= 1) {
      const latestRefundRequest = existingRefunds[0];
      if (
        latestRefundRequest.approvalStatus === APPROVAL_STATUS.APPROVED &&
        mentorshipContract.mentorPassCount === 0
      ) {
        throw new Error(WALLET_ERROR.REFUNDED); // alr refund
      }
      if (latestRefundRequest.approvalStatus === APPROVAL_STATUS.PENDING)
        throw new Error(WALLET_ERROR.EXISTING_REFUND); // pending refund
    }

    const paidBillings = await Billing.findAll({
      where: {
        contractId,
        status: BILLING_STATUS.PAID,
        billingType: BILLING_TYPE.MENTORSHIP,
      },
      order: [['createdAt', 'DESC']],
    });

    let billingIds: string[] = [];
    let remainingNumPasses = mentorshipContract.mentorPassCount;
    for (let i = 0; i < paidBillings.length; i++) {
      if (remainingNumPasses <= 0) break;
      const billing = paidBillings[i];
      if (billing.createdAt < refundablePeriod) break;
      remainingNumPasses -= billing.mentorPassCount;
      billingIds.push(billing.billingId);
    }

    if (billingIds.length === 0)
      throw new Error(WALLET_ERROR.REFUND_PERIOD_OVER);

    const refundRequest = await new RefundRequest({
      contractId,
      studentId: accountId,
      contractType: BILLING_TYPE.MENTORSHIP,
    }).save();

    return await RefundRequest.findOne({
      where: { refundRequestId: refundRequest.refundRequestId },
      include: [
        {
          model: Billing,
          as: 'OriginalBillings',
          on: { billingId: { [Op.in]: billingIds } },
          include: [{ model: MentorshipListing, as: 'MentorshipListing' }],
        },
      ],
    });
  }

  // =============== Refund Approval/Rejection ===============
  public static async populateApproveRefund(refundRequestId: string) {
    const refundRequest = await RefundRequest.findByPk(refundRequestId);
    if (!refundRequest) throw new Error(WALLET_ERROR.MISSING_REFUND_REQUEST);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.APPROVED)
      throw new Error(WALLET_ERROR.REFUNDED);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.REJECTED)
      throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);

    const student = await User.findByPk(refundRequest.studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const contractId = refundRequest.contractId;

    const paidBillings = await Billing.findAll({
      where: {
        contractId,
        status: BILLING_STATUS.PAID,
      },
      order: [['createdAt', 'DESC']],
    });
    if (paidBillings.length === 0)
      throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);

    let refundsToMake: RefundsToMake[] = [];

    // Populate refund details for course
    if (paidBillings[0].billingType === BILLING_TYPE.COURSE) {
      const billing = paidBillings[0];
      const paymentId = billing.paypalPaymentId;
      const refund_details: RefundDetails = {
        amount: {
          currency: billing.currency,
          total: `${billing.amount}`,
        },
      };

      refundsToMake.push({ billing, paymentId, refund_details });
      return {
        refundsToMake,
        student,
        refundRequest,
      };
    }

    if (paidBillings[0].billingType === BILLING_TYPE.MENTORSHIP) {
      const mentorshipContract = await MentorshipContract.findByPk(contractId);
      let remainingNumPasses = mentorshipContract.mentorPassCount;
      // Today - 120 days to be compared against createdAt; if createdAt is > today - 120 then it is still refundable
      const refundablePeriod = new Date();
      refundablePeriod.setDate(refundablePeriod.getDate() - WITHDRAWAL_DAYS);

      for (let i = 0; i < paidBillings.length; i++) {
        if (remainingNumPasses <= 0) break;
        const billing = paidBillings[i];
        if (billing.createdAt < refundablePeriod) break;
        let numPassesToRefund = remainingNumPasses;
        if (remainingNumPasses >= billing.mentorPassCount) {
          remainingNumPasses -= billing.mentorPassCount;
          numPassesToRefund = billing.mentorPassCount;
        }
        const indivPassCost = Number(
          (billing.amount / billing.mentorPassCount).toFixed(2)
        );
        const totalCost = numPassesToRefund * indivPassCost;
        const paymentId = billing.paypalPaymentId;
        const refund_details = {
          amount: {
            currency: billing.currency,
            total: `${totalCost}`,
          },
        };
        refundsToMake.push({ billing, paymentId, refund_details });
      }
      const numPassLeft = Math.max(remainingNumPasses, 0);
      return { refundsToMake, student, refundRequest, numPassLeft };
    }

    throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);
  }

  public static async approveRefund(
    refund: any,
    originalBilling: Billing,
    student: User,
    refundRequest: RefundRequest,
    accountId: string,
    numPassLeft?: number
  ) {
    const admin = await Admin.findByPk(accountId);
    // 1. Create refund billing
    await new Billing({
      paypalPaymentId: refund.id,
      productId: originalBilling.productId,
      amount: originalBilling.amount,
      currency: originalBilling.currency,
      senderWalletId: admin.walletId,
      receiverWalletId: student.walletId,
      status: BILLING_STATUS.REFUNDED,
      billingType: BILLING_TYPE.REFUND,
    }).save();
    // 2. Update RefundRequest
    await refundRequest.update({
      approvalStatus: APPROVAL_STATUS.APPROVED,
      adminId: accountId,
    });

    // 3. Destroy CouseContract/Update mentorPassCount to 0
    if (originalBilling.billingType === BILLING_TYPE.COURSE) {
      await CourseContract.destroy({
        where: { courseContractId: originalBilling.contractId },
      });
    }
    if (originalBilling.billingType === BILLING_TYPE.MENTORSHIP) {
      await MentorshipContract.update(
        { mentorPassCount: numPassLeft },
        { where: { mentorshipContractId: originalBilling.contractId } }
      );
    }
  }

  public static async rejectRefund(refundRequestId: string, accountId: string) {
    const refundRequest = await RefundRequest.findByPk(refundRequestId);
    if (!refundRequest) throw new Error(WALLET_ERROR.MISSING_REFUND_REQUEST);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.APPROVED)
      throw new Error(WALLET_ERROR.REFUNDED);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.REJECTED)
      throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);

    await refundRequest.update({
      approvalStatus: APPROVAL_STATUS.REJECTED,
      adminId: accountId,
    });
  }

  // ============================== Order ==============================

  public static async createOrder(accountId: string, cartId: string) {
    const student = await User.findByPk(accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const populatedTransactions = await this.populateOrderTransactions(cartId);

    const payment = {
      intent: `${ORDER_INTENT}`,
      payer: { payment_method: `${PAYMENT_METHOD}` },
      redirect_urls: {
        return_url: 'http://localhost:3000/success', //placeholder
        cancel_url: 'http://localhost:3000/err', //placeholder
      },
      transactions: populatedTransactions,
    };

    return await payment;
  }

  public static async populateOrderTransactions(cartId: string) {
    const cart = await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });

    const courses = cart.Courses;
    const mentorPasses = cart.MentorPasses;

    const items = [];
    let totalPrice = STARTING_BALANCE;

    if (courses && courses.length > 0) {
      await Promise.all(
        courses.map(async (course: Course) => {
          items.push({
            name: course.title,
            description: course.description,
            quantity: '1',
            price: `${course.priceAmount}`,
            currency: course.currency,
          });
          totalPrice += course.priceAmount;
        })
      );
    }

    if (mentorPasses && mentorPasses.length > 0) {
      await Promise.all(
        mentorPasses.map(async (mentorPass: MentorPass) => {
          const numSlots = mentorPass.CartToMentorshipListing.numSlots;
          items.push({
            name: mentorPass.name,
            description: mentorPass.description,
            quantity: `${numSlots}`,
            price: `${mentorPass.priceAmount}`,
            currency: mentorPass.currency,
          });
          const totalCost = mentorPass.priceAmount * numSlots;
          totalPrice += totalCost;
        })
      );
    }

    const populatedTransactions = [
      {
        amount: { total: `${totalPrice}`, currency: `${CURRENCY}` },
        description: `DigiDojo Order Checkout`,
        item_list: {
          items,
        },
      },
    ];

    return populatedTransactions;
  }

  public static async captureOrder(
    user: User,
    paymentId: string,
    payerId: string,
    cartId: string
  ) {
    // Initialise variables
    const senseiWalletsDictionary = new Map<
      string,
      { pendingAmountToAdd: number; totalEarnedToAdd: number }
    >();

    const studentId = user.accountId;
    const admin = await Admin.findOne({
      where: { walletId: { [Op.not]: null } },
    });
    const adminWallet = await Wallet.findByPk(admin.walletId);
    const cart = await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
    const courses = cart.Courses;
    const mentorPasses = cart.MentorPasses;

    let newPlatformEarned = 0,
      newPlatformRevenue = 0;

    if (courses && courses.length > 0) {
      await Promise.all(
        courses.map(async (course: Course) => {
          const coursePrice = course.priceAmount;
          // 1. Create courseContract for user
          const courseContract = await CourseService.createContract(
            studentId,
            course.courseId
          );
          // 2. Create billing for course
          await WalletService.createOrderBilling(
            studentId,
            paymentId,
            payerId,
            course.courseId,
            courseContract.courseContractId,
            coursePrice,
            course.currency,
            BILLING_STATUS.PAID,
            BILLING_TYPE.COURSE
          );
          // 3. Calculate Revenue + Earnings
          const platformFee = coursePrice * MARKET_FEE;
          const paypalFee = coursePrice * PAYPAL_FEE + 0.5;
          const payable = coursePrice - paypalFee - platformFee;
          newPlatformEarned += coursePrice - paypalFee;
          newPlatformRevenue += platformFee;
          // 4. Create billings from admin to sensei
          const sensei = await User.findByPk(course.accountId);
          await WalletService.createSenseiBilling(
            Number(payable.toFixed(2)),
            Number(platformFee.toFixed(2)),
            course.currency,
            course.courseId,
            courseContract.courseContractId,
            admin.walletId,
            sensei.walletId,
            BILLING_STATUS.PENDING_120_DAYS,
            BILLING_TYPE.COURSE
          );
          //5. Add sensei wallet to dictionary to update amount later
          const senseiWalletToUpdate = senseiWalletsDictionary.get(
            sensei.walletId
          );
          if (senseiWalletToUpdate) {
            const updatedPendingAmount =
              senseiWalletToUpdate.pendingAmountToAdd +
              Number(payable.toFixed(2));
            const updatedTotalAmount =
              senseiWalletToUpdate.totalEarnedToAdd +
              Number(payable.toFixed(2));
            senseiWalletsDictionary.set(sensei.walletId, {
              pendingAmountToAdd: updatedPendingAmount,
              totalEarnedToAdd: updatedTotalAmount,
            });
          } else {
            senseiWalletsDictionary.set(sensei.walletId, {
              pendingAmountToAdd: Number(payable.toFixed(2)),
              totalEarnedToAdd: Number(payable.toFixed(2)),
            });
          }
        })
      );
    }

    if (mentorPasses && mentorPasses.length > 0) {
      await Promise.all(
        mentorPasses.map(async (mentorPass: MentorPass) => {
          const numSlots = mentorPass.CartToMentorshipListing.numSlots;
          // Total cost = price * quantity
          const mentorPassCost = mentorPass.priceAmount * numSlots;
          // 1. Update mentorshipContract for user
          const mentorshipContract = await MentorshipContract.findOne({
            where: {
              accountId: studentId,
              mentorshipListingId: mentorPass.mentorshipListingId,
              progress: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
            },
          });
          const mentorPassCount = mentorshipContract.mentorPassCount + numSlots;
          await mentorshipContract.update({ mentorPassCount });
          // 2. Create billing for mentorship
          await WalletService.createOrderBilling(
            studentId,
            paymentId,
            payerId,
            mentorPass.mentorshipListingId,
            mentorshipContract.mentorshipContractId,
            mentorPassCost,
            mentorPass.currency,
            BILLING_STATUS.PAID,
            BILLING_TYPE.MENTORSHIP,
            numSlots
          );
          // 3. Calculate Revenue + Earnings
          const platformFee = mentorPassCost * MARKET_FEE;
          const paypalFee = mentorPassCost * PAYPAL_FEE + 0.5;
          const payable = mentorPassCost - paypalFee - platformFee;
          newPlatformEarned += mentorPassCost - paypalFee;
          newPlatformRevenue += platformFee;
          // 4. Create billings from admin to sensei
          const sensei = await User.findByPk(mentorPass.accountId);
          await WalletService.createSenseiBilling(
            Number(payable.toFixed(2)),
            Number(platformFee.toFixed(2)),
            mentorPass.currency,
            mentorPass.mentorshipListingId,
            mentorshipContract.mentorshipContractId,
            admin.walletId,
            sensei.walletId,
            BILLING_STATUS.PENDING_120_DAYS,
            BILLING_TYPE.MENTORSHIP
          );
          //5. Add sensei wallet to dictionary to update amount later
          const senseiWalletToUpdate = senseiWalletsDictionary.get(
            sensei.walletId
          );
          if (senseiWalletToUpdate) {
            const updatedPendingAmount =
              senseiWalletToUpdate.pendingAmountToAdd +
              Number(payable.toFixed(2));
            const updatedTotalAmount =
              senseiWalletToUpdate.totalEarnedToAdd +
              Number(payable.toFixed(2));
            senseiWalletsDictionary.set(sensei.walletId, {
              pendingAmountToAdd: updatedPendingAmount,
              totalEarnedToAdd: updatedTotalAmount,
            });
          } else {
            senseiWalletsDictionary.set(sensei.walletId, {
              pendingAmountToAdd: Number(payable.toFixed(2)),
              totalEarnedToAdd: Number(payable.toFixed(2)),
            });
          }
        })
      );
    }

    const totalEarned = Number(
      (adminWallet.totalEarned + newPlatformEarned).toFixed(2)
    );
    const platformRevenue = Number(
      (adminWallet.platformRevenue + newPlatformRevenue).toFixed(2)
    );

    // 6. Update admin wallet
    await adminWallet.update({
      totalEarned,
      platformRevenue,
    });
    // 7. Update sensei wallet
    return await Promise.all(
      Array.from(senseiWalletsDictionary).map(
        async ([walletId, { pendingAmountToAdd, totalEarnedToAdd }]) => {
          const senseiWallet = await Wallet.findByPk(walletId);
          const pendingAmount = senseiWallet.pendingAmount + pendingAmountToAdd;
          const totalEarned = senseiWallet.totalEarned + totalEarnedToAdd;
          await senseiWallet.update({
            pendingAmount,
            totalEarned,
          });
        }
      )
    );
  }
}
