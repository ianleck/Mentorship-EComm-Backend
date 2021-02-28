import express from 'express';

import { CategoryController } from '../controllers/category.controller';

import Utility from '../constants/utility';

const router = express.Router();

router.get('/', Utility.asyncHandler(CategoryController.getAllCategories));

export default router;
