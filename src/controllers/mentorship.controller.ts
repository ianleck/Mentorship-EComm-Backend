import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import MentorshipService from '../services/mentorship.service';

const success_listing = 'Mentorship Listing has been successfully created';
const success_update = 'Mentorship Listing has been successfully updated';
const success_delete = 'Mentorship Listing has been successfully deleted';
export class MentorshipController {
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
        { message: success_listing, createdListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.createListing]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async deleteListing(req, res) {
    const { mentorshipListingId } = req.params;

    try {
      await MentorshipService.deleteListing(mentorshipListingId);
      return apiResponse.result(
        res,
        { message: success_update },
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
        { message: success_update, updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[mentorshipController.updateListing]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
