import logger from '../config/logger';
import Utility from '../constants/utility';
import AchievementService from '../services/achievement.service';
const fs = require('fs');

export class AchievementController {
  public static async generateAchievementsPdf(req, res, next) {
    try {
      const { user } = req;
      const { accountId } = req.params;
      const url = await AchievementService.generateUserAchievementsPdf(
        accountId
      );

      const data = fs.readFileSync(url);
      res.contentType('application/pdf');
      res.send(data);
    } catch (e) {
      logger.error(
        '[achievementController.generateAchievementsPdf]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, []);
    }
  }
}
