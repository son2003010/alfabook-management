import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, ShoppingBag, Users } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: '0 VND',
    newOrders: 0,
    newUsers: 0,
  });

  const [salesData, setSalesData] = useState([]); // Dữ liệu cho biểu đồ

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Gọi API lấy doanh thu
      const revenueRes = await fetch('/api/get-revenue-payment');
      const revenueData = await revenueRes.json();

      // Gọi API lấy số đơn hàng mới
      const ordersRes = await fetch('/api/get-new-order');
      const ordersData = await ordersRes.json();

      // Gọi API lấy số khách hàng mới
      const usersRes = await fetch('/api/get-new-user');
      const usersData = await usersRes.json();

      // Gọi API lấy dữ liệu biểu đồ
      const chartRes = await fetch('/api/get-sales-chart'); // API để lấy dữ liệu biểu đồ
      const chartData = await chartRes.json();

      // Cập nhật state với dữ liệu thực tế
      setStats({
        revenue: `${revenueData.totalRevenue.toLocaleString()} VND`,
        newOrders: ordersData.newOrders,
        newUsers: usersData.newUsers,
      });

      setSalesData(chartData.salesByMonth || []); // Cập nhật dữ liệu biểu đồ
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Doanh thu tháng', value: stats.revenue, icon: Wallet },
          { title: 'Đơn hàng mới', value: stats.newOrders, icon: ShoppingBag },
          { title: 'Khách hàng mới', value: stats.newUsers, icon: Users },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Thống kê doanh thu & đơn hàng</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4F46E5" name="Doanh thu" />
              <Bar dataKey="orders" fill="#10B981" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
