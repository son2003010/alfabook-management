import { sql } from '../config/db.js';

class CategoryModel {
  static async getCategory(categoryId) {
    const request = new sql.Request();
    request.input('categoryId', sql.Int, categoryId);
    const result = await request.query(
      'SELECT CategoryID, CategoryName FROM Category',
    );
    return result.recordset;
  }
  static async getCategoryNoId() {
    const request = new sql.Request();
    const result = await request.query(
      'SELECT CategoryID, CategoryName FROM Category',
    );
    return result.recordset;
  }
  static async addCategory(categoryName) {
    const request = new sql.Request();
    request.input('categoryName', sql.NVarChar, categoryName);
    const result = await request.query(
      'INSERT INTO Category (CategoryName) VALUES (@categoryName); SELECT SCOPE_IDENTITY() AS CategoryID',
    );
    return { categoryId: result.recordset[0].CategoryID, categoryName };
  }
  static async deleteCategory(categoryId) {
    const request = new sql.Request();
    request.input('categoryId', sql.Int, categoryId);

    const result = await request.query(
      'DELETE FROM Category WHERE CategoryID = @categoryId',
    );
    return result.recordset;
  }
}

export default CategoryModel;
