import * as express from 'express';

import userRoute from './user.route';
import mentorshipListingRoute from './mentorship.route';
import adminRoute from './admin.route';

const router = express.Router();

router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/mentorshiplisting', mentorshipListingRoute);

export default router;
