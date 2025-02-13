// models/categoryModel.js
import { sql } from '../config/db.js';

class CategoryModel {
  static async getCategory(categoryId) {
    const request = new sql.Request();
    request.input('categoryId', sql.Int, categoryId);
    const result = await request
      .query('SELECT CategoryID, CategoryName FROM Category');
    return result.recordset
  }
  static async getCategoryNoId() {
    const request = new sql.Request();
    const result = await request
      .query('SELECT CategoryID, CategoryName FROM Category');
    return result.recordset
  }
}

export default CategoryModel;