import { Op } from 'sequelize';
import {
  BILLING_ACTION,
  BILLING_STATUS,
  BILLING_TYPE,
} from '../constants/enum';
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

  public static async viewWallet(walletId: string) {
    return await Wallet.findByPk(walletId, {
      include: [Billing],
    });
  }
}
