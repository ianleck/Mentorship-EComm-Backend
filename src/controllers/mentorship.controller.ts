import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import { USER_TYPE_ENUM_OPTIONS } from '../constants/enum';
import { MENTORSHIP_ERRORS } from '../constants/errors';
import MentorshipService from '../services/mentorship.service';

const success_listing = 'Mentorship Listing has been successfully created';

export class MentorshipController {
  public static async createListing(req, res) {
    const { user } = req;
    const { newListing } = req.body;

    if (user.accountType != USER_TYPE_ENUM_OPTIONS.SENSEI) {
      // need to add check that sensei is verified
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: MENTORSHIP_ERRORS.UNAUTH_LISTING,
      });
    }
    try {
      const createdListing = await MentorshipService.createListing(newListing);
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
