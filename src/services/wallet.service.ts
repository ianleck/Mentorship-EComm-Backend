import { Op } from 'sequelize';
import { WITHDRAWAL_DAYS } from '../constants/constants';
import {
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
  // ============================== Billings ==============================
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
      productId: courseId,
      amount: amount,
      currency: currency,
      senderWalletId: student.walletId,
      receiverWalletId: admin.walletId,
      status,
      billingType: BILLING_TYPE.COURSE,
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
      productId: courseId,
      contractId: courseContractId,
      amount: amount,
      currency: currency,
      platformFee,
      senderWalletId: adminWalletId,
      receiverWalletId: senseiWalletId,
      status,
      withdrawableDate,
      billingType: BILLING_TYPE.INTERNAL,
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
  // ============================== Wallet ==============================

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

  // ============================== Withdrawals ==============================

  public static async approveWithdrawal(billingId: string) {
    const existingApplication = await Billing.findByPk(billingId);
    if (!existingApplication) throw new Error(WALLET_ERROR.MISSING_BILLING);

    const sensei = await User.findOne({
      where: { walletId: existingApplication.receiverWalletId },
    });
    const senseiWallet = await Wallet.findByPk(
      existingApplication.receiverWalletId
    );

    // Perform payout. Will leave for next PR
    // Set confirmedAmount to 0

    return await Billing.findAll({
      where: { status: BILLING_STATUS.PENDING_WITHDRAWAL },
    });
  }

  public static async viewCompletedWithdrawals(
    walletId: string,
    accountId: string,
    userType: USER_TYPE_ENUM
  ) {
    const user = await User.findByPk(accountId);

    if (
      userType === USER_TYPE_ENUM.STUDENT ||
      (userType === USER_TYPE_ENUM.SENSEI && user.walletId !== walletId)
    )
      throw new Error(WALLET_ERROR.UNAUTH_WALLET);

    let whereOptions = {};
    if (userType === USER_TYPE_ENUM.ADMIN) {
      whereOptions = {
        where: {
          status: BILLING_STATUS.WITHDRAWN,
          billingType: BILLING_TYPE.WITHDRAWAL,
        },
      };
    }
    if (userType === USER_TYPE_ENUM.SENSEI) {
      whereOptions = {
        where: {
          receiverWalletId: walletId,
          status: BILLING_STATUS.WITHDRAWN,
          billingType: BILLING_TYPE.WITHDRAWAL,
        },
      };
    }

    return await Billing.findAll(whereOptions);
  }

  public static async viewPendingWithdrawals() {
    return await Billing.findAll({
      where: { status: BILLING_STATUS.PENDING_WITHDRAWAL },
    });
  }

  public static async withdrawBalance(walletId: string, accountId: string) {
    const user = await User.findByPk(accountId);
    const admin = await Admin.findOne({
      where: { walletId: { [Op.not]: null } },
    });

    if (!user || user.walletId !== walletId)
      throw new Error(WALLET_ERROR.UNAUTH_WALLET);

    const senseiWallet = await Wallet.findByPk(walletId);

    const withdrawableAmount = senseiWallet.confirmedAmount;
    if (withdrawableAmount === 0) throw new Error(WALLET_ERROR.NO_MONEY);

    const existingApplication = await Billing.findOne({
      where: { status: BILLING_STATUS.PENDING_WITHDRAWAL },
    });
    if (existingApplication) throw new Error(WALLET_ERROR.EXISTING_WITHDRAWAL);

    const withdrawalApplication = await new Billing({
      amount: withdrawableAmount,
      senderWalletId: admin.walletId,
      receiverWalletId: walletId,
      status: BILLING_STATUS.PENDING_WITHDRAWAL,
      billingType: BILLING_TYPE.WITHDRAWAL,
    }).save();

    return withdrawalApplication;
  }

  // ============================== Cronjob ==============================
  // Works. Just need to add to cronjob
  public static async checkPendingSenseiBillings() {
    const currDate = new Date();
    // Billings from admin to sensei that have not been
    const pendingBillings = await Billing.findAll({
      where: {
        status: BILLING_STATUS.PENDING_120_DAYS,
      },
    });

    // Track amount to update sensei wallet by later.
    // Need this instead of update within Promise.all because that will create concurrency bugs as multiple promises can hit the same Wallet at the same time.
    const senseiWalletsDictionary = new Map<
      string,
      { pendingAmountToRemove: number; confirmedAmountToAdd: number }
    >();

    await Promise.all(
      pendingBillings.map(async (billing) => {
        const billingWithdrawableDate = billing.withdrawableDate;
        const walletId = billing.receiverWalletId;
        if (currDate >= billingWithdrawableDate) {
          await billing.update({
            status: BILLING_STATUS.CONFIRMED,
          });

          const senseiWalletToUpdate = senseiWalletsDictionary.get(walletId);
          if (senseiWalletToUpdate) {
            const updatedConfirmedAmount =
              senseiWalletToUpdate.confirmedAmountToAdd + billing.amount;
            const updatedPendingAmount =
              senseiWalletToUpdate.pendingAmountToRemove + billing.amount;
            senseiWalletsDictionary.set(walletId, {
              confirmedAmountToAdd: updatedConfirmedAmount,
              pendingAmountToRemove: updatedPendingAmount,
            });
          } else {
            senseiWalletsDictionary.set(walletId, {
              confirmedAmountToAdd: billing.amount,
              pendingAmountToRemove: billing.amount,
            });
          }
        }
      })
    );

    return await Promise.all(
      Array.from(senseiWalletsDictionary).map(
        async ([walletId, { pendingAmountToRemove, confirmedAmountToAdd }]) => {
          const senseiWallet = await Wallet.findByPk(walletId);
          const pendingAmount =
            senseiWallet.pendingAmount - pendingAmountToRemove;
          const confirmedAmount =
            senseiWallet.confirmedAmount + confirmedAmountToAdd;
          await senseiWallet.update({
            pendingAmount,
            confirmedAmount,
          });
        }
      )
    );
  }
}
