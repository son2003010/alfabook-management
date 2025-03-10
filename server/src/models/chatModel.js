import { sql } from '../config/db.js';
// Hàm lấy danh mục sách từ SQL Server
class ChatModel {
    static async getCategory() {
      const request = new sql.Request();
      const result = await request.query(
        'SELECT CategoryID, CategoryName FROM Category',
      );
      return result.recordset;
    }
}
  
export default ChatModel;
  