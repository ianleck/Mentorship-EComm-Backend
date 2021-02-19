import { Response } from 'express';
// import httpStatusCodes from 'http-status-codes';
import * as HttpStatus from 'http-status-codes';

export interface IOverrideRequest {
  code: number;
  message: string;
  positive: string;
  negative: string;
}

export interface ICookie {
  key: string;
  value: string;
}
export default class ApiResponse {
  static result = (
    res: Response,
    data: object,
    status: number = 200,
    cookie: ICookie = null
  ) => {
    res.status(status);
    if (cookie) {
      res.cookie(cookie.key, cookie.value);
    }
    res.json({
      ...data,
      success: true,
    });
  };

  static error = (
    res: Response,
    status: number = 400,
    error: any = {
      message: HttpStatus.getStatusText(status),
      errors: [],
    },
    override: IOverrideRequest = null
  ) => {
    res.status(status).json({
      override,
      error,
      success: false,
    });
  };

  static setCookie = (res: Response, key: string, value: string) => {
    res.cookie(key, value);
  };
}
