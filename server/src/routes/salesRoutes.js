import express from 'express';
import { getSalesChart, getNewUsers, getRevenuePayment, getNewOrders } from '../controllers/salesController.js';

const router = express.Router();

router.get('/get-new-user', getNewUsers);
router.get('/get-revenue-payment', getRevenuePayment);
router.get('/get-new-order', getNewOrders);

router.get('/get-sales-chart', getSalesChart);

export default router;
