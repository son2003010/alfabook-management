// models/userModel.js
import { sql } from '../config/db.js';

class UserModel {
  // Kiểm tra số điện thoại tồn tại
  static async checkEmailExists(email) {
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .query('SELECT TOP 1 1 FROM [User] WHERE Email = @Email');
    return result.recordset.length > 0;
  }

  // Tạo user mới
  static async createUser(userData) {
    const { email, hashedPassword } = userData;
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, hashedPassword)
      .input('RoleID', sql.Int, 2)
      .input('Status', sql.Int, 1)
      .query(`
        INSERT INTO [User] (Email, Password, RoleID, Status, CreatedDate, UpdatedDate)
        VALUES (@Email, @Password, @RoleID, @Status, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS UserID;
      `);
    return result.recordset[0];
  }

  // Tìm user theo số điện thoại
  static async findByEmail(email) {
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .query('SELECT UserID, Email, Password, RoleID, Status FROM [User] WHERE Email = @Email');
    return result.recordset[0];
  }

  // Tìm admin theo username
  static async findAdminByUsername(username) {
    const request = new sql.Request();
    const result = await request
      .input('Username', sql.VarChar, username)
      .query('SELECT UserID, Username, Password, RoleID, Status FROM [User] WHERE Username = @Username');
    return result.recordset[0];
  }

  // Cập nhật thời gian đăng nhập
  static async updateLastLogin(userId) {
    const request = new sql.Request();
    await request
      .input('UserID', sql.Int, userId)
      .query('UPDATE [User] SET LastLoginDate = GETDATE() WHERE UserID = @UserID');
  }
  static async getUsers() {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM [User]');
    return result.recordset
  }

}

export default UserModel;