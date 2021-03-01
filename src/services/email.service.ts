import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { TEMPLATES } from '../constants/templates/index';
import { User } from '../models/User';
import path from 'path';
import { ERRORS } from '../constants/errors';
import { lowerCase } from 'lodash';
export default class EmailService {
  public static async sendEmail(
    email: string,
    template: string,
    additional?: {
      url?: string;
      mentorshipName?: string;
    }
  ) {
    try {
      // Set up emailClient
      const { SENDER_EMAIL_ADDRESS, SENDER_EMAIL_PASSWORD } = process.env;

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SENDER_EMAIL_ADDRESS,
          pass: SENDER_EMAIL_PASSWORD,
        },
      });

      // Verification
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

      // Send Email
      const subject = TEMPLATES[template].subject;
      const htmlTemplate = await this.generateTemplate(
        email,
        template,
        user,
        additional
      );

      const mailOptions = {
        from: SENDER_EMAIL_ADDRESS,
        to: email,
        subject,
        html: htmlTemplate,
      };

      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  public static async generateTemplate(
    email: string,
    template: string,
    user: User,
    additional?: {
      url?: string;
      mentorshipName?: string;
    }
  ) {
    const name = `${user.firstName} ${user.lastName}`;

    const fileName = TEMPLATES[template].fileName;
    const rootPath = process.cwd();
    const filePath = path.normalize(
      `${rootPath}/src/constants/templates/${fileName}`
    );

    switch (template) {
      case 'register':
        const userType = lowerCase(user.userType);
        const placeHolder = 'https://www.google.com';
        return await ejs.renderFile(filePath, {
          name,
          email,
          userType,
          url: placeHolder,
        });

      case 'forgotPassword':
        return await ejs.renderFile(filePath, {
          name,
          email,
          userType,
          url: additional.url,
        });

      case 'passwordReset':
        return await ejs.renderFile(filePath, {
          name,
          email,
          userType,
        });
    }
  }
}
