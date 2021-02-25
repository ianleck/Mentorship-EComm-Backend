import * as _ from 'lodash';

import Utility from '../constants/utility';
import { MENTORSHIP_CONTRACT_APPROVAL } from '../constants/enum';
import { Op } from 'sequelize';
import { Category } from '../models/Category';
import { ListingToCategory } from '../models/ListingToCategory';
import { MentorshipContract } from '../models/MentorshipContract';

import { MentorshipListing } from '../models/MentorshipListing';

export type UpdateMentorshipListing = MentorshipListing & {
  categories: Category[];
};
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
      mentorshipListingId: Utility.generateUUID(),
      name,
      accountId,
      description,
    });

    newListing.save();

    await ListingToCategory.bulkCreate(
      categories.map((categoryId) => ({
        mentorshipListingId: newListing.mentorshipListingId,
        categoryId,
      }))
    );

    return MentorshipListing.findByPk(newListing.mentorshipListingId, {
      include: [ListingToCategory],
    });
  }

  public static async getSenseiMentorshipListings(accountId: string) {
    const mentorshipListings = MentorshipListing.findAll({
      where: { senseiId: { [Op.eq]: accountId } },
    });
    return mentorshipListings;
  }

  public static async getAllMentorshipListings() {
    const mentorshipListings = MentorshipListing.findAll();
    return mentorshipListings;
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
    mentorshipListing: UpdateMentorshipListing
  ): Promise<void> {
    const currListing = await MentorshipListing.findByPk(mentorshipListingId);

    if (currListing) {
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

      const existingCategories = listingCategories.map(
        ({ categoryId }) => categoryId
      );
      const updatedCategories = mentorshipListing.categories.map(
        ({ categoryId }) => categoryId
      );

      const categoriesToAdd = _.difference(
        updatedCategories,
        existingCategories
      );
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
      await this.removeListingCategories(
        mentorshipListingId,
        categoriesToRemove
      );
    }
  }

  // ==================== MENTORSHIP APPLICATIONS ====================
  public static async createApplication(
    accountId: string,
    mentorshipListingId: string
  ): Promise<MentorshipContract> {
    const newApplication = new MentorshipContract({
      mentorshipContractId: Utility.generateUUID(),
      mentorshipListingId,
      accountId,
    });

    newApplication.save();

    return newApplication;
  }

  //get all mentorship applications (for admin)
  public static async getAllMentorshipApplications() {
    const mentorshipApplications = MentorshipContract.findAll();
    return mentorshipApplications;
  }

  /*

  //retrieve mentorshipContracts which are PENDING -> retrieve mentorshipListingIds of these contracts -> retrieve SenseiId
  public static async getSenseiMentorshipApplications(accountId) {
    const mentorshipContracts = MentorshipContract.findAll({
      where: { senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING },
    });

    //Loop through mentorshipContracts to retrieve mentorshipListingsIds

    const mentorshipApplications = MentorshipListing.findAll({
      where: { senseiId: { [Op.eq]: accountId } },
    });

    //Get mentorshipListing and match to senseiId

    return mentorshipApplications;
  }
  */

  public static async getStudentMentorshipApplication(mentorshipContractId) {
    const mentorshipApplication = MentorshipContract.findByPk(
      mentorshipContractId
    );
    return mentorshipApplication;
  }

  //get all mentorshipApplications created by this student
  public static async getAllStudentMentorshipApplications(studentId) {
    const mentorshipApplications = MentorshipContract.findAll({
      where: {
        studentId: { [Op.eq]: studentId },
      },
    });
    return mentorshipApplications;
  }
}
