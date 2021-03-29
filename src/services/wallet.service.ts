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
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import EmailService from './email.service';
import PaypalService from './paypal.service';
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

  public static async viewBillingsByFilter(filter: {
    billingId?: string;
    receiverWalletId?: string;
    status?: BILLING_STATUS;
    billingType?: BILLING_TYPE;
    paypalPaymentId?: string;
  }) {
    if (filter.billingId) {
      // View a sensei's withdrawal request
      if (filter.billingType === BILLING_TYPE.WITHDRAWAL) {
        const withdrawals = await Billing.findAll({
          where: {
            status: BILLING_STATUS.WITHDRAWN,
            billingType: BILLING_TYPE.WITHDRAWAL,
          },
          order: [['createdAt', 'DESC']],
        });

        const currWithdrawal = await Billing.findByPk(filter.billingId);

        let createdCheck = withdrawals[0]
          ? {
              [Op.between]: [
                withdrawals[0].createdAt,
                currWithdrawal.createdAt,
              ],
            }
          : { [Op.lte]: currWithdrawal.createdAt };

        return await Billing.findAll({
          where: {
            receiverWalletId: currWithdrawal.receiverWalletId,
            status: BILLING_STATUS.CONFIRMED,
            createdAt: createdCheck,
          },
        });
      }
      if (filter.billingType === BILLING_TYPE.COURSE) {
        return await Billing.findByPk(filter.billingId, {
          include: [{ model: Course, as: 'Course' }],
        });
      }

      if (filter.billingType === BILLING_TYPE.SUBSCRIPTION) {
        return await Billing.findByPk(filter.billingId, {
          include: [{ model: MentorshipListing, as: 'MentorshipListing' }],
        });
      }
    }

    if (filter.paypalPaymentId) {
      return await Billing.findAll({
        where: { paypalPaymentId: filter.paypalPaymentId },
        include: [
          { model: Course, as: 'Course' },
          { model: MentorshipListing, as: 'MentorshipListing' },
        ],
      });
    }

    return await Billing.findAll({
      where: filter,
      paranoid: false,
    });
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
      if (!user || user.walletId !== walletId)
        throw new Error(WALLET_ERROR.UNAUTH_WALLET);
    }

    return await Wallet.findByPk(walletId, {
      include: [
        { model: Billing, as: 'BillingsSent' },
        { model: Billing, as: 'BillingsReceived' },
      ],
    });
  }

  public static async viewListOfWallets() {
    return await User.findAll({
      include: [{ model: Wallet, as: 'WalletOwner' }],
    });
  }
  // ============================== Withdrawals ==============================

  public static async approveWithdrawal(billingId: string) {
    const existingApplication = await Billing.findByPk(billingId);
    if (
      !existingApplication ||
      existingApplication.billingType !== BILLING_TYPE.WITHDRAWAL
    )
      throw new Error(WALLET_ERROR.MISSING_BILLING);

    if (existingApplication.status !== BILLING_STATUS.PENDING_WITHDRAWAL) {
      throw new Error(WALLET_ERROR.PAID_OUT);
    }

    const sensei = await User.findOne({
      where: { walletId: existingApplication.receiverWalletId },
    });
    const payout_json = await PaypalService.createPayout(
      existingApplication,
      sensei.email
    );

    return { payout_json, billing: existingApplication };
  }

  public static async postWithdrawalHelper(
    billing: Billing,
    paymentId: string
  ) {
    const wallet = await Wallet.findByPk(billing.receiverWalletId);
    const receiver = await User.findOne({
      where: { walletId: wallet.walletId },
    });

    await billing.update({
      paypalPaymentId: paymentId,
      status: BILLING_STATUS.WITHDRAWN,
    });

    const newAmount = wallet.confirmedAmount - billing.amount;

    await wallet.update({
      confirmedAmount: newAmount,
    });

    await EmailService.sendEmail(receiver.email, 'withdrawalSuccess');
  }

  public static async rejectWithdrawal(billingId: string) {
    const existingApplication = await Billing.findByPk(billingId);
    if (
      !existingApplication ||
      existingApplication.billingType !== BILLING_TYPE.WITHDRAWAL
    )
      throw new Error(WALLET_ERROR.MISSING_BILLING);

    if (existingApplication.status !== BILLING_STATUS.PENDING_WITHDRAWAL) {
      throw new Error(WALLET_ERROR.PAID_OUT);
    }

    return await existingApplication.destroy();
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
