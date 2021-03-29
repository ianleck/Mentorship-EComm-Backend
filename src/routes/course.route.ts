import express from 'express';
import Utility from '../constants/utility';
import { CourseController } from '../controllers/course.controller';
import {
  optionalAuth,
  requireAdmin,
  requireSameUserOrAdmin,
  requireSensei,
  requireStudent,
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
  requireSensei,
  schemaValidator.body(course.createCourseB),
  Utility.asyncHandler(CourseController.createCourseDraft)
);

// update course / course draft
router.put(
  '/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(course.updateCourseB),
  Utility.asyncHandler(CourseController.updateCourse)
);

// ======================================== LESSONS ========================================
router.post(
  '/lesson/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.createLessonShell)
);

router.put(
  '/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.lessonIdP),
  schemaValidator.body(course.updateLessonB),
  Utility.asyncHandler(CourseController.updateLesson)
);

router.delete(
  '/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(CourseController.deleteLesson)
);

// ======================================== NOTES ========================================
router.post(
  '/note/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.lessonIdP),
  schemaValidator.body(course.createNoteB),
  Utility.asyncHandler(CourseController.addNoteToLesson)
);

router.put(
  '/note/:noteId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.noteIdP),
  schemaValidator.body(course.updateNoteB),
  Utility.asyncHandler(CourseController.editNoteInLesson)
);

//Get ALL notes added for lesson
router.get(
  '/note/all/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(CourseController.getAllNotes)
);

// ======================================== ANNOUNCEMENTS ========================================
router.post(
  '/announcement/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(course.createAnnouncement),
  Utility.asyncHandler(CourseController.createAnnouncement)
);

router.put(
  '/announcement/:announcementId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.announcementIdP),
  schemaValidator.body(course.updateAnnouncementB),
  Utility.asyncHandler(CourseController.updateAnnouncement)
);

router.delete(
  '/announcement/:announcementId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(course.announcementIdP),
  Utility.asyncHandler(CourseController.deleteAnnouncement)
);

//view all announcements in one course
//only students doing course and sensei who created course can access
router.get(
  '/all/announcement/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CourseController.getAllAnnouncements)
);

router.get(
  '/announcement/:announcementId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.announcementIdP),
  Utility.asyncHandler(CourseController.getAnnouncement)
);

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

router.get(
  '/contract/student/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(course.studentIdP),
  Utility.asyncHandler(CourseController.getAllPurchasedCourses)
);

export default router;
