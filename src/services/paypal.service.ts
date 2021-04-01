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
import { BILLING_STATUS, BILLING_TYPE } from '../constants/enum';
import { ERRORS } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import CourseService from './course.service';
import WalletService from './wallet.service';
export default class PaypalService {
  public static async captureOrder(
    user: User,
    paymentId: string,
    payerId: string
  ) {
    const senseiWalletsDictionary = new Map<
      string,
      { pendingAmountToAdd: number; totalEarnedToAdd: number }
    >();

    const studentId = user.accountId;
    const admin = await Admin.findOne({
      where: { walletId: { [Op.not]: null } },
    });
    const adminWallet = await Wallet.findByPk(admin.walletId);

    let newPlatformEarned = 0,
      newPlatformRevenue = 0;

    const billingsPending = await Billing.findAll({
      where: { paypalPaymentId: paymentId },
    });

    await Promise.all(
      billingsPending.map(async (billing) => {
        if (billing.billingType === BILLING_TYPE.COURSE) {
          // 1. Create courseContract for user
          const courseContract = await CourseService.createContract(
            studentId,
            billing.productId
          );

          // 2. Update billing with payerId
          await billing.update({
            paypalPayerId: payerId,
            contractId: courseContract.courseContractId,
            status: BILLING_STATUS.SUCCESS,
          });

          // 3. Calculate Revenue + Earnings
          const platformFee = billing.amount * MARKET_FEE;
          const paypalFee = billing.amount * PAYPAL_FEE + 0.5;
          const payable = billing.amount - paypalFee - platformFee;
          newPlatformEarned += billing.amount - paypalFee;
          newPlatformRevenue += platformFee;

          const course = await Course.findByPk(billing.productId);
          const sensei = await User.findByPk(course.accountId);

          // 4. Create billings from admin to sensei
          await WalletService.createSenseiBilling(
            Number(payable.toFixed(2)),
            Number(platformFee.toFixed(2)),
            billing.currency,
            billing.productId,
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
        } // else for mentorship
      })
    );

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

  public static async createOrder(
    courseIds: string[],
    mentorshipListingIds: string[],
    accountId: string
  ) {
    const student = await User.findByPk(accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const {
      populatedTransactions,
      billings,
    } = await this.populateCourseTransactions(
      courseIds,
      mentorshipListingIds,
      accountId
    );

    const payment = {
      intent: `${ORDER_INTENT}`,
      payer: { payment_method: `${PAYMENT_METHOD}` },
      redirect_urls: {
        return_url: 'http://localhost:3000/success', //placeholder
        cancel_url: 'http://localhost:3000/err', //placeholder
      },
      transactions: populatedTransactions,
    };

    return await { payment, billings };
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

  public static async populateCourseTransactions(
    courseIds: string[],
    mentorshipListingIds: string[],
    accountId: string
  ) {
    let courses, mentorshipListings;
    if (courseIds) {
      courses = await Course.findAll({
        where: {
          courseId: { [Op.in]: courseIds },
        },
      });
    }
    if (mentorshipListingIds) {
      mentorshipListings = await MentorshipListing.findAll({
        where: {
          mentorshipListingId: { [Op.in]: mentorshipListingIds },
        },
      });
    }

    const items = [];
    const billings: Billing[] = [];
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

          const billing = await WalletService.createCourseBilling(
            course.priceAmount,
            course.currency,
            course.courseId,
            accountId,
            BILLING_STATUS.PENDING_PAYMENT
          );
          billings.push(billing);
        })
      );
    }

    // Ignore mentorshipListings for now
    if (mentorshipListings && mentorshipListings.length > 0) {
      await Promise.all(
        mentorshipListings.map((mentorshipListing: MentorshipListing) => {
          items.push({
            name: mentorshipListing.name,
            description: mentorshipListing.description,
            quantity: '1',
            price: `${mentorshipListing.priceAmount}`,
            currency: `${CURRENCY}`,
          });
          totalPrice += mentorshipListing.priceAmount;
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

    return { populatedTransactions, billings };
  }
}
