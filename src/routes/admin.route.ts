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
import Utility from '../constants/utility';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

//create admin account
//the schema must have details needed to register an admin
router.post(
  '/register-admin',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(admin.registerAdmin),
  Utility.asyncHandler(AdminController.registerAdmin)
);

//admin changes own password
router.put(
  '/change-password',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(admin.changePassword),
  Utility.asyncHandler(AdminController.changePassword)
);

//suepradmin changes admin password
router.put(
  '/reset-admin-password',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(admin.changePassword),
  Utility.asyncHandler(AdminController.resetPassword)
);

//update an admin account
router.put(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  schemaValidator.body(admin.updateAdmin),
  Utility.asyncHandler(AdminController.updateAdmin)
);

router.put(
  '/update-permission',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  schemaValidator.body(admin.updateAdminPermission),
  Utility.asyncHandler(AdminController.updateAdminPermission)
);

//get admin
router.get(
  '/:id',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  Utility.asyncHandler(AdminController.getAdmin)
);

//get list of active students
router.get(
  '/students',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(AdminController.getActiveStudents)
);

//get list of active senseis
router.get(
  '/senseis',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(AdminController.getActiveSenseis)
);

router.delete(
  '/:id',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  Utility.asyncHandler(AdminController.deactivateAdmin)
);

export default router;
