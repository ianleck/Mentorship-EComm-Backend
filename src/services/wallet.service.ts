import { Op } from 'sequelize';
import {
  BILLING_ACTION,
  BILLING_STATUS,
  BILLING_TYPE,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { WALLET_ERROR } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
export default class WalletService {
  public static async addBillings(
    type: BILLING_TYPE,
    billingOptions: {
      accountId?: string;
      amount?: number;
      currency?: string;
      status?: BILLING_STATUS;
      action?: BILLING_ACTION;
      payerId?: string;
      paymentId?: string;
    }
  ) {
    if (type === BILLING_TYPE.ORDER) {
      const sender = await User.findByPk(billingOptions.accountId);
      const receiver = await Admin.findOne({
        where: { walletId: { [Op.not]: null } },
      });
      if (billingOptions.action === BILLING_ACTION.AUTHORIZE) {
        const newBilling = new Billing({
          amount: billingOptions.amount,
          currency: billingOptions.currency,
          senderWalletId: sender.walletId,
          receiverWalletId: receiver.walletId,
          status: billingOptions.status,
        });
        return await newBilling.save();
      }

      if (billingOptions.action === BILLING_ACTION.CAPTURE) {
        const pendBilling = await Billing.findOne({
          where: {
            senderWalletId: sender.walletId,
            receiverWalletId: receiver.walletId,
            status: BILLING_STATUS.PENDING,
          },
        });
        return await pendBilling.update({
          paypalPayerId: billingOptions.payerId,
          paypalPaymentId: billingOptions.paymentId,
          status: billingOptions.status,
        });
      }
    }
  }

  public static async setupWallet(ownerId: string) {
    let wallet = await Wallet.findOne({ where: { ownerId } });
    if (!wallet) {
      wallet = new Wallet({
        ownerId,
      });
      await wallet.save();
    }
    return wallet;
  }

  public static async getAllBillings() {
    return await Billing.findAll();
  }
  public static async viewBilling(
    billingId: string,
    walletId: string,
    accountId: string,
    userType: USER_TYPE_ENUM
  ) {
    let user;
    if (userType !== USER_TYPE_ENUM.ADMIN) {
      user = await User.findByPk(accountId);
    }
    if (!user || user.walletId !== walletId)
      throw new Error(WALLET_ERROR.UNAUTH_WALLET);

    const billing = await Billing.findByPk(billingId);
    return billing;
  }

  public static async viewWallet(
    walletId: string,
    accountId: string,
    userType: USER_TYPE_ENUM
  ) {
    let user;
    if (userType !== USER_TYPE_ENUM.ADMIN) {
      user = await User.findByPk(accountId);
    }
    if (!user || user.walletId !== walletId)
      throw new Error(WALLET_ERROR.UNAUTH_WALLET);

    return await Wallet.findByPk(walletId, {
      include: [
        { model: Billing, as: 'billingsSent' },
        { model: Billing, as: 'billingsReceived' },
      ],
    });
  }
}
