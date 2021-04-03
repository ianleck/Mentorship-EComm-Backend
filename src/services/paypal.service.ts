import { Op } from 'sequelize';
import {
  CURRENCY,
  MARKET_FEE,
  ORDER_INTENT,
  PAYMENT_METHOD,
  PAYPAL_FEE,
  RECIPIENT_TYPE,
  STARTING_BALANCE,
  WITHDRAWAL_TITLE,
} from '../constants/constants';
import {
  BILLING_STATUS,
  BILLING_TYPE,
  CONTRACT_PROGRESS_ENUM,
} from '../constants/enum';
import { ERRORS } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { Cart } from '../models/Cart';
import { Course } from '../models/Course';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
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
export default class PaypalService {
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

  public static async createRefund() {}

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
            currency: `${CURRENCY}`,
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
          await mentorshipContract.update({ mentorPassCount: numSlots });
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
            BILLING_TYPE.MENTORSHIP
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
