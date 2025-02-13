import { sql } from '../config/db.js';
const ORDER_STATUSES = [
  'Chờ xác nhận',
  'Đang chuẩn bị hàng',
  'Đang vận chuyển',
  'Đang giao hàng',
  'Đã giao hàng',
  'Đang hoàn hàng',
  'Hoàn hàng thành công'
];

const STATUS_FLOW = {
  'Chờ xác nhận': ['Đang chuẩn bị hàng', 'Đang hoàn hàng'],
  'Đang chuẩn bị hàng': ['Đang vận chuyển', 'Đang hoàn hàng'],
  'Đang vận chuyển': ['Đang giao hàng', 'Đang hoàn hàng'],
  'Đang giao hàng': ['Đã giao hàng', 'Đang hoàn hàng'],
  'Đã giao hàng': [], // Final state
  'Đang hoàn hàng': ['Hoàn hàng thành công'],
  'Hoàn hàng thành công': [], // Final state
};

class OrderModel {
  static async getNextOrderSequence(transaction) {
    const request = new sql.Request(transaction);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await request.query(`
      SELECT TOP 1 RIGHT(OrderID, 2) as sequence
      FROM [Order]
      WHERE OrderID LIKE 'AFB${date}%'
      ORDER BY OrderID DESC
    `);
    
    const sequence = result.recordset[0] ? 
      parseInt(result.recordset[0].sequence) + 1 : 
      1;
    
    return `AFB${date}${sequence.toString().padStart(2, '0')}`;
  }

  static async validateStock(bookId, requestedQuantity, transaction) {
    const request = new sql.Request(transaction);
    request.input('bookId', sql.Int, bookId);
    
    const result = await request.query(`
      SELECT Quantity 
      FROM Book 
      WHERE BookID = @bookId
    `);

    if (!result.recordset[0] || result.recordset[0].Quantity < requestedQuantity) {
      throw new Error(`Insufficient stock for book ID ${bookId}`);
    }
  }
  static async createOrder(orderData) {
    const transaction = new sql.Transaction();
    try {
      await transaction.begin();
      
      // Validate all items have sufficient stock
      for (const item of orderData.orderDetails) {
        await this.validateStock(item.bookId, item.quantity, transaction);
      }

      const orderId = await this.getNextOrderSequence(transaction);
      const orderRequest = new sql.Request(transaction);
      
      // Validate total price
      const calculatedTotal = orderData.orderDetails.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      if (Math.abs(calculatedTotal - orderData.totalPrice) > 0.01) {
        throw new Error('Order total price mismatch');
      }

      // Only allow COD payment method
      if (orderData.paymentMethod !== 'Thanh toán tiền mặt') {
        throw new Error('Only COD payment method is supported');
      }

      // Create order
      orderRequest.input('orderId', sql.VarChar(20), orderId);
      orderRequest.input('receiverName', sql.NVarChar, orderData.receiverName);
      orderRequest.input('receiverPhone', sql.VarChar, orderData.receiverPhone);
      orderRequest.input('province', sql.NVarChar, orderData.province);
      orderRequest.input('district', sql.NVarChar, orderData.district);
      orderRequest.input('ward', sql.NVarChar, orderData.ward);
      orderRequest.input('streetAddress', sql.NVarChar, orderData.streetAddress);
      orderRequest.input('totalPrice', sql.Decimal(18,2), orderData.totalPrice);
      orderRequest.input('status', sql.NVarChar, 'Chờ xác nhận');
      orderRequest.input('paymentMethod', sql.NVarChar, 'Thanh toán tiền mặt');
      orderRequest.input('userId', sql.Int, orderData.userId);
      orderRequest.input('createdDate', sql.DateTime, new Date());
      orderRequest.input('note', sql.NVarChar, orderData.note);

      await orderRequest.query(`
        INSERT INTO [Order] (
          OrderID, ReceiverName, ReceiverPhone, Province,
          District, Ward, StreetAddress, TotalPrice, 
          Status, PaymentMethod, UserID, CreatedDate, Note
        )
        VALUES (
          @orderId, @receiverName, @receiverPhone, @province,
          @district, @ward, @streetAddress, @totalPrice,
          @status, @paymentMethod, @userId, @createdDate, @note
        )
      `);

      // Create order details and update stock
      for (const item of orderData.orderDetails) {
        const detailRequest = new sql.Request(transaction);
        detailRequest.input('orderId', sql.VarChar(20), orderId);
        detailRequest.input('bookId', sql.Int, item.bookId);
        detailRequest.input('quantity', sql.Int, item.quantity);
        detailRequest.input('price', sql.Decimal(18,2), item.price);

        await detailRequest.query(`
          INSERT INTO OrderDetail (OrderID, BookID, Quantity, Price)
          VALUES (@orderId, @bookId, @quantity, @price)
        `);

        await detailRequest.query(`
          UPDATE Book
          SET Quantity = Quantity - @quantity
          WHERE BookID = @bookId
        `);
      }

      await transaction.commit();
      return { orderId };

    } catch (error) {
      await transaction.rollback();
      console.error('Error in OrderModel.createOrder:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, newStatus) {
    const transaction = new sql.Transaction();
    try {
      await transaction.begin();
      
      const request = new sql.Request(transaction);
      request.input('orderId', sql.VarChar(20), orderId);
      
      // Get current order info
      const orderResult = await request.query(`
        SELECT Status, PaymentMethod, TotalPrice 
        FROM [Order] 
        WHERE OrderID = @orderId
      `);
      
      if (!orderResult.recordset[0]) {
        throw new Error('Order not found');
      }
      
      const currentStatus = orderResult.recordset[0].Status;
      
      // Validate status exists
      if (!ORDER_STATUSES.includes(newStatus)) {
        throw new Error('Invalid order status');
      }
      
      // Validate status flow
      const allowedNextStatuses = STATUS_FLOW[currentStatus];
      if (!allowedNextStatuses.includes(newStatus)) {
        throw new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
      }

      request.input('status', sql.NVarChar, newStatus);
      request.input('updatedDate', sql.DateTime, new Date());

      // Update order status
      await request.query(`
        UPDATE [Order]
        SET 
          Status = @status,
          UpdatedDate = @updatedDate
        WHERE OrderID = @orderId
      `);

      // Create payment record when order is delivered
      if (newStatus === 'Đã giao hàng') {
        await request.query(`
          INSERT INTO Payment (
            OrderID,
            Amount, 
            Status,
            CreatedDate,
            PaymentDate
          )
          VALUES (
            @orderId,
            ${orderResult.recordset[0].TotalPrice},
            'Success',
            @updatedDate,
            @updatedDate
          )
        `);
      }

      await transaction.commit();
      return true;

    } catch (error) {
      await transaction.rollback();
      console.error('Error in OrderModel.updateOrderStatus:', error);
      throw error;
    }
  }

  static async getUserOrders(userId) {
    try {
        console.log("Fetching orders for userId:", userId); // Kiểm tra userId

        const request = new sql.Request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT 
                o.OrderID,
                o.UserID,
                o.ReceiverName,
                o.ReceiverPhone,
                o.Province,
                o.District,
                o.Ward,
                o.StreetAddress,
                o.TotalPrice,
                o.Status,
                o.PaymentMethod,
                o.CreatedDate,
                o.UpdatedDate,
                COUNT(od.OrderDetailID) as ItemCount,
                STRING_AGG(b.Title, ', ') as BookTitles
            FROM [Order] o
            LEFT JOIN OrderDetail od ON o.OrderID = od.OrderID
            LEFT JOIN Book b ON od.BookID = b.BookID
            WHERE o.UserID = @userId
            GROUP BY 
                o.OrderID, o.UserID, o.ReceiverName, o.ReceiverPhone,
                o.Province, o.District, o.Ward, o.StreetAddress,
                o.TotalPrice, o.Status, o.PaymentMethod,
                o.CreatedDate, o.UpdatedDate
            ORDER BY o.CreatedDate DESC
        `);

        console.log("Query result:", result.recordset); // Kiểm tra kết quả truy vấn
        return result.recordset;

    } catch (error) {
        console.error('Error in OrderModel.getUserOrders:', error);
        throw error;
    }

  }

  static async getOrderById(orderId) {
    try {
      const request = new sql.Request();
      request.input('orderId', sql.VarChar(20), orderId);

      const result = await request.query(`
        SELECT 
          o.*,
          od.OrderDetailID,
          od.BookID,
          od.Quantity,
          od.Price,
          b.Title,
          b.Image,
          p.PaymentID,
          p.Status as PaymentStatus
        FROM [Order] o
        LEFT JOIN OrderDetail od ON o.OrderID = od.OrderID
        LEFT JOIN Book b ON od.BookID = b.BookID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        WHERE o.OrderID = @orderId
      `);

      if (result.recordset.length === 0) {
        return null;
      }

      const order = {
        ...result.recordset[0],
        orderDetails: result.recordset.map(record => ({
          orderDetailID: record.OrderDetailID,
          bookID: record.BookID,
          quantity: record.Quantity,
          price: record.Price,
          title: record.Title,
          image: record.Image
        }))
      };

      return order;

    } catch (error) {
      console.error('Error in OrderModel.getOrderById:', error);
      throw error;
    }
  }
  static async getOrders() {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM [Order]');
    return result.recordset;
  }
  static async searchOrders(query) {
    const request = new sql.Request();
    request.input('query', sql.NVarChar, `%${query}%`);
    
    const result = await request.query(`
      SELECT 
        OrderID, ReceiverName, ReceiverPhone, OrderDate, TotalPrice, Status, PaymentMethod
      FROM [Order]
      WHERE OrderID LIKE @query OR ReceiverPhone LIKE @query
      ORDER BY OrderDate DESC
    `);

    return result.recordset;
  }
}

export default OrderModel;