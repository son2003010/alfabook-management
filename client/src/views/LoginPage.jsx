import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  
  if (!isOpen) return null;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Kiểm tra email hợp lệ
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('api/send-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }

      if (result.success) {
        setIsOTPSent(true);
        setSuccessMessage('Mã OTP đã được gửi đến email của bạn!');
        setShowSuccessIcon(true);
        setTimeout(() => setShowSuccessIcon(false), 3000);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Vui lòng nhập mã OTP!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }

      if (result.success) {
        setIsOTPVerified(true);
        setSuccessMessage('Xác minh OTP thành công!');
        setShowSuccessIcon(true);
        setTimeout(() => setShowSuccessIcon(false), 3000);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!isLogin && !isOTPVerified) {
      setError("Vui lòng xác minh OTP trước khi đăng ký!");
      return;
    }

    const endpoint = isLogin ? 'http://localhost:3001/api/login' : 'http://localhost:3001/api/register';
    const data = { email, password };

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }

      if (result.success) {
        if (isLogin) {
          login(result.data);
          onClose();
        } else {
          setIsLogin(true);
          setSuccessMessage('Đăng ký thành công!');
          setShowSuccessIcon(true);
          setTimeout(() => setShowSuccessIcon(false), 3000);
          setTimeout(() => setSuccessMessage(''), 3000);
        }
        setEmail('');
        setPassword('');
        setOtp('');
        setError('');
        setIsOTPSent(false);
        setIsOTPVerified(false);
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex mb-8 border-b">
          <button
            className={`flex-1 py-3 text-center ${isLogin ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccessMessage('');
              setIsOTPSent(false);
              setIsOTPVerified(false);
            }}
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 py-3 text-center ${!isLogin ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccessMessage('');
              setIsOTPSent(false);
              setIsOTPVerified(false);
            }}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg text-center flex items-center justify-center space-x-2">
            {showSuccessIcon && <i className="fas fa-check-circle text-green-500 text-4xl"></i>}
            <span className="text-lg font-semibold">{successMessage}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || (isOTPSent && !isLogin)}
            />
          </div>

          {!isLogin && isOTPSent && !isOTPVerified && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã OTP
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={`w-full mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg transition-colors duration-200 
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                Xác minh OTP
              </button>
            </div>
          )}

          {/* Phần nhập mật khẩu cho cả đăng nhập và đăng ký */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || (!isLogin && !isOTPVerified)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {!isLogin && !isOTPSent && (
            <button
              type="button"
              className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg transition-colors duration-200 
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              onClick={handleSendOTP}
              disabled={loading}
            >
              Gửi mã OTP
            </button>
          )}

          <button
            type="submit"
            className={`w-full py-2 px-4 bg-red-500 text-white rounded-lg transition-colors duration-200 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
            disabled={loading || (!isLogin && !isOTPVerified)}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký'
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                <div>
                  <span>Bạn chưa có tài khoản? </span>
                  <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(false);
                      setError('');
                      setIsOTPSent(false);
                      setIsOTPVerified(false);
                    }}
                  >
                    Đăng ký ngay
                  </button>
                </div>
                <div className="mt-2">
                  <span>Bạn là ADMIN bấm </span>
                  <Link 
                    to="/admin-login" 
                    className="text-red-500 hover:text-red-600"
                    onClick={onClose}
                  >
                    vào đây
                  </Link>
                  <span> để đăng nhập</span>
                </div>
              </>
            ) : (
              <>
                <p>Bằng việc đăng ký, bạn đã đồng ý với alfabook.com về</p>
                <div className="mt-1">
                  <a href="#" className="text-blue-500 hover:text-blue-600">Điều khoản dịch vụ</a>
                  {' & '}
                  <a href="#" className="text-blue-500 hover:text-blue-600">Chính sách bảo mật</a>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;