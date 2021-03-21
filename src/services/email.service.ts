import ejs from 'ejs';
import { lowerCase } from 'lodash';
import nodemailer from 'nodemailer';
import path from 'path';
import { ERRORS } from '../constants/errors';
import { TEMPLATES } from '../constants/templates/index';
import { User } from '../models/User';
export default class EmailService {
  public static async sendEmail(
    email: string,
    template: string,
    additional?: {
      url?: string;
      mentorshipName?: string;
      courseName?: string;
      commentBody?: string;
    }
  ) {
    try {
      // Set up emailClient
      const { SENDER_EMAIL_ADDRESS, SENDER_EMAIL_PASSWORD } = process.env;

      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: SENDER_EMAIL_ADDRESS,
          pass: SENDER_EMAIL_PASSWORD,
        },
      });

      // Verification
      const user = await User.findOne({ where: { email } });
      if (!user && template !== 'register')
        throw new Error(ERRORS.USER_DOES_NOT_EXIST);

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
      courseName?: string;
      commentBody?: string;
    }
  ) {
    const name = `${user.firstName} ${user.lastName}`;

    const fileName = TEMPLATES[template].fileName;
    const rootPath = process.cwd();
    const filePath = path.normalize(
      `${rootPath}/src/constants/templates/${fileName}`
    );

    switch (template) {
      // AUTH
      case 'register':
        const placeHolder = 'https://www.google.com';
        return await ejs.renderFile(filePath, {
          name,
          userType: lowerCase(user.userType),
          url: placeHolder,
        });

      case 'forgotPassword':
        return await ejs.renderFile(filePath, {
          name,
          url: additional.url,
        });

      case 'passwordReset':
        return await ejs.renderFile(filePath, {
          name,
        });

      // COMMENTS
      case 'deleteOffensiveComment':
        return await ejs.renderFile(filePath, {
          name,
          commentBody: additional.commentBody,
        });
      // COURSE
      case 'acceptCourse':
        return await ejs.renderFile(filePath, {
          name,
          courseName: additional.courseName,
        });

      case 'rejectCourse':
        return await ejs.renderFile(filePath, {
          name,
          courseName: additional.courseName,
        });

      // MENTORSHIPCONTRACTS
      case 'acceptContract':
        return await ejs.renderFile(filePath, {
          name,
          mentorshipName: additional.mentorshipName,
        });

      case 'rejectContract':
        return await ejs.renderFile(filePath, {
          name,
          mentorshipName: additional.mentorshipName,
        });

      // SENSEI
      case 'acceptSensei':
        return await ejs.renderFile(filePath, {
          name,
        });

      case 'rejectSensei':
        return await ejs.renderFile(filePath, {
          name,
        });

      // FINANCE
      case 'withdrawalSuccess':
        return await ejs.renderFile(filePath, {
          name,
        });
    }
  }
}
