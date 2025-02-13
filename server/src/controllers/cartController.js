import CartModel from '../models/CartModel.js';

export const addToCart = async (req, res) => {  
    try {
        const { userId, bookId, quantity } = req.body;
        await CartModel.addToCart(userId, bookId, quantity);
        const cartCount = await CartModel.getCartCount(userId);
        
        res.status(200).json({
          success: true,
          cartCount,
          message: 'Added to cart successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};

export const getCartItems = async (req, res) => {  
    try {
        const { userId } = req.params;
        const items = await CartModel.getCartItems(userId);
        
        res.status(200).json({
          success: true,
          items,
          message: 'Cart items retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};

export const updateQuantity = async (req, res) => {  
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;
        console.log("Payload từ frontend:", { cartId, quantity });

        await CartModel.updateQuantity(cartId, quantity);
        
        res.status(200).json({
          success: true,
          message: 'Cart quantity updated successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};

export const removeFromCart = async (req, res) => {  
    try {
        const { cartId } = req.params;
        await CartModel.removeFromCart(cartId);
        
        res.status(200).json({
          success: true,
          message: 'Item removed from cart successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};

export const clearCart = async (req, res) => {  
    try {
        const { userId } = req.params;
        await CartModel.clearCart(userId);
        
        res.status(200).json({
          success: true,
          message: 'Cart cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};

export const getCartCount = async (req, res) => {  
    try {
        const { userId } = req.params;
        const count = await CartModel.getCartCount(userId);
        
        res.status(200).json({
          success: true,
          count,
          message: 'Cart count retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
    }
};
