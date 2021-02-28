import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import MentorshipService from '../services/mentorship.service';
import { USER_TYPE_ENUM } from '../constants/enum';

export const LISTING_CREATE =
  'Mentorship Listing has been successfully created';
export const LISTING_UPDATE =
  'Mentorship Listing has been successfully updated';
export const LISTING_DELETE =
  'Mentorship Listing has been successfully deleted';
export const LISTING_MISSING = 'Please create a mentorship contract';

export const CONTRACT_CREATE =
  'Mentorship Contract has been successfully created';
export const CONTRACT_UPDATE =
  'Mentorship Contract has been successfully updated';
export const CONTRACT_DELETE =
  'Mentorship Contract has been successfully deleted';
export const CONTRACT_EXISTS =
  'A mentorship contract has already been made for this mentor. Please edit existing mentorship contract.';
export const CONTRACT_MISSING =
  'No pending mentorship contract found. Please create a mentorship contract';
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
        { message: LISTING_CREATE, createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
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
        { message: LISTING_UPDATE, updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async deleteListing(req, res) {
    const { mentorshipListingId } = req.params;

    try {
      await MentorshipService.deleteListing(mentorshipListingId);
      return apiResponse.result(
        res,
        { message: LISTING_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async getSenseiMentorshipListings(req, res) {
    // const { user } = req; //user is the user who is making the request
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
        message: e.toString(),
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
        { message: CONTRACT_CREATE, createdContract },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createContract]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async updateContract(req, res) {
    const { mentorshipContractId } = req.params;
    const { statement } = req.body;

    // Check that there is an existing mentorship contract
    try {
      const updatedContract = await MentorshipService.updateContract(
        mentorshipContractId,
        statement
      );
      return apiResponse.result(
        res,
        { message: CONTRACT_UPDATE, updatedContract },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateContract]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async deleteContract(req, res) {
    const { mentorshipContractId } = req.params;

    try {
      await MentorshipService.deleteContract(mentorshipContractId);
      return apiResponse.result(
        res,
        { message: CONTRACT_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteContract]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
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

      // remove contracts if request user is not the owner of the listing and not an admin
      if (
        listing.accountId !== user.accountId &&
        user.userType !== USER_TYPE_ENUM.ADMIN
      ) {
        listing.MentorshipContracts = null;
      }
      return apiResponse.result(
        res,
        { message: 'success', mentorshipListing: listing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.getListing]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
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
    }
  }

  //get ONE mentorship contract of ONE student (for admin and student)
  public static async getStudentMentorshipContract(req, res) {
    const { user } = req; //user is the user who is making the request
    const { mentorshipContractId } = req.params;

    try {
      const contract = await MentorshipService.getStudentMentorshipContract(
        mentorshipContractId
      );
      if (
        user.accountId !== contract.accountId &&
        // user.accountId !== contract.senseiId && // TO BE ADDEDIN THE FUTUR
        user.userType !== USER_TYPE_ENUM.SENSEI && // TO BE DELETED IN THE FUTURE
        user.userType !== USER_TYPE_ENUM.ADMIN
      ) {
        return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
          message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        });
      }
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
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  //get ALL mentorship contracts of ONE student
  public static async getAllStudentMentorshipContracts(req, res) {
    const { accountId } = req.params;
    const { user } = req; //user is the user who is making the request

    if (
      user.accountId !== accountId &&
      user.userType !== USER_TYPE_ENUM.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

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
    }
  }

  //get ALL mentorship contracts of ONE sensei
  public static async getSenseiMentorshipContracts(req, res) {
    const { accountId } = req.params; //accountId of the sensei
    const { user } = req; //user is the user who is making the request

    if (
      user.accountId !== accountId &&
      user.userType !== USER_TYPE_ENUM.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

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
    }
  }

  //get ALL mentorship contracts of ONE sensei for ONE listing
  // public static async getSenseiListingMentorshipContracts(req, res) {
  //   const { mentorshipListingId } = req.params;
  //   const { user } = req; //user is the user who is making the request

  //   console.log(' user=', user);
  //   if (
  //     user.userType !== USER_TYPE_ENUM.SENSEI &&
  //     user.userType !== USER_TYPE_ENUM.ADMIN
  //   ) {
  //     return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
  //       message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
  //     });
  //   }

  //   try {
  //     const contracts = await MentorshipService.getSenseiListingMentorshipContracts(
  //       mentorshipListingId,
  //       user.accountId
  //     );
  //     return apiResponse.result(
  //       res,
  //       {
  //         message: 'success',
  //         contracts,
  //       },
  //       httpStatusCodes.OK
  //     );
  //   } catch (e) {
  //     logger.error(
  //       '[mentorshipController.getSenseiListingMentorshipContracts]:' +
  //         e.toString()
  //     );
  //   }
  // }
}
