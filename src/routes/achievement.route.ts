import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { AchievementController } from '../controllers/achievement.controller';

const router = express.Router();

router.get(
  '/generate/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(AchievementController.generateAchievementsPdf)
);

export default router;
