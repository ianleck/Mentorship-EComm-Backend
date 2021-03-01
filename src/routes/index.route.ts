import * as express from 'express';

import userRoute from './user.route';
import mentorship from './mentorship.route';
import adminRoute from './admin.route';
import emailRoute from './email.route';

const router = express.Router();

router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/mentorship', mentorship);
router.use('/email', emailRoute);
export default router;
