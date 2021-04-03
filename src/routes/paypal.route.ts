import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { PaypalController } from '../controllers/paypal.controller';
import { requireStudent } from '../middlewares/authenticationMiddleware';
import cart from './schema/cart.schema';
import paypal from './schema/paypal.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/order/create',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.cartIdP),
  Utility.asyncHandler(PaypalController.createOrder)
);

router.post(
  '/order/capture',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.query(paypal.captureOrderQ),
  Utility.asyncHandler(PaypalController.captureOrder)
);

router.get(
  '/payout/:payoutId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(paypal.payoutIdP),
  Utility.asyncHandler(PaypalController.viewPayout)
);
export default router;
