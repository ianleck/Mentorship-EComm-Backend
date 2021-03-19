import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import {
  CONTRACT_PROGRESS_ENUM,
  MENTORSHIP_CONTRACT_APPROVAL,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { ERRORS, MENTORSHIP_ERRORS } from '../constants/errors';
import { Category } from '../models/Category';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { MentorshipListingToCategory } from '../models/MentorshipListingToCategory';
import { Review } from '../models/Review';
import { Testimonial } from '../models/Testimonial';
import { User } from '../models/User';
import CartService from './cart.service';
import EmailService from './email.service';
/*type getFilter = {
  where: {
    adminVerified: ADMIN_VERIFIED_ENUM;
    visibility: VISIBILITY_ENUM;
  };
};*/

export default class MentorshipService {
  // ==================== Mentorship Listings ====================

  public static async createListing(
    accountId: string,
    mentorshipListing: {
      name: string;
      description: string;
      categories: string[];
      priceAmount: number;
      visibility: VISIBILITY_ENUM;
    }
  ): Promise<MentorshipListing> {
    const { categories, ...listingWithoutCategories } = mentorshipListing;

    const newListing = new MentorshipListing({
      accountId,
      ...listingWithoutCategories,
    });

    await newListing.save();

    await MentorshipListingToCategory.bulkCreate(
      categories.map((categoryId) => ({
        mentorshipListingId: newListing.mentorshipListingId,
        categoryId,
      }))
    );

    return MentorshipListing.findByPk(newListing.mentorshipListingId, {
      include: [Category],
    });
  }

  public static async deleteListing(
    mentorshipListingId: string
  ): Promise<void> {
    const listingCategories = await MentorshipListingToCategory.findAll({
      where: { mentorshipListingId },
    });

    const existingCategories = listingCategories.map(
      ({ categoryId }) => categoryId
    );

    await this.removeListingCategories(mentorshipListingId, existingCategories);
    await MentorshipListing.destroy({ where: { mentorshipListingId } });
  }

  public static async removeListingCategories(
    mentorshipListingId: string,
    categoriesToRemove: string[]
  ): Promise<void> {
    await Promise.all(
      categoriesToRemove.map(
        async (categoryId) =>
          await MentorshipListingToCategory.destroy({
            where: {
              mentorshipListingId,
              categoryId,
            },
          })
      )
    );
  }

  public static async updateListing(
    mentorshipListingId: string,
    mentorshipListing: {
      name: string;
      description: string;
      categories: string[];
      priceAmount: number;
      visibility: VISIBILITY_ENUM;
    }
  ): Promise<MentorshipListing> {
    const { categories, ...listingWithoutCategories } = mentorshipListing;
    const currListing = await MentorshipListing.findByPk(mentorshipListingId);
    if (!currListing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    await currListing.update(listingWithoutCategories);

    // Find all category associations with listing
    const listingCategories: MentorshipListingToCategory[] = await MentorshipListingToCategory.findAll(
      {
        where: { mentorshipListingId },
      }
    );

    const existingCategories: string[] = listingCategories.map(
      ({ categoryId }) => categoryId
    );
    const updatedCategories: string[] = mentorshipListing.categories;

    const categoriesToAdd = _.difference(updatedCategories, existingCategories);
    const categoriesToRemove = _.difference(
      existingCategories,
      updatedCategories
    );

    // Create new associations to new categories
    await MentorshipListingToCategory.bulkCreate(
      categoriesToAdd.map((categoryId) => ({
        mentorshipListingId,
        categoryId,
      }))
    );

    // Delete associations to removed categories
    await this.removeListingCategories(mentorshipListingId, categoriesToRemove);

    return MentorshipListing.findByPk(currListing.mentorshipListingId, {
      include: [Category],
    });
  }

  public static async getSenseiMentorshipListings(accountId: string) {
    return MentorshipListing.findAll({
      where: { accountId: { [Op.eq]: accountId } },
      include: [Category],
    });
  }

  public static async getAllMentorshipListings() {
    const mentorshipListings = MentorshipListing.findAll({
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    return mentorshipListings;
  }

  /**
   * @param obj = {
   *  mentorshipListingId: string,
   *  extraModels: Models[]
   * }
   */
  private static async getListingWithAssociations({
    mentorshipListingId,
    extraModels,
  }) {
    return await MentorshipListing.findByPk(mentorshipListingId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        ...extraModels,
      ],
    });
  }

  // get one listing
  // if student, return without listing.contracts
  // if sensei/admin return whole obj

  //get all mentorship contracts (for admin)
  public static async getListing(
    mentorshipListingId: string,
    user?
  ): Promise<MentorshipListing> {
    const listingWithoutContracts = await this.getListingWithAssociations({
      mentorshipListingId,
      extraModels: [Review],
    });

    if (!listingWithoutContracts)
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    /** if user is not logged in
     * OR (user is not the sensei who created the mentorship listing AND user is not an admin)
     * Return listing without contracts
     */
    if (
      !user ||
      (user.accountId !== listingWithoutContracts.accountId &&
        user.userType !== USER_TYPE_ENUM.ADMIN)
    ) {
      return listingWithoutContracts;
    }

    // else return listing with contract
    return MentorshipListing.findByPk(mentorshipListingId, {
      include: [Review, MentorshipContract],
    });
  }

  // ==================== MENTORSHIP CONTRACTS ====================
  public static async createContract(
    mentorshipListingId: string,
    accountId: string,
    statement: string
  ): Promise<MentorshipContract> {
    const pendingContract = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
      },
    });
    const existingContract = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.APPROVED,
        progress:
          CONTRACT_PROGRESS_ENUM.NOT_STARTED || CONTRACT_PROGRESS_ENUM.ONGOING,
      },
    });

    if (pendingContract || existingContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_EXISTS);

    const newContract = new MentorshipContract({
      mentorshipListingId,
      accountId,
      statement,
    });

    await newContract.save();

    return newContract;
  }

  public static async updateContract(
    mentorshipContractId: string,
    statement: string,
    accountId
  ): Promise<MentorshipContract> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    if (currContract.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const updatedContract = await currContract.update({
      statement,
    });

    return updatedContract;
  }

  public static async acceptContract(mentorshipContractId, accountId) {
    // Check for existing mentorship contract that is pending
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    // Check that sensei approving is sensei in question on contract
    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    // Check that student still exists
    const student = await User.findByPk(mentorshipContract.accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const acceptedApplication = await mentorshipContract.update({
      senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.APPROVED,
    });

    const mentorshipName = mentorshipListing.name;
    const additional = { mentorshipName };

    await CartService.addMentorshipListing(
      acceptedApplication.mentorshipContractId,
      student.accountId
    );
    //SEND EMAIL TO INFORM OF ACCEPTANCE OF APPLICATION
    await EmailService.sendEmail(student.email, 'acceptContract', additional);

    return acceptedApplication;
  }

  public static async rejectContract(mentorshipContractId, accountId) {
    // Check for existing mentorship contract that is pending
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    // Check that sensei approving is sensei in question on contract
    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    // Check that student still exists
    const student = await User.findByPk(mentorshipContract.accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const rejectedApplication = await mentorshipContract.update({
      senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.REJECTED,
    });

    const mentorshipName = mentorshipListing.name;
    const additional = { mentorshipName };

    //SEND EMAIL TO INFORM OF REJECTION OF APPLICATION
    await EmailService.sendEmail(student.email, 'rejectContract', additional);

    return rejectedApplication;
  }

  public static async deleteContract(
    mentorshipContractId: string,
    accountId
  ): Promise<void> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    if (currContract.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    // Manual cascade deletion of associations - Subscription

    await MentorshipContract.destroy({
      where: {
        mentorshipContractId,
      },
    });
  }

  public static async getAllMentorshipContracts() {
    const mentorshipContracts = await MentorshipContract.findAll();
    return mentorshipContracts;
  }

  //get ALL mentorship contracts of ONE sensei
  public static async getSenseiMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      include: [
        { model: MentorshipListing, where: { accountId } },
        {
          model: User,
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    return mentorshipContracts;
  }

  // if student is viewing the page, returns the existing contract if it exist. Else return null
  public static async getContractIfExist(
    mentorshipListingId: string,
    accountId: string
  ) {
    return await MentorshipContract.findOne({
      where: {
        accountId,
        mentorshipListingId,
      },
    });
  }

  //get ONE mentorship contract of ONE student
  public static async getStudentMentorshipContract(
    mentorshipContractId: string,
    accountId: string,
    userType: USER_TYPE_ENUM
  ) {
    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId,
      {
        include: [MentorshipListing],
      }
    );

    if (
      accountId !== mentorshipContract.accountId &&
      accountId !== mentorshipContract.MentorshipListing.accountId && // TO BE ADDEDIN THE FUTURE
      userType !== USER_TYPE_ENUM.ADMIN
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    return mentorshipContract;
  }

  //get all mentorshipContracts created by this student
  public static async getAllStudentMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
      },
      include: [{ model: MentorshipListing }],
    });
    return mentorshipContracts;
  }

  // ============================== TESTIMONIAL ==============================
  public static async addTestimonial(
    accountId: string,
    mentorshipContractId: string,
    testimonial: {
      body: string;
    }
  ): Promise<Testimonial> {
    const existingTestimonial = await Testimonial.findOne({
      where: {
        mentorshipContractId,
      },
    });

    //Check if testimonial has been created
    if (existingTestimonial)
      throw new Error(MENTORSHIP_ERRORS.TESTIMONIAL_EXISTS);

    //Check if mentorship has been completed before testimonial is created
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        progress: CONTRACT_PROGRESS_ENUM.COMPLETED,
      },
    });
    if (!mentorshipContract) {
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_NOT_COMPLETED);
    }

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId,
      { paranoid: false }
    );

    if (!mentorshipListing) {
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    }

    //Check if mentor adding testimonial is the mentor on the mentorshipContract
    if (mentorshipListing.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const { body } = testimonial;

    const newTestimonial = new Testimonial({
      mentorshipContractId,
      accountId,
      body,
    });

    await newTestimonial.save();

    return newTestimonial;
  }

  public static async editTestimonial(
    accountId: string,
    testimonialId: string,
    editedTestimonial
  ): Promise<Testimonial> {
    const existingTestimonial = await Testimonial.findByPk(testimonialId);

    if (!existingTestimonial)
      throw new Error(MENTORSHIP_ERRORS.TESTIMONIAL_MISSING);

    //Check if the mentor editing the testimonial is the one who wrote the testimonial
    if (existingTestimonial.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await existingTestimonial.update(editedTestimonial);
  }

  //get list of testimonials by mentorship listing for Sensei
  public static async getTestimonial(mentorshipListingId: string) {
    const testimonials = await Testimonial.findAll({
      include: [{ model: MentorshipContract, where: { mentorshipListingId } }],
    });
    return testimonials;
  }
  /*
  //get list of testimonials for student
  public static async getAllTestimonial(filter: {
    accountId?: string; //accountId of sensei for students to search?
  }) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //If user is a sensei, findAll by accountId
    if (user.userType === USER_TYPE_ENUM.SENSEI) {
      const testimonials = await Testimonial.findAll({
        where: {
          accountId: { [Op.eq]: accountId },
        },
      });

      return testimonials;
    } else if (user.userType === USER_TYPE_ENUM.STUDENT) {
      const testimonials = await Testimonial.findAll({
        include: [{ model: MentorshipContract, where: { accountId } }],
      });

      return testimonials;
    }
  }*/
}
