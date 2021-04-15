import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { CONTRACT_PROGRESS_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import {
  CONSULTATION_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
} from '../constants/errors';
import { Consultation } from '../models/Consultation';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { User } from '../models/User';

export interface ConsultationSlot {
  title?: Text;
  mentorshipListingId?: string;
  timeStart?: Date;
  timeEnd?: Date;
}

export default class ConsultationService {
  public static async createConsultationSlot(
    accountId: string,
    newSlot: ConsultationSlot
  ) {
    const { title, mentorshipListingId, timeStart, timeEnd } = newSlot;
    const overlappingSlot = await Consultation.findAll({
      where: {
        senseiId: accountId,
        [Op.not]: {
          [Op.or]: [
            { timeStart: { [Op.gte]: timeEnd } },
            { timeEnd: { [Op.lte]: timeStart } },
          ],
        },
      },
    });

    if (overlappingSlot.length > 0)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_CLASH);

    await new Consultation({
      title,
      mentorshipListingId,
      senseiId: accountId,
      timeStart,
      timeEnd,
    }).save();
  }

  public static async editConsultationSlot(
    accountId: string,
    consultationId: string,
    editedSlot: ConsultationSlot
  ) {
    const existingConsultation = await Consultation.findByPk(consultationId);
    if (!existingConsultation)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_MISSING);
    if (existingConsultation.senseiId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    if (existingConsultation.studentId)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_BOOKED);

    return await existingConsultation.update({
      ...editedSlot,
    });
  }

  public static async deleteConsultationSlot(
    accountId: string,
    consultationId: string
  ) {
    const existingConsultation = await Consultation.findByPk(consultationId);
    if (!existingConsultation)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_MISSING);
    if (existingConsultation.senseiId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    // refund student
    if (existingConsultation.studentId) {
      const existingMentorship = await MentorshipContract.findOne({
        where: {
          accountId: existingConsultation.studentId,
          mentorshipListingId: existingConsultation.mentorshipListingId,
        },
      });
      if (!existingMentorship)
        throw new Error(MENTORSHIP_ERRORS.CONTRACT_MISSING);

      const newPassCount = existingMentorship.mentorPassCount + 1;
      await existingMentorship.update({ mentorPassCount: newPassCount });
    }

    return await existingConsultation.destroy();
  }

  public static async viewFilteredConsultationSlots(
    accountId: string,
    dateStart: Date,
    dateEnd: Date
  ) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    let filter = {};
    if (user.userType === USER_TYPE_ENUM.SENSEI) {
      filter = {
        where: {
          senseiId: accountId,
          timeStart: { [Op.gte]: dateStart },
          timeEnd: { [Op.lte]: dateEnd },
        },
      };
    }

    if (user.userType === USER_TYPE_ENUM.STUDENT) {
      const mentorshipContracts = await MentorshipContract.findAll({
        where: {
          accountId,
          progress: {
            [Op.or]: [
              CONTRACT_PROGRESS_ENUM.ONGOING,
              CONTRACT_PROGRESS_ENUM.NOT_STARTED,
            ],
          },
        },
      });

      const mentorshipListingIds = mentorshipContracts.map(
        (mentorship) => mentorship.mentorshipListingId
      );
      const mentorshipListings = await MentorshipListing.findAll({
        where: { mentorshipListingId: { [Op.in]: mentorshipListingIds } },
      });
      const senseiIds = mentorshipListings.map(
        (mentorship) => mentorship.accountId
      );
      filter = {
        where: {
          senseiId: { [Op.in]: senseiIds },
          timeStart: { [Op.gte]: dateStart },
          timeEnd: { [Op.lte]: dateEnd },
        },
      };
    }

    return await Consultation.findAll({
      ...filter,
      include: [
        MentorshipListing,
        {
          model: User,
          as: 'Sensei',
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        {
          model: User,
          as: 'Student',
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
  }

  public static async registerConsultation(
    accountId: string,
    consultationId: string
  ) {
    const existingConsultation = await Consultation.findByPk(consultationId);
    if (!existingConsultation)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_MISSING);
    const existingMentorship = await MentorshipContract.findOne({
      where: {
        accountId,
        mentorshipListingId: existingConsultation.mentorshipListingId,
      },
    });
    if (!existingMentorship)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    if (existingConsultation.studentId)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_TAKEN);
    if (existingMentorship.mentorPassCount === 0)
      throw new Error(CONSULTATION_ERRORS.INSUFFICIENT_PASS);

    const today = new Date();
    if (existingConsultation.timeStart < today)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_PAST);
    const newPassCount = existingMentorship.mentorPassCount - 1;
    await existingMentorship.update({ mentorPassCount: newPassCount });
    return await existingConsultation.update({ studentId: accountId });
  }

  public static async unregisterConsultation(
    accountId: string,
    consultationId: string
  ) {
    const existingConsultation = await Consultation.findByPk(consultationId);
    if (!existingConsultation)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_MISSING);
    if (!existingConsultation.studentId)
      throw new Error(CONSULTATION_ERRORS.CONSULTATION_MISSING);
    if (existingConsultation.studentId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const cancelLimit = existingConsultation.timeStart;
    cancelLimit.setDate(cancelLimit.getDate() - 3);
    const today = new Date();
    if (cancelLimit < today)
      throw new Error(CONSULTATION_ERRORS.UNREGISTER_FAILURE);

    const existingMentorship = await MentorshipContract.findOne({
      where: {
        accountId,
        mentorshipListingId: existingConsultation.mentorshipListingId,
      },
    });

    const newPassCount = existingMentorship.mentorPassCount + 1;
    await existingMentorship.update({ mentorPassCount: newPassCount });
    return await existingConsultation.update({ studentId: null });
  }
}
