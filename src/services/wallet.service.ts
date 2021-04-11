import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { WITHDRAWAL_DAYS } from '../constants/constants';
import {
  APPROVAL_STATUS,
  BILLING_STATUS,
  BILLING_TYPE,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { ERRORS, WALLET_ERROR } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Billing } from '../models/Billing';
import { Course } from '../models/Course';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { RefundRequest } from '../models/RefundRequest';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
export default class WalletService {
  // ============================== Billings ==============================
  public static async createOrderBilling(
    studentId: string,
    paypalPaymentId: string,
    paypalPayerId: string,
    productId: string,
    contractId: string,
    amount: number,
    currency: string,
    status: BILLING_STATUS,
    billingType: BILLING_TYPE,
    mentorPassCount?: number
  ) {
    const student = await User.findByPk(studentId);
    const admin = await Admin.findOne({
      where: { walletId: { [Op.not]: null } },
    });

    const newBilling = new Billing({
      paypalPaymentId,
      paypalPayerId,
      productId,
      contractId,
      amount,
      currency,
      mentorPassCount,
      senderWalletId: student.walletId,
      receiverWalletId: admin.walletId,
      status,
      billingType,
    });

    return await newBilling.save();
  }

  public static async createSenseiBilling(
    amount: number,
    platformFee: number,
    currency: string,
    productId: string,
    contractId: string,
    adminWalletId: string,
    senseiWalletId: string,
    status: BILLING_STATUS,
    billingType: BILLING_TYPE
  ) {
    const withdrawableDate = new Date();
    withdrawableDate.setDate(withdrawableDate.getDate() + WITHDRAWAL_DAYS);

    const newBilling = new Billing({
      productId,
      contractId,
      amount: amount,
      currency: currency,
      platformFee,
      senderWalletId: adminWalletId,
      receiverWalletId: senseiWalletId,
      status,
      withdrawableDate,
      billingType,
    });

    return await newBilling.save();
  }

  public static async viewBillingsByFilter(filter: {
    billingId?: string;
    receiverWalletId?: string;
    status?: BILLING_STATUS;
    billingType?: BILLING_TYPE;
    paypalPaymentId?: string;
  }) {
    // Student billing
    if (filter.paypalPaymentId) {
      return await Billing.findAll({
        where: { paypalPaymentId: filter.paypalPaymentId },
        include: [
          { model: Course, as: 'Course' },
          { model: MentorshipListing, as: 'MentorshipListing' },
        ],
      });
    }

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

      if (filter.billingType === BILLING_TYPE.MENTORSHIP) {
        return await Billing.findByPk(filter.billingId, {
          include: [{ model: MentorshipListing, as: 'MentorshipListing' }],
        });
      }
    }

    return await Billing.findAll({
      where: filter,
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
      where: { userType: USER_TYPE_ENUM.SENSEI },
      include: [{ model: Wallet }],
    });
  }

  // ============================== Refunds ==============================
  public static async cancelRefundRequest(
    refundRequestId: string,
    accountId: string
  ) {
    const existingRefund = await RefundRequest.findByPk(refundRequestId);
    if (!existingRefund) throw new Error(WALLET_ERROR.MISSING_REFUND_REQUEST);
    if (existingRefund.studentId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const billings = await Billing.findAll({ where: { refundRequestId } });
    await Promise.all(
      billings.map(async (billing) => {
        billing.update({ refundRequestId: null });
      })
    );
    return await existingRefund.destroy();
  }

  public static async requestRefund(
    contractId: string,
    contractType: string,
    accountId: string
  ) {
    try {
      const user = await User.findByPk(accountId);
      if (!user) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

      // Today - 120 days to be compared against createdAt; if createdAt is > today - 120 then it is still refundable
      const refundablePeriod = new Date();
      refundablePeriod.setDate(refundablePeriod.getDate() - WITHDRAWAL_DAYS);

      if (contractType === BILLING_TYPE.COURSE)
        return await this.requestCourseRefund(
          contractId,
          user,
          refundablePeriod
        );

      return await this.requestMentorPassRefund(
        contractId,
        user,
        refundablePeriod
      );
    } catch (e) {
      throw e;
    }
  }

  public static async requestCourseRefund(
    contractId: string,
    user: User,
    refundablePeriod: Date
  ) {
    const accountId = user.accountId;

    const existingRefund = await RefundRequest.findOne({
      where: { contractId, studentId: accountId },
    });

    if (existingRefund) {
      if (existingRefund.approvalStatus === APPROVAL_STATUS.APPROVED) {
        throw new Error(WALLET_ERROR.REFUNDED); // alr refund
      }
      if (existingRefund.approvalStatus === APPROVAL_STATUS.PENDING) {
        throw new Error(WALLET_ERROR.EXISTING_REFUND); // pending refund
      }
    }

    const billing = await Billing.findOne({
      where: {
        contractId,
        senderWalletId: user.walletId,
        status: BILLING_STATUS.PAID,
        billingType: BILLING_TYPE.COURSE,
      },
    });

    if (billing.createdAt < refundablePeriod)
      throw new Error(WALLET_ERROR.REFUND_PERIOD_OVER);

    const refundRequest = await new RefundRequest({
      contractId,
      studentId: accountId,
      contractType: BILLING_TYPE.COURSE,
    }).save();

    await billing.update({ refundRequestId: refundRequest.refundRequestId });

    return await RefundRequest.findOne({
      where: { refundRequestId: refundRequest.refundRequestId },
      include: [
        {
          model: Billing,
          as: 'OriginalBillings',
          on: { billingId: billing.billingId },
          include: [{ model: Course, as: 'Course' }],
        },
      ],
    });
  }

  public static async requestMentorPassRefund(
    contractId: string,
    user: User,
    refundablePeriod: Date
  ) {
    const accountId = user.accountId;

    const existingRefunds = await RefundRequest.findAll({
      where: { contractId, studentId: accountId },
      order: [['createdAt', 'DESC']],
    });

    const mentorshipContract = await MentorshipContract.findByPk(contractId);

    if (existingRefunds.length >= 1) {
      const latestRefundRequest = existingRefunds[0];
      if (
        latestRefundRequest.approvalStatus === APPROVAL_STATUS.APPROVED &&
        mentorshipContract.mentorPassCount === 0
      ) {
        throw new Error(WALLET_ERROR.REFUNDED); // alr refund
      }
      if (latestRefundRequest.approvalStatus === APPROVAL_STATUS.PENDING)
        throw new Error(WALLET_ERROR.EXISTING_REFUND); // pending refund
    }

    const paidBillings = await Billing.findAll({
      where: {
        contractId,
        status: BILLING_STATUS.PAID,
        billingType: BILLING_TYPE.MENTORSHIP,
        refundRequestId: { [Op.is]: null },
      },
      order: [['createdAt', 'DESC']],
    });

    let billingIds: string[] = [];
    let billings: Billing[] = [];
    let remainingNumPasses = mentorshipContract.mentorPassCount;
    for (let i = 0; i < paidBillings.length; i++) {
      if (remainingNumPasses <= 0) break;
      const billing = paidBillings[i];
      if (billing.createdAt < refundablePeriod) break;
      remainingNumPasses -= billing.mentorPassCount;
      billingIds.push(billing.billingId);
      billings.push(billing);
    }

    if (billingIds.length === 0)
      throw new Error(WALLET_ERROR.REFUND_PERIOD_OVER);

    const refundRequest = await new RefundRequest({
      contractId,
      studentId: accountId,
      contractType: BILLING_TYPE.MENTORSHIP,
    }).save();

    await Promise.all(
      billings.map(async (billing) => {
        await billing.update({
          refundRequestId: refundRequest.refundRequestId,
        });
      })
    );

    return await RefundRequest.findOne({
      where: { refundRequestId: refundRequest.refundRequestId },
      include: [
        {
          model: Billing,
          as: 'OriginalBillings',
          on: { billingId: { [Op.in]: billingIds } },
          include: [{ model: MentorshipListing, as: 'MentorshipListing' }],
        },
      ],
    });
  }

  public static async viewListOfRefunds(accountId: string) {
    const checkUser = await User.findByPk(accountId);
    let filter = {};
    if (checkUser) filter = { studentId: accountId };
    return RefundRequest.findAll({
      where: filter,
      include: [
        { model: User, attributes: ['username', 'firstName', 'lastName'] },
        { model: Billing, as: 'Refund' },
        {
          model: Billing,
          as: 'OriginalBillings',
          include: [MentorshipListing, Course],
        },
      ],
    });
  }

  public static async viewRefundDetail(refundRequestId: string) {
    return await RefundRequest.findOne({
      where: { refundRequestId },
      include: [
        { model: User, attributes: ['username', 'firstName', 'lastName'] },
        { model: Billing, as: 'Refund' },
        {
          model: Billing,
          as: 'OriginalBillings',
          include: [
            { model: Course, as: 'Course' },
            { model: MentorshipListing, as: 'MentorshipListing' },
          ],
        },
      ],
    });
  }

  // ============================== Withdrawals ==============================
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
