import { Sensei } from '../models/Sensei';
import { ERRORS } from '../constants/errors';

export default class SenseiService {
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
}
