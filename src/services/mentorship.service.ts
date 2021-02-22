import Utility from '../constants/utility';

import { MentorshipListing } from '../models/MentorshipListing';

export default class MentorshipService {
  public static async createListing(mentorshipListing: {
    name: string;
    accountId: string;
    categories: string[];
    description: string;
  }): Promise<MentorshipListing> {
    const { name, accountId, categories, description } = mentorshipListing;

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
