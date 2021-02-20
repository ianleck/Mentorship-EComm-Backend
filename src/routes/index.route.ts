import * as express from 'express';

import userRoute from './user.route';
import studentRoute from './student.route';
import senseiRoute from './sensei.route';
import adminRoute from './admin.route';

const router = express.Router();

router.use('/', userRoute);
router.use('/student', studentRoute);
router.use('/sensei', senseiRoute);
router.use('/admin', adminRoute);

export default router;
