import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { Course } from '../models/Course';
import { Category } from '../models/Category';
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { CourseContract } from '../models/CourseContract';
import { COURSE_ERRORS } from '../constants/errors';

export default class CourseService {
  public static async createCourse(
    accountId: string,
    course: {
      name: string;
      description: string;
      priceAmount: number;
      currency: string;
      parentCourseId: string | null;
      categories: string[];
    }
  ): Promise<Course> {
    const {
      name,
      categories,
      description,
      priceAmount,
      currency,
      parentCourseId,
    } = course;

    const newCourse = new Course({
      name,
      accountId,
      description,
      priceAmount,
      currency,
      parentCourseId,
    });

    await newCourse.save();

    await CourseListingToCategory.bulkCreate(
      categories.map((categoryId) => ({
        courseId: newCourse.courseId,
        categoryId,
      }))
    );

    return Course.findByPk(newCourse.courseId, {
      include: [Category],
    });
  }

  public static async createContract(
    accountId: string,
    courseId: string
  ): Promise<CourseContract> {
    const course = await Course.findOne({
      where: {
        courseId,
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
      },
    });

    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const existingContract = await CourseContract.findOne({
      where: {
        courseId,
        accountId,
      },
    });

    if (existingContract) throw new Error(COURSE_ERRORS.CONTRACT_EXISTS);

    const newContract = new CourseContract({
      courseId,
      accountId,
    });

    await newContract.save();

    return newContract;
  }
}
