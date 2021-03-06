import paypal from 'paypal-rest-sdk';
import { CURRENCY, ORDER_INTENT } from '../constants/constants';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

export default class PaypalService {
  // Should eventually only need to pass in courseId[],
  public static async createOrder(value: string, payment_method: string) {
    //Initialize
    await this.setupPaypal();

    const courseTransactions = await this.populateCourseTransactions(value); // To be replaced with coursesId

    const payment = {
      intent: `${ORDER_INTENT}`,
      payer: { payment_method: `${payment_method}` },
      redirect_urls: {
        return_url: 'http://localhost:3000/success', //placeholder
        cancel_url: 'http://localhost:3000/err', //placeholder
      },
      transactions: courseTransactions,
    };

    await paypal.payment.create(payment, function (error, payment) {
      if (error) {
        console.error(error);
      } else {
        //capture HATEOAS links
        var links = {};
        payment.links.forEach(function (linkObj) {
          links[linkObj.rel] = {
            href: linkObj.href,
            method: linkObj.method,
          };
        });

        //if redirect url present, redirect user
        if (links.hasOwnProperty('approval_url')) {
          console.log(links['approval_url'].href, 'link');
          return links['approval_url'].href;
        } else {
          console.error('no redirect URI present');
        }
      }
    });
  }

  public static async populateCourseTransactions(value: string) {
    const courseTransaction = [
      {
        amount: { total: `30.0`, currency: `${CURRENCY}` },
        description: 'testing api',
        item_list: {
          items: [
            {
              name: 'test1',
              description: 'test1',
              quantity: '1',
              price: `${value}`,
              currency: `${CURRENCY}`,
            },
            {
              name: 'test2',
              description: 'test2',
              quantity: '1',
              price: `${value}`,
              currency: `${CURRENCY}`,
            },
            {
              name: 'test3',
              description: 'test3',
              quantity: '1',
              price: `${value}`,
              currency: `${CURRENCY}`,
            },
          ],
        },
      },
      // {
      //   amount: { total: `${value}`, currency: `${CURRENCY}` },
      //   description: 'testing api 2 ',
      // },
    ];
    return courseTransaction;
  } // Get course description // Get course cost // Find courses this order is for

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
