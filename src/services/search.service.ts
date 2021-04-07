import { Op } from 'sequelize';
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { Course } from '../models/Course';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';

export default class SearchService {
  public static async searchForUsers(filter: {
    username?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const likeKeys = ['username', 'firstName', 'lastName'];
    let where = {};
    Object.keys(filter).forEach((key) => {
      if (likeKeys.indexOf(key) !== -1) {
        where[key] = {
          [Op.like]: `%${filter[key]}%`,
        };
      }
    });
    if (Object.keys(where).length === 0) {
      return [];
    } else return await User.findAll({ where });
  }

  public static async searchForMentorshipListings(filter: { name?: string }) {
    const likeKeys = ['name'];
    let where = {};
    Object.keys(filter).forEach((key) => {
      if (likeKeys.indexOf(key) !== -1) {
        where[key] = {
          [Op.like]: `%${filter[key]}%`,
        };
      }
    });
    if (Object.keys(where).length === 0) {
      return [];
    } else return await MentorshipListing.findAll({ where });
  }

  public static async searchForCourses(filter: { title?: string }) {
    const likeKeys = ['title'];
    let where = { adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED };
    Object.keys(filter).forEach((key) => {
      if (likeKeys.indexOf(key) !== -1) {
        where[key] = {
          [Op.like]: `%${filter[key]}%`,
        };
      }
    });
    if (Object.keys(where).length === 1) {
      return [];
    } else {
      return await Course.findAll({ where });
    }
  }
}
