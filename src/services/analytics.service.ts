import _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import {
  APPROVAL_STATUS,
  BILLING_STATUS,
  BILLING_TYPE,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { Billing } from '../models/Billing';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { MentorshipListingToCategory } from '../models/MentorshipListingToCategory';
import { User } from '../models/User';

export default class AnalyticsService {
  public static async getMentorshipSales(
    accountId: string,
    userType: USER_TYPE_ENUM,
    dateStart: Date,
    dateEnd: Date
  ) {
    if (userType == USER_TYPE_ENUM.ADMIN) {
      const listings = await MentorshipListing.findAll();
      const listingIds = listings.map((l) => l.mentorshipListingId);
      const billings = await Billing.findAll({
        where: {
          productId: { [Op.in]: listingIds },
          status: BILLING_STATUS.PAID,
          createdAt: {
            [Op.gte]: dateStart,
            [Op.lte]: dateEnd,
          },
        },
        group: ['Billing.productId'],
        attributes: [
          [
            Sequelize.fn('SUM', Sequelize.col('mentorPassCount')),
            'mentorPassCount',
          ],
        ],
        include: [
          {
            model: MentorshipListing,
            attributes: ['mentorshipListingId', 'name'],
            include: [
              {
                model: User,
                attributes: ['accountId', 'username', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      });
      return billings;
    } else {
      //sensei
      const listings = await MentorshipListing.findAll({
        where: {
          accountId,
        },
      });
      const listingIds = listings.map((l) => l.mentorshipListingId);
      const billings = await Billing.findAll({
        where: {
          productId: { [Op.in]: listingIds },
          status: BILLING_STATUS.PAID,
          createdAt: {
            [Op.gte]: dateStart,
            [Op.lte]: dateEnd,
          },
        },
        group: ['Billing.productId'],
        attributes: [
          [
            Sequelize.fn('SUM', Sequelize.col('mentorPassCount')),
            'mentorPassCount',
          ],
        ],
        include: [
          {
            model: MentorshipListing,
            attributes: ['mentorshipListingId', 'name'],
          },
        ],
      });
      return billings;
    }
  }

  public static async getCourseSales(
    accountId: string,
    userType: USER_TYPE_ENUM,
    dateStart: Date,
    dateEnd: Date
  ) {
    if (userType == USER_TYPE_ENUM.ADMIN) {
      const courses = await Course.findAll();
      const courseIds = courses.map((c) => c.courseId);
      const billings = await Billing.findAll({
        where: {
          productId: { [Op.in]: courseIds },
          status: BILLING_STATUS.PAID,
          createdAt: {
            [Op.gte]: dateStart,
            [Op.lte]: dateEnd,
          },
        },
        group: ['Billing.productId'],
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('productId')), 'courseCount'],
        ],
        include: [
          {
            model: Course,
            attributes: ['courseId', 'title'],
            include: [
              {
                model: User,
                attributes: ['accountId', 'username', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      });
      return billings;
    } else {
      //sensei
      const courses = await Course.findAll({
        where: {
          accountId,
        },
      });
      const courseIds = courses.map((c) => c.courseId);
      const billings = await Billing.findAll({
        where: {
          productId: { [Op.in]: courseIds },
          status: BILLING_STATUS.PAID,
          createdAt: {
            [Op.gte]: dateStart,
            [Op.lte]: dateEnd,
          },
        },
        group: ['Billing.productId'],
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('productId')), 'courseCount'],
        ],
        include: [
          {
            model: Course,
            attributes: ['courseId', 'title'],
          },
        ],
      });
      return billings;
    }
  }

  //Returns count of APPROVED applications per listing
  public static async getApprovedApplications(
    accountId: string,
    dateStart: Date,
    dateEnd: Date
  ) {
    const senseiApproval = APPROVAL_STATUS.APPROVED;
    return await this.applicationCount(
      accountId,
      dateStart,
      dateEnd,
      senseiApproval
    );
  }

  //Returns count of REJECTED applications per listing
  public static async getRejectedApplications(
    accountId: string,
    dateStart: Date,
    dateEnd: Date
  ) {
    const senseiApproval = APPROVAL_STATUS.REJECTED;
    return await this.applicationCount(
      accountId,
      dateStart,
      dateEnd,
      senseiApproval
    );
  }

  //Returns count of ALL applications per listing
  public static async getAllApplications(
    accountId: string,
    dateStart: Date,
    dateEnd: Date
  ) {
    const listings = await MentorshipListing.findAll({
      where: {
        accountId,
      },
    });
    const listingIds = listings.map((l) => l.mentorshipListingId);
    const listingDict = _.keyBy(
      listings,
      (listing) => listing.mentorshipListingId
    );
    const applications = await MentorshipContract.findAll({
      where: {
        mentorshipListingId: { [Op.in]: listingIds },
        createdAt: {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        },
      },
      group: ['MentorshipContract.mentorshipListingId'],
      attributes: [
        [
          Sequelize.fn('COUNT', Sequelize.col('mentorshipListingId')),
          'applicationsCount',
        ],
        'mentorshipListingId',
        // 'name',
      ],
    });
    const applicationsByListing = applications.map((application) => {
      const name = listingDict[application.mentorshipListingId].name;
      return { name, application };
    });
    return applicationsByListing;
  }

  public static async applicationCount(
    accountId: string,
    dateStart: Date,
    dateEnd: Date,
    senseiApproval?: APPROVAL_STATUS
  ) {
    const listings = await MentorshipListing.findAll({
      where: {
        accountId,
      },
    });
    const listingIds = listings.map((l) => l.mentorshipListingId);
    const applications = await MentorshipContract.findAll({
      where: {
        mentorshipListingId: { [Op.in]: listingIds },
        createdAt: {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        },
        senseiApproval,
      },
      group: ['MentorshipContract.mentorshipListingId'],
      attributes: [
        [
          Sequelize.fn('COUNT', Sequelize.col('mentorshipListingId')),
          'applicationsCount',
        ],
        'mentorshipListingId',
      ],
    });
    return applications;
  }

  public static async getCourseCategorySales(dateStart: Date, dateEnd: Date) {
    const billings = await Billing.findAll({
      where: {
        status: BILLING_STATUS.PAID,
        createdAt: {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        },
        billingType: BILLING_TYPE.COURSE,
      },
    });

    let categoryNameArr = [];

    //For each billing, insert the categoryIds of the Course in the array
    await Promise.all(
      billings.map(async (billing: Billing) => {
        const course = await Course.findByPk(billing.productId);
        const categories = await CourseListingToCategory.findAll({
          where: {
            courseId: course.courseId,
          },
        });
        //array of categoryIds in course
        const categoryIds = categories.map((c) => c.categoryId);
        const categoriesRetrieved = await Category.findAll({
          where: {
            categoryId: { [Op.in]: categoryIds },
          },
        });
        const categoryNames = categoriesRetrieved.map((cat) => cat.name);
        categoryNameArr = categoryNameArr.concat(categoryNames);
      })
    );

    //To count number of occurrences of each categoryId
    let initialValue = {};
    let reducer = function (tally, vote) {
      if (!tally[vote]) {
        tally[vote] = 1;
      } else {
        tally[vote] = tally[vote] + 1;
      }
      return tally;
    };
    let categoryCount = categoryNameArr.reduce(reducer, initialValue);
    return categoryCount;
  }

  public static async getMentorshipCategorySales(
    dateStart: Date,
    dateEnd: Date
  ) {
    const billings = await Billing.findAll({
      where: {
        status: BILLING_STATUS.PAID,
        createdAt: {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        },
        billingType: BILLING_TYPE.MENTORSHIP,
      },
    });

    let categoryNameArr = [];

    //For each billing, insert the categoryIds of the Mentorship in the array
    await Promise.all(
      billings.map(async (billing: Billing) => {
        const mentorship = await MentorshipListing.findByPk(billing.productId);
        const categories = await MentorshipListingToCategory.findAll({
          where: {
            mentorshipListingId: mentorship.mentorshipListingId,
          },
        });
        //array of categoryIds in mentorship
        const categoryIds = categories.map((c) => c.categoryId);
        const categoriesRetrieved = await Category.findAll({
          where: {
            categoryId: { [Op.in]: categoryIds },
          },
        });
        const categoryNames = categoriesRetrieved.map((cat) => cat.name);
        categoryNameArr = categoryNameArr.concat(categoryNames);
      })
    );

    //To count number of occurrences of each categoryId
    let initialValue = {};
    let reducer = function (tally, vote) {
      if (!tally[vote]) {
        tally[vote] = 1;
      } else {
        tally[vote] = tally[vote] + 1;
      }
      return tally;
    };
    let categoryCount = categoryNameArr.reduce(reducer, initialValue);
    return categoryCount;
  }
}
