import httpStatusCodes from 'http-status-codes';
import paypal from 'paypal-rest-sdk';
import logger from '../config/logger';
import { BILLING_STATUS, BILLING_TYPE } from '../constants/enum';
import { ERRORS, WALLET_ERROR } from '../constants/errors';
import {
  REFUND_RESPONSE,
  WITHDRAWAL_RESPONSE,
} from '../constants/successMessages';
import Utility from '../constants/utility';
import EmailService from '../services/email.service';
import PaypalService from '../services/paypal.service';
import WalletService from '../services/wallet.service';
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
          return apiResponse.result(
            res,
            { message: 'success', payment },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[PaypalController.viewOrder]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  // ============================== Refunds ==============================
  public static async approveRefund(req, res) {
    try {
      const { refundRequestId } = req.params;
      const { user } = req;
      const {
        refundsToMake,
        student,
        refundRequest,
        title,
        numPassLeft,
        totalPassesRefunded,
      } = await PaypalService.populateApproveRefund(refundRequestId);

      await Promise.all(
        refundsToMake.map(async (refundToMake) => {
          const { billing, paymentId, refund_details } = refundToMake;
          await paypal.payment.get(paymentId, async function (error, payment) {
            if (error) {
              throw new Error(error);
            } else {
              const captureId = await payment.transactions[0]
                .related_resources[0].sale.id;

              await paypal.capture.refund(
                `${captureId}`,
                refund_details,
                async function (error, refund) {
                  if (error) {
                    throw new Error(error);
                  } else {
                    await PaypalService.approveRefund(
                      refund,
                      billing,
                      student,
                      refundRequest,
                      user.accountId,
                      numPassLeft,
                      totalPassesRefunded
                    );
                  }
                }
              );
            }
          });
        })
      );

      const additional = { title };
      await EmailService.sendEmail(student.email, 'refundSuccess', additional);

      const refunds = await WalletService.viewListOfRefunds(user.accountId);
      return apiResponse.result(
        res,
        { message: REFUND_RESPONSE.REQUEST_APPROVE, refunds },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[PaypalController.approveRefund]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.STUDENT_DOES_NOT_EXIST,
        WALLET_ERROR.MISSING_REFUND_REQUEST,
        WALLET_ERROR.INVALID_REFUND_REQUEST,
        WALLET_ERROR.REFUNDED,
      ]);
    }
  }

  public static async rejectRefund(req, res) {
    try {
      const { refundRequestId } = req.params;
      const { user } = req;

      await PaypalService.rejectRefund(refundRequestId, user.accountId);
      const refunds = await WalletService.viewListOfRefunds(user.accountId);
      return apiResponse.result(
        res,
        { message: REFUND_RESPONSE.REQUEST_REJECT, refunds },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[PaypalController.rejectRefund]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        WALLET_ERROR.MISSING_BILLING,
        WALLET_ERROR.INVALID_REFUND_REQUEST,
      ]);
    }
  }

  // ============================== Withdrawal ==============================
  public static async approveWithdrawal(req, res) {
    try {
      const { billingId } = req.params;

      const { payout_json, billing } = await PaypalService.approveWithdrawal(
        billingId
      );

      await paypal.payout.create(payout_json, async function (error, payout) {
        if (error) {
          throw new Error(error);
        } else {
          const payout_batch_id = payout.batch_header.payout_batch_id;

          await PaypalService.postWithdrawalHelper(billing, payout_batch_id);

          const filter = {
            status: BILLING_STATUS.PENDING_WITHDRAWAL,
            billingType: BILLING_TYPE.WITHDRAWAL,
          };

          const pendingWithdrawals = WalletService.viewBillingsByFilter(filter);
          return apiResponse.result(
            res,
            {
              message: WITHDRAWAL_RESPONSE.REQUEST_APPROVE,
              pendingWithdrawals,
            },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[PaypalController.approveWithdrawal]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        WALLET_ERROR.MISSING_BILLING,
        WALLET_ERROR.PAID_OUT,
      ]);
    }
  }

  public static async rejectWithdrawal(req, res) {
    try {
      const { billingId } = req.params;

      await PaypalService.rejectWithdrawal(billingId);

      const filter = {
        status: BILLING_STATUS.PENDING_WITHDRAWAL,
        billingType: BILLING_TYPE.WITHDRAWAL,
      };

      const pendingWithdrawals = WalletService.viewBillingsByFilter(filter);

      return apiResponse.result(
        res,
        { message: WITHDRAWAL_RESPONSE.REQUEST_REJECT, pendingWithdrawals },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[PaypalController.rejectWithdrawal]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        WALLET_ERROR.MISSING_BILLING,
        WALLET_ERROR.PAID_OUT,
      ]);
    }
  }

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
