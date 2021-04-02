import express from 'express';
import Utility from '../constants/utility';
import { MentorshipController } from '../controllers/mentorship.controller';
import {
  requireAdmin,
  requireSameUserOrAdmin,
  requireSensei,
  requireStudent,
} from '../middlewares/authenticationMiddleware';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ==================================== MENTORSHIP LISTINGS ====================================
router.post(
  '/listing/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.createListing)
);

router.put(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingP),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.updateListing)
);

router.delete(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingP),
  Utility.asyncHandler(MentorshipController.deleteListing)
);

router.get(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipListingP),
  Utility.asyncHandler(MentorshipController.getListing)
);

//get ALL mentorship listings
router.get(
  '/listing',
  Utility.asyncHandler(MentorshipController.getMentorshipListings)
);

//get single sensei mentorship listings
router.get(
  '/listing/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipListings)
);

// ==================================== MENTORSHIP CONTRACT ====================================
router.post(
  '/contract/:mentorshipListingId/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipListingP),
  schemaValidator.body(mentorship.mentorshipContractB),
  Utility.asyncHandler(MentorshipController.createContract)
);

router.put(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipContractP),
  schemaValidator.body(mentorship.mentorshipContractB),
  Utility.asyncHandler(MentorshipController.updateContract)
);

router.delete(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipContractP),
  Utility.asyncHandler(MentorshipController.deleteContract)
);

//Accept Mentorship Application
router.put(
  '/accept/application/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipContractP),
  schemaValidator.body(mentorship.acceptMentorshipB),
  Utility.asyncHandler(MentorshipController.acceptMentorshipContract)
);

//Reject Mentorship Application
router.put(
  '/reject/application/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipContractP),
  Utility.asyncHandler(MentorshipController.rejectMentorshipContract)
);

//get ALL mentorship contracts
router.get(
  '/contract',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(MentorshipController.getAllMentorshipContracts)
);

//get ONE mentorship contract
router.get(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractP),
  Utility.asyncHandler(MentorshipController.getStudentMentorshipContract)
);

//get ALL mentorship contracts of ONE student
router.get(
  '/contract/student/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(MentorshipController.getAllStudentMentorshipContracts)
);

//get ALL mentorship contracts of ONE sensei
router.get(
  '/contract/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipContracts)
);

// ==================================== TESTIMONIALS ====================================
router.post(
  '/testimonial/:mentorshipListingId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.createTestimonialParams),
  schemaValidator.body(mentorship.addTestimonialB),
  Utility.asyncHandler(MentorshipController.addTestimonial)
);

router.put(
  '/testimonial/:testimonialId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.testimonialP),
  schemaValidator.body(mentorship.editTestimonialB),
  Utility.asyncHandler(MentorshipController.editTestimonial)
);

//View List of Testimonials By Filter - sensei can search by mentorshipListing and accountId
router.get(
  '/testimonial/list',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(mentorship.getFilter),
  Utility.asyncHandler(MentorshipController.getTestimonialsByFilter)
);

// ==================================== TASKS ====================================

//===================== TASK BUCKET =============================
//Create Task Bucket
router.post(
  '/task-bucket/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractP),
  schemaValidator.body(mentorship.addTaskBucketB),
  Utility.asyncHandler(MentorshipController.addTaskBucket)
);

//Update Task Bucket
router.put(
  '/task-bucket/:taskBucketId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskBucketP),
  schemaValidator.body(mentorship.editTaskBucketB),
  Utility.asyncHandler(MentorshipController.editTaskBucket)
);

//Remove Task Bucket
router.delete(
  '/task-bucket/:taskBucketId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskBucketP),
  Utility.asyncHandler(MentorshipController.deleteTaskBucket)
);

//Get all task buckets of mentorship contract
router.get(
  '/task-bucket/all/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractP),
  Utility.asyncHandler(MentorshipController.getTaskBuckets)
);

//===================== TASK =============================
//Create Task
router.post(
  '/task-bucket/task/:taskBucketId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskBucketP),
  schemaValidator.body(mentorship.addTaskB),
  Utility.asyncHandler(MentorshipController.addTask)
);

//Update Task
router.put(
  '/task-bucket/task/:taskId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskP),
  schemaValidator.body(mentorship.editTaskB),
  Utility.asyncHandler(MentorshipController.editTask)
);

//Remove Task
router.delete(
  '/task-bucket/task/:taskId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskP),
  Utility.asyncHandler(MentorshipController.deleteTask)
);

//Get all tasks in task bucket
router.get(
  '/task-bucket/task/all/:taskBucketId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskBucketP),
  Utility.asyncHandler(MentorshipController.getTasks)
);

// ==================================== SENSEI MENTEE ====================================
router.get(
  // get sensei's mentee list
  '/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(MentorshipController.getSenseiMenteeList)
);
export default router;
