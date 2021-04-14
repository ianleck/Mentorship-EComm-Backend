import _ from 'lodash';
import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import {
  ADMIN_VERIFIED_ENUM,
  APPROVAL_STATUS,
  CONTRACT_PROGRESS_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import {
  CART_ERRORS,
  COURSE_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
} from '../constants/errors';
import { Cart } from '../models/Cart';
import { CartToCourse } from '../models/CartToCourse';
import { CartToMentorshipListing } from '../models/CartToMentorshipListing';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { MentorshipListingToCategory } from '../models/MentorshipListingToCategory';
import { User } from '../models/User';

export default class CartService {
  // ======================================== CART ========================================

  public static async addCourse(courseId: string, studentId: string) {
    const student = await User.findByPk(studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const course = await Course.findOne({
      where: {
        courseId,
        visibility: VISIBILITY_ENUM.PUBLISHED,
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
        publishedAt: { [Op.not]: null },
      },
    });
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const purchasedCourse = await CourseContract.findOne({
      where: { accountId: studentId, courseId },
    });
    if (purchasedCourse) throw new Error(CART_ERRORS.COURSE_PURCHASED);

    const cart = await this.setupCart(studentId);
    const cartId = cart.cartId;

    const addedCourse = await CartToCourse.findOne({
      where: { cartId, courseId },
    });
    if (addedCourse) throw new Error(CART_ERRORS.COURSE_ALREADY_ADDED);

    await new CartToCourse({ cartId, courseId }).save();

    return await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
  }

  public static async addMentorshipListing(
    mentorshipContractId: string,
    studentId: string,
    numSlots: number
  ) {
    const student = await User.findByPk(studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        progress:
          CONTRACT_PROGRESS_ENUM.NOT_STARTED || CONTRACT_PROGRESS_ENUM.ONGOING,
        senseiApproval: APPROVAL_STATUS.APPROVED,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    const cart = await this.setupCart(studentId);

    const cartId = cart.cartId;

    await new CartToMentorshipListing({
      cartId,
      mentorshipListingId: mentorshipContract.mentorshipListingId,
      numSlots,
    }).save();

    return await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
  }

  public static async updateMentorshipCartQuantity(
    cartId: string,
    mentorshipListingId: string,
    numSlots: string
  ) {
    const mentorshipCartItem = await CartToMentorshipListing.findOne({
      where: { cartId, mentorshipListingId },
    });
    if (!mentorshipCartItem) throw new Error(CART_ERRORS.ITEM_MISSING);

    await mentorshipCartItem.update({ numSlots });
  }

  public static async deleteItems(
    courseIds: string[],
    mentorshipListingIds: string[],
    studentId: string
  ) {
    const student = await User.findByPk(studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    let cart = await Cart.findOne({ where: { studentId } });
    if (!cart) {
      cart = new Cart({
        studentId,
      });
      await cart.save();
      return cart;
    }

    const cartId = cart.cartId;

    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map(async (courseId) => {
          await CartToCourse.destroy({
            where: {
              cartId,
              courseId,
            },
          });
        })
      );
    }

    if (mentorshipListingIds && mentorshipListingIds.length > 0) {
      await Promise.all(
        mentorshipListingIds.map(async (mentorshipListingId) => {
          await CartToMentorshipListing.destroy({
            where: {
              cartId,
              mentorshipListingId,
            },
          });
        })
      );
    }

    return await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
  }

  public static async setupCart(studentId: string) {
    let cart = await Cart.findOne({ where: { studentId } });
    if (!cart) {
      cart = new Cart({
        studentId,
      });
      await cart.save();
    }
    return cart;
  }

  public static async viewCart(studentId: string) {
    const student = await User.findByPk(studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const cart = await this.setupCart(studentId);

    const cartId = cart.cartId;
    return await Cart.findByPk(cartId, {
      include: [
        { model: Course, include: [Category] },
        { model: MentorshipListing, include: [Category] },
      ],
    });
  }

  // ======================================== UPSELL ========================================

  // 1. On course page
  public static async upsellOnCourses(courseId: string, accountId: string) {
    const course = await Course.findByPk(courseId, {
      include: [CourseListingToCategory],
    });
    // Show mentorships by same sensei
    const senseiMentorships = await MentorshipListing.findAll({
      where: {
        accountId: course.accountId,
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (senseiMentorships) return senseiMentorships;
    // If don't have, show other mentorships in same category
    const courseCategoryIds = course.Categories.map((category) => {
      return category.categoryId;
    });
    const categoryMentorships = await MentorshipListing.findAll({
      where: {
        '$Categories.categoryId$': { [Op.in]: courseCategoryIds },
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (categoryMentorships) return categoryMentorships;
    // If don't have, show random mentorships in categories of interest
    const user = await User.findByPk(accountId, { include: [Category] });
    const userInterests = user.Interests.map((category) => {
      return category.categoryId;
    });
    const interestMentorships = await MentorshipListing.findAll({
      where: {
        '$Categories.categoryId$': { [Op.in]: userInterests },
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (interestMentorships) return interestMentorships;
    // If don't have show random mentorships
    const mentorshipListings = await MentorshipListing.findAll({
      where: {
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
      order: sequelize.random(),
      limit: 10,
    });
    return mentorshipListings;
  }

  // 2. On mentorship listing page
  public static async upsellOnMentorships(
    mentorshipListingId: string,
    accountId: string
  ): Promise<Course[]> {
    const mentorship = await MentorshipListing.findByPk(mentorshipListingId, {
      include: [MentorshipListingToCategory],
    });
    // Show courses by same sensei
    const senseiCourses = await Course.findAll({
      where: {
        accountId: mentorship.accountId,
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (senseiCourses) return senseiCourses;
    // If don't have, show other courses in same category
    const mentorshipCategoryIds = mentorship.Categories.map((category) => {
      return category.categoryId;
    });
    const categoryCourses = await Course.findAll({
      where: {
        '$Categories.categoryId$': { [Op.in]: mentorshipCategoryIds },
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (categoryCourses) return categoryCourses;
    // If don't have, show random courses in categories of interest
    const user = await User.findByPk(accountId, { include: [Category] });
    const userInterests = user.Interests.map((category) => {
      return category.categoryId;
    });
    const interestCourses = await Course.findAll({
      where: {
        '$Categories.categoryId$': { [Op.in]: userInterests },
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (interestCourses) return interestCourses;
    // If don't have, show random courses
    const courses = await Course.findAll({
      where: {
        visibility: VISIBILITY_ENUM.PUBLISHED,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
      order: sequelize.random(),
      limit: 10,
    });
    return courses;
  }

  /*
 3. On checkout page - If only have courses, 
 show per option 1 above. 
 If only mentorship, show per option 2 above. 
 If have both mentorship and course, take from categories
 */
  public static async upsellCheckout(accountId: string) {
    const cart = await this.viewCart(accountId);
    if (cart.MentorPasses) {
      if (cart.Courses) {
        //take all categories of courses/mentorships in cart
        //then randomly pick 5 course and 5 mentorships
        const courseCategoryIds = cart.Courses.map((course) => {
          return course.Categories.map((category) => {
            return category.categoryId;
          });
        });
        const mentorshipCategoryIds = cart.MentorPasses.map((mentorship) => {
          return mentorship.Categories.map((category) => {
            return category.categoryId;
          });
        });
        const categoryIds = _.flatten([
          ...new Set([...courseCategoryIds, ...mentorshipCategoryIds]),
        ]);
        const mentorshipListingIds = cart.MentorPasses.map((mentorship) => {
          return mentorship.mentorshipListingId;
        });
        const courseIds = cart.Courses.map((course) => {
          return course.courseId;
        });
        const mentorshipListings = await MentorshipListing.findAll({
          where: {
            mentorshipListingIds: { [Op.notIn]: mentorshipListingIds },
            '$Categories.categoryId$': { [Op.in]: categoryIds },
            visibility: VISIBILITY_ENUM.PUBLISHED,
          },
          include: [
            {
              model: User,
              attributes: [
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
          order: sequelize.random(),
          limit: 5,
        });
        const courses = await Course.findAll({
          where: {
            courseIds: { [Op.notIn]: courseIds },
            '$Categories.categoryId$': { [Op.in]: categoryIds },
            visibility: VISIBILITY_ENUM.PUBLISHED,
          },
          include: [
            {
              model: User,
              attributes: [
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
          order: sequelize.random(),
          limit: 5,
        });
        return { mentorshipListings, courses };
      }

      const upsoldCourses = await this.upsellOnMentorships(
        cart.MentorPasses[0].mentorshipListingId,
        accountId
      );
      return { courses: upsoldCourses };
    }

    const upsoldMentorships = await this.upsellOnCourses(
      cart.Courses[0].courseId,
      accountId
    );
    return { mentorships: upsoldMentorships };
  }
}
