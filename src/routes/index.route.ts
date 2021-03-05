import * as express from 'express';
import adminRoute from './admin.route';
import authRoute from './auth.route';
import categoryRoute from './category.route';
import emailRoute from './email.route';
import fileRoute from './file.route';
import mentorship from './mentorship.route';
import uploadRoute from './upload.route';
import userRoute from './user.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/category', categoryRoute);
router.use('/email', emailRoute);
router.use('/file', fileRoute);
router.use('/mentorship', mentorship);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);

export default router;
