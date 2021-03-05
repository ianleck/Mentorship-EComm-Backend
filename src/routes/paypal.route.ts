import express from 'express';
import paypal from './schema/paypal.schema';
import Utility from '../constants/utility';
import { PaypalController } from '../controllers/paypal.controller';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/order/create',
  schemaValidator.body(paypal.createOrderB),
  Utility.asyncHandler(PaypalController.createOrder)
);

export default router;
