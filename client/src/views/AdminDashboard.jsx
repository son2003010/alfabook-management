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
  const [userStats, setUserStats] = useState({ totalUsersToday: 0, totalUsersYesterday: 0 });
  const [orderStats, setOrderStats] = useState({ totalOrdersToday: 0, totalOrdersYesterday: 0 });
  const [revenueStats, setRevenueStats] = useState({ revenueThisMonth: 0, revenueLastMonth: 0 });

  
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
        revenue: `${revenueData.revenueThisMonth.toLocaleString()} VND`,
        newOrders: ordersData.totalOrdersToday,
        newUsers: usersData.totalUsersToday,
      });
      setRevenueStats({
        revenueThisMonth: revenueData.revenueThisMonth,
        revenueLastMonth: revenueData.revenueLastMonth,
      });
      setOrderStats({
        totalOrdersToday: ordersData.totalOrdersToday,
        totalOrdersYesterday: ordersData.totalOrdersYesterday,
      });
      setUserStats({
        totalUsersToday: usersData.totalUsersToday,
        totalUsersYesterday: usersData.totalUsersYesterday,
      });
      setSalesData(chartData.salesByMonth || []); // Cập nhật dữ liệu biểu đồ
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    }
  };
  const userGrowth = userStats.totalUsersYesterday > 0
  ? ((userStats.totalUsersToday - userStats.totalUsersYesterday) / userStats.totalUsersYesterday * 100).toFixed(2)
  : userStats.totalUsersToday > 0 ? 100 : 0;

  const orderGrowth = orderStats.totalOrdersYesterday > 0 
  ? ((orderStats.totalOrdersToday - orderStats.totalOrdersYesterday) / orderStats.totalOrdersYesterday * 100).toFixed(2)
  : orderStats.totalOrdersToday > 0 ? 100 : 0;

  const revenueGrowth = revenueStats.revenueLastMonth === 0 
  ? ((revenueStats.revenueThisMonth - revenueStats.revenueLastMonth) / revenueStats.revenueLastMonth * 100).toFixed(2)
  : revenueStats.revenueThisMonth > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Doanh thu tháng',
            value: (
              <>
                {stats.revenue}
                <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="mr-1">{revenueGrowth >= 0 ? '▲' : '▼'}</span> 
                  ({revenueGrowth}%)
                </span>
              </>
            ),
            icon: Wallet,
          },
          {
            title: 'Đơn hàng mới',
            value: (
              <>
                {stats.newOrders} {/* Hiển thị số đơn hàng mới hôm nay */}
                <span className={`text-sm ${orderGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="mr-1">{orderGrowth >= 0 ? '▲' : '▼'}</span> 
                  ({orderGrowth}%)
                </span>
              </>
            ),
            icon: ShoppingBag,
          },

          {
            title: 'Khách hàng mới',
            value: (
                <>
                    {stats.newUsers} {/* Số khách hàng mới hôm nay */}
                    <span className={`text-sm ${userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="mr-1">{userGrowth >= 0 ? '▲' : '▼'}</span> 
                    ({userGrowth}%)                    </span>
                </>
            ),
            icon: Users,
        }
        
          
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
