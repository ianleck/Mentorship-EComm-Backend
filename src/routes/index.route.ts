import * as express from 'express';

import userRoute from './user.route';
import mentorship from './mentorship.route';
import adminRoute from './admin.route';
import emailRoute from './email.route';
import categoryRoute from './category.route';
import uploadRoute from './upload.route';

const router = express.Router();

router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/mentorship', mentorship);
router.use('/email', emailRoute);
router.use('/category', categoryRoute);
router.use('/upload', uploadRoute);

export default router;
