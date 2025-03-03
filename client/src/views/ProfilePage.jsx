import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  ShoppingBag, 
  Star, 
  RotateCcw, 
  X, 
  MessageCircle, 
  Filter
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const userId = user?.userId;

  // Mở rộng/thu gọn chi tiết đơn hàng
  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };
  
  // Lọc đơn hàng theo trạng thái
  const filterOrders = () => {
    if (filter === "all") return orders;
    return orders.filter(order => order.Status === filter);
  };

  const filteredOrders = filterOrders();
  
  // Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      return data;
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`);
        const ordersData = await response.json();

        if (!response.ok) throw new Error(ordersData.message);

        // Lấy chi tiết từng đơn hàng
        const detailedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const details = await fetchOrderDetails(order.OrderID);
            return details
              ? { ...order, orderDetails: details.orderDetails }
              : order;
          })
        );

        setOrders(detailedOrders);
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      return null;
    }
  };

  const getOrderStatusStyles = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "bg-yellow-50 text-yellow-700";
      case "Đang chuẩn bị hàng":
        return "bg-blue-50 text-blue-700";
      case "Đang vận chuyển":
      case "Đang giao hàng":
        return "bg-purple-50 text-purple-700";
      case "Đã giao hàng":
        return "bg-green-50 text-green-700";
      case "Đang hoàn hàng":
        return "bg-orange-50 text-orange-700";
      case "Hoàn hàng thành công":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return <ShoppingBag className="w-4 h-4 mr-1" />;
      case "Đang chuẩn bị hàng":
        return <Package className="w-4 h-4 mr-1" />;
      case "Đang vận chuyển":
      case "Đang giao hàng":
        return <Truck className="w-4 h-4 mr-1" />;
      case "Đã giao hàng":
        return <Star className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return 20;
      case "Đang chuẩn bị hàng":
        return 40;
      case "Đang vận chuyển":
        return 60;
      case "Đang giao hàng":
        return 80;
      case "Đã giao hàng":
        return 100;
      default:
        return 0;
    }
  };

  // Tính toán thời gian giao hàng dự kiến
  const getEstimatedDelivery = (createdDate, status) => {
    const orderDate = new Date(createdDate);
    
    if (status === "Đã giao hàng") {
      return "Đã giao hàng";
    }
    
    // Thêm 3-5 ngày từ ngày đặt hàng
    const minDelivery = new Date(orderDate);
    minDelivery.setDate(minDelivery.getDate() + 3);
    
    const maxDelivery = new Date(orderDate);
    maxDelivery.setDate(maxDelivery.getDate() + 5);
    
    return `Dự kiến: ${minDelivery.toLocaleDateString('vi-VN')} - ${maxDelivery.toLocaleDateString('vi-VN')}`;
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Đơn Hàng Của Tôi
        </h1>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm mb-6">
        <CardHeader className="border-b border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách đơn hàng
            </h2>
            
            {/* Bộ lọc đơn hàng */}
            <div className="mt-4 sm:mt-0 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              <select 
                className="border border-gray-300 rounded-md p-2 text-sm"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1); // Reset về trang đầu khi lọc
                }}
              >
                <option value="all">Tất cả đơn hàng</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</option>
                <option value="Đang vận chuyển">Đang vận chuyển</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          ) : currentOrders.length > 0 ? (
            <div className="space-y-6">
              {currentOrders.map((order) => (
                <div
                  key={order.OrderID}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
                >
                  {/* Header đơn hàng */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Đơn hàng {order.OrderID}
                        </span>
                        <button 
                          onClick={() => toggleOrderDetails(order.OrderID)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          {expandedOrders[order.OrderID] ? 
                            <ChevronUp className="w-5 h-5" /> : 
                            <ChevronDown className="w-5 h-5" />
                          }
                        </button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <p>
                          Ngày đặt:{" "}
                          {new Date(order.CreatedDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <p className="font-medium">
                          {getEstimatedDelivery(order.CreatedDate, order.Status)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${getOrderStatusStyles(
                          order.Status
                        )}`}
                      >
                        {getOrderStatusIcon(order.Status)}
                        {order.Status}
                      </span>
                      <span className="mt-2 font-medium text-red-500">
                        {order.TotalPrice?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {/* Thanh tiến trình đơn hàng */}
                  {order.Status !== "Đang hoàn hàng" && order.Status !== "Hoàn hàng thành công" && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${getProgressPercentage(order.Status)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Chờ xác nhận</span>
                        <span>Đang chuẩn bị hàng</span>
                        <span>Đang vận chuyển</span>
                        <span>Đang giao hàng</span>
                        <span>Giao hàng</span>
                      </div>
                    </div>
                  )}

                  {/* Phần thông tin chi tiết */}
                  {expandedOrders[order.OrderID] && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Thông tin giao hàng</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Người nhận: {order.ReceiverName || user?.name || "Không có thông tin"}</p>
                            <p>Số điện thoại: {order.ReceiverPhone}</p>
                            <p>
                              Địa chỉ: {order.StreetAddress}, {order.Ward},{" "}
                              {order.District}, {order.Province}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Thông tin thanh toán</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Phương thức thanh toán: {order.PaymentMethod}</p>
                            <p>Trạng thái thanh toán: {order.PaymentStatus || "Đã thanh toán"}</p>
                            <p>Tổng tiền: <span className="font-medium text-red-500">{order.TotalPrice?.toLocaleString()}đ</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Hiển thị danh sách sách đã mua */}
                      {order.orderDetails && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Sản phẩm đã mua</h3>
                          <div className="space-y-3">
                            {order.orderDetails.map((book) => (
                              <div
                                key={book.bookID}
                                className="flex items-center border p-3 rounded-md"
                              >
                                <img
                                  src={getBookImage(book.image)}
                                  alt={book.title}
                                  className="w-16 h-20 object-cover rounded-md"
                                />
                                <div className="ml-4 flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {book.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Số lượng: {book.quantity}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Đơn giá: {book.price.toLocaleString()}đ
                                  </p>
                                  <p className="text-sm font-medium text-gray-700">
                                    Thành tiền: {(book.price * book.quantity).toLocaleString()}đ
                                  </p>
                                </div>
                                {order.Status === "Đã giao hàng" && (
                                  <button className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm hover:bg-yellow-100 flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    Đánh giá
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Các nút thao tác */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center hover:bg-gray-200">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Liên hệ hỗ trợ
                        </button>
                        
                        {order.Status === "Chờ xác nhận" && (
                          <button className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm flex items-center hover:bg-red-100">
                            <X className="w-4 h-4 mr-1" />
                            Hủy đơn hàng
                          </button>
                        )}
                        
                        {order.Status === "Đã giao hàng" && (
                          <button className="px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm flex items-center hover:bg-green-100">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Mua lại
                          </button>
                        )}
                      </div>
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
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
