import { sql } from '../config/db.js';

class SalesModel {
    static async getRevenuePayment() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                (SELECT SUM(Amount) FROM Payment WHERE YEAR(PaymentDate) = YEAR(GETDATE()) AND MONTH(PaymentDate) = MONTH(GETDATE())) AS revenueThisMonth,
                (SELECT SUM(Amount) FROM Payment WHERE YEAR(PaymentDate) = YEAR(GETDATE()) AND MONTH(PaymentDate) = MONTH(DATEADD(MONTH, -1, GETDATE()))) AS revenueLastMonth
        `);
        return result.recordset[0]; 
    }
    
    
    static async getNewOrders() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                (SELECT COUNT(OrderID) FROM [Order] WHERE CAST(OrderDate AS DATE) = CAST(GETDATE() AS DATE)) AS totalOrdersToday,
                (SELECT COUNT(OrderID) FROM [Order] WHERE CAST(OrderDate AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)) AS totalOrdersYesterday
        `);
        return result.recordset[0]; 
    }
    
    static async getNewUsers() {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                (SELECT COUNT(UserID) FROM [User]) AS totalUsersToday,
                (SELECT COUNT(UserID) FROM [User] WHERE CreatedDate < CAST(GETDATE() AS DATE)) AS totalUsersYesterday
        `);
        return result.recordset[0]; // Trả về tổng số khách hàng hôm nay và hôm qua
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
