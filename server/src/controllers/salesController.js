import SalesModel from '../models/salesModel.js';

export const getSalesChart = async (req, res) => {
    try {
        const salesByMonth = await SalesModel.getSalesByMonth();
        res.json({ salesByMonth });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu biểu đồ doanh thu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
export const getNewUsers = async (req, res) => {
    try {
        const { newUsers } = await SalesModel.getNewUsers();
        res.json({ newUsers });
    } catch (error) {
        console.error('Lỗi lấy đơn hàng mới:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
export const getNewOrders = async (req, res) => {
    try {
        const { newOrders } = await SalesModel.getNewOrders();
        res.json({ newOrders });
    } catch (error) {
        console.error('Lỗi lấy đơn hàng mới:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};  
export const getRevenuePayment = async (req, res) => {
    try {
        const payments = await SalesModel.getRevenuePayment();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách thanh toán", details: error.message });
    }
};
