import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 10, // Giới hạn 10 request mỗi phút
    message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.'
});
