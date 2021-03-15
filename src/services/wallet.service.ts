import { Billing } from '../models/Billing';
import { Wallet } from '../models/Wallet';

export default class WalletService {
  public static async addBillings(courseId: string, studentId: string) {
    // const student = await User.findByPk(studentId);
    // if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);
    // const course = await Course.findOne({
    //   where: {
    //     courseId,
    //     visibility: VISIBILITY_ENUM.PUBLISHED,
    //     adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
    //     publishedAt: { [Op.not]: null },
    //   },
    // });
    // if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    // const wallet = await this.setupWallet(ownerId);
    // const cartId = cart.cartId;
    // const addedCourse = await CartToCourse.findOne({
    //   where: { cartId, courseId },
    // });
    // if (addedCourse) throw new Error(CART_ERRORS.COURSE_ALREADY_ADDED);
    // await new CartToCourse({ cartId, courseId }).save();
    // return await Cart.findByPk(cartId, {
    //   include: [Course, MentorshipListing],
    // });
  }

  public static async setupWallet(ownerId: string) {
    let wallet = await Wallet.findOne({ where: { ownerId } });
    if (!wallet) {
      wallet = new Wallet({
        ownerId,
      });
      await wallet.save();
    }
    return wallet;
  }

  public static async viewWallet(ownerId: string) {
    const wallet = await this.setupWallet(ownerId);

    const walletId = wallet.walletId;
    return await Wallet.findByPk(walletId, {
      include: [Billing],
    });
  }
}
