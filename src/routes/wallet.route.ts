import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { WalletController } from '../controllers/wallet.controller';
import {
  requireFinance,
  requireSameUserOrAdmin,
  requireSensei,
} from '../middlewares/authenticationMiddleware';
import wallet from './schema/wallet.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/:accountId/:walletId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  requireSameUserOrAdmin,
  requireSensei,
  schemaValidator.body(wallet.walletIdP),
  Utility.asyncHandler(WalletController.viewWallet)
);

export default router;
