import express from 'express';
import { limiterSendOtp } from '../middleware/rateLimitMiddleware.js';

import { registerUser, loginUser, loginAdmin, getUsers, sendRegistrationOTP, verifyOTP } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.get('/get-user', getUsers);
router.post('/send-registration-otp', limiterSendOtp, sendRegistrationOTP); // Thêm route mới
router.post('/verify-otp', verifyOTP); // Thêm route mới

export default router;