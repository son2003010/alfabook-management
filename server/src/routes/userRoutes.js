import express from 'express';
import { limiterSendOtp } from '../middleware/rateLimitMiddleware.js';
import { authenticateAdmin } from '../middleware/adminAuth.js'; 

import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutAdmin,
  getUsers,
  sendRegistrationOTP,
  verifyOTP,
  sendResetPasswordOTP,
  verifyResetPasswordOTP,
  resetPassword,
  searchUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/send-registration-otp', limiterSendOtp, sendRegistrationOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/admin-logout', authenticateAdmin, logoutAdmin);

router.get('/get-user', getUsers);

router.post('/send-reset-password-otp', sendResetPasswordOTP);
router.post('/verify-reset-password-otp', verifyResetPasswordOTP);
router.post('/reset-password', resetPassword);
router.get('/search-users', searchUser);

export default router;
