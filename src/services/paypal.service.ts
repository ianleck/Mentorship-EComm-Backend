import paypal from 'paypal-rest-sdk';
import { Op } from 'sequelize';
import {
  CURRENCY,
  ORDER_INTENT,
  PAYMENT_METHOD,
  STARTING_BALANCE,
} from '../constants/constants';
import {
  BILLING_ACTION,
  BILLING_STATUS,
  BILLING_TYPE,
} from '../constants/enum';
import { ERRORS } from '../constants/errors';
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { User } from '../models/User';
import WalletService from './wallet.service';
export default class PaypalService {
  public static async createOrder(
    courseIds: string[],
    mentorshipListingIds: string[],
    accountId: string
  ) {
    const student = await User.findByPk(accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const {
      populatedTransactions,
      totalPrice,
    } = await this.populateCourseTransactions(courseIds, mentorshipListingIds);

    const payment = {
      intent: `${ORDER_INTENT}`,
      payer: { payment_method: `${PAYMENT_METHOD}` },
      redirect_urls: {
        return_url: 'http://localhost:3000/success', //placeholder
        cancel_url: 'http://localhost:3000/err', //placeholder
      },
      transactions: populatedTransactions,
    };

    const billingOptions = {
      accountId,
      amount: totalPrice,
      currency: CURRENCY,
      type: BILLING_TYPE.ORDER,
      status: BILLING_STATUS.PENDING,
      action: BILLING_ACTION.AUTHORIZE,
    };

    await WalletService.addBillings(BILLING_TYPE.ORDER, billingOptions);
    return await { paypal, payment };
  }

  public static async populateCourseTransactions(
    courseIds: string[],
    mentorshipListingIds: string[]
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
    let totalPrice = STARTING_BALANCE;

    if (courses && courses.length > 0) {
      await Promise.all(
        courses.map((course: Course) => {
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

    return { populatedTransactions, totalPrice };
  }

  // Pass in subscriptionPlan Id
  public static async populateBillingPlanAttributes(
    subscriptionPlanId: string
  ) {
    const existingSubscription = await SubscriptionPlan.findByPk(
      subscriptionPlanId
    );

    const billingPlanAttributes = {
      name: existingSubscription.name,
    };
  }

  public static async populateBillingPlanUpdateAttributes() {}

  public static async setupPaypal() {
    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
    await paypal.configure({
      mode: 'sandbox',
      client_id: PAYPAL_CLIENT_ID,
      client_secret: PAYPAL_CLIENT_SECRET,
    });
  }
}
