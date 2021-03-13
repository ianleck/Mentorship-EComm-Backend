import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { CartController } from '../controllers/cart.controller';
import { requireStudent } from '../middlewares/authenticationMiddleware';
import cart from './schema/cart.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  Utility.asyncHandler(CartController.viewCart)
);

router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.addItemsB),
  Utility.asyncHandler(CartController.addCourse)
);

router.delete(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.deleteItemsB),
  Utility.asyncHandler(CartController.deleteItems)
);

export default router;
