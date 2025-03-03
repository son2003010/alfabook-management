import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import OTPModel from '../models/otpModel.js';
import { sendEmail } from '../config/emailconfig.js';
import { config, generateToken, generateRefreshToken } from '../config/jwtconfig.js';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const sendRegistrationOTP = async (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: 'Email không hợp lệ.' });
  }
  try {
    // Kiểm tra email đã đăng ký chưa
    const userExists = await UserModel.checkEmailExists(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký.',
      });
    }

    // Tạo và lưu OTP
    const otp = generateOTP();
    await OTPModel.createOTP(email, otp);

    // Gửi OTP qua email
    const emailSent = await sendEmail(
      email,
      'Mã OTP xác thực đăng ký',
      `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`,
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi khi gửi email.' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Mã OTP đã gửi qua email.' });
  } catch (error) {
    next(err);
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOTP = await OTPModel.verifyOTP(email, otp);
    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
      });
    }

    await OTPModel.markOTPAsUsed(email, otp);

    return res.status(200).json({
      success: true,
      message: 'Mã OTP hợp lệ, tiếp tục đăng ký.',
    });
  } catch (error) {
    next(err);
  }
};

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Password received:', password, 'Type:', typeof password);

  try {
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Email không hợp lệ.' });
    }
    if (!passwordRegex.test(password) || password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Mật khẩu phải có ít nhất 6 ký tự, ký tự đầu tiên phải viết hoa và chứa ít nhất một ký tự đặc biệt.',
      });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const result = await UserModel.createUser({ email, hashedPassword });
    await OTPModel.deleteOTP(email);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: {
        userId: result.UserID,
        email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: 'Email không hợp lệ.' });
  }
  try {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.',
      });
    }

    if (user.Status === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.',
      });
    }

    await UserModel.updateLastLogin(user.UserID);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        userId: user.UserID,
        email: user.Email,
        roleId: user.RoleID,
      },
    });
  } catch (error) {
    next(err);
  }
};
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token không được cung cấp'
    });
  }
  
  try {
    // Xác thực refresh token
    const decoded = jwt.verify(refreshToken, config.secretKey);
    
    // Kiểm tra xem refresh token có hợp lệ trong database không
    const user = await UserModel.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }
    
    // Kiểm tra refresh token trong database
    const isValidRefreshToken = await UserModel.verifyRefreshToken(user.UserID, refreshToken);
    
    if (!isValidRefreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token không hợp lệ'
      });
    }
    
    // Tạo payload cho token mới
    const payload = {
      userId: user.UserID,
      username: user.Username,
      roleId: user.RoleID,
    };
    
    // Tạo access token mới
    const accessToken = generateToken(payload);
    
    return res.status(200).json({
      success: true,
      message: 'Làm mới token thành công',
      data: {
        accessToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Refresh token không hợp lệ'
    });
  }
};
export const loginAdmin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findAdminByUsername(username);

    if (!user || user.RoleID !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    if (user.Status === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.',
      });
    }

    if (password !== user.Password) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    // Cập nhật thời gian đăng nhập cuối
    await UserModel.updateLastLogin(user.UserID);

    // Tạo payload cho JWT
    const payload = {
      userId: user.UserID,
      username: user.Username,
      roleId: user.RoleID,
    };

    // Tạo access token và refresh token
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Lưu refresh token vào database (nếu cần)
    await UserModel.saveRefreshToken(user.UserID, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        userId: user.UserID,
        username: user.Username,
        roleId: user.RoleID,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const logoutAdmin = async (req, res, next) => {
  const { refreshToken } = req.body;
  const userId = req.user.userId;
  
  try {
    // Xóa refresh token từ database
    if (refreshToken) {
      await UserModel.removeRefreshToken(userId, refreshToken);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1; // Chuyển đổi sang số
    limit = parseInt(limit) || 10;

    const data = await UserModel.getUsers(page, limit);
    res.json(data);
  } catch (error) {
    next(err);
  }
};

export const sendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const userExists = await UserModel.checkEmailExists(email);
    if (!userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'Email chưa được đăng ký.' });
    }

    const otp = generateOTP();
    await OTPModel.createOTP(email, otp);

    const emailSent = await sendEmail(
      email,
      'Mã OTP đặt lại mật khẩu',
      `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`,
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi khi gửi email.' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Mã OTP đã gửi qua email.' });
  } catch (error) {
    next(err);
  }
};

export const verifyResetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValidOTP = await OTPModel.verifyOTP(email, otp);
    if (!isValidOTP) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
        });
    }

    await OTPModel.deleteOTP(email);
    return res
      .status(200)
      .json({
        success: true,
        message: 'Mã OTP hợp lệ, tiếp tục đặt lại mật khẩu.',
      });
  } catch (error) {
    next(err);
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Lấy thông tin người dùng
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Email không tồn tại.' });
    }

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    const isSamePassword = await bcrypt.compare(newPassword, user.Password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Mật khẩu mới không được trùng với mật khẩu cũ.',
        });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(email, hashedPassword);

    return res
      .status(200)
      .json({ success: true, message: 'Mật khẩu đã được đặt lại thành công.' });
  } catch (error) {
    next(err);
  }
};
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]); // Nếu không có query, trả về mảng rỗng
    }

    const books = await UserModel.searchUsers(query);
    res.json(books);
  } catch (error) {
    next(err);
  }
};
