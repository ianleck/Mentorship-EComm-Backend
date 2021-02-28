import * as _ from 'lodash';

import Utility from '../constants/utility';
import { Op } from 'sequelize';
import {
  MENTORSHIP_CONTRACT_APPROVAL,
  MENTORSHIP_PROGRESS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { ERRORS } from '../constants/errors';
import {
  APPLICATION_EXISTS,
  APPLICATION_MISSING,
  LISTING_MISSING,
} from '../controllers/mentorship.controller';
import { Category } from '../models/Category';
import { ListingToCategory } from '../models/ListingToCategory';
import { MentorshipContract } from '../models/MentorshipContract';

import { MentorshipListing } from '../models/MentorshipListing';
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

    await ListingToCategory.bulkCreate(
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
    const listingCategories = await ListingToCategory.findAll({
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
          await ListingToCategory.destroy({
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
    if (!currListing) throw new Error(LISTING_MISSING);

    await currListing.update({
      name: mentorshipListing.name,
      description: mentorshipListing.description,
    });

    // Find all category associations with listing
    const listingCategories: ListingToCategory[] = await ListingToCategory.findAll(
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
    await ListingToCategory.bulkCreate(
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
    });
  }

  public static async getAllMentorshipListings() {
    const mentorshipListings = MentorshipListing.findAll();
    return mentorshipListings;
  }

  // ==================== MENTORSHIP APPLICATIONS ====================
  public static async createContract(
    mentorshipListingId: string,
    accountId: string,
    statement: string
  ): Promise<MentorshipContract> {
    const existingContract = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
      },
    });

    if (existingContract) throw new Error(APPLICATION_EXISTS);

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
    statement: string
  ): Promise<MentorshipContract> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(APPLICATION_MISSING);

    const updatedContract = await currContract.update({
      statement,
    });

    return updatedContract;
  }

  public static async deleteContract(
    mentorshipContractId: string
  ): Promise<void> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(APPLICATION_MISSING);

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
    if (!listing) throw new Error(ERRORS.LISTING_DOES_NOT_EXIST);

    return listing;
  }

  public static async getAllMentorshipContracts() {
    const mentorshipContracts = await MentorshipContract.findAll();
    return mentorshipContracts;
  }

  //get ALL mentorship contracts of ONE sensei
  public static async getSenseiMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      include: [{ model: MentorshipListing, where: { accountId } }],
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
    mentorshipContractId: string
  ): Promise<MentorshipContract> {
    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );

    if (!mentorshipContract) throw new Error(APPLICATION_MISSING);

    return mentorshipContract;
  }

  //get all mentorshipContracts created by this student
  public static async getAllStudentMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
      },
    });
    return mentorshipContracts;
  }
}
