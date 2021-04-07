import { Op } from 'sequelize';
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';

export default class SearchService {
  public static async searchForUsers(query) {
    const userResults = await User.findAll({
      where: {
        [Op.or]: [
          { username: query },
          { firstName: query },
          { lastName: query },
        ],
      },
    });
    if (userResults.length === 0) {
      return [];
    } else return userResults;
  }

  public static async searchForMentorshipListings(query) {
    const mentorshipResults = await MentorshipListing.findAll({
      where: {
        name: {
          [Op.like]: `%${query}%`,
        },
      },
    });
    if (mentorshipResults.length === 0) {
      return [];
    } else return mentorshipResults;
  }

  public static async searchForCourses(query) {
    const courseResults = await Course.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`,
        },
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
      },
    });
    if (courseResults.length === 0) {
      return [];
    } else return courseResults;
  }
}
