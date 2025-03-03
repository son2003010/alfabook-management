import React, { useState, useEffect } from "react";
import { Search, Filter, Edit, Phone } from "lucide-react";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const statusOptions = [
    "Chờ xác nhận",
    "Đang chuẩn bị hàng",
    "Đang vận chuyển",
    "Đang giao hàng",
    "Đã giao hàng",
    "Đang hoàn hàng",
    "Hoàn hàng thành công",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/get-order");
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/update-status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.OrderID === orderId ? { ...order, Status: newStatus } : order
        )
      );

      setIsEditModalOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search-orders?query=${searchQuery}`);
      if (!response.ok) throw new Error("Lỗi khi tìm kiếm đơn hàng");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
    }
  }, [searchQuery]);

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

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "Chờ xác nhận";
      case "Đang chuẩn bị hàng":
        return "Đang chuẩn bị hàng";
      case "Đang vận chuyển":
        return "Đang vận chuyển";
      case "Đang giao hàng":
        return "Đang giao hàng";
      case "Đã giao hàng":
        return "Đã giao hàng";
      case "Đang hoàn hàng":
        return "Đang hoàn hàng";
      case "Hoàn hàng thành công":
        return "Hoàn hàng thành công";
      default:
        return null;
    }
  };

  const filterOrdersByStatus = (ordersList) => {
    return selectedStatus
      ? ordersList.filter((order) => order.Status === selectedStatus)
      : ordersList;
  };

  const displayedOrders =
    searchResults.length > 0 ? searchResults : filterOrdersByStatus(orders);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

      <div className="flex gap-4 items-center w-full">
        <div className="flex-1 relative">
          <Search className="w-5 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập mã đơn hàng hoặc số điện thoại..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
        >
          Tìm kiếm
        </button>

        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedOrders.map((order) => (
              <tr key={order.OrderID} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {order.OrderID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Phone className="w-4 h-4 mr-1" /> {order.ReceiverPhone}
                  </div>
                  {order.ReceiverName}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">{order.ReceiverPhone}</td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.OrderDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatPrice(order.TotalPrice)} VND
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getOrderStatusStyles(
                      order.Status
                    )}`}
                  >
                    {getOrderStatusLabel(order.Status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.PaymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEditingOrder(order);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded inline-flex items-center"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              Cập nhật trạng thái đơn hàng #{editingOrder?.OrderID}
            </h2>
            <select
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editingOrder?.Status || ""}
              onChange={(e) =>
                setEditingOrder((prev) => ({ ...prev, Status: e.target.value }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingOrder(null);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() =>
                  handleUpdateStatus(editingOrder.OrderID, editingOrder.Status)
                }
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;
