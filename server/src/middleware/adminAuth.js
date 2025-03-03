// middleware/adminAuth.js
import { verifyToken } from '../config/jwtconfig.js'

// Middleware xác thực admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Xác thực token
    verifyToken(req, res, (err) => {
      if (err) return next(err);
      
      // Kiểm tra quyền admin (RoleID = 1)
      if (req.user && req.user.roleId === 1) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập trang này.'
      });
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
    });
  }
};
