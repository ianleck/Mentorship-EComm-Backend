import Utility from '../constants/utility';

import { MentorshipListing } from '../models/MentorshipListing';

export default class MentorshipService {
  public static async createListing(mentorshipListing: {
    name: string;
    senseiId: string;
    categories: string[];
    description: string;
  }): Promise<MentorshipListing> {
    const { name, senseiId, categories, description } = mentorshipListing;

    const newListing = new MentorshipListing({
      id: Utility.generateUUID(),
      name,
      senseiId,
      description,
      categories,
    });

    newListing.save();
    return newListing;
  }
}
