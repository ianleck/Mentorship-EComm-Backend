import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import WalletService from '../services/wallet.service';
import apiResponse from '../utilities/apiResponse';

export class WalletController {
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

  public static async viewBilling(req, res) {
    try {
      const { user } = req;
      const { billingId, walletId } = req.params;
      const wallet = await WalletService.viewBilling(
        billingId,
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
}
