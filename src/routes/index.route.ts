import * as express from 'express';
import adminRoute from './admin.route';
import analyticsRoute from './analytics.route';
import authRoute from './auth.route';
import cartRoute from './cart.route';
import categoryRoute from './category.route';
import chatRoute from './chat.route';
import commentRoute from './comment.route';
import complaintRoute from './complaint.route';
import consultationRoute from './consultation.route';
import courseRoute from './course.route';
import emailRoute from './email.route';
import fileRoute from './file.route';
import mentorshipRoute from './mentorship.route';
import paypalRoute from './paypal.route';
import reviewRoute from './review.route';
import searchRoute from './search.route';
import socialRoute from './social.route';
import uploadRoute from './upload.route';
import userRoute from './user.route';
import walletRoute from './wallet.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/cart', cartRoute);
router.use('/category', categoryRoute);
router.use('/comment', commentRoute);
router.use('/complaint', complaintRoute);
router.use('/consultation', consultationRoute);
router.use('/course', courseRoute);
router.use('/email', emailRoute);
router.use('/file', fileRoute);
router.use('/mentorship', mentorshipRoute);
router.use('/paypal', paypalRoute);
router.use('/review', reviewRoute);
router.use('/search', searchRoute);
router.use('/social', socialRoute);
router.use('/upload', uploadRoute);
router.use('/user', userRoute);
router.use('/wallet', walletRoute);
router.use('/social', socialRoute);
router.use('/search', searchRoute);
router.use('/chat', chatRoute);
router.use('/analytics', analyticsRoute);

export default router;
