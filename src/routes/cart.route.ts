import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { CartController } from '../controllers/cart.controller';
import cart from './schema/cart.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(cart.cartItemsP),
  Utility.asyncHandler(CartController.addItem)
);

export default router;
