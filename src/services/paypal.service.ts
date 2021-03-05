import paypal from 'paypal-rest-sdk';
import { CURRENCY } from '../constants/constants';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

export default class PaypalService {
  public static async createOrder(intent: string, value: string) {
    const payment = {
      intent: `${intent}`,
      payer: { payment_method: `paypal` },
      redirect_urls: {
        return_url: 'http://localhost:3000/success', //placeholder
        cancel_url: 'http://localhost:3000/err', //placeholder
      },
      transactions: [
        {
          amount: { total: `${value}`, currency: `${CURRENCY}` },
          description: 'testing api',
        },
      ],
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

  public static async setupPaypal() {
    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
    await paypal.configure({
      mode: 'sandbox',
      client_id: PAYPAL_CLIENT_ID,
      client_secret: PAYPAL_CLIENT_SECRET,
    });
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
}
