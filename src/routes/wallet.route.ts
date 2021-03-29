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

// View all billings
// view list of all sensei billings: status = [CONFIRMED, PENDING_120_DAYS]
router.get(
  '/billings/filter',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinanceIfAdmin,
  schemaValidator.body(wallet.billingFilterB),
  Utility.asyncHandler(WalletController.viewBillingsByFilter)
);

export default router;
