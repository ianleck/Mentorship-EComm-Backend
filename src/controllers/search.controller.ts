import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR } from '../constants/errors';
import SearchService from '../services/search.service';
import apiResponse from '../utilities/apiResponse';

export class SearchController {
  public static async searchByFilter(req, res) {
    const { query } = req.params;

    try {
      const users = await SearchService.searchForUsers(query);
      const mentorships = await SearchService.searchForMentorshipListings(
        query
      );
      const courses = await SearchService.searchForCourses(query);
      return apiResponse.result(
        res,
        {
          message: 'success',
          users,
          mentorships,
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[searchController.searchByFilter]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
