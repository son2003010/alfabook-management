import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import OTPModel from '../models/otpModel.js';
import { sendEmail } from '../config/emailconfig.js';

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
    return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
  }
  try {
    // Kiểm tra email đã đăng ký chưa
    const userExists = await UserModel.checkEmailExists(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký.'
      });
    }

    // Tạo và lưu OTP
    const otp = generateOTP();
    await OTPModel.createOTP(email, otp);

    // Gửi OTP qua email
    const emailSent = await sendEmail(
      email,
      'Mã OTP xác thực',
      `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`
    );

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Lỗi khi gửi email.' });
    }

    return res.status(200).json({ success: true, message: 'Mã OTP đã gửi qua email.' });

  } catch (error) {
    console.error('Lỗi gửi OTP:', error);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi, thử lại sau.' });
  }
};

export const registerUser = async (req, res) => {
  const { email, password, otp } = req.body;
  console.log("Password received:", password, "Type:", typeof password);

  try {
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }
    if (!passwordRegex.test(password) || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự, ký tự đầu tiên phải viết hoa và chứa ít nhất một ký tự đặc biệt."
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
        email
      }
    });

  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau.'
    });
  }
};
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOTP = await OTPModel.verifyOTP(email, otp);
    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn.'
      });
    }

    // Mark OTP as used after successful verification
    await OTPModel.markOTPAsUsed(email, otp);
    
    return res.status(200).json({
      success: true,
      message: 'Mã OTP hợp lệ, tiếp tục đăng ký.'
    });

  } catch (error) {
    console.error('Lỗi xác minh OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, vui lòng thử lại sau.'
    });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
  }
  try {
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.' 
      });
    }

    if (user.Status === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.' 
      });
    }

    await UserModel.updateLastLogin(user.UserID);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        userId: user.UserID,
        email: user.Email,
        roleId: user.RoleID
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' 
    });
  }
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findAdminByUsername(username);
    
    if (!user || user.RoleID !== 1) {
      return res.status(401).json({ 
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' 
      });
    }

    if (user.Status === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.'
      });
    }

    if (password !== user.Password) {
      return res.status(401).json({ 
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' 
      });
    }

    await UserModel.updateLastLogin(user.UserID);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        userId: user.UserID,
        username: user.Username,
        roleId: user.RoleID
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' 
    });
  }
};

export const getUsers = async (req, res) => {
  try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1;  // Chuyển đổi sang số
      limit = parseInt(limit) || 10;


      const data = await UserModel.getUsers(page, limit);
      res.json(data);
  } catch (error) {
      res.status(500).json({ 
          error: "Lỗi khi lấy danh sách người dùng", 
          details: error.message 
      });
  }
};



export const sendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const userExists = await UserModel.checkEmailExists(email);
    if (!userExists) {
      return res.status(400).json({ success: false, message: 'Email chưa được đăng ký.' });
    }

    const otp = generateOTP();
    await OTPModel.createOTP(email, otp);

    const emailSent = await sendEmail(email, 'Mã OTP đặt lại mật khẩu', `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`);
    
    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Lỗi khi gửi email.' });
    }

    return res.status(200).json({ success: true, message: 'Mã OTP đã gửi qua email.' });

  } catch (error) {
    console.error('Lỗi gửi OTP:', error);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi, thử lại sau.' });
  }
};

export const verifyResetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValidOTP = await OTPModel.verifyOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }
    
    await OTPModel.deleteOTP(email);
    return res.status(200).json({ success: true, message: 'Mã OTP hợp lệ, tiếp tục đặt lại mật khẩu.' });

  } catch (error) {
    console.error('Lỗi xác minh OTP:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại sau.' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Lấy thông tin người dùng
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email không tồn tại.' });
    }

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    const isSamePassword = await bcrypt.compare(newPassword, user.Password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(email, hashedPassword);

    return res.status(200).json({ success: true, message: 'Mật khẩu đã được đặt lại thành công.' });

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
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
      console.error("Lỗi trong searchUser Controller:", error);
      res.status(500).json({ message: "Lỗi server khi tìm kiếm khách hàng" });
  }
};