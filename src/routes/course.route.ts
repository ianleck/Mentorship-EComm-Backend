import express from 'express';
import Utility from '../constants/utility';
import { CourseController } from '../controllers/course.controller';
import {
  optionalAuth,
  requireSameUserOrAdmin,
  requireAdmin,
} from '../middlewares/authenticationMiddleware';
import course from './schema/course.schema';
import user from './schema/user.schema';

const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== COURSE LISTING ========================================
// get all courses
router.get('/', Utility.asyncHandler(CourseController.getAllCourses));

router.get(
  '/:courseId',
  optionalAuth,
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.getOneCourse)
);

router.get(
  '/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  schemaValidator.query(course.getFilter),
  Utility.asyncHandler(CourseController.getAllSenseiCourses)
);
// create course draft
router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(course.createCourseB),
  Utility.asyncHandler(CourseController.createCourseDraft)
);

// update course / course draft
router.put(
  '/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(course.updateCourseB),
  Utility.asyncHandler(CourseController.updateCourse)
);

// ======================================== LESSONS ========================================
router.post(
  '/lesson/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.createLessonShell)
);

// ======================================== ANNOUNCEMENTS ========================================
/*router.post(
  '/announcement/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.createLessonShell)
); */

// ======================================== COURSE REQUESTS ========================================
//only admin can see pending courses 
router.get(
  '/all/request',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(CourseController.getAllRequests)
); 

router.get(
  '/request/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin, 
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.getRequest)
); 

router.put(
  '/accept/request/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.acceptCourseRequest)
); 

router.put(
  '/reject/request/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.rejectCourseRequest)
);



// ======================================== COURSE CONTRACT ========================================
router.post(
  '/contract/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.createContract)
);

// ======================================== COMMENTS ========================================
router.post(
  '/comment/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  schemaValidator.body(course.createCommentB),
  Utility.asyncHandler(CourseController.createComment)
);

router.get(
  '/comment/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(CourseController.getLessonComments)
);

export default router;
