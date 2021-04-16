import { ERRORS } from '../constants/errors';
import { User } from '../models/User';
import { UserToAchievement } from '../models/UserToAchievement';
import { BACKEND_API } from '../constants/constants';

const PDFDocument = require('pdfkit');
const fs = require('fs');

export default class AchievementService {
  // ======================================== ADMIN AUTH ========================================
  public static async generateUserAchievementsPdf(accountId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    const userAchievements = await UserToAchievement.findAll({
      where: {
        accountId,
      },
    });
    return this.generateAchievementsPdf(user, userAchievements);
  }

  private static async generateAchievementsPdf(
    user,
    userAchievements
  ): Promise<string> {
    const userAchievementTitles = userAchievements.map((achv) => achv.title);

    const fileName = `${user.accountId}.pdf`;
    const doc = new PDFDocument({ layout: 'landscape' });
    doc.pipe(
      fs.createWriteStream(
        `${__dirname}/../../uploads/user-achievement/${fileName}`
      )
    );
    doc.image(`${__dirname}/../assets/achievement-cert-template.jpg`, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });

    // display name = username if firstname and lastname is null
    let displayName = user.firstName && user.firstName;
    displayName =
      displayName && displayName + (user.lastName && ` ${user.lastName}`);
    displayName = displayName ? displayName : user.username;

    doc
      .fontSize(24)
      .font('Times-Roman')
      .text(displayName.toUpperCase(), 80, 260, {
        align: 'center',
      });

    const length = userAchievements.length;
    const leftColumnLength = length / 2 + (length % 2);
    const rightColumnLength = length / 2;

    let margin = 350;
    let medalType;
    for (let i = 0; i < leftColumnLength; i++) {
      medalType = userAchievements[i].medal
        ? userAchievements[i].medal.toLowerCase()
        : 'nil';
      doc.image(
        `${__dirname}/../assets/medals/${medalType}.png`,
        150,
        margin - 5,
        {
          width: 25,
          height: 25,
        }
      );
      doc
        .fontSize(14)
        .font('Times-Roman')
        .text(
          `${userAchievements[i].currentCount} ${userAchievementTitles[i]}`,
          180,
          margin,
          {
            align: 'left',
          }
        );
      margin = margin + 20;
    }

    margin = 350;
    for (let i = rightColumnLength; i < length; i++) {
      medalType = userAchievements[i].medal
        ? userAchievements[i].medal.toLowerCase()
        : 'nil';
      doc.image(
        `${__dirname}/../assets/medals/${medalType}.png`,
        450,
        margin - 5,
        {
          width: 25,
          height: 25,
        }
      );
      doc
        .fontSize(14)
        .font('Times-Roman')
        .text(
          `${userAchievements[i].currentCount} ${userAchievementTitles[i]}`,
          480,
          margin,
          {
            align: 'left',
          }
        );
      margin = margin + 20;
    }

    doc.end();
    return `${__dirname}/../../uploads/user-achievement/${fileName}`;
  }
}
