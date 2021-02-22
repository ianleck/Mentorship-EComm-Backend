import { Sensei } from '../models/Sensei';
import { ERRORS } from '../constants/errors';
import { Op } from 'sequelize';
import { STATUS_ENUM_OPTIONS } from '../constants/enum';
export default class SenseiService {
  public static async getAllActiveSenseis() {
    const senseis = Sensei.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.ACTIVE } },
    });
    return senseis;
  }

  public static async updateSensei(senseiUser) {
    const sensei = await Sensei.findByPk(senseiUser.accountId);
    if (sensei) {
      await sensei.update({
        firstName: senseiUser.firstName,
        lastName: senseiUser.lastName,
        contactNumber: senseiUser.contactNumber,
      });
    } else {
      throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);
    }
  }

  public static async findSenseiById(accountId: string): Promise<Sensei> {
    try {
      return Sensei.findByPk(accountId);
    } catch (e) {
      throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);
    }
  }

  public static async deactivateSensei(accountId: string): Promise<void> {
    try {
      await Sensei.destroy({
        where: {
          accountId,
        },
      });
      return;
    } catch (e) {
      throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);
    }
  }
}
