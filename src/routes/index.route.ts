import * as express from 'express';

import userRoute from './user.route';
import mentorship from './mentorship.route';
import adminRoute from './admin.route';
import emailRoute from './email.route';
import categoryRoute from './category.route';
import uploadRoute from './upload.route';
import fileRoute from './file.route';

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/category', categoryRoute);
router.use('/file', fileRoute);
router.use('/email', emailRoute);
router.use('/mentorship', mentorship);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);

export default router;
