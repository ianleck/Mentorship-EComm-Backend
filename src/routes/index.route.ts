import * as express from 'express';

import userRoute from './user/user.route';

const router = express.Router();

router.use('/', userRoute);

export default router;
