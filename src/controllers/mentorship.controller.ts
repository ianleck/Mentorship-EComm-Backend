import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { USER_TYPE_ENUM } from '../constants/enum';
import { ERRORS, MENTORSHIP_ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { MENTORSHIP_RESPONSE } from '../constants/successMessages';
import MentorshipService from '../services/mentorship.service';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';

export class MentorshipController {
  // ==================== MENTORSHIP LISTINGS ====================
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
    const { mentorshipListingId } = req.params;
    const { mentorshipListing } = req.body;

    try {
      const updatedListing = await MentorshipService.updateListing(
        mentorshipListingId,
        mentorshipListing
      );
      return apiResponse.result(
        res,
        { message: MENTORSHIP_RESPONSE.LISTING_UPDATE, updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateListing]:' + e.message);
      if (e.message === MENTORSHIP_ERRORS.LISTING_MISSING) {
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

    try {
      const listing = await MentorshipService.getListing(mentorshipListingId);
      const experiences = await UserService.getExperienceByAccountId(
        listing.accountId
      );
      // remove contracts if request user is not the owner of the listing and not an admin
      if (
        listing.accountId !== user.accountId &&
        user.userType !== USER_TYPE_ENUM.ADMIN
      ) {
        listing.MentorshipContracts = null;
      }

      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipListing: listing,
          experience: experiences,
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

  // ==================== MENTORSHIP CONTRACTS ====================
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
      if (e.message === MENTORSHIP_ERRORS.CONTRACT_EXISTS) {
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

    try {
      const mentorshipContract = await MentorshipService.acceptContract(
        mentorshipContractId,
        user.accountId
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
      if (
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === ERRORS.STUDENT_DOES_NOT_EXIST ||
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
      if (
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === ERRORS.STUDENT_DOES_NOT_EXIST ||
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

  //get ALL mentorship contracts of ONE sensei
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
}
