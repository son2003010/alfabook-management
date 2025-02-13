import OrderModel from '../models/orderModel.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getOrders();
    res.json(orders);
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
export const createOrder = async (req, res) => {
  try {
    const { orderId } = await OrderModel.createOrder(req.body);
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId
    });
  } catch (error) {
    let status = 500;
    if (error.message.includes('Insufficient stock') || 
        error.message.includes('Invalid payment method') ||
        error.message.includes('Order total price mismatch')) {
      status = 400;
    }
    
    res.status(status).json({ 
      error: 'Failed to create order', 
      details: error.message 
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getUserOrders(req.params.userId);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch order details', 
      details: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const success = await OrderModel.updateOrderStatus(req.params.orderId, status);
    res.status(200).json({ 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    let status = 500;
    if (error.message.includes('Order not found')) {
      status = 404;
    } else if (error.message.includes('Invalid status') || 
               error.message.includes('Cannot change status')) {
      status = 400;
    }
    
    res.status(status).json({ 
      error: 'Failed to update order status', 
      details: error.message 
    });
  }
};

export const searchOrder = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
        return res.json([]); // Nếu không có query, trả về mảng rỗng
    }

    const books = await OrderModel.searchOrders(query);
    res.json(books);
  } catch (error) {
      console.error("Lỗi trong searchOrders Controller:", error);
      res.status(500).json({ message: "Lỗi server khi tìm kiếm đơn hàng" });
  }
};
