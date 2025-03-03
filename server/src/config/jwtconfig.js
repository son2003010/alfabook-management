// jwtConfig.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
// Các cấu hình JWT
const config = {
  secretKey: process.env.JWT_SECRET, // Khóa bí mật nên lưu trong biến môi trường
  options: {
    expiresIn: '1h', // Thời gian hết hạn token
    algorithm: 'HS256', // Thuật toán mã hóa
    issuer: 'Alfabook', // Người phát hành token
  },
  refreshTokenOptions: {
    expiresIn: '7d', // Thời gian hết hạn refresh token
  }
};

// Hàm tạo JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, config.secretKey, config.options);
};

// Hàm tạo refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.secretKey, config.refreshTokenOptions);
};

// Middleware xác thực JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn', expired: true });
    }
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};
export {config, generateRefreshToken, generateToken, verifyToken, requireAdmin}
