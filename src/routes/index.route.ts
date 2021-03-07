import * as express from 'express';
import adminRoute from './admin.route';
import authRoute from './auth.route';
import cartRoute from './cart.route';
import categoryRoute from './category.route';
import emailRoute from './email.route';
import fileRoute from './file.route';
import mentorshipRoute from './mentorship.route';
import paypalRoute from './paypal.route';
import uploadRoute from './upload.route';
import userRoute from './user.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/category', categoryRoute);
router.use('/email', emailRoute);
router.use('/file', fileRoute);
router.use('/mentorship', mentorshipRoute);
router.use('/paypal', paypalRoute);
router.use('/shoppingCart', cartRoute);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);

export default router;
