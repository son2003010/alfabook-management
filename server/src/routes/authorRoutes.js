import express from 'express';
import { getAuthor, addAuthor, updateAuthor, deleteAuthor } from '../controllers/authorController.js';

const router = express.Router();

router.get('/get-author', getAuthor);
router.post('/add-author', addAuthor);
router.put('/update-author/:id', updateAuthor);
router.delete('/delete-author/:id', deleteAuthor);

export default router;
