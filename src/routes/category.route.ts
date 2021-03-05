import express from 'express';
import Utility from '../constants/utility';
import { CategoryController } from '../controllers/category.controller';

const router = express.Router();

router.get('/', Utility.asyncHandler(CategoryController.getAllCategories));

export default router;
