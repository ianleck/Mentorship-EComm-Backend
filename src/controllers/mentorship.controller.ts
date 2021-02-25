import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import MentorshipService from '../services/mentorship.service';

const LISTING_CREATE = 'Mentorship Listing has been successfully created';
const LISTING_UPDATE = 'Mentorship Listing has been successfully updated';
const LISTING_DELETE = 'Mentorship Listing has been successfully deleted';

const APPLICATION_CREATE =
  'Mentorship Application has been successfully created';
const APPLICATION_UPDATE =
  'Mentorship Application has been successfully updated';
const APPLICATION_DELETE =
  'Mentorship Application has been successfully deleted';
export class MentorshipController {
  // ==================== MENTORSHIP LISTINGS ====================
  public static async createListing(req, res) {
    const { accountId } = req.params;
    const { newMentorshipListing } = req.body;

    try {
      const createdListing = await MentorshipService.createListing(
        accountId,
        newMentorshipListing
      );
      return apiResponse.result(
        res,
        { message: LISTING_CREATE, createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createListing]:' + e.toString());
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
        '[mentorshipController.getMentorshipListings]:' + e.toString()
      );
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
      logger.error('[mentorshipController.deleteListing]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
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
      logger.error('[mentorshipController.updateListing]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  // ==================== MENTORSHIP APPLICATIONS ====================
  public static async createApplication(req, res) {
    const { mentorshipListingId, accountId } = req.params;

    try {
      const createdApplication = await MentorshipService.createApplication(
        mentorshipListingId,
        accountId
      );
      return apiResponse.result(
        res,
        { message: APPLICATION_CREATE, createdApplication },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[mentorshipController.createApplication]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
