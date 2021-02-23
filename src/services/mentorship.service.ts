import Utility from '../constants/utility';

import { MentorshipListing } from '../models/MentorshipListing';

export default class MentorshipService {
  public static async createListing(
    accountId: string,
    mentorshipListing: {
      name: string;
      categories: string[];
      description: string;
    }
  ): Promise<MentorshipListing> {
    const { name, categories, description } = mentorshipListing;

    const newListing = new MentorshipListing({
      id: Utility.generateUUID(),
      name,
      accountId,
      description,
      categories,
    });

    newListing.save();
    return newListing;
  }
}
