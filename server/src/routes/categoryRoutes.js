import express from 'express';
import {
  getCategory,
  getCategoryNoId,
  addCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/category/:categoryId', getCategory);
router.get('/category', getCategoryNoId);
router.post('/add-category', addCategory);
router.delete('/delete-category/:id', deleteCategory);

export default router;
