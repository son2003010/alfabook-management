import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('accessToken'); // Lấy token
  const roleId = localStorage.getItem('roleId'); // Lấy quyền hạn

  // Nếu chưa đăng nhập hoặc không phải Admin, chuyển về trang đăng nhập
  if (!token || roleId !== '1') {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />; // Cho phép truy cập nếu hợp lệ
};

export default AdminRoute;
