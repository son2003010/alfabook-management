import { sql } from '../config/db.js';

class CartModel {
  static async addToCart(userId, bookId, quantity) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('bookId', sql.Int, bookId);
      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng
      const checkExist = await request.query(`
          SELECT Quantity
          FROM Cart
          WHERE UserID = @userId AND BookID = @bookId
        `);

      if (checkExist.recordset.length > 0) {
        // Cập nhật số lượng nếu đã tồn tại
        const newQuantity = checkExist.recordset[0].Quantity + quantity;
        request.input('quantity', sql.Int, newQuantity);

        const updateResult = await request.query(`
            UPDATE Cart
            SET Quantity = @quantity
            WHERE UserID = @userId AND BookID = @bookId
          `);
        return updateResult;
      } else {
        // Thêm mới nếu chưa tồn tại
        request.input('quantity', sql.Int, quantity);

        const insertResult = await request.query(`
            INSERT INTO Cart (UserID, BookID, Quantity)
            VALUES (@userId, @bookId, @quantity)
          `);
        return insertResult;
      }
    } catch (error) {
      console.error('Lỗi trong CartModel.addToCart:', error);
      throw error;
    }
  }

  static async getCartItems(userId) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);

      const result = await request.query(`
          SELECT 
            c.CartID,
            c.BookID,
            c.Quantity,
            b.Title,
            b.Price,
            b.Image,
            COALESCE(p.Discount, 0) as Discount,
            STRING_AGG(a.AuthorName, ', ') as Authors
          FROM Cart c
          JOIN Book b ON c.BookID = b.BookID
          LEFT JOIN Promotion p ON b.PromotionID = p.PromotionID
          LEFT JOIN BookAuthor ba ON b.BookID = ba.BookID
          LEFT JOIN Author a ON ba.AuthorID = a.AuthorID
          WHERE c.UserID = @userId
          GROUP BY 
            c.CartID,
            c.BookID,
            c.Quantity,
            b.Title,
            b.Price,
            b.Image,
            p.Discount
        `);

      return result.recordset;
    } catch (error) {
      console.error('Lỗi trong CartModel.getCartItems:', error);
      throw error;
    }
  }

  static async getCartCount(userId) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);

      const result = await request.query(`
          SELECT COUNT(*) as count
          FROM Cart
          WHERE UserID = @userId
        `);

      return result.recordset[0].count;
    } catch (error) {
      console.error('Lỗi trong CartModel.getCartCount:', error);
      throw error;
    }
  }

  static async updateQuantity(cartId, quantity) {
    try {
      const request = new sql.Request();
      request.input('cartId', sql.Int, cartId);
      request.input('quantity', sql.Int, quantity);

      const result = await request.query(`
            UPDATE Cart
            SET Quantity = @quantity
            WHERE CartID = @cartId
        `);

      return result;
    } catch (error) {
      console.error('Lỗi trong CartModel.updateQuantity:', error);
      throw error;
    }
  }

  static async removeFromCart(cartId) {
    try {
      const request = new sql.Request();
      request.input('cartId', sql.Int, cartId);

      const result = await request.query(`
          DELETE FROM Cart
          WHERE CartID = @cartId
        `);

      return result;
    } catch (error) {
      console.error('Lỗi trong CartModel.removeFromCart:', error);
      throw error;
    }
  }

  static async clearCart(userId) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
            DELETE FROM Cart
            WHERE UserID = @userId
        `);

      return result;
    } catch (error) {
      console.error('Lỗi trong CartModel.clearCart:', error);
      throw error;
    }
  }
}
export default CartModel;
