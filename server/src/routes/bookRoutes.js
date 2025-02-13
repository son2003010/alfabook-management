import express from 'express';
import { getBookByID, getBooksByCategory, getBooksByCategoryBySub, searchBook, addBook  } from '../controllers/bookController.js';

const router = express.Router();

router.get('/get-book/:bookId', getBookByID);
router.get('/get-book-by-category/:categoryId', getBooksByCategory);
router.get('/get-book-by-category-by-sub/:categoryId', getBooksByCategoryBySub);

router.get('/search-book', searchBook);
router.post('/add-book', addBook);

export default router;