import * as _ from 'lodash';

import Utility from '../constants/utility';
import { Category } from '../models/Category';
import { ListingToCategory } from '../models/ListingToCategory';

import { MentorshipListing } from '../models/MentorshipListing';

export type UpdateMentorshipListing = MentorshipListing & {
  categories: Category[];
};
export default class MentorshipService {
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
      await Promise.all(
        categoriesToAdd.map(
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
  }
}
