import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { SearchController } from '../controllers/search.controller';
import search from './schema/search.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/:query',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(search.filterSearch),
  Utility.asyncHandler(SearchController.searchByFilter)
);

export default router;
