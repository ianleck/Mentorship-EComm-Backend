import * as express from 'express';

import userRoute from './user.route';
import adminRoute from './admin.route';

const router = express.Router();

router.use('/user', userRoute);
router.use('/admin', adminRoute);

export default router;
