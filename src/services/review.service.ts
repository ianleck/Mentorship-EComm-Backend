import {
  COURSE_ERRORS,
  MENTORSHIP_ERRORS,
  REVIEW_ERRORS,
} from '../constants/errors';
import { CourseContract } from '../models/CourseContract';
import { MentorshipContract } from '../models/MentorshipContract';
import { Review } from '../models/Review';
export default class ReviewService {
  public static async createCourseReview(
    courseId: string,
    accountId: string,
    reviewB: {
      rating: number;
      comment?: string;
    }
  ): Promise<Review> {
    // check if contract exist
    const existingContract = await CourseContract.findOne({
      where: {
        accountId,
        courseId,
      },
    });
    if (!existingContract) throw new Error(COURSE_ERRORS.CONTRACT_MISSING);
    // check if user has already made a review
    const existingReview = await Review.findOne({
      where: {
        accountId,
        courseId,
      },
    });
    if (existingReview) throw new Error(REVIEW_ERRORS.REVIEW_EXISTS);
    const review = new Review({
      ...reviewB,
      courseId,
      accountId,
    });
    return review.save();
  }

  public static async createMentorshipListingReview(
    mentorshipListingId: string,
    accountId: string,
    reviewB: {
      rating: number;
      comment?: string;
    }
  ): Promise<Review> {
    const existingContract = await MentorshipContract.findOne({
      where: {
        accountId,
        mentorshipListingId,
      },
    });
    if (!existingContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    // check if user has already made a review
    const existingReview = await Review.findOne({
      where: {
        accountId,
        mentorshipListingId,
      },
    });
    if (existingReview) throw new Error(REVIEW_ERRORS.REVIEW_EXISTS);

    const review = new Review({
      ...reviewB,
      mentorshipListingId,
      accountId,
    });
    return review.save();
  }
}
