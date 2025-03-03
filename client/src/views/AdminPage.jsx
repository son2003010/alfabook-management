import React, { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Building,
  PenTool,
  Folder,
  LogOut
} from "lucide-react";

function AdminPage() {
  const navigate = useNavigate();

  // Kiểm tra đăng nhập khi trang load
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const roleId = localStorage.getItem("roleId");
    
    // Nếu không có token hoặc không phải admin, chuyển hướng về trang đăng nhập
    if (!accessToken || roleId !== "1") {
      console.log("Không có quyền truy cập, chuyển hướng đến trang đăng nhập");
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
  
    if (!accessToken) {
      // Nếu không có token, chỉ xóa localStorage và điều hướng
      localStorage.clear();
      navigate("/admin-login");
      return;
    }
  
    try {
      // Chỉ gửi yêu cầu API nếu có refreshToken
      if (refreshToken) {
        const response = await fetch("/api/admin-logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({ refreshToken })
        });
  
        if (!response.ok) {
          const data = await response.json();
          console.error("Lỗi khi đăng xuất:", data.message);
        }
      } else {
        console.warn("Không tìm thấy refreshToken trong localStorage");
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    } finally {
      // Luôn xóa token khỏi localStorage và điều hướng, bất kể kết quả API
      localStorage.clear();
      navigate("/admin-login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-white shadow-lg p-4 fixed">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Admin
        </h2>
        <nav className="space-y-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <LayoutDashboard className="w-5 h-5 text-gray-600" />
            <span>Trang Chủ</span>
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <Package className="w-5 h-5 text-gray-600" />
            <span>Quản lý sản phẩm</span>
          </Link>
          <Link
            to="/admin/publisher"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <Building className="w-5 h-5 text-gray-600" />
            <span>Quản lý nhà xuất bản</span>
          </Link>
          <Link
            to="/admin/category"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <Folder className="w-5 h-5 text-gray-600" />
            <span>Quản lý danh mục</span>
          </Link>
          <Link
            to="/admin/author"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <PenTool className="w-5 h-5 text-gray-600" />
            <span>Quản lý tác giả</span>
          </Link>
          <Link
            to="/admin/promotion"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <Tag className="w-5 h-5 text-gray-600" />
            <span>Quản lý khuyến mãi</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span>Quản lý đơn hàng</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md"
          >
            <Users className="w-5 h-5 text-gray-600" />
            <span>Quản lý người dùng</span>
          </Link>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full space-x-3 text-red-600 hover:bg-red-200 p-2 rounded-md mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;