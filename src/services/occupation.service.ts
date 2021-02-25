import * as _ from 'lodash';
import { Occupation } from '../models/Occupation';

import Utility from '../constants/utility';

export default class OccupationService {
  // ==================== Occupation Listings ====================

  public static async getAllOccupation(): Promise<Occupation[]> {
    return await Occupation.findAll();
  }

  public static async findOrCreate(
    occupationName: string
  ): Promise<Occupation> {
    const occ = await Occupation.findOne({
      where: {
        name: occupationName,
      },
    });
    if (occ) return occ;

    const newOcc = new Occupation({
      name: occupationName,
    });

    return await newOcc.save();
  }
}
