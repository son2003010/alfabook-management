import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const [formState, setFormState] = useState({
    isLogin: true,
    showPassword: false,
    email: '',
    password: '',
    otp: '',
    loading: false,
    error: '',
    successMessage: '',
    showSuccessIcon: false,
    isOTPSent: false,
    isOTPVerified: false
  });

  if (!isOpen) return null;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (message, isError = false) => {
    setFormState(prev => ({
      ...prev,
      error: isError ? message : '',
      successMessage: !isError ? message : '',
      showSuccessIcon: !isError
    }));

    if (!isError) {
      setTimeout(() => {
        setFormState(prev => ({
          ...prev,
          showSuccessIcon: false,
          successMessage: ''
        }));
      }, 3000);
    }
  };

  const handleSendOTP = async () => {
    if (!validateEmail(formState.email)) {
      showNotification("Email không hợp lệ!", true);
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch('api/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email }),
      });
      if (response.status === 429) { // Rate limit exceeded
        throw new Error('Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.');
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      if (result.success) {
        setFormState(prev => ({ ...prev, isOTPSent: true }));
        showNotification('Mã OTP đã được gửi đến email của bạn!');
      }
    } catch (error) {
      showNotification(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau', true);
      setTimeout(() => {
        showNotification("", false)
      }, 5000)
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleVerifyOTP = async () => {
    if (!formState.otp) {
      showNotification("Vui lòng nhập mã OTP!", true);
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch('api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formState.email, 
          otp: formState.otp 
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      if (result.success) {
        setFormState(prev => ({ ...prev, isOTPVerified: true }));
        showNotification('Xác minh OTP thành công!');
      }
    } catch (error) {
      showNotification(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau', true);
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, isLogin, isOTPVerified } = formState;

    if (!email || !password) {
      showNotification("Vui lòng nhập đầy đủ email và mật khẩu!", true);
      return;
    }

    if (!validateEmail(email)) {
      showNotification("Email không hợp lệ!", true);
      return;
    }

    if (password.length < 6) {
      showNotification("Mật khẩu phải có ít nhất 6 ký tự!", true);
      return;
    }

    if (!isLogin && !isOTPVerified) {
      showNotification("Vui lòng xác minh OTP trước khi đăng ký!", true);
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(
        `http://localhost:3001/api/${isLogin ? 'login' : 'register'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      if (result.success) {
        if (isLogin) {
          login(result.data);
          onClose();
        } else {
          setFormState(prev => ({
            ...prev,
            isLogin: true,
            email: '',
            password: '',
            otp: '',
            isOTPSent: false,
            isOTPVerified: false
          }));
          showNotification('Đăng ký thành công!');
        }
      }
    } catch (error) {
      showNotification(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau', true);
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const switchMode = (isLoginMode) => {
    setFormState(prev => ({
      ...prev,
      isLogin: isLoginMode,
      error: '',
      successMessage: '',
      isOTPSent: false,
      isOTPVerified: false
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex mb-8 border-b">
          <button
            className={`flex-1 py-3 text-center ${
              formState.isLogin ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'
            }`}
            onClick={() => switchMode(true)}
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              !formState.isLogin ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'
            }`}
            onClick={() => switchMode(false)}
          >
            Đăng ký
          </button>
        </div>

        {formState.error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            {formState.error}
          </div>
        )}

        {formState.successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg text-center flex items-center justify-center gap-2">
            {formState.showSuccessIcon && <CheckCircle2 className="w-6 h-6" />}
            <span className="text-lg font-semibold">{formState.successMessage}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập email"
                  value={formState.email}
                  onChange={handleInputChange}
                  disabled={formState.loading}
                />
              </div>
              {!formState.isLogin && (
                <button
                  type="button"
                  className={`whitespace-nowrap px-4 py-2 bg-blue-400 text-white rounded-lg transition-colors duration-200 
                    ${formState.loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500'}
                    ${formState.isOTPSent ? 'bg-gray-400 hover:bg-gray-500' : ''}`}
                  onClick={handleSendOTP}
                  disabled={formState.loading || formState.isOTPVerified}
                >
                  {formState.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </span>
                  ) : formState.isOTPSent ? 'Gửi lại mã' : 'Gửi mã OTP'}
                </button>
              )}
            </div>
          </div>


          {!formState.isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="otp"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập mã OTP"
                  value={formState.otp}
                  onChange={handleInputChange}
                  disabled={!formState.isOTPSent || formState.loading || formState.isOTPVerified}
                />
                <button
                  type="button"
                  className={`whitespace-nowrap px-4 py-2 bg-blue-400 text-white rounded-lg transition-colors duration-200 
                    ${formState.loading || !formState.isOTPSent || formState.isOTPVerified ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                  onClick={handleVerifyOTP}
                  disabled={formState.loading || !formState.isOTPSent || formState.isOTPVerified}
                >
                  {formState.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </span>
                  ) : formState.isOTPVerified ? 'Đã xác minh' : 'Xác minh'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={formState.showPassword ? 'text' : 'password'}
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập mật khẩu"
                value={formState.password}
                onChange={handleInputChange}
                disabled={formState.loading || (!formState.isLogin && !formState.isOTPVerified)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              >
                {formState.showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* {!formState.isLogin && !formState.isOTPSent && (
            <button
              type="button"
              className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg transition-colors duration-200 
                ${formState.loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              onClick={handleSendOTP}
              disabled={formState.loading}
            >
              {formState.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          )} */}

          <button
            type="submit"
            className={`w-full py-2 px-4 bg-red-500 text-white rounded-lg transition-colors duration-200 
              ${formState.loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
            disabled={formState.loading || (!formState.isLogin && !formState.isOTPVerified)}
          >
            {formState.loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              formState.isLogin ? 'Đăng nhập' : 'Đăng ký'
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            {formState.isLogin ? (
              <>
                <div>
                  <span>Bạn chưa có tài khoản? </span>
                  <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      switchMode(false);
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
                  <a href="#" className="text-blue-500 hover:text-blue-600">
                    Điều khoản dịch vụ
                  </a>
                  {' & '}
                  <a href="#" className="text-blue-500 hover:text-blue-600">
                    Chính sách bảo mật
                  </a>
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