import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import WalletService from '../services/wallet.service';
import apiResponse from '../utilities/apiResponse';

export class WalletController {
  public static async getAllBillings(req, res) {
    try {
      const billings = await WalletService.getAllBillings();
      return apiResponse.result(
        res,
        { message: 'success', billings },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.getAllBillings]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async viewCompletedWithdrawals(req, res) {
    try {
      const { user } = req;
      const { walletId } = req.params;
      const completedWithdrawals = await WalletService.viewCompletedWithdrawals(
        walletId,
        user.accountId,
        user.userType
      );
      return apiResponse.result(
        res,
        { message: 'success', completedWithdrawals },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewCompletedWithdrawals]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
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

  public static async viewBilling(req, res) {
    try {
      const { user } = req;
      const { billingId, walletId } = req.params;
      const billing = await WalletService.viewBilling(
        billingId,
        walletId,
        user.accountId,
        user.userType
      );
      return apiResponse.result(
        res,
        { message: 'success', billing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[walletController.viewBilling]:' + e.message);
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
