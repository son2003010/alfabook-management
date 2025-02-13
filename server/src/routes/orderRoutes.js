import express from 'express';
import { limiter } from '../middleware/rateLimitMiddleware.js';

import { getOrders, createOrder, getUserOrders, getOrderById, updateOrderStatus, searchOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/get-order', getOrders);
router.post('/orders/create', limiter, createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/orders/:orderId', getOrderById);
router.put('/update-status/:orderId', updateOrderStatus);
router.get('/search-orders', searchOrder);

export default router;