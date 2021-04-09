import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR, WALLET_ERROR } from '../constants/errors';
import { WITHDRAWAL_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import WalletService from '../services/wallet.service';
import apiResponse from '../utilities/apiResponse';

export class WalletController {
  public static async viewBillingsByFilter(req, res) {
    try {
      const { filter } = req.query;
      const billings = await WalletService.viewBillingsByFilter(filter);
      return apiResponse.result(
        res,
        { message: 'success', billings },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewBillingsByFilter]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
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
      return Utility.apiErrorResponse(res, e, [WALLET_ERROR.UNAUTH_WALLET]);
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
        { message: WITHDRAWAL_RESPONSE.REQUEST_CREATE, withdrawalApplication },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.withdrawBalance]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        WALLET_ERROR.UNAUTH_WALLET,
        WALLET_ERROR.NO_MONEY,
        WALLET_ERROR.EXISTING_WITHDRAWAL,
      ]);
    }
  }

  public static async manualChronjob(req, res) {
    try {
      await WalletService.checkPendingSenseiBillings();
      return apiResponse.result(
        res,
        { message: 'success' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.manualChronjob]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: e.message,
      });
    }
  }
}
