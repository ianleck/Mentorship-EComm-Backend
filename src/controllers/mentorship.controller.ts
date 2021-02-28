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
export const LISTING_MISSING = 'Please create a mentorship application';

export const APPLICATION_CREATE =
  'Mentorship Application has been successfully created';
export const APPLICATION_UPDATE =
  'Mentorship Application has been successfully updated';
export const APPLICATION_DELETE =
  'Mentorship Application has been successfully deleted';
export const APPLICATION_EXISTS =
  'A mentorship application has already been made for this mentor. Please edit existing mentorship application.';
export const APPLICATION_MISSING =
  'No pending mentorship application found. Please create a mentorship application';
export class MentorshipController {
  // ==================== MENTORSHIP LISTINGS ====================
  public static async createListing(req, res) {
    const { accountId } = req.params;
    const { mentorshipListing } = req.body;

    try {
      const createdListing = await MentorshipService.createListing(
        accountId,
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
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the sensei who is being looked at

    if (
      user.accountId !== accountId &&
      user.userType !== USER_TYPE_ENUM.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

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
      logger.error('[mentorshipController.getMentorshipListings]:' + e.message);
    }
  }

  // ==================== MENTORSHIP APPLICATIONS ====================
  public static async createApplication(req, res) {
    const { mentorshipListingId, accountId } = req.params;
    const { statement } = req.body;

    // Check that there is no existing mentorship application
    try {
      const createdApplication = await MentorshipService.createApplication(
        mentorshipListingId,
        accountId,
        statement
      );
      return apiResponse.result(
        res,
        { message: APPLICATION_CREATE, createdApplication },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createApplication]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async updateApplication(req, res) {
    const { mentorshipContractId } = req.params;
    const { statement } = req.body;

    // Check that there is an existing mentorship application
    try {
      const updatedApplication = await MentorshipService.updateApplication(
        mentorshipContractId,
        statement
      );
      return apiResponse.result(
        res,
        { message: APPLICATION_UPDATE, updatedApplication },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateApplication]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async deleteApplication(req, res) {
    const { mentorshipContractId } = req.params;

    try {
      await MentorshipService.deleteApplication(mentorshipContractId);
      return apiResponse.result(
        res,
        { message: APPLICATION_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.deleteApplication]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  //get ALL mentorship applications
  public static async getAllMentorshipApplications(req, res) {
    try {
      const mentorshipApplications = await MentorshipService.getAllMentorshipApplications();
      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipApplications,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllMentorshipApplications]:' + e.toString()
      );
    }
  }

  //get ONE mentorship application of ONE student (for admin and student)
  public static async getStudentMentorshipApplication(req, res) {
    const { user } = req; //user is the user who is making the request
    const { mentorshipContractId } = req.params;

    try {
      const application = await MentorshipService.getStudentMentorshipApplication(
        mentorshipContractId
      );
      if (
        user.accountId !== application.accountId &&
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
          application,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getStudentMentorshipApplication]:' + e.toString()
      );
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  //get ALL mentorship applications of ONE student
  public static async getAllStudentMentorshipApplications(req, res) {
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
      const applications = await MentorshipService.getAllStudentMentorshipApplications(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          applications,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getAllStudentMentorshipApplications]:' +
          e.toString()
      );
    }
  }

  //get ALL mentorship applications of ONE sensei
  public static async getSenseiMentorshipApplications(req, res) {
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
      const applications = await MentorshipService.getSenseiMentorshipApplications(
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          applications,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getSenseiMentorshipApplications]:' + e.toString()
      );
    }
  }

  //get ALL mentorship applications of ONE sensei for ONE listing
  public static async getSenseiListingMentorshipApplications(req, res) {
    const { accountId, mentorshipListingId } = req.params;
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
      const applications = await MentorshipService.getSenseiListingMentorshipApplications(
        accountId,
        mentorshipListingId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          applications,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[mentorshipController.getSenseiListingMentorshipApplications]:' +
          e.toString()
      );
    }
  }
}
