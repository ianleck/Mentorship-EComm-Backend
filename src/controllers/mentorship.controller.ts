import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, MENTORSHIP_ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { MENTORSHIP_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import MentorshipService from '../services/mentorship.service';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';

export class MentorshipController {
  // ====================================== MENTORSHIP LISTINGS ======================================
  public static async createListing(req, res) {
    const { user } = req;
    const { mentorshipListing } = req.body;

    try {
      const createdListing = await MentorshipService.createListing(
        user.accountId,
        mentorshipListing
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.LISTING_CREATE, createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateListing(req, res) {
    const { accountId } = req.user;
    const { mentorshipListingId } = req.params;
    const { mentorshipListing } = req.body;

    try {
      const updatedListing = await MentorshipService.updateListing(
        mentorshipListingId,
        accountId,
        mentorshipListing
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.LISTING_UPDATE, updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateListing]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        MENTORSHIP_ERRORS.LISTING_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MENTORSHIP_ERRORS.USER_NOT_VERIFIED,
      ]);
    }
  }

  public static async deleteListing(req, res) {
    const { mentorshipListingId } = req.params;

    try {
      await MentorshipService.deleteListing(mentorshipListingId);
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.LISTING_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  // Can be called by anyone logged in. View sensei's mentorship listings
  public static async getSenseiMentorshipListings(req, res) {
    const { accountId } = req.params; //accountId of the sensei who is being looked at

    try {
      const mentorshipListings = await MentorshipService.getSenseiMentorshipListings(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipListings,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipService.getSenseiMentorshipListings]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: RESPONSE_ERROR.RES_ERROR.toString(),
      });
    }
  }

  public static async getMentorshipListings(req, res) {
    try {
      const mentorshipListings = await MentorshipService.getAllMentorshipListings();
      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipListings,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllMentorshipListings]:' + e.message
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // get one listing
  // if student, return without listing.contracts
  // if sensei/admin return whole obj
  public static async getListing(req, res) {
    const { mentorshipListingId } = req.params;
    const { user } = req;
    const accountId = user ? user.accountId : null;
    try {
      const listing = await MentorshipService.getListing(
        mentorshipListingId,
        user
      );
      const existingContract = await MentorshipService.getContractIfExist(
        mentorshipListingId,
        accountId
      );
      const experiences = await UserService.getExperienceByAccountId(
        listing.accountId
      );

      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipListing: listing,
          experience: experiences,
          existingContract,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getListing]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  // ====================================== MENTORSHIP CONTRACTS ======================================
  public static async createContract(req, res) {
    const { mentorshipListingId } = req.params;
    const { accountId } = req.user;
    const { statement } = req.body;

    // Check that there is no existing mentorship contract
    try {
      const createdContract = await MentorshipService.createContract(
        mentorshipListingId,
        accountId,
        statement
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.CONTRACT_CREATE, createdContract },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createContract]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        MENTORSHIP_ERRORS.LISTING_MISSING,
        MENTORSHIP_ERRORS.CONTRACT_EXISTS,
      ]);
    }
  }

  public static async updateContract(req, res) {
    const { mentorshipContractId } = req.params;
    const { statement } = req.body;
    const { accountId } = req.user;

    // Check that there is an existing mentorship contract
    try {
      const updatedContract = await MentorshipService.updateContract(
        mentorshipContractId,
        statement,
        accountId
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.CONTRACT_UPDATE, updatedContract },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateContract]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async acceptMentorshipContract(req, res) {
    const { mentorshipContractId } = req.params;
    const { user } = req;
    const { emailParams } = req.body;

    try {
      const mentorshipContract = await MentorshipService.acceptContract(
        mentorshipContractId,
        user.accountId,
        emailParams
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.CONTRACT_ACCEPT, mentorshipContract },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.acceptMentorshipContract]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        MENTORSHIP_ERRORS.CONTRACT_MISSING,
        ERRORS.STUDENT_DOES_NOT_EXIST,
        ERRORS.SENSEI_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async rejectMentorshipContract(req, res) {
    const { mentorshipContractId } = req.params;
    const { user } = req;

    try {
      const mentorshipContract = await MentorshipService.rejectContract(
        mentorshipContractId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.CONTRACT_REJECT, mentorshipContract },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.rejectMentorshipContract]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        MENTORSHIP_ERRORS.CONTRACT_MISSING,
        ERRORS.STUDENT_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async deleteContract(req, res) {
    const { mentorshipContractId } = req.params;
    const { accountId } = req.user;

    try {
      await MentorshipService.deleteContract(mentorshipContractId, accountId);
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.CONTRACT_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteContract]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //get ALL mentorship contracts
  public static async getAllMentorshipContracts(req, res) {
    try {
      const mentorshipContracts = await MentorshipService.getAllMentorshipContracts();
      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipContracts,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllMentorshipContracts]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  /*get ONE mentorship contract
  // Permissions: For student who created the contract, sensei who own the contract.listing and for admins
  */
  public static async getStudentMentorshipContract(req, res) {
    const { user } = req; //user is the user who is making the request
    const { mentorshipContractId } = req.params;

    try {
      const contract = await MentorshipService.getStudentMentorshipContract(
        mentorshipContractId,
        user.accountId,
        user.userType
      );

      return apiResponse.result(
        res,
        {
          message: 'success',
          contract,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getStudentMentorshipContract]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  //get ALL mentorship contracts of ONE student
  public static async getAllStudentMentorshipContracts(req, res) {
    const { accountId } = req.params;

    try {
      const contracts = await MentorshipService.getAllStudentMentorshipContracts(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          contracts,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllStudentMentorshipContracts]:' +
          e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  //get ONE active mentorship
  public static async getSenseiMentorshipContracts(req, res) {
    const { accountId } = req.params; //accountId of the sensei
    const { user } = req; //user is the user who is making the request

    try {
      const contracts = await MentorshipService.getSenseiMentorshipContracts(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          contracts,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getSenseiMentorshipContracts]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getActiveMentorship(req, res) {
    const { mentorshipContractId } = req.params;

    try {
      const activeContract = await MentorshipService.getActiveMentorship(
        mentorshipContractId
      );

      return apiResponse.result(
        res,
        {
          message: 'success',
          activeContract,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getActiveMentorship]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  //get ALL active mentorship contracts of ONE student
  public static async getAllActiveMentorships(req, res) {
    const { accountId } = req.params;

    try {
      const activeContracts = await MentorshipService.getAllActiveMentorships(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          activeContracts,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllActiveMentorships]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ============================= TESTIMONIALS =================================================
  public static async addTestimonial(req, res) {
    const { user } = req;
    const { newTestimonial } = req.body;
    const { mentorshipListingId, accountId } = req.params;

    try {
      const createdTestimonial = await MentorshipService.addTestimonial(
        user.accountId,
        accountId,
        mentorshipListingId,
        newTestimonial
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TESTIMONIAL_CREATE, createdTestimonial },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.addTestimonial]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.TESTIMONIAL_EXISTS ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_NOT_COMPLETED ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async editTestimonial(req, res) {
    const { testimonialId } = req.params;
    const { editedTestimonial } = req.body;
    const { user } = req;

    try {
      const updatedTestimonial = await MentorshipService.editTestimonial(
        user.accountId,
        testimonialId,
        editedTestimonial
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TESTIMONIAL_EDIT, updatedTestimonial },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.editTestimonial]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.TESTIMONIAL_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //get list of testimonials
  public static async getTestimonialsByFilter(req, res) {
    const filter = req.query;

    try {
      const testimonials = await MentorshipService.getTestimonialsByFilter(
        filter
      );

      return apiResponse.result(
        res,
        {
          message: 'success',
          testimonials,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getTestimonialByFilter]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getAllTestimonials(req, res) {
    const { accountId } = req.params;

    try {
      const testimonials = await MentorshipService.getAllTestimonials(
        accountId
      );

      return apiResponse.result(
        res,
        {
          message: 'success',
          testimonials,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getAllTestimonials]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ====================================== TASKS ======================================

  //================= TASK BUCKET =====================
  public static async addTaskBucket(req, res) {
    const { user } = req;
    const { newTaskBucket } = req.body;
    const { mentorshipContractId } = req.params;

    try {
      const newBucket = await MentorshipService.addTaskBucket(
        user.accountId,
        mentorshipContractId,
        newTaskBucket
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_BUCKET_CREATE, newBucket },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.addTaskBucket]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async editTaskBucket(req, res) {
    const { taskBucketId } = req.params;
    const { editedTaskBucket } = req.body;
    const { user } = req;

    try {
      const updatedTaskBucket = await MentorshipService.editTaskBucket(
        user.accountId,
        taskBucketId,
        editedTaskBucket
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_BUCKET_EDIT, updatedTaskBucket },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.editTaskBucket]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async deleteTaskBucket(req, res) {
    const { taskBucketId } = req.params;
    const { user } = req;

    try {
      await MentorshipService.deleteTaskBucket(taskBucketId, user.accountId);
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_BUCKET_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteTaskBucket]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //get all task buckets of mentorship contract
  public static async getTaskBuckets(req, res) {
    const { mentorshipContractId } = req.params;
    const { user } = req;

    try {
      const taskBuckets = await MentorshipService.getTaskBuckets(
        mentorshipContractId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          taskBuckets,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getTaskBuckets]:' + e.toString());
      if (
        e.message ===
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //================= TASK =====================
  public static async addTask(req, res) {
    const { user } = req;
    const { newTask } = req.body;
    const { taskBucketId } = req.params;

    try {
      const createdTask = await MentorshipService.addTask(
        user.accountId,
        taskBucketId,
        newTask
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_CREATE, createdTask },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.addTask]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async editTask(req, res) {
    const { taskId } = req.params;
    const { editedTask } = req.body;
    const { user } = req;

    try {
      const updatedTask = await MentorshipService.editTask(
        user.accountId,
        taskId,
        editedTask
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_EDIT, updatedTask },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.editTask]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.TASK_MISSING ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async deleteTask(req, res) {
    const { taskId } = req.params;
    const { user } = req;

    try {
      await MentorshipService.deleteTask(taskId, user.accountId);
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.TASK_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteTask]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === MENTORSHIP_ERRORS.TASK_MISSING ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //get all tasks in task bucket
  public static async getTasks(req, res) {
    const { taskBucketId } = req.params;
    const { user } = req;

    try {
      const tasks = await MentorshipService.getTasks(
        taskBucketId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          tasks,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getTasks]:' + e.toString());
      if (
        e.message ===
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  // ==================================== SENSEI MENTEE ====================================
  public static async getSenseiMenteeList(req, res) {
    const { accountId } = req.params;

    try {
      const menteeList = await MentorshipService.getSenseiMenteeList(accountId);
      return apiResponse.result(
        res,
        { message: 'success', students: menteeList },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getSenseiMenteeList]:' + e.message);
      return Utility.apiErrorResponse(res, e, [ERRORS.USER_DOES_NOT_EXIST]);
    }
  }
}
