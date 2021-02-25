import express from 'express';
import Utility from '../constants/utility';
import { OccupationController } from '../controllers/occupation.controller';

const passport = require('passport');

const router = express.Router();

/*** GET REQUESTS ***/

// get user (student/sensei)
router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(OccupationController.getAllOccupation)
);

/*** END OF GET REQUESTS ***/

/*** POST REQUESTS ***/

/*** END OF POST REQUESTS ***/

/*** PUT REQUESTS ***/

/*** END OF PUT REQUESTS ***/

/*** DEL REQUESTS ***/

/*** END OF DEL REQUESTS ***/

export default router;
