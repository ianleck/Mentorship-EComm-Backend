import * as express from 'express';

import userRoute from './user.route';
import studentRoute from './student.route';

const router = express.Router();

router.use('/', userRoute);
router.use('/student', studentRoute);

export default router;
