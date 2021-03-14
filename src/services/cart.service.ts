import { Op } from 'sequelize';
import {
  ADMIN_VERIFIED_ENUM,
  CONTRACT_PROGRESS_ENUM,
  MENTORSHIP_CONTRACT_APPROVAL,
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
import { Course } from '../models/Course';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';

export default class CartService {
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
    studentId: string
  ) {
    const student = await User.findByPk(studentId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        progress: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.APPROVED,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    const cart = await this.setupCart(studentId);

    const cartId = cart.cartId;

    await new CartToMentorshipListing({
      cartId,
      mentorshipListingId: mentorshipContract.mentorshipListingId,
    }).save();

    return await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
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

    if (courseIds.length > 0) {
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

    if (mentorshipListingIds.length > 0) {
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
    const cart = await this.setupCart(studentId);

    const cartId = cart.cartId;
    return await Cart.findByPk(cartId, {
      include: [Course, MentorshipListing],
    });
  }
}