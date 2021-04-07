import express from 'express';
import Utility from '../constants/utility';
import { SearchController } from '../controllers/search.controller';
import search from './schema/search.schema';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(search.getFilter),
  Utility.asyncHandler(SearchController.searchByFilter)
);

export default router;
