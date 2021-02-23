import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import MentorshipService from '../services/mentorship.service';

const success_listing = 'Mentorship Listing has been successfully created';

export class MentorshipController {
  public static async createListing(req, res) {
    const { accountId } = req.params;
    const { newListing } = req.body;

    try {
      const createdListing = await MentorshipService.createListing(
        accountId,
        newListing
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
}
