import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { TEMPLATES } from '../constants/templates/index';
import { User } from '../models/User';

export default class EmailService {
  public static async sendEmail(email: string, template: string) {
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

      // Send Email
      const subject = TEMPLATES[template].subject;
      const htmlTemplate = await this.generateTemplate(email, template, user);

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
    user: User
  ) {
    const name = `${user.firstName} ${user.lastName}`;
    const userType = user.userType;
    console.log(name, 'name');

    const fileName = TEMPLATES[template].fileName;
    const rootPath = process.cwd();
    console.log(rootPath);
    const filePath = `${rootPath}/src/constants/templates/${fileName}`;
    // \src\constants\templates\acceptSensei.ejs
    const url = `https://www.google.com`;

    const htmlTemplate = await ejs.renderFile(filePath, {
      name,
      email,
      userType,
      url,
    });

    return htmlTemplate;
  }
}
