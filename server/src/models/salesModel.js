import { sql } from '../config/db.js';

class SalesModel {
    static async getRevenuePayment() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT SUM(Amount) AS totalRevenue FROM Payment
        `);
        return result.recordset[0]; // Trả về một object chứa tổng doanh thu
    }
    static async getNewOrders() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT COUNT(OrderID) AS newOrders 
            FROM [Order] 
            WHERE OrderDate >= DATEADD(DAY, -30, GETDATE())
        `);
        return result.recordset[0]; // Trả về số đơn hàng mới
    }
    static async getNewUsers() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT COUNT(UserID) AS newUsers 
            FROM [User] 
            WHERE CreatedDate >= DATEADD(DAY, -30, GETDATE())
        `);
        return result.recordset[0]; // Trả về số đơn hàng mới
      }
    static async getSalesByMonth() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                FORMAT(o.OrderDate, 'yyyy-MM') AS month, 
                SUM(p.Amount) AS revenue,  -- Lấy tổng Amount từ Payment
                COUNT(o.OrderID) AS orders  -- Lấy số lượng đơn hàng
            FROM [Order] o
            JOIN Payment p ON o.OrderID = p.OrderID  -- Join bảng Payment với Order
            WHERE o.OrderDate >= DATEADD(YEAR, -1, GETDATE())  -- Chỉ lấy dữ liệu 12 tháng gần nhất
            GROUP BY FORMAT(o.OrderDate, 'yyyy-MM')
            ORDER BY month ASC;
        `);
        return result.recordset;
    }
}

export default SalesModel;
