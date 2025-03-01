import rateLimit from 'express-rate-limit';

// Rate limit cho email không hợp lệ - giới hạn chặt chẽ hơn
const invalidEmailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 3, // Cho phép tối đa 3 lần thử với email không hợp lệ
  message:
    'Quá nhiều lần thử với email không hợp lệ. Vui lòng kiểm tra lại email của bạn.',
  skipFailedRequests: false,
});

// Rate limit cho email hợp lệ
const validEmailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 1, // Giới hạn 1 request mỗi phút cho email hợp lệ
  message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.',
  skipFailedRequests: false,
});

export const limiterSendOtp = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { email } = req.body;

  if (!email || !emailRegex.test(email)) {
    return invalidEmailLimiter(req, res, next);
  }
  return validEmailLimiter(req, res, next);
};

export const limiterOrder = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 2, // Giới hạn 2 request mỗi phút
  message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.',
});
