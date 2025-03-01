import express from 'express';
import {
  getPublisher,
  addPublisher,
  updatePublisher,
  deletePublisher,
} from '../controllers/publisherController.js';

const router = express.Router();

router.get('/get-publisher', getPublisher);
router.post('/add-publisher', addPublisher);
router.put('/update-publisher/:id', updatePublisher);
router.delete('/delete-publisher/:id', deletePublisher);

export default router;
