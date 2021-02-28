import * as _ from 'lodash';

import Utility from '../constants/utility';
import { Op } from 'sequelize';
import {
  MENTORSHIP_CONTRACT_APPROVAL,
  MENTORSHIP_PROGRESS_ENUM,
} from '../constants/enum';

import {
  APPLICATION_EXISTS,
  APPLICATION_MISSING,
  LISTING_MISSING,
} from '../controllers/mentorship.controller';
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

    const existingCategories = listingCategories.map(
      ({ categoryId }) => categoryId
    );
    const updatedCategories = mentorshipListing.categories.map(
      ({ categoryId }) => categoryId
    );

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
      include: [ListingToCategory],
    });
  }

  // ==================== MENTORSHIP APPLICATIONS ====================
  public static async createApplication(
    accountId: string,
    mentorshipListingId: string,
    statement: string
  ): Promise<MentorshipContract> {
    const existingApplication = MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
      },
    });
    if (existingApplication) throw new Error(APPLICATION_EXISTS);

    const newApplication = new MentorshipContract({
      mentorshipListingId,
      accountId,
      statement,
    });

    newApplication.save();

    return newApplication;
  }

  //get all mentorship applications (for admin)
  public static async getAllMentorshipApplications() {
    const mentorshipApplications = MentorshipContract.findAll();
    return mentorshipApplications;
  }

  //get ALL mentorship applications of ONE sensei
  public static async getSenseiMentorshipApplications(senseiId) {
    const mentorshipApplications = MentorshipContract.findAll({
      include: [{ model: MentorshipListing, where: { senseiId } }],
    });

    return mentorshipApplications;
  }

  //get ALL mentorship applications of ONE sensei for ONE listing
  public static async getSenseiListingMentorshipApplications(
    accountId,
    mentorshipListingId
  ) {
    const mentorshipApplications = MentorshipContract.findAll({
      include: [
        {
          model: MentorshipListing,
          where: { mentorshipListingId, accountId },
        },
      ],
    });

    return mentorshipApplications;
  }

  //get ONE mentorship application of ONE student
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

  public static async updateApplication(
    mentorshipListingId: string,
    accountId: string,
    statement: string
  ): Promise<MentorshipContract> {
    const currApplication = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
        progress: MENTORSHIP_PROGRESS_ENUM.NOT_STARTED,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
      },
    });
    if (!currApplication) throw new Error(APPLICATION_MISSING);

    const updatedApplication = await currApplication.update({
      statement,
    });

    return updatedApplication;
  }

  public static async reviewMentorshipApplication(
    mentorshipContractId, //mentorshipcontract has its own id
    mentorshipContract
  ) {
    const mentorshipApplication = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (mentorshipApplication) {
      await mentorshipContract.update({
        senseiApproval: mentorshipApplication.senseiApproval,
      });
    } else {
      throw new Error(APPLICATION_MISSING);
    }
  }

  public static async deleteApplication(
    mentorshipListingId: string,
    accountId: string
  ): Promise<void> {
    const existingApplication = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
        progress: MENTORSHIP_PROGRESS_ENUM.NOT_STARTED,
        senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
      },
    });
    if (!existingApplication) throw new Error(APPLICATION_MISSING);

    // Manual cascade deletion of associations - Subscription

    await MentorshipContract.destroy({
      where: {
        mentorshipListingId,
        accountId,
      },
    });
  }
}
