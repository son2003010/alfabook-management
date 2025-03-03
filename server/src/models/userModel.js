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
      .input('Status', sql.Int, 1).query(`
        INSERT INTO [User] (Email, Password, RoleID, Status, CreatedDate, UpdatedDate)
        VALUES (@Email, @Password, @RoleID, @Status, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS UserID;
      `);
    return result.recordset[0];
  }

  // Tìm user theo email
  static async findByEmail(email) {
    const request = new sql.Request();
    const result = await request
      .input('Email', sql.VarChar, email)
      .query(
        'SELECT UserID, Email, Password, RoleID, Status FROM [User] WHERE Email = @Email',
      );
    return result.recordset[0];
  }
  // Tìm admin theo username
  static async findAdminByUsername(username) {
    const request = new sql.Request();
    const result = await request
      .input('Username', sql.VarChar, username)
      .query(
        'SELECT UserID, Username, Password, RoleID, Status FROM [User] WHERE Username = @Username',
      );
    return result.recordset[0];
  }

  // Cập nhật thời gian đăng nhập
  static async updateLastLogin(userId) {
    const request = new sql.Request();
    await request
      .input('UserID', sql.Int, userId)
      .query(
        'UPDATE [User] SET LastLoginDate = GETDATE() WHERE UserID = @UserID',
      );
  }
  static async getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const request = new sql.Request();

    // Lấy danh sách user với phân trang
    const result = await request
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset).query(`
            SELECT * FROM [User]
            ORDER BY UserID
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

    // Lấy tổng số user để tính totalPages
    const totalResult = await request.query(
      `SELECT COUNT(*) as total FROM [User]`,
    );
    const totalUsers = totalResult.recordset[0].total;
    const totalPages = Math.ceil(totalUsers / limit); // Tính tổng số trang

    return { users: result.recordset, totalPages };
  }

  static async updatePassword(email, newPassword) {
    const request = new sql.Request();
    await request
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, newPassword)
      .query('UPDATE [User] SET Password = @Password WHERE Email = @Email');
  }
  static async searchUsers(query) {
    const request = new sql.Request();
    request.input('query', sql.NVarChar, `%${query}%`);

    const result = await request.query(`
      SELECT *
      FROM [User]
      WHERE Phone LIKE @query OR Email LIKE @query
    `);

    return result.recordset;
  }

  static async saveRefreshToken(userId, refreshToken) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('refreshToken', sql.NVarChar, refreshToken);
  
      const result = await request.query(`
        INSERT INTO User_Refresh_Tokens (User_Id, Refresh_token, Expires_at)
        VALUES (@userId, @refreshToken, DATEADD(DAY, 7, GETDATE()))
      `);
  
      return result.recordset;
    } catch (error) {
      console.error('Lỗi khi lưu refresh token:', error);
      throw error;
    }
  }
  static async verifyRefreshToken (userId, refreshToken) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('refreshToken', sql.NVarChar, refreshToken);

      const result = await request.query(`
        SELECT * FROM User_Refresh_Tokens
        WHERE User_Id = @userId AND Refresh_token = @refreshToken AND Expires_at > GETDATE()
      `);

      return result.recordset.length > 0;
    } catch (error) {
      console.error('Lỗi khi xác thực refresh token:', error);
      throw error;
    }
  }
  static async removeRefreshToken (userId, refreshToken) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('refreshToken', sql.NVarChar, refreshToken);
  
      await request.query(`
        DELETE FROM User_Refresh_Tokens
        WHERE User_Id = @userId AND Refresh_token = @refreshToken
      `);
  
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa refresh token:', error);
      throw error;
    }
  }
  static async findUserById  (userId) {
    try {
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
  
      const result = await request.query(`
        SELECT * FROM [User]
        WHERE UserID = @userId
      `);
  
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm người dùng theo ID:', error);
      throw error;
    }
  }
}

export default UserModel;
