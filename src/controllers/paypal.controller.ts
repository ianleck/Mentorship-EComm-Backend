import httpStatusCodes from 'http-status-codes';
import paypal from 'paypal-rest-sdk';
import logger from '../config/logger';
import PaypalService from '../services/paypal.service';
import apiResponse from '../utilities/apiResponse';
export class PaypalController {
  public static async createOrder(req, res) {
    try {
      const { courseIds, mentorshipContractIds } = req.body;

      const { payment } = await PaypalService.createOrder(
        courseIds,
        mentorshipContractIds
      );

      await paypal.payment.create(payment, async function (error, payment) {
        if (error) {
          console.error(error);
        } else {
          //capture HATEOAS links
          let links = {};
          await payment.links.forEach(function (linkObj) {
            links[linkObj.rel] = {
              href: linkObj.href,
              method: linkObj.method,
            };
          });
          //if redirect url present, redirect user
          if (links.hasOwnProperty('approval_url')) {
            const paypalUrl = links['approval_url'].href;
            return apiResponse.result(
              res,
              { message: 'success', paypalUrl },
              httpStatusCodes.OK
            );
          } else {
            console.error('no redirect URI present');
          }
        }
      });
    } catch (e) {
      logger.error('[PaypalController.createOrder]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async captureOrder(req, res) {
    try {
      const { paymentId } = req.query;
      const payerId = { payer_id: req.query.PayerID };

      await paypal.payment.execute(
        paymentId,
        payerId,
        async function (error, payment) {
          if (error) {
            console.error(error);
          } else {
            if (payment.state == 'approved') {
              await PaypalService.captureOrder(paymentId, payerId.payer_id);
              return apiResponse.result(
                res,
                { message: 'success' },
                httpStatusCodes.OK
              );
            } else {
              return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
                message: 'unsuccessful payment',
              });
            }
          }
        }
      );
    } catch (e) {
      logger.error('[PaypalController.captureOrder]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
