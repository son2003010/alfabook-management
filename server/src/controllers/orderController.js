import OrderModel from '../models/orderModel.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getOrders();
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};
export const createOrder = async (req, res) => {
  try {
    const { orderId } = await OrderModel.createOrder(req.body);
    res.status(200).json({success: true, message: 'Tạo đơn hàng thành công', orderId});
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getUserOrders(req.params.userId);
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status là bắt buộc' });
    }

    await OrderModel.updateOrderStatus(orderId, status);
    res.status(200).json({message: 'Trạng thái đơn hàng đã được cập nhật thành công'});
  } catch (err) {
    next(err);
  }
};

export const searchOrder = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const books = await OrderModel.searchOrders(query);
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};
