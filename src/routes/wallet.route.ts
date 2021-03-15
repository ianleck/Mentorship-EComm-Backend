import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { WalletController } from '../controllers/wallet.controller';
import { requireSameUserOrFinance } from '../middlewares/authenticationMiddleware';
import wallet from './schema/wallet.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/:accountId/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrFinance,
  schemaValidator.params(wallet.walletIdP),
  Utility.asyncHandler(WalletController.viewWallet)
);

export default router;
