import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import {
  ACHIEVEMENT_ENUM,
  ADMIN_VERIFIED_ENUM,
  APPROVAL_STATUS,
  CONTRACT_PROGRESS_ENUM,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { ERRORS, MENTORSHIP_ERRORS } from '../constants/errors';
import { Achievement } from '../models/Achievement';
import { Category } from '../models/Category';
import {
  MentorshipApplicationFields,
  MentorshipContract,
} from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { MentorshipListingToCategory } from '../models/MentorshipListingToCategory';
import { Note } from '../models/Note';
import { Review } from '../models/Review';
import { Task } from '../models/Task';
import { TaskBucket } from '../models/TaskBucket';
import { Testimonial } from '../models/Testimonial';
import { User } from '../models/User';
import { UserToAchievement } from '../models/UserToAchievement';
import EmailService from './email.service';

export default class MentorshipService {
  // ==================== Mentorship Listings ====================

  public static async createListing(
    accountId: string,
    mentorshipListing: {
      name: string;
      description: string;
      categories: string[];
      priceAmount: number;
      visibility: VISIBILITY_ENUM;
    }
  ): Promise<MentorshipListing> {
    const { categories, ...listingWithoutCategories } = mentorshipListing;

    const user = await User.findByPk(accountId);
    if (
      // if user is trying to publish course but user has not been verified by admin, throw error
      user.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED &&
      mentorshipListing.visibility === VISIBILITY_ENUM.PUBLISHED
    )
      throw new Error(MENTORSHIP_ERRORS.USER_NOT_VERIFIED);

    const newListing = new MentorshipListing({
      accountId,
      ...listingWithoutCategories,
    });

    await newListing.save();

    await MentorshipListingToCategory.bulkCreate(
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
    const listingCategories = await MentorshipListingToCategory.findAll({
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
          await MentorshipListingToCategory.destroy({
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
    accountId: string,
    updatedListing: {
      name: string;
      description: string;
      categories: string[];
      priceAmount: number;
      visibility: VISIBILITY_ENUM;
      publishedAt?: Date;
    }
  ): Promise<MentorshipListing> {
    const currListing = await MentorshipListing.findByPk(mentorshipListingId);
    if (!currListing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    if (currListing.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ); // course not created by user

    const user = await User.findByPk(accountId);
    if (
      // if user is trying to publish course but user has not been verified by admin, throw error
      user.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED &&
      updatedListing.visibility === VISIBILITY_ENUM.PUBLISHED
    )
      throw new Error(MENTORSHIP_ERRORS.USER_NOT_VERIFIED);

    //=============UPDATE MENTORSHIP ACHIEVEMENTS UPON PUBLISHED===============
    if (
      !currListing.publishedAt &&
      updatedListing.visibility === VISIBILITY_ENUM.PUBLISHED
    ) {
      const mentorshipAchievement = await Achievement.findOne({
        where: {
          title: 'Mentorship Listings Created',
        },
      });
      const existingMentorshipListingAchievement = await UserToAchievement.findOne(
        {
          where: {
            accountId: user.accountId,
            achievementId: mentorshipAchievement.achievementId,
          },
        }
      );
      if (!existingMentorshipListingAchievement) {
        const newAchievement = new UserToAchievement({
          achievementId: mentorshipAchievement.achievementId,
          accountId: user.accountId,
          currentCount: 1,
          title: mentorshipAchievement.title,
        });
        await newAchievement.save();
      } else {
        const newCount = existingMentorshipListingAchievement.currentCount + 1;
        await existingMentorshipListingAchievement.update({
          currentCount: newCount,
        });
        //Check if currentCount is 5/10/50, if it is then update ENUM
        switch (true) {
          case newCount >= 5 && newCount < 10:
            await existingMentorshipListingAchievement.update({
              medal: ACHIEVEMENT_ENUM.BRONZE,
            });
            break;

          case newCount >= 10 && newCount < 50:
            await existingMentorshipListingAchievement.update({
              medal: ACHIEVEMENT_ENUM.SILVER,
            });
            break;

          case newCount >= 50:
            await existingMentorshipListingAchievement.update({
              medal: ACHIEVEMENT_ENUM.GOLD,
            });
            break;
        }
      }
    }
    //=================== END OF ACHIEVEMENT UPDATE ========================

    const { categories, ...listingWithoutCategories } = updatedListing;
    await this.updateMentorshipCategory(mentorshipListingId, updatedListing);

    if (
      !currListing.publishedAt &&
      updatedListing.visibility === VISIBILITY_ENUM.PUBLISHED
    ) {
      listingWithoutCategories.publishedAt = new Date();
    }

    await currListing.update(listingWithoutCategories);

    return MentorshipListing.findByPk(currListing.mentorshipListingId, {
      include: [Category],
    });
  }

  public static async updateMentorshipCategory(
    mentorshipListingId: string,
    updatedListing: any
  ) {
    // Find all category associations with listing
    const listingCategories: MentorshipListingToCategory[] = await MentorshipListingToCategory.findAll(
      {
        where: { mentorshipListingId },
      }
    );

    const existingCategories: string[] = listingCategories.map(
      ({ categoryId }) => categoryId
    );
    const updatedCategories: string[] = updatedListing.categories;

    const categoriesToAdd = _.difference(updatedCategories, existingCategories);
    const categoriesToRemove = _.difference(
      existingCategories,
      updatedCategories
    );

    // Create new associations to new categories
    await MentorshipListingToCategory.bulkCreate(
      categoriesToAdd.map((categoryId) => ({
        mentorshipListingId,
        categoryId,
      }))
    );

    // Delete associations to removed categories
    await this.removeListingCategories(mentorshipListingId, categoriesToRemove);
  }

  public static async getSenseiMentorshipListings(accountId: string) {
    return MentorshipListing.findAll({
      where: { accountId: { [Op.eq]: accountId } },
      include: [Category],
    });
  }

  public static async getAllMentorshipListings() {
    const mentorshipListings = MentorshipListing.findAll({
      where: {
        visibility: VISIBILITY_ENUM.PUBLISHED, // courses that are not hidden
      },
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    return mentorshipListings;
  }

  /**
   * @param obj = {
   *  mentorshipListingId: string,
   *  extraModels: Models[]
   * }
   */
  private static async getListingWithAssociations({
    mentorshipListingId,
    extraModels,
  }) {
    return await MentorshipListing.findByPk(mentorshipListingId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        ...extraModels,
      ],
    });
  }

  // get one listing
  // if student, return without listing.contracts
  // if sensei/admin return whole obj

  //get all mentorship contracts (for admin)
  public static async getListing(
    mentorshipListingId: string,
    user?
  ): Promise<MentorshipListing> {
    const listingWithoutContracts = await this.getListingWithAssociations({
      mentorshipListingId,
      extraModels: [
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
        },
      ],
    });

    if (!listingWithoutContracts)
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    /** if user is not logged in
     * OR (user is not the sensei who created the mentorship listing AND user is not an admin)
     * Return listing without contracts
     */
    if (
      !user ||
      (user.accountId !== listingWithoutContracts.accountId &&
        user.userType !== USER_TYPE_ENUM.ADMIN)
    ) {
      return listingWithoutContracts;
    }

    // else return listing with contract
    return MentorshipListing.findByPk(mentorshipListingId, {
      include: [
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
        },
        Category,
        MentorshipContract,
      ],
    });
  }

  // ==================== MENTORSHIP CONTRACTS ====================
  public static async createContract(
    mentorshipListingId: string,
    accountId: string,
    applicationFields: MentorshipApplicationFields
  ): Promise<MentorshipContract> {
    const listing = await MentorshipListing.findByPk(mentorshipListingId);
    if (!listing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    const existingContract = await MentorshipContract.findOne({
      where: {
        mentorshipListingId,
        accountId,
        progress: {
          [Op.or]: [
            CONTRACT_PROGRESS_ENUM.NOT_STARTED,
            CONTRACT_PROGRESS_ENUM.ONGOING,
          ],
        },
      },
    });

    if (existingContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_EXISTS);

    const newContract = new MentorshipContract({
      mentorshipListingId,
      accountId,
      applicationFields,
    });

    await newContract.save();

    return newContract;
  }

  public static async updateContract(
    mentorshipContractId: string,
    accountId: string,
    applicationFields: MentorshipApplicationFields
  ): Promise<MentorshipContract> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    if (currContract.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const updatedContract = await currContract.update({
      applicationFields,
    });

    return updatedContract;
  }

  public static async acceptContract(
    mentorshipContractId: string,
    accountId: string,
    emailParams: { numSlots: string; duration: string; message?: Text }
  ) {
    // Check for existing mentorship contract that is pending
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        senseiApproval: APPROVAL_STATUS.PENDING,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    // Check that sensei approving is sensei in question on contract
    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    // Check that student still exists
    const student = await User.findByPk(mentorshipContract.accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const sensei = await User.findByPk(mentorshipListing.accountId);
    if (!sensei) throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);
    const mentorName = `${sensei.firstName} ${sensei.lastName}`;

    const acceptedApplication = await mentorshipContract.update({
      senseiApproval: APPROVAL_STATUS.APPROVED,
    });

    //=============UPDATE ACHIEVEMENTS UPON ACCPETING CONTRACT===============
    const achievement = await Achievement.findOne({
      where: {
        title: 'Students Mentored',
      },
    });
    const existingMentorshipAchievement = await UserToAchievement.findOne({
      where: {
        accountId: sensei.accountId,
        achievementId: achievement.achievementId,
      },
    });
    if (!existingMentorshipAchievement) {
      const newAchievement = new UserToAchievement({
        achievementId: achievement.achievementId,
        accountId: sensei.accountId,
        currentCount: 1,
        title: achievement.title,
      });
      await newAchievement.save();
    } else {
      const newCount = existingMentorshipAchievement.currentCount + 1;
      await existingMentorshipAchievement.update({
        currentCount: newCount,
      });
      //Check if currentCount is 10/20/50, if it is then update ENUM
      switch (true) {
        case newCount >= 10 && newCount < 20:
          await existingMentorshipAchievement.update({
            medal: ACHIEVEMENT_ENUM.BRONZE,
          });
          break;

        case newCount >= 20 && newCount < 50:
          await existingMentorshipAchievement.update({
            medal: ACHIEVEMENT_ENUM.SILVER,
          });
          break;

        case newCount >= 50:
          await existingMentorshipAchievement.update({
            medal: ACHIEVEMENT_ENUM.GOLD,
          });
          break;
      }
    }

    //================== END OF ACHIEVEMENT UPDATE =========================

    const mentorshipName = mentorshipListing.name;
    const additional = { title: mentorshipName, ...emailParams, mentorName };

    //SEND EMAIL TO INFORM OF ACCEPTANCE OF APPLICATION
    await EmailService.sendEmail(student.email, 'acceptContract', additional);

    return acceptedApplication;
  }

  public static async rejectContract(mentorshipContractId, accountId) {
    // Check for existing mentorship contract that is pending
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        senseiApproval: APPROVAL_STATUS.PENDING,
      },
    });
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    // Check that sensei approving is sensei in question on contract
    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    // Check that student still exists
    const student = await User.findByPk(mentorshipContract.accountId);
    if (!student) throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);

    const rejectedApplication = await mentorshipContract.update({
      senseiApproval: APPROVAL_STATUS.REJECTED,
    });

    const title = mentorshipListing.name;
    const additional = { title };

    //SEND EMAIL TO INFORM OF REJECTION OF APPLICATION
    await EmailService.sendEmail(student.email, 'rejectContract', additional);

    return rejectedApplication;
  }

  public static async deleteContract(
    mentorshipContractId: string,
    accountId
  ): Promise<void> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    if (currContract.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    await MentorshipContract.destroy({
      where: {
        mentorshipContractId,
      },
    });
  }

  public static async terminateContract(
    // Complete or Cancel
    mentorshipContractId: string,
    user: User,
    action: CONTRACT_PROGRESS_ENUM
  ): Promise<void> {
    const currContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!currContract) throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    if (user.userType === USER_TYPE_ENUM.STUDENT) {
      // student can only cancel
      if (
        currContract.accountId !== user.accountId ||
        action !== CONTRACT_PROGRESS_ENUM.CANCELLED
      )
        throw new Error(
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
        );
    }

    if (user.userType === USER_TYPE_ENUM.SENSEI) {
      // sensei can only complete
      const mentorshipListing = await MentorshipListing.findByPk(
        currContract.mentorshipListingId
      );
      if (
        mentorshipListing.accountId !== user.accountId ||
        action !== CONTRACT_PROGRESS_ENUM.COMPLETED
      )
        throw new Error(
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
        );
    }

    if (
      currContract.progress === CONTRACT_PROGRESS_ENUM.NOT_STARTED &&
      action === CONTRACT_PROGRESS_ENUM.COMPLETED
    )
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_NOT_STARTED);
    if (
      currContract.progress === CONTRACT_PROGRESS_ENUM.CANCELLED ||
      currContract.progress === CONTRACT_PROGRESS_ENUM.COMPLETED
    )
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_TERMINATED);

    //=============UPDATE MENTORSHIP ACHIEVEMENTS UPON COMPLETION===============
    if (user.userType === USER_TYPE_ENUM.SENSEI) {
      const achievement = await Achievement.findOne({
        where: {
          title: 'Mentorships Completed',
        },
      });
      const existingMentorshipAchievement = await UserToAchievement.findOne({
        where: {
          accountId: currContract.accountId,
          achievementId: achievement.achievementId,
        },
      });
      if (!existingMentorshipAchievement) {
        const newAchievement = new UserToAchievement({
          achievementId: achievement.achievementId,
          accountId: currContract.accountId,
          currentCount: 1,
          title: achievement.title,
        });
        await newAchievement.save();
      } else {
        const newCount = existingMentorshipAchievement.currentCount + 1;
        await existingMentorshipAchievement.update({
          currentCount: newCount,
        });
        //Check if currentCount is 5/10/50, if it is then update ENUM
        switch (true) {
          case newCount >= 5 && newCount < 10:
            await existingMentorshipAchievement.update({
              medal: ACHIEVEMENT_ENUM.BRONZE,
            });
            break;

          case newCount >= 10 && newCount < 50:
            await existingMentorshipAchievement.update({
              medal: ACHIEVEMENT_ENUM.SILVER,
            });
            break;

          case newCount >= 50:
            await existingMentorshipAchievement.update({
              medal: ACHIEVEMENT_ENUM.GOLD,
            });
            break;
        }
      }
    }

    //=================== END OF ACHIEVEMENT UPDATE ========================

    await currContract.update({
      progress: action,
    });
  }

  public static async getAllMentorshipContracts() {
    const mentorshipContracts = await MentorshipContract.findAll();
    return mentorshipContracts;
  }

  //get ALL mentorship contracts of ONE sensei
  public static async getSenseiMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      include: [
        { model: MentorshipListing, where: { accountId } },
        {
          model: User,
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    return mentorshipContracts;
  }

  // if student is viewing the page, returns the existing contract if it exist. Else return null
  public static async getContractIfExist(
    mentorshipListingId: string,
    accountId: string
  ) {
    return await MentorshipContract.findOne({
      where: {
        accountId,
        mentorshipListingId,
      },
      include: [
        {
          model: TaskBucket,
          include: [
            {
              model: Task,
            },
          ],
        },
      ],
    });
  }

  //get ONE mentorship contract of ONE student
  public static async getStudentMentorshipContract(
    mentorshipContractId: string,
    accountId: string,
    userType: USER_TYPE_ENUM
  ) {
    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId,
      {
        include: [
          {
            model: MentorshipListing,
            include: [
              {
                model: User,
                attributes: [
                  'accountId',
                  'firstName',
                  'lastName',
                  'profileImgUrl',
                ],
              },
              {
                model: Review,
                include: [
                  {
                    model: User,
                    attributes: [
                      'accountId',
                      'firstName',
                      'lastName',
                      'profileImgUrl',
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: TaskBucket,
            include: [
              {
                model: Task,
              },
            ],
          },
        ],
      }
    );

    if (
      accountId !== mentorshipContract.accountId &&
      accountId !== mentorshipContract.MentorshipListing.accountId && // TO BE ADDEDIN THE FUTURE
      userType !== USER_TYPE_ENUM.ADMIN
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    return mentorshipContract;
  }

  //get all mentorshipContracts created by this student
  public static async getAllStudentMentorshipContracts(accountId) {
    const mentorshipContracts = await MentorshipContract.findAll({
      where: {
        accountId: { [Op.eq]: accountId },
      },
      include: [{ model: MentorshipListing }],
    });
    return mentorshipContracts;
  }

  //get ONE Active mentorship contract of ONE student
  public static async getActiveMentorship(mentorshipContractId: string) {
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        progress: CONTRACT_PROGRESS_ENUM.ONGOING,
      },
      include: [
        {
          model: MentorshipListing,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
              ],
            },
          ],
        },
        {
          model: TaskBucket,
          include: [
            {
              model: Task,
            },
          ],
        },
      ],
    });

    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    return mentorshipContract;
  }

  //get ALL Active mentorshipContracts of this student
  public static async getAllActiveMentorships(accountId: string) {
    const mentorshipContracts = await MentorshipContract.findAll({
      where: {
        accountId,
        progress: CONTRACT_PROGRESS_ENUM.ONGOING,
      },
      include: [
        {
          model: MentorshipListing,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
              ],
            },
          ],
        },
        {
          model: TaskBucket,
          include: [
            {
              model: Task,
            },
          ],
        },
      ],
    });

    return mentorshipContracts;
  }

  // ============================== TESTIMONIAL ==============================
  public static async addTestimonial(
    userId: string,
    accountId: string, //studentId
    mentorshipContractId: string,
    testimonial: {
      body: string;
    }
  ): Promise<Testimonial> {
    const existingTestimonial = await Testimonial.findOne({
      where: {
        mentorshipContractId,
        accountId,
      },
    });

    //Check if testimonial has been created
    if (existingTestimonial)
      throw new Error(MENTORSHIP_ERRORS.TESTIMONIAL_EXISTS);

    //Check if mentorship has been completed before testimonial is created
    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId,
        accountId,
        progress: CONTRACT_PROGRESS_ENUM.COMPLETED,
      },
    });
    if (!mentorshipContract) {
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_NOT_COMPLETED);
    }

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId,
      { paranoid: false }
    );

    if (!mentorshipListing) {
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    }

    //Check if mentor adding testimonial is the mentor on the mentorshipContract
    if (mentorshipListing.accountId !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const { body } = testimonial;

    const newTestimonial = new Testimonial({
      mentorshipContractId,
      accountId,
      body,
    });

    await newTestimonial.save();

    return newTestimonial;
  }

  public static async editTestimonial(
    accountId: string, //accountId of sensei
    testimonialId: string,
    editedTestimonial
  ): Promise<Testimonial> {
    const existingTestimonial = await Testimonial.findByPk(testimonialId);

    if (!existingTestimonial)
      throw new Error(MENTORSHIP_ERRORS.TESTIMONIAL_MISSING);

    const mentorshipContract = await MentorshipContract.findOne({
      where: {
        mentorshipContractId: existingTestimonial.mentorshipContractId,
      },
      paranoid: false,
    });

    if (!mentorshipContract) {
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);
    }

    const mentorshipListing = await MentorshipListing.findOne({
      where: {
        mentorshipListingId: mentorshipContract.mentorshipListingId,
      },
      paranoid: false,
    });

    if (!mentorshipListing) {
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    }

    //Check if the mentor editing the testimonial is the one who wrote the testimonial
    if (accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await existingTestimonial.update(editedTestimonial);
  }

  //get list of testimonials by filter
  public static async getTestimonialsByFilter(filter: {
    accountId?: string;
    mentorshipContractId?: string;
  }) {
    return await Testimonial.findAll({
      where: filter,
      include: [
        {
          model: MentorshipContract,
          include: [
            {
              model: MentorshipListing,
              include: [
                {
                  model: User,
                  attributes: [
                    'firstName',
                    'lastName',
                    'profileImgUrl',
                    'occupation',
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  public static async getAllTestimonials(accountId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    const mentorshipListings = await MentorshipListing.findAll({
      where: {
        accountId,
      },
    });

    const mentorshipListingIds = mentorshipListings.map(
      (ml) => ml.mentorshipListingId
    );

    const mentorshipContracts = await MentorshipContract.findAll({
      where: { mentorshipListingId: { [Op.in]: mentorshipListingIds } },
    });

    const mentorshipContractIds = mentorshipContracts.map(
      (mc) => mc.mentorshipContractId
    );

    return await Testimonial.findAll({
      where: { mentorshipContractId: { [Op.in]: mentorshipContractIds } },
      include: [MentorshipContract, User],
    });
  }

  // =========================================== TASKS ====================================================

  //====================== TASK BUCKET =======================
  public static async addTaskBucket(
    userId: string,
    mentorshipContractId: string,
    taskBucket: {
      title: string;
    }
  ): Promise<TaskBucket> {
    await MentorshipService.authorizationCheck(mentorshipContractId, userId);

    const { title } = taskBucket;

    const newTaskBucket = new TaskBucket({
      mentorshipContractId,
      title,
    });

    await newTaskBucket.save();

    return newTaskBucket;
  }

  public static async editTaskBucket(
    accountId: string,
    taskBucketId: string,
    editedTaskBucket
  ): Promise<TaskBucket> {
    const taskBucket = await TaskBucket.findByPk(taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      accountId
    );

    return await taskBucket.update(editedTaskBucket);
  }

  public static async deleteTaskBucket(
    taskBucketId: string,
    accountId: string
  ): Promise<void> {
    const taskBucket = await TaskBucket.findByPk(taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      accountId
    );

    await TaskBucket.destroy({
      where: {
        taskBucketId,
      },
      individualHooks: true,
    });
  }

  public static async getTaskBuckets(
    mentorshipContractId: string,
    accountId: string
  ) {
    await MentorshipService.authorizationCheck(mentorshipContractId, accountId);
    const buckets = await TaskBucket.findAll({
      where: { mentorshipContractId },
      include: [Task],
      order: [['createdAt', 'ASC']],
    });

    await Promise.all(
      buckets.map(async (bucket) => {
        bucket.Tasks.sort(function (a, b) {
          return (
            bucket.taskOrder.indexOf(a.taskId) -
            bucket.taskOrder.indexOf(b.taskId)
          );
        });
      })
    );

    return buckets;
  }

  //====================== TASK =======================
  public static async addTask(
    userId: string,
    taskBucketId: string,
    task: {
      body: string;
      dueAt?: string;
    }
  ): Promise<Task> {
    const taskBucket = await TaskBucket.findByPk(taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      userId
    );

    const { body, dueAt } = task;

    const newTask = new Task({
      taskBucketId,
      body,
      dueAt,
    });

    await newTask.save();

    // Push task to end of task order array
    const updatedTaskOrder = taskBucket.taskOrder;
    updatedTaskOrder.push(newTask.taskId);
    await taskBucket.update({
      taskOrder: updatedTaskOrder,
    });

    return newTask;
  }

  public static async editTask(
    accountId: string,
    taskId: string,
    editedTask
  ): Promise<Task> {
    const existingTask = await Task.findByPk(taskId);
    if (!existingTask) throw new Error(MENTORSHIP_ERRORS.TASK_MISSING);

    const taskBucket = await TaskBucket.findByPk(existingTask.taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    const mentorshipContract = await MentorshipContract.findByPk(
      taskBucket.mentorshipContractId
    );
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      accountId
    );

    //=============UPDATE TASK ACHIEVEMENTS UPON COMPLETION===============
    if (
      existingTask.progress === CONTRACT_PROGRESS_ENUM.ONGOING &&
      editedTask.progress === CONTRACT_PROGRESS_ENUM.COMPLETED
    ) {
      const taskAchievement = await Achievement.findOne({
        where: {
          title: 'Tasks Completed',
        },
      });
      const existingTaskAchievement = await UserToAchievement.findOne({
        where: {
          accountId: mentorshipContract.accountId,
          achievementId: taskAchievement.achievementId,
        },
      });
      if (!existingTaskAchievement) {
        const newAchievement = new UserToAchievement({
          achievementId: taskAchievement.achievementId,
          accountId: mentorshipContract.accountId,
          currentCount: 1,
          title: taskAchievement.title,
        });
        await newAchievement.save();
      } else {
        const newCount = existingTaskAchievement.currentCount + 1;
        await existingTaskAchievement.update({
          currentCount: newCount,
        });
        //Check if currentCount is 10/20/50, if it is then update ENUM
        switch (true) {
          case newCount >= 10 && newCount < 20:
            await existingTaskAchievement.update({
              medal: ACHIEVEMENT_ENUM.BRONZE,
            });
            break;

          case newCount >= 20 && newCount < 50:
            await existingTaskAchievement.update({
              medal: ACHIEVEMENT_ENUM.SILVER,
            });
            break;

          case newCount >= 50:
            await existingTaskAchievement.update({
              medal: ACHIEVEMENT_ENUM.GOLD,
            });
            break;
        }
      }
    }
    //=================== END OF ACHIEVEMENT UPDATE ========================

    return await existingTask.update(editedTask);
  }

  public static async deleteTask(
    taskId: string,
    accountId: string
  ): Promise<void> {
    const existingTask = await Task.findByPk(taskId);
    if (!existingTask) throw new Error(MENTORSHIP_ERRORS.TASK_MISSING);
    const taskBucket = await TaskBucket.findByPk(existingTask.taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      accountId
    );
    await Task.destroy({
      where: {
        taskId,
      },
    });

    // Remove task from task order
    const updatedTaskOrder = taskBucket.taskOrder.filter(
      (_taskId) => _taskId !== taskId
    );
    await taskBucket.update({
      taskOrder: updatedTaskOrder,
    });
  }

  public static async getTasks(taskBucketId: string, accountId: string) {
    const taskBucket = await TaskBucket.findByPk(taskBucketId);
    if (!taskBucket) throw new Error(MENTORSHIP_ERRORS.TASK_BUCKET_MISSING);

    await MentorshipService.authorizationCheck(
      taskBucket.mentorshipContractId,
      accountId
    );

    return Task.findAll({
      where: { taskBucketId },
    });
  }

  public static async authorizationCheck(
    mentorshipContractId: string,
    accountId: string
  ) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (!mentorshipListing) {
      throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);
    }

    //Check if the mentor/mentee editing the taks is the one who created the task
    if (
      (user.userType === USER_TYPE_ENUM.SENSEI &&
        mentorshipListing.accountId !== accountId) ||
      (user.userType === USER_TYPE_ENUM.STUDENT &&
        mentorshipContract.accountId !== accountId)
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
  }

  // ======================================== NOTES ========================================
  public static async addNoteToMentorship(
    mentorshipContractId: string,
    accountId: string,
    note: {
      title: string;
      body: string;
    }
  ): Promise<Note> {
    await MentorshipService.noteAuthorizationCheck(
      mentorshipContractId,
      accountId
    );

    const { title, body } = note;

    const newNote = new Note({
      mentorshipContractId,
      title,
      body,
    });

    await newNote.save();

    return newNote;
  }

  public static async editNoteInMentorship(
    noteId: string,
    accountId: string,
    updateNote
  ): Promise<Note> {
    const note = await Note.findByPk(noteId);
    if (!note) throw new Error(MENTORSHIP_ERRORS.NOTE_MISSING);

    await MentorshipService.noteAuthorizationCheck(
      note.mentorshipContractId,
      accountId
    );

    return await note.update(updateNote);
  }

  public static async getAllNotes(mentorshipContractId, accountId) {
    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (!mentorshipListing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    const user = await User.findByPk(accountId);
    if (
      user.accountId !== mentorshipListing.accountId &&
      user.accountId !== mentorshipContract.accountId
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    const notes = Note.findAll({
      where: {
        mentorshipContractId,
      },
    });
    return notes;
  }

  public static async noteAuthorizationCheck(mentorshipContractId, accountId) {
    const mentorshipContract = await MentorshipContract.findByPk(
      mentorshipContractId
    );
    if (!mentorshipContract)
      throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

    const mentorshipListing = await MentorshipListing.findByPk(
      mentorshipContract.mentorshipListingId
    );
    if (!mentorshipListing) throw new Error(MENTORSHIP_ERRORS.LISTING_MISSING);

    const user = await User.findByPk(accountId);
    if (user.accountId !== mentorshipListing.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
  }

  // ==================================== SENSEI MENTEE ====================================
  public static async getSenseiMenteeList(accountId: string): Promise<User[]> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    const mentorshipListings = await MentorshipListing.findAll({
      where: { accountId },
    });
    const mentorshipListingIds = mentorshipListings.map(
      (ml) => ml.mentorshipListingId
    );
    return await User.findAll({
      include: [
        {
          model: MentorshipContract,
          where: {
            mentorshipListingId: mentorshipListingIds,
            senseiApproval: APPROVAL_STATUS.APPROVED,
          },
          include: [Testimonial],
        },
      ],
    });
  }
}
