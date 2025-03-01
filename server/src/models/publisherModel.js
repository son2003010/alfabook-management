import { sql } from '../config/db.js';

class PublisherModel {
  static async getPublishers() {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM Publisher');
    return result.recordset;
  }

  static async addPublisher(publisherName, address, phone) {
    const request = new sql.Request();
    request.input('publisherName', sql.NVarChar, publisherName);
    request.input('address', sql.NVarChar, address);
    request.input('phone', sql.VarChar, phone);
    const result = await request.query(
      'INSERT INTO Publisher (PublisherName, Address, Phone) OUTPUT INSERTED.PublisherID VALUES (@publisherName, @address, @phone)',
    );
    return result.recordset[0].PublisherID;
  }

  static async updatePublisher(publisherId, publisherName, address, phone) {
    const request = new sql.Request();
    request.input('publisherId', sql.Int, publisherId);
    request.input('publisherName', sql.NVarChar, publisherName);
    request.input('address', sql.NVarChar, address);
    request.input('phone', sql.VarChar, phone);

    const result = await request.query(
      'UPDATE Publisher SET PublisherName = @publisherName, Address = @address, Phone = @phone WHERE PublisherID = @publisherId',
    );
    return result.recordset;
  }

  static async deletePublisher(publisherId) {
    const request = new sql.Request();
    request.input('publisherId', sql.Int, publisherId);

    const result = await request.query(
      'DELETE FROM Publisher WHERE PublisherID = @publisherId',
    );
    return result.recordset;
  }
}

export default PublisherModel;
