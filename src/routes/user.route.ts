import express from 'express';
import { UserController } from '../controllers/user.controller';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import { requireAdmin } from '../middlewares/userTypeHandler';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

/*** GET REQUESTS ***/

// get user (student/sensei)
router.get(
  '/:accountId',
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(UserController.getUser)
);

// get all senseis
router.get('/sensei', Utility.asyncHandler(UserController.getAllActiveSenseis));

// get all students (only admin)
router.get(
  '/student',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(UserController.getAllActiveStudents)
);

/*** END OF GET REQUESTS ***/

/*** POST REQUESTS ***/
router.post(
  '/login',
  schemaValidator.body(user.login),
  Utility.asyncHandler(UserController.login)
);

router.post(
  '/register',
  schemaValidator.body(user.register),
  Utility.asyncHandler(UserController.register)
);

/*** END OF POST REQUESTS ***/

/*** PUT REQUESTS ***/

// authentication: check that req.user == accountId
router.put(
  '/change-password',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(user.changePassword),
  Utility.asyncHandler(UserController.changePassword)
);

// update user (student/sensei)
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(user.updateUserB),
  Utility.asyncHandler(UserController.updateUser)
);

// update user about (user.headline & user.bio)
router.put(
  '/about/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(user.updateUserAboutB),
  Utility.asyncHandler(UserController.updateUserAbout)
);

/*** END OF PUT REQUESTS ***/

/*** DEL REQUESTS ***/

// delete user (student/sensei)
router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(UserController.deactivateUser)
);

/*** END OF DEL REQUESTS ***/

export default router;
