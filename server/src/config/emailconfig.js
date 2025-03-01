import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const userEmail = process.env.EMAIL_USER;
const userPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userEmail,
    pass: userPass,
  },
  secure: true, // Sử dụng SSL/TLS
  tls: {
    rejectUnauthorized: true, // Từ chối kết nối không an toàn
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    const info = transporter.sendMail({
      from: `"Alfabook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(info);
    return true;
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    return false;
  }
};
