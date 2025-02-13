import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Package } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = user?.userId; // Lấy userId nếu user tồn tại

  // useEffect(() => {
  //   if (!userId) {
  //     console.warn("UserId is undefined, waiting for authentication...");
  //     return;
  //   }

  //   const fetchOrders = async () => {
  //     try {
  //       console.log("Fetching orders for userId:", userId); // Kiểm tra userId
  //       const response = await fetch(`/api/user/${userId}`);
  //       const data = await response.json();
  //       if (response.ok) {
  //         setOrders(data);
  //       } else {
  //         throw new Error(data.message);
  //       }
  //     } catch (err) {
  //       setError('Không thể tải thông tin đơn hàng');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchOrders();
  // }, [userId]); // Chỉ chạy khi userId thay đổi

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`); // Gọi đúng API
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
  
      return data; // Trả về dữ liệu chi tiết đơn hàng
    } catch (err) {
      console.error('Lỗi tải chi tiết đơn hàng:', err);
      return null;
    }
  };
  useEffect(() => {
    if (!userId) return;
  
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`); // Lấy danh sách đơn hàng của user
        const ordersData = await response.json();
  
        if (!response.ok) throw new Error(ordersData.message);
  
        // Lấy chi tiết từng đơn hàng
        const detailedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const details = await fetchOrderDetails(order.OrderID);
            return details ? { ...order, orderDetails: details.orderDetails } : order;
          })
        );
  
        setOrders(detailedOrders);
      } catch (err) {
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, [userId]); // Chạy lại khi userId thay đổi
  
  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      return null;
    }
  };
  
  const getOrderStatusStyles = (status) => {
    switch(status) {
      case 'Chờ xác nhận':
        return 'bg-yellow-50 text-yellow-700';
      case 'Đang chuẩn bị hàng':
        return 'bg-blue-50 text-blue-700';
      case 'Đang vận chuyển':
      case 'Đang giao hàng':
        return 'bg-purple-50 text-purple-700';
      case 'Đã giao hàng':
        return 'bg-green-50 text-green-700';
      case 'Đang hoàn hàng':
        return 'bg-orange-50 text-orange-700';
      case 'Hoàn hàng thành công':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  const getOrderStatusLabel = (status) => {
    switch(status) {
      case 'Chờ xác nhận':
        return 'Chờ xác nhận'; // Có thể sử dụng icon từ lucide-react
      case 'Đang chuẩn bị hàng':
        return 'Đang chuẩn bị hàng';
      case 'Đang vận chuyển':
        return 'Đang vận chuyển';
      case 'Đang giao hàng':
        return 'Đang giao hàng';
      case 'Đã giao hàng':
        return 'Đã giao hàng';
      case 'Đang hoàn hàng':
        return 'Đang hoàn hàng';
      case 'Hoàn hàng thành công':
        return 'Hoàn hàng thành công';
      default:
        return null;
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Package className="w-8 h-8 text-red-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đơn Hàng Của Tôi</h1>
      </div>
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader className="border-b border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách đơn hàng</h2>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.OrderID} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">Đơn hàng {order.OrderID}</span>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>Ngày đặt: {new Date(order.CreatedDate).toLocaleDateString('vi-VN')}</p>
                      <p>Số điện thoại: {order.ReceiverPhone}</p>
                      <p>Địa chỉ: {order.StreetAddress}, {order.Ward}, {order.District}, {order.Province}</p>
                      <p>Phương thức thanh toán: {order.PaymentMethod}</p>
                      <p>Tổng tiền: <span className="font-medium text-red-500">{order.TotalPrice?.toLocaleString()}đ</span></p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusStyles(order.Status)}`}>
                    {getOrderStatusLabel(order.Status)}
                  </span>
                </div>

                {/* Hiển thị danh sách sách đã mua */}
                {order.orderDetails && (
                  <div className="mt-4 space-y-2">
                    {order.orderDetails.map((book) => (
                      <div key={book.bookID} className="flex items-center border p-3 rounded-md">
                        <img src={getBookImage(book.image)} alt={book.title} className="w-16 h-16 object-cover rounded-md" />
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-500">Số lượng: {book.quantity}</p>
                          <p className="text-sm text-gray-500">Giá: {book.price.toLocaleString()}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
