import {
  COURSE_ERRORS,
  MENTORSHIP_ERRORS,
  REVIEW_ERRORS,
} from '../constants/errors';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
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
    await review.save();

    // update course rating
    const orgReviewCount =
      (await Review.count({
        where: {
          courseId,
        },
      })) - 1; // -1 because just inserted new review

    const course = await Course.findByPk(courseId);
    const updatedRating =
      (course.rating * orgReviewCount + review.rating) / (orgReviewCount + 1);
    await course.update({
      rating: updatedRating,
    });
    return review;
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
    await review.save();

    // update mentorshipListing rating
    const orgReviewCount =
      (await Review.count({
        where: {
          mentorshipListingId,
        },
      })) - 1; // -1 because just inserted new review

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipListingId
    );
    const updatedRating =
      (mentorshipListing.rating * orgReviewCount + review.rating) /
      (orgReviewCount + 1);
    await mentorshipListing.update({
      rating: updatedRating,
    });
    return review;
  }

  public static async editCourseReview(
    courseId: string,
    accountId: string,
    reviewB: {
      rating: number;
      comment?: string;
    }
  ): Promise<Review> {
    // check if user has already made a review
    const existingReview = await Review.findOne({
      where: {
        accountId,
        courseId,
      },
    });
    if (!existingReview) throw new Error(REVIEW_ERRORS.REVIEW_MISSING);

    const originalRating = existingReview.rating;
    await existingReview.update(reviewB);

    // update course rating
    const reviewCount = await Review.count({
      where: {
        courseId,
      },
    });

    const course = await Course.findByPk(courseId);

    const updatedRating =
      (course.rating * reviewCount - originalRating + reviewB.rating) /
      reviewCount;
    await course.update({
      rating: updatedRating,
    });
    return existingReview;
  }

  public static async editMentorshipListingReview(
    mentorshipListingId: string,
    accountId: string,
    reviewB: {
      rating: number;
      comment?: string;
    }
  ): Promise<Review> {
    // check if user has already made a review
    const existingReview = await Review.findOne({
      where: {
        accountId,
        mentorshipListingId,
      },
    });
    if (!existingReview) throw new Error(REVIEW_ERRORS.REVIEW_MISSING);

    const originalRating = existingReview.rating;
    await existingReview.update(reviewB);

    // update mentorshipListing rating
    const reviewCount = await Review.count({
      where: {
        mentorshipListingId,
      },
    });

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipListingId
    );

    const updatedRating =
      (mentorshipListing.rating * reviewCount -
        originalRating +
        reviewB.rating) /
      reviewCount;
    await mentorshipListing.update({
      rating: updatedRating,
    });
    return existingReview;
  }
}
