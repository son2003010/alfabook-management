import { sql } from '../config/db.js';

class PromotionModel {
  static async getPromotions() {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM Promotion');
    return result.recordset;
  }

  static async isPromotionIdExists(promotionId) {
    const request = new sql.Request();
    request.input('promotionId', sql.Int, promotionId);
    const result = await request.query(
      'SELECT COUNT(*) AS count FROM Promotion WHERE PromotionID = @promotionId',
    );
    return result.recordset[0].count > 0;
  }

  static async addPromotion(
    promotionName,
    description,
    startDate,
    endDate,
    discount,
    isActive = true,
  ) {
    const request = new sql.Request();
    request.input('promotionName', sql.NVarChar, promotionName);
    request.input('description', sql.NVarChar, description);
    request.input('startDate', sql.DateTime, startDate);
    request.input('endDate', sql.DateTime, endDate);
    request.input('discount', sql.Float, discount);
    request.input('isActive', sql.Bit, isActive);

    const result =
      await request.query(`INSERT INTO Promotion (PromotionName, Description, StartDate, EndDate, Discount, IsActive, CreatedDate, UpdatedDate) 
                    OUTPUT INSERTED.PromotionID 
                    VALUES (@promotionName, @description, @startDate, @endDate, @discount, @isActive, GETDATE(), GETDATE())`);
    return result.recordset[0].PromotionID;
  }

  static async updatePromotion(
    promotionId,
    promotionName,
    description,
    startDate,
    endDate,
    discount,
    isActive,
  ) {
    const request = new sql.Request();
    request.input('promotionId', sql.Int, promotionId);
    request.input('promotionName', sql.NVarChar, promotionName);
    request.input('description', sql.NVarChar, description);
    request.input('startDate', sql.DateTime, startDate);
    request.input('endDate', sql.DateTime, endDate);
    request.input('discount', sql.Float, discount);
    request.input('isActive', sql.Bit, isActive);

    const result = await request.query(`UPDATE Promotion SET 
                    PromotionName = @promotionName, 
                    Description = @description, 
                    StartDate = @startDate, 
                    EndDate = @endDate, 
                    Discount = @discount, 
                    IsActive = @isActive, 
                    UpdatedDate = GETDATE()
                    WHERE PromotionID = @promotionId`);
    return result.recordset;
  }

  static async deletePromotion(promotionId) {
    const request = new sql.Request();
    request.input('promotionId', sql.Int, promotionId);
    const result = await request.query(
      'DELETE FROM Promotion WHERE PromotionID = @promotionId',
    );
    return result.recordset;
  }
}

export default PromotionModel;
