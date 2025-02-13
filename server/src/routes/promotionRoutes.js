import express from 'express';
import { getPromotion, addPromotion, updatePromotion, deletePromotion } from '../controllers/promotionController.js';

const router = express.Router();

router.get('/get-promotions', getPromotion);
router.post('/add-promotion', addPromotion);
router.put('/update-promotion/:promotionId', updatePromotion);
router.delete('/delete-promotion/:promotionId', deletePromotion);

export default router;
