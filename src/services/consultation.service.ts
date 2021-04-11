import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { CONSULTATION_ERRORS } from '../constants/errors';
import { Consultation } from '../models/Consultation';

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

    return await existingConsultation.destroy();
  }

  public static async viewAllConsultationSlots(accountId: string) {}

  public static async registerForConsultation(
    accountId: string,
    consultationId: string
  ) {}
}
