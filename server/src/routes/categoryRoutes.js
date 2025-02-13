import express from 'express';
import {getCategory, getCategoryNoId} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/category/:categoryId', getCategory);
router.get('/category', getCategoryNoId);

export default router;