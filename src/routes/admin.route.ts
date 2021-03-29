import express from 'express';
import Utility from '../constants/utility';
import { AdminController } from '../controllers/admin.controller';
import {
  requireAdmin,
  requireFinance,
  requireSameUserOrSuperAdmin,
  requireSuperAdmin,
} from '../middlewares/authenticationMiddleware';
import admin from './schema/admin.schema';
import auth from './schema/auth.schema';
import comment from './schema/comment.schema';
import user from './schema/user.schema';
import wallet from './schema/wallet.schema';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== ADMIN AUTH ========================================
router.post(
  '/login',
  schemaValidator.body(auth.login),
  Utility.asyncHandler(AdminController.login)
);

//create admin account
router.post(
  '/register',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.body(admin.registerAdmin),
  Utility.asyncHandler(AdminController.registerAdmin)
);

//suepradmin changes admin password
router.put(
  '/password/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.params(user.accountIdP), // adminId to be changed
  schemaValidator.body(admin.resetPassword),
  Utility.asyncHandler(AdminController.resetPassword)
);

// ======================================== ADMIN ========================================

//update an admin account
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrSuperAdmin,
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(admin.updateAdmin),
  Utility.asyncHandler(AdminController.updateAdmin)
);

//update role of admin (done by superdmin)
router.put(
  '/role/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  schemaValidator.params(user.accountIdP), //adminId to be changed
  schemaValidator.body(admin.updateAdminRole),
  Utility.asyncHandler(AdminController.updateAdminRole)
);

router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrSuperAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(AdminController.deactivateAdmin)
);

//get admin
router.get(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrSuperAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(AdminController.getAdmin)
);

//get list of admins
router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSuperAdmin,
  Utility.asyncHandler(AdminController.getAllAdmins)
);

// ======================================== USERS ========================================
//accept sensei profile
router.put(
  '/accept/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(AdminController.acceptSenseiProfile)
);

//reject sensei profile
router.put(
  '/reject/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(AdminController.rejectSenseiProfile)
);

// toggle user status
router.put(
  '/ban/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(AdminController.toggleUserStatus)
);

/*** END OF PUT REQUESTS ***/
// get list of students by filter
router.get(
  '/all/user',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.query(user.getFilter),
  Utility.asyncHandler(AdminController.getUsersByFilter)
);

router.get(
  '/pending/sensei',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getAllPendingSenseis)
);

//get list of banned students
router.get(
  '/ban/student',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getBannedStudents)
);

//get list of banned senseis
router.get(
  '/ban/sensei',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(AdminController.getBannedSenseis)
);

// ======================================== COMPLAINTS ========================================
router.delete(
  '/comment/:commentId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(comment.commentIdP),
  Utility.asyncHandler(AdminController.deleteOffensiveComment)
);
// ======================================== FINANCE ========================================

// View list of withdrawal requests = where billingType = pending_withdrawal
// View a sensei's withdrawal request = where billingId =
router.get(
  '/withdrawals',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.body(wallet.billingFilterB),
  Utility.asyncHandler(AdminController.viewWithdrawalsByFilter)
);

// approve withdrawal
router.put(
  '/withdrawal/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.billingIdP),
  Utility.asyncHandler(AdminController.approveWithdrawal)
);

router.delete(
  '/withdrawal/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.billingIdP),
  Utility.asyncHandler(AdminController.rejectWithdrawal)
);
export default router;
