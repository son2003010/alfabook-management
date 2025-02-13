import React from "react";
import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Building, PenTool } from "lucide-react";

function AdminPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-white shadow-lg p-4 fixed">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Admin</h2>
        <nav className="space-y-4">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <LayoutDashboard className="w-5 h-5 text-gray-600" /> <span>Trang Chủ</span>
          </Link>
          <Link to="/admin/products" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <Package className="w-5 h-5 text-gray-600" /> <span>Quản lý sản phẩm</span>
          </Link>
          <Link to="/admin/publisher" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <Building className="w-5 h-5 text-gray-600" /> <span>Quản lý nhà xuất bản</span>
          </Link>
          <Link to="/admin/author" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <PenTool className="w-5 h-5 text-gray-600" /> <span>Quản lý tác giả</span>
          </Link>
          <Link to="/admin/promotion" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <Tag className="w-5 h-5 text-gray-600" /> <span>Quản lý khuyến mãi </span>
          </Link>
          <Link to="/admin/orders" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <ShoppingCart className="w-5 h-5 text-gray-600" /> <span>Quản lý đơn hàng</span>
          </Link>
          <Link to="/admin/users" className="flex items-center space-x-3 text-gray-800 hover:bg-gray-200 p-2 rounded-md">
            <Users className="w-5 h-5 text-gray-600" /> <span>Quản lý người dùng</span>
          </Link>
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
