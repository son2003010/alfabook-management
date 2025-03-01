import express from 'express';
import {
  addToCart,
  getCartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/cart/add', addToCart);

router.get('/cart/:userId', getCartItems);
router.put('/cart/update/:cartId', updateQuantity);
router.delete('/cart/delete/:cartId', removeFromCart);
router.delete('/cart/clear/:userId', clearCart);
router.get('/cart/count/:userId', getCartCount);
export default router;
