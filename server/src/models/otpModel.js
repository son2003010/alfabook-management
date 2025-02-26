import { sql } from '../config/db.js';

class OTPModel {
  static async createOTP(email, otp) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .input('OTP', sql.VarChar, otp)
      .input('ExpiryTime', sql.DateTime, new Date(Date.now() + 1 * 60000)) // 1 phút hết hạn
      .query(`
        INSERT INTO OTP (Email, OTPCode, ExpiryTime, CreatedDate)
        VALUES (@Email, @OTP, DATEADD(MINUTE, 1, GETDATE()), GETDATE())
      `);
  }

  static async verifyOTP(email, otp) {
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .input('OTP', sql.VarChar, otp)
      .query(`
        SELECT TOP 1 * FROM OTP
        WHERE Email = @Email 
        AND OTPCode = @OTP 
        AND ExpiryTime > GETDATE()
        AND IsUsed = 0
        ORDER BY CreatedDate DESC
      `);
    return result.recordset[0];
  }

  static async markOTPAsUsed(email, otp) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .input('OTP', sql.VarChar, otp)
      .query(`
        UPDATE OTP 
        SET IsUsed = 1 
        WHERE Email = @Email 
        AND OTPCode = @OTP
      `); 
  }

  static async deleteOTP(email) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .query('DELETE FROM OTP WHERE Email = @Email');
  }
}
export default OTPModel