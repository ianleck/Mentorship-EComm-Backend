import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR } from '../constants/errors';
import WalletService from '../services/wallet.service';
import apiResponse from '../utilities/apiResponse';

export class WalletController {
  public static async viewBillingsByFilter(req, res) {
    try {
      const { filter } = req.body;
      const billings = await WalletService.viewBillingsByFilter(filter);
      return apiResponse.result(
        res,
        { message: 'success', billings },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewBilling]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async viewWithdrawalsByFilter(req, res) {
    try {
      const { filter } = req.body;
      const withdrawals = await WalletService.viewWithdrawalsByFilter(filter);

      return apiResponse.result(
        res,
        {
          message: 'success',
          withdrawals,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewWithdrawalsByFilter]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async viewListOfWallets(req, res) {
    try {
      const userWallets = await WalletService.viewListOfWallets();

      return apiResponse.result(
        res,
        {
          message: 'success',
          userWallets,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewListOfWallets]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async viewWallet(req, res) {
    try {
      const { user } = req;
      const { walletId } = req.params;

      const wallet = await WalletService.viewWallet(
        walletId,
        user.accountId,
        user.userType
      );
      return apiResponse.result(
        res,
        { message: 'success', wallet },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewWallet]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async withdrawBalance(req, res) {
    try {
      const { user } = req;
      const { walletId } = req.params;
      const withdrawalApplication = await WalletService.withdrawBalance(
        walletId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: 'success', withdrawalApplication },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.withdrawBalance]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
