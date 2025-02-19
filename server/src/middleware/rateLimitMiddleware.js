import rateLimit from 'express-rate-limit';

export const limiterOrder = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 2, // Giới hạn 2 request mỗi phút
    message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.'
});
export const limiterSendOtp = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 1, // Giới hạn 1 request mỗi phút
    message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.'
});
