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
import EmailService from './email.service';
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
  public static async approveWithdrawal(billingId: string) {
    const existingApplication = await Billing.findByPk(billingId);
    if (
      !existingApplication ||
      existingApplication.billingType !== BILLING_TYPE.WITHDRAWAL
    )
      throw new Error(WALLET_ERROR.MISSING_BILLING);

    if (existingApplication.status !== BILLING_STATUS.PENDING_WITHDRAWAL) {
      throw new Error(WALLET_ERROR.PAID_OUT);
    }

    const sensei = await User.findOne({
      where: { walletId: existingApplication.receiverWalletId },
    });
    const payout_json = await this.createWithdrawalPayout(
      existingApplication,
      sensei.email
    );

    return { payout_json, billing: existingApplication };
  }

  public static async createWithdrawalPayout(
    application: Billing,
    email: string
  ) {
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

  public static async postWithdrawalHelper(
    billing: Billing,
    paymentId: string
  ) {
    const wallet = await Wallet.findByPk(billing.receiverWalletId);
    const receiver = await User.findByPk(wallet.accountId);

    await billing.update({
      paypalPaymentId: paymentId,
      status: BILLING_STATUS.WITHDRAWN,
    });

    const newAmount = wallet.confirmedAmount - billing.amount;

    await wallet.update({
      confirmedAmount: newAmount,
    });

    await EmailService.sendEmail(receiver.email, 'withdrawalSuccess');
  }

  public static async rejectWithdrawal(billingId: string) {
    const existingApplication = await Billing.findByPk(billingId);
    if (
      !existingApplication ||
      existingApplication.billingType !== BILLING_TYPE.WITHDRAWAL
    )
      throw new Error(WALLET_ERROR.MISSING_BILLING);

    if (existingApplication.status !== BILLING_STATUS.PENDING_WITHDRAWAL) {
      throw new Error(WALLET_ERROR.PAID_OUT);
    }

    const billing = await Billing.findByPk(billingId);
    const wallet = await Wallet.findByPk(billing.receiverWalletId);
    const receiver = await User.findByPk(wallet.accountId);

    await EmailService.sendEmail(receiver.email, 'withdrawalFailure');
    return await existingApplication.update({
      status: BILLING_STATUS.REJECTED,
    });
  }

  // ============================== Refunds ==============================
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
        refundRequestId,
      },
      order: [['createdAt', 'DESC']],
    });
    if (paidBillings.length === 0)
      throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);

    let refundsToMake: RefundsToMake[] = [];

    // Populate refund details for course
    if (refundRequest.contractType === BILLING_TYPE.COURSE) {
      const courseContract = await CourseContract.findByPk(contractId);
      const course = await Course.findByPk(courseContract.courseId);

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
        title: course.title,
      };
    }

    if (refundRequest.contractType === BILLING_TYPE.MENTORSHIP) {
      const mentorshipContract = await MentorshipContract.findByPk(contractId);
      const mentorshipListing = await MentorshipListing.findByPk(
        mentorshipContract.mentorshipListingId
      );

      let remainingNumPasses = mentorshipContract.mentorPassCount;
      let totalPassesRefunded = 0;
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

        totalPassesRefunded += numPassesToRefund;
        const indivPassCost = Number(
          (billing.amount / billing.mentorPassCount).toFixed(2)
        );
        const totalCost = Number(
          (numPassesToRefund * indivPassCost).toFixed(2)
        );
        const paymentId = billing.paypalPaymentId;
        const refund_details = {
          amount: {
            currency: billing.currency,
            total: `${totalCost}`,
          },
        };
        refundsToMake.push({
          billing,
          paymentId,
          refund_details,
        });
      }
      const numPassLeft = Math.max(remainingNumPasses, 0);
      return {
        refundsToMake,
        student,
        refundRequest,
        title: mentorshipListing.name,
        numPassLeft,
        totalPassesRefunded,
      };
    }

    throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);
  }

  public static async approveRefund(
    refund: any,
    originalBilling: Billing,
    student: User,
    refundRequest: RefundRequest,
    accountId: string,
    numPassLeft?: number,
    totalPassesRefunded?: number
  ) {
    const admin = await Admin.findByPk(accountId);
    // 1. Create refund billing
    const refundBilling = await new Billing({
      paypalPaymentId: refund.id,
      refundRequestId: refundRequest.refundRequestId,
      productId: originalBilling.productId,
      contractId: originalBilling.contractId,
      amount: originalBilling.amount,
      currency: originalBilling.currency,
      senderWalletId: admin.walletId,
      receiverWalletId: student.walletId,
      status: BILLING_STATUS.REFUNDED,
      billingType: BILLING_TYPE.REFUND,
    }).save();
    // 2. Update refundRequest and destroy CouseContract/Update mentorPassCount to 0
    if (originalBilling.billingType === BILLING_TYPE.COURSE) {
      await refundRequest.update({
        billingId: refundBilling.billingId,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        adminId: accountId,
      });

      await CourseContract.destroy({
        where: { courseContractId: originalBilling.contractId },
      });
    }
    if (originalBilling.billingType === BILLING_TYPE.MENTORSHIP) {
      await refundRequest.update({
        billingId: refundBilling.billingId,
        mentorPassCount: totalPassesRefunded,
        approvalStatus: APPROVAL_STATUS.APPROVED,
        adminId: accountId,
      });

      await MentorshipContract.update(
        { mentorPassCount: numPassLeft },
        { where: { mentorshipContractId: originalBilling.contractId } }
      );
    }
  }

  public static async postApproveRefundHelper(
    refundsToMake: RefundsToMake[],
    accountId: string
  ) {
    const adminWallet = await Wallet.findOne({ where: { accountId } });
    const senseiWalletsDictionary = new Map<
      string,
      { pendingAmountToRemove: number; totalEarnedToRemove: number }
    >();
    let toDeductFromPlatformEarned = 0;
    let toDeductFromPlatformRevenue = 0;

    await Promise.all(
      refundsToMake.map(async (refund) => {
        const { billing, refund_details } = refund;
        const senseiBilling = await Billing.findOne({
          where: {
            contractId: billing.contractId,
            status: BILLING_STATUS.PENDING_120_DAYS,
          },
        });
        let toDeductFromSensei = 0;

        const refundedAmount = Number(refund_details.amount.total); // amount we refunded to student
        //1. Calculate how much to deduct
        const platformFee = Number((refundedAmount * MARKET_FEE).toFixed(2));
        const paypalFee = Number(
          (refundedAmount * PAYPAL_FEE + 0.5).toFixed(2)
        );
        toDeductFromSensei = refundedAmount - paypalFee - platformFee;
        toDeductFromPlatformEarned += refundedAmount - paypalFee;
        toDeductFromPlatformRevenue += platformFee;

        //2. Save amount to refund per sensei
        const senseiWalletToUpdate = senseiWalletsDictionary.get(
          senseiBilling.receiverWalletId
        );
        if (senseiWalletToUpdate) {
          const updatedPendingAmount =
            senseiWalletToUpdate.pendingAmountToRemove +
            Number(toDeductFromSensei.toFixed(2));
          const updatedTotalAmount =
            senseiWalletToUpdate.totalEarnedToRemove +
            Number(toDeductFromSensei.toFixed(2));
          senseiWalletsDictionary.set(senseiBilling.receiverWalletId, {
            pendingAmountToRemove: updatedPendingAmount,
            totalEarnedToRemove: updatedTotalAmount,
          });
        } else {
          senseiWalletsDictionary.set(senseiBilling.receiverWalletId, {
            pendingAmountToRemove: Number(toDeductFromSensei.toFixed(2)),
            totalEarnedToRemove: Number(toDeductFromSensei.toFixed(2)),
          });
        }

        //3. Destroy old sensei billing that is pending 120 days if fully refunded
        if (billing.amount === refundedAmount) {
          await senseiBilling.destroy();
        } else {
          const updatedAmount = senseiBilling.amount - toDeductFromSensei;
          const updatedFees = senseiBilling.platformFee - platformFee;
          await senseiBilling.update({
            amount: updatedAmount,
            platformFee: updatedFees,
          });
        }
      })
    );

    //4. Update admin wallet
    const totalEarned = Number(
      (adminWallet.totalEarned - toDeductFromPlatformEarned).toFixed(2)
    );
    const platformRevenue = Number(
      (adminWallet.platformRevenue - toDeductFromPlatformRevenue).toFixed(2)
    );
    await adminWallet.update({
      totalEarned,
      platformRevenue,
    });

    //5. Update sensei wallet
    await Promise.all(
      Array.from(senseiWalletsDictionary).map(
        async ([walletId, { pendingAmountToRemove, totalEarnedToRemove }]) => {
          const senseiWallet = await Wallet.findByPk(walletId);
          const pendingAmount =
            senseiWallet.pendingAmount - pendingAmountToRemove;
          const totalEarned = senseiWallet.totalEarned - totalEarnedToRemove;
          await senseiWallet.update({
            pendingAmount,
            totalEarned,
          });
        }
      )
    );
  }

  public static async rejectRefund(refundRequestId: string, accountId: string) {
    const refundRequest = await RefundRequest.findByPk(refundRequestId);
    if (!refundRequest) throw new Error(WALLET_ERROR.MISSING_REFUND_REQUEST);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.APPROVED)
      throw new Error(WALLET_ERROR.REFUNDED);
    if (refundRequest.approvalStatus === APPROVAL_STATUS.REJECTED)
      throw new Error(WALLET_ERROR.INVALID_REFUND_REQUEST);

    const receiver = await User.findByPk(refundRequest.studentId);
    let title;
    const relatedBillings = await Billing.findAll({
      where: { refundRequestId: refundRequest.refundRequestId },
    });
    if (relatedBillings[0].billingType === BILLING_TYPE.COURSE) {
      const billing = relatedBillings[0];
      await billing.update({ refundRequestId: null });
      const course = await Course.findByPk(billing.productId);
      title = course.title;
    }
    if (relatedBillings[0].billingType === BILLING_TYPE.MENTORSHIP) {
      await Promise.all(
        relatedBillings.map(async (billing) => {
          await billing.update({ refundRequestId: null });
        })
      );
      const mentorship = await MentorshipListing.findByPk(
        relatedBillings[0].productId
      );
      title = mentorship.name;
    }

    const additional = { title };
    await EmailService.sendEmail(receiver.email, 'refundFailure', additional);
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
          const totalCost = Number(
            (mentorPass.priceAmount * numSlots).toFixed(2)
          );
          totalPrice += totalCost;
        })
      );
    }

    const populatedTransactions = [
      {
        amount: { total: `${totalPrice.toFixed(2)}`, currency: `${CURRENCY}` },
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
          const platformFee = Number((coursePrice * MARKET_FEE).toFixed(2));
          const paypalFee = Number((coursePrice * PAYPAL_FEE + 0.5).toFixed(2));
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
          const mentorPassCost = Number(
            (mentorPass.priceAmount * numSlots).toFixed(2)
          );
          // 1. Update mentorshipContract for user
          const mentorshipContract = await MentorshipContract.findOne({
            where: {
              accountId: studentId,
              mentorshipListingId: mentorPass.mentorshipListingId,
              progress: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
            },
          });
          const mentorPassCount = mentorshipContract.mentorPassCount + numSlots;
          await mentorshipContract.update({
            mentorPassCount,
            progress: CONTRACT_PROGRESS_ENUM.ONGOING,
          });
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
          const platformFee = Number((mentorPassCost * MARKET_FEE).toFixed(2));
          const paypalFee = Number(
            (mentorPassCost * PAYPAL_FEE + 0.5).toFixed(2)
          );
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
