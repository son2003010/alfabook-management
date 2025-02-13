import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import OTPModel from '../models/otpModel.js';
import { sendEmail } from '../config/emailconfig.js';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendRegistrationOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email đã đăng ký chưa
    const userExists = await UserModel.checkEmailExists(email);
    if (userExists) {
      return res.status(409).json({
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
      `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`
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

  try {
    // // Xác minh OTP qua email
    // const validOTP = await OTPModel.verifyOTP(email, otp);
    // if (!validOTP) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Mã OTP không hợp lệ hoặc đã hết hạn.'
    //   });
    // }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const result = await UserModel.createUser({ email, hashedPassword });

    // Xóa OTP sau khi sử dụng
    // await OTPModel.deleteOTP(email);

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
    // Kiểm tra OTP hợp lệ hay không
    const isValidOTP = await OTPModel.verifyOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn.'
      });
    }
    await OTPModel.deleteOTP(email);
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
        phone: user.Phone,
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
      const users = await UserModel.getUsers();
      console.log(users)
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng", details: error.message });
  }
};
