import joi from 'joi';
import { STATUS_ENUM_OPTIONS } from 'src/constants/enum';

interface senseiObj {
  accountId: string;
  firstName: string;
  lastName: string;
  contactNumber: number;
}

interface senseiProfile {
  senseiObj: senseiObj;
}

export default {
  updateSenseiB: joi.object({
    sensei: joi.object({
      accountId: joi.string().required(),
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),

  senseiProfile: joi.object({
    sensei: joi.object({
      accountId: joi.string().required(),
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),
};
