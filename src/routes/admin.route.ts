/*
 Routes identify specific URL paths, which can be targeted in the application logic 
 and which allow you to specify the information to be sent to the client. 

 If the /contact path can respond to POST and GET requests, for example, 
 your code will route to the appropriate function as soon as the request’s method is identified

 When you call get or post, you need to pass the URL of the route and the function you want to execute when that route is reached. 
 These functions register your routes by adding them to the routes object, where they can be reached and used by the handle function.

 To recap, to register a route, I need to state the following:

Whether the request is a GET or a POST request
The URL’s path
The name of the file to return
An HTTP status code
The type of the file being returned (as the content type)

*/

import express from 'express';

import { AdminController } from '../controllers/admin.controller';
import admin from './schema/admin.schema';
import auth from './schema/auth.schema';

import Utility from '../constants/utility';
import {
  requireSuperAdmin,
  requireAdmin,
} from '../middlewares/userTypeHandler';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/login',
  schemaValidator.body(auth.login),
  Utility.asyncHandler(AdminController.login)
);

router.get(
  '/verify-senseis',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getAllPendingSenseis)
);

//get admin
router.get(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  Utility.asyncHandler(AdminController.getAdmin)
);

//get list of admins
router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  Utility.asyncHandler(AdminController.getAllAdmins)
);

//get list of banned students
router.get(
  '/banned-students',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getBannedStudents)
);

//get list of banned senseis
router.get(
  '/banned-senseis',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getBannedSenseis)
);

/*

//get list of mentorship contracts - mentorshipApplication : pending / approved 
router.get(
  '/mentorship-contracts',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getMentorshipContracts)
);
*/

/*** END OF GET REQUESTS ***/

/*** POST REQUESTS ***/
//create admin account
router.post(
  '/register-admin',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.body(admin.registerAdmin),
  Utility.asyncHandler(AdminController.registerAdmin)
);

/*** END OF POST REQUESTS ***/

/*** PUT REQUESTS ***/
//suepradmin changes admin password
router.put(
  '/reset-admin-password/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.params(admin.adminIdQ), // adminId to be changed
  schemaValidator.body(admin.resetPassword),
  Utility.asyncHandler(AdminController.resetPassword)
);

//update an admin account
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  schemaValidator.body(admin.updateAdmin),
  Utility.asyncHandler(AdminController.updateAdmin)
);

//update permission of admin (done by superdmin)
router.put(
  '/update-permission/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.params(admin.adminIdQ), //adminId to be changed
  schemaValidator.body(admin.updateAdminPermission),
  Utility.asyncHandler(AdminController.updateAdminPermission)
);

//accept sensei profile
router.put(
  '/accept-sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(admin.senseiIdQ),
  Utility.asyncHandler(AdminController.acceptSenseiProfile)
);

//reject sensei profile
router.put(
  '/reject-sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(admin.senseiIdQ),
  Utility.asyncHandler(AdminController.rejectSenseiProfile)
);

/*** END OF PUT REQUESTS ***/

/*** DEL REQUESTS ***/

router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  Utility.asyncHandler(AdminController.deactivateAdmin)
);

/*** END OF DEL REQUESTS ***/

export default router;
