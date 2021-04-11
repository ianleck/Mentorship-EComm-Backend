import { Op } from 'sequelize';
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';

export default class SearchService {
  public static async searchForUsers(query) {
    const Sequelize = require('sequelize');
    const userResults = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } },
          Sequelize.where(
            Sequelize.fn(
              'concat',
              Sequelize.col('firstName'),
              ' ',
              Sequelize.col('lastName')
            ),
            {
              [Op.like]: `%${query}%`,
            }
          ),
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
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
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
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
    if (courseResults.length === 0) {
      return [];
    } else return courseResults;
  }
}
