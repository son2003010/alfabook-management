import CartModel from '../models/CartModel.js';

export const addToCart = async (req, res) => {
  try {
    const { userId, bookId, quantity } = req.body;
    await CartModel.addToCart(userId, bookId, quantity);
    const cartCount = await CartModel.getCartCount(userId);

    res.status(200).json({success: true, cartCount, message: 'Thêm vào giỏ hàng thành công'});
  } catch (err) {
    next(err);
  }
};

export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await CartModel.getCartItems(userId);

    res.status(200).json({success: true, items, message: 'Lấy danh sách sản phẩm trong giỏ hàng thành công'});
  } catch (err) {
    next(err);
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    await CartModel.updateQuantity(cartId, quantity);

    res.status(200).json({success: true, message: 'Cập nhật số lượng trong giỏ hàng thành công'});
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    await CartModel.removeFromCart(cartId);

    res.status(200).json({success: true, message: 'Sản phẩm đã được loại bỏ khỏi giỏ hàng'});
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await CartModel.clearCart(userId);

    res.status(200).json({success: true, message: 'Xóa thành công giỏ hàng'});
  } catch (err) {
    next(err);
  }
};

export const getCartCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await CartModel.getCartCount(userId);

    res.status(200).json({success: true, count, message: 'Lấy số lượng sản phẩm trong giỏ hàng thành công'});
  } catch (err) {
    next(err);
  }
};
