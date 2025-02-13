import { sql } from '../config/db.js';

class OTPModel {
  static async createOTP(email, otp) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .input('OTP', sql.VarChar, otp)
      .input('ExpiryTime', sql.DateTime, new Date(Date.now() + 5 * 60000)) // 5 phút hết hạn
      .query(`
        INSERT INTO OTP (Email, OTPCode, ExpiryTime, CreatedDate)
        VALUES (@Email, @OTP, @ExpiryTime, GETDATE())
      `);
  }

  static async verifyOTP(email, otp) {
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .input('OTP', sql.VarChar, otp)
      .query(`
        SELECT TOP 1 *, GETDATE() as CurrentTime FROM OTP
        WHERE Email = @Email AND OTPCode = @OTP
        ORDER BY CreatedDate DESC
      `);
    return result.recordset[0];
}


  static async deleteOTP(email) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .query('DELETE FROM OTP WHERE Email = @Email');
  }
}
export default OTPModel