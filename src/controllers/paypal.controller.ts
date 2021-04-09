import httpStatusCodes from 'http-status-codes';
import paypal from 'paypal-rest-sdk';
import logger from '../config/logger';
import { ERRORS, WALLET_ERROR } from '../constants/errors';
import { REFUND_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import PaypalService from '../services/paypal.service';
import apiResponse from '../utilities/apiResponse';
export class PaypalController {
  // ============================== Orders ==============================
  public static async createOrder(req, res) {
    try {
      const { cartId } = req.body;
      const { user } = req;

      const payment = await PaypalService.createOrder(user.accountId, cartId);

      await paypal.payment.create(payment, async function (error, payment) {
        if (error) {
          throw new Error(error);
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
            return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
              message: 'no redirect URI present',
            });
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
      const { user } = req;
      const { paymentId, cartId } = req.query;
      const payerId = { payer_id: req.query.PayerID };

      await paypal.payment.execute(
        paymentId,
        payerId,
        async function (error, payment) {
          if (error) {
            return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
              message: 'unsuccessful payment',
            });
          } else {
            if (payment.state == 'approved') {
              await PaypalService.captureOrder(
                user,
                paymentId,
                payerId.payer_id,
                cartId
              );
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

  public static async viewOrder(req, res) {
    try {
      const { paymentId } = req.params;

      await paypal.payment.get(paymentId, function (error, payment) {
        if (error) {
          throw new Error(error);
        } else {
          console.log(JSON.stringify(payment, null, 2));
          return apiResponse.result(
            res,
            { message: 'success', payment },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[PaypalController.viewPayout]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  // ============================== Refunds ==============================
  public static async cancelRefundRequest(req, res) {
    try {
      const { refundRequestId } = req.params;
      const { user } = req;
      await PaypalService.cancelRefundRequest(refundRequestId, user.accountId);
      return apiResponse.result(
        res,
        { message: REFUND_RESPONSE.REQUEST_CANCEL },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[PaypalController.requestRefund]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.STUDENT_DOES_NOT_EXIST,
        WALLET_ERROR.REFUNDED,
        WALLET_ERROR.EXISTING_REFUND,
        WALLET_ERROR.REFUND_PERIOD_OVER,
      ]);
    }
  }

  public static async requestRefund(req, res) {
    try {
      const { contractId, contractType } = req.query;
      const { user } = req;
      const refundRequest = await PaypalService.requestRefund(
        contractId,
        contractType,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: REFUND_RESPONSE.REQUEST_CREATE, refundRequest },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[PaypalController.requestRefund]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.STUDENT_DOES_NOT_EXIST,
        WALLET_ERROR.REFUNDED,
        WALLET_ERROR.EXISTING_REFUND,
        WALLET_ERROR.REFUND_PERIOD_OVER,
      ]);
    }
  }

  // ============================== Payout ==============================
  public static async viewPayout(req, res) {
    try {
      const { payoutId } = req.params;

      await paypal.payout.get(payoutId, function (error, payout) {
        if (error) {
          throw new Error(error);
        } else {
          return apiResponse.result(
            res,
            { message: 'success', payout },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[PaypalController.viewPayout]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
