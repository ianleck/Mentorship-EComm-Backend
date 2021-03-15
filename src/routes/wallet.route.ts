import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { WalletController } from '../controllers/wallet.controller';
import { requireFinance } from '../middlewares/authenticationMiddleware';
import wallet from './schema/wallet.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/billings',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  Utility.asyncHandler(WalletController.getAllBillings)
);

router.get(
  '/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.walletIdP),
  Utility.asyncHandler(WalletController.viewWallet)
);

router.get(
  '/:walletId/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.billingIdP),
  Utility.asyncHandler(WalletController.viewBilling)
);

export default router;
