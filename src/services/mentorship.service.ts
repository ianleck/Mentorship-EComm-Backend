import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import {
  CONTRACT_PROGRESS_ENUM,
  MENTORSHIP_CONTRACT_APPROVAL,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { ERRORS, MENTORSHIP_ERRORS } from '../constants/errors';
import { Category } from '../models/Category';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { MentorshipListingToCategory } from '../models/MentorshipListingToCategory';
import { User } from '../models/User';
import CartService from './cart.service';
import EmailService from './email.service';

export default class MentorshipService {
  // ==================== Mentorship Listings ====================

  public static async createListing(
    accountId: string,
    mentorshipListing: {
      name: string;
      description: string;
      categories: string[];
    }
  ): Promise<MentorshipListing> {
    const { name, categories, description } = mentorshipListing;

    const newListing = new MentorshipListing({
      name,
      accountId,
      description,
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
    }
  ): Promise<MentorshipListing> {
    const currListing = await MentorshipListing.findByPk(mentorshipListingId);
    if (!currListing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    await currListing.update({
      name: mentorshipListing.name,
      description: mentorshipListing.description,
    });

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

  // get one listing
  // if student, return without listing.contracts
  // if sensei/admin return whole obj

  //get all mentorship contracts (for admin)
  public static async getListing(
    mentorshipListingId: string
  ): Promise<MentorshipListing> {
    const listing = await MentorshipListing.findByPk(mentorshipListingId, {
      include: [MentorshipContract],
    });
    if (!listing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    return listing;
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

  //get ALL mentorship contracts of ONE sensei for ONE listing
  // public static async getSenseiListingMentorshipContracts(
  //   accountId,
  //   mentorshipListingId
  // ) {
  //   const mentorshipContracts = await MentorshipContract.findAll({
  //     include: [
  //       {
  //         model: MentorshipListing,
  //         where: { accountId, mentorshipListingId },
  //       },
  //     ],
  //   });

  //   return mentorshipContracts;
  // }

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
}
