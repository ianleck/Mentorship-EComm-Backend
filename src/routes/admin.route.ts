import express from 'express';
import Utility from '../constants/utility';
import { AdminController } from '../controllers/admin.controller';
import { WalletController } from '../controllers/wallet.controller';
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

// view list of all withdrawal requests : billingType = WITHDRAWAL *impt for FE
// view list of pending withdrawal requests : billingType = WITHDRAWAL && status = PENDING_WITHDRAWAL
// view list of approved withdrawal requests : billingType = WITHDRAWAL && status = WITHDRAWN
// view list of rejected withdrawal request : billingType = WITHDRAWAL && status = REJECTED
// view a sensei's withdrawal request : billingId = withdrawal billingId, billingType = WITHDRAWAL
router.get(
  '/withdrawals/filter',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.query(wallet.billingFilterQ),
  Utility.asyncHandler(WalletController.viewBillingsByFilter)
);

// View list of all sensei wallets
router.get(
  '/wallets/sensei',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  Utility.asyncHandler(WalletController.viewListOfWallets)
);

// approve withdrawal
router.post(
  '/withdrawal/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.billingIdP),
  Utility.asyncHandler(AdminController.approveWithdrawal)
);
// reject withdrawal
router.put(
  '/withdrawal/:billingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.billingIdP),
  Utility.asyncHandler(AdminController.rejectWithdrawal)
);

// approve refund
router.post(
  '/refund/:refundRequestId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.refundRequestIdP),
  Utility.asyncHandler(AdminController.approveRefund)
);
// reject refund
router.put(
  '/refund/:refundRequestId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireFinance,
  schemaValidator.params(wallet.refundRequestIdP),
  Utility.asyncHandler(AdminController.rejectRefund)
);
export default router;
