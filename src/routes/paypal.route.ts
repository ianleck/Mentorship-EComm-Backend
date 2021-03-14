import express from 'express';
import Utility from '../constants/utility';
import { PaypalController } from '../controllers/paypal.controller';
import cart from './schema/cart.schema';
import paypal from './schema/paypal.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/order/create',
  schemaValidator.body(cart.courseAndContractIdsB),
  Utility.asyncHandler(PaypalController.createOrder)
);

router.post(
  '/order/capture',
  schemaValidator.query(paypal.captureOrderQ),
  Utility.asyncHandler(PaypalController.captureOrder)
);
export default router;
