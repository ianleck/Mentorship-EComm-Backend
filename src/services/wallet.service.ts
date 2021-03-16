import { Op } from 'sequelize';
import { WITHDRAWAL_DAYS } from '../constants/constants';
import { BILLING_STATUS, USER_TYPE_ENUM } from '../constants/enum';
import { WALLET_ERROR } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
export default class WalletService {
  public static async createCourseBilling(
    amount: number,
    currency: string,
    courseId: string,
    studentId: string,
    status: BILLING_STATUS
  ) {
    const student = await User.findByPk(studentId);
    const admin = await Admin.findOne({
      where: { walletId: { [Op.not]: null } },
    });

    const newBilling = new Billing({
      courseId,
      amount: amount,
      currency: currency,
      senderWalletId: student.walletId,
      receiverWalletId: admin.walletId,
      status,
    });

    return await newBilling.save();
  }

  public static async createSenseiBilling(
    amount: number,
    platformFee: number,
    currency: string,
    courseId: string,
    courseContractId: string,
    adminWalletId: string,
    senseiWalletId: string,
    status: BILLING_STATUS
  ) {
    const senseiWallet = await Wallet.findByPk(senseiWalletId);
    const pendingAmount = senseiWallet.pendingAmount + amount;
    const totalEarned = senseiWallet.totalEarned + amount;

    await senseiWallet.update({ pendingAmount, totalEarned });

    const withdrawableDate = new Date();
    withdrawableDate.setDate(withdrawableDate.getDate() + WITHDRAWAL_DAYS);

    const newBilling = new Billing({
      courseId,
      courseContractId,
      amount: amount,
      currency: currency,
      platformFee,
      senderWalletId: adminWalletId,
      receiverWalletId: senseiWalletId,
      status,
      withdrawableDate,
    });

    return await newBilling.save();
  }

  public static async updatePaymentId(billings: Billing[], paymentId: string) {
    await Promise.all(
      billings.map(async (billing) => {
        await billing.update({
          paypalPaymentId: paymentId,
        });
      })
    );
  }

  public static async setupWallet(accountId: string) {
    let wallet = await Wallet.findOne({ where: { accountId } });
    if (!wallet) {
      wallet = new Wallet({
        accountId,
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
        { model: Billing, as: 'BillingsSent' },
        { model: Billing, as: 'BillingsReceived' },
      ],
    });
  }
}
