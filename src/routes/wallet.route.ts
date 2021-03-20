import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { WalletController } from '../controllers/wallet.controller';
import {
  requireFinanceIfAdmin,
  requireSensei,
} from '../middlewares/authenticationMiddleware';
import wallet from './schema/wallet.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// View transaction history as admin - can view all billings
router.get(
  '/billings',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinanceIfAdmin,
  Utility.asyncHandler(WalletController.getAllBillings)
);

// View wallet, includes viewing own transaction history
router.get(
  '/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinanceIfAdmin,
  schemaValidator.params(wallet.walletIdP),
  Utility.asyncHandler(WalletController.viewWallet)
);

router.put(
  '/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(wallet.walletIdP),
  Utility.asyncHandler(WalletController.withdrawBalance)
);

router.get(
  '/withdrawals/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinanceIfAdmin,
  schemaValidator.params(wallet.walletIdP),
  Utility.asyncHandler(WalletController.viewCompletedWithdrawals)
);

router.get(
  '/:walletId/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinanceIfAdmin,
  schemaValidator.params(wallet.walletBillingIdP),
  Utility.asyncHandler(WalletController.viewBilling)
);

export default router;
