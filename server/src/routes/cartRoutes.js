import express from 'express';
import { addToCart, getCartItems, updateQuantity, removeFromCart, clearCart, getCartCount } from '../controllers/cartController.js';

const router = express.Router();

router.post('/cart/add', addToCart); // test done

router.get('/cart/:userId', getCartItems); // test done
router.put('/cart/update/:cartId', updateQuantity);
router.delete('/cart/delete/:cartId', removeFromCart);
router.delete('/cart/clear/:userId', clearCart); // test done
router.get('/cart/count/:userId', getCartCount); // test done
export default router;