import { sql } from '../config/db.js';

class AuthorModel {
    static async getAuthors() {
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM Author');
        return result.recordset;
    }
    static async isAuthorIdExists(authorId) {
        const request = new sql.Request();
        request.input('authorId', sql.Int, authorId);
        const result = await request.query('SELECT COUNT(*) AS count FROM Author WHERE AuthorID = @authorId');
        return result.recordset[0].count > 0;
    }
    
    static async addAuthor(authorId, authorName, description) {
        const request = new sql.Request();
        request.input('authorId', sql.Int, authorId)
        request.input('authorName', sql.NVarChar, authorName)
        request.input('description', sql.NVarChar, description)
        const result = await request
            .query('INSERT INTO Author (AuthorID, AuthorName, Description) OUTPUT INSERTED.AuthorID VALUES (@authorId, @authorName, @description)');
        return result.recordset[0].AuthorID
    }

    static async updateAuthor(authorId, authorName, description) {
        const request = new sql.Request();
        request.input('authorId', sql.Int, authorId)
        request.input('authorName', sql.NVarChar, authorName)
        request.input('description', sql.NVarChar, description)

        const result = await request
            .query('UPDATE Author SET AuthorName = @authorName, Description = @description WHERE AuthorID = @authorId');
        return result.recordset    
    }

    static async deleteAuthor(authorId) {
        const request = new sql.Request();
        request.input('authorId', sql.Int, authorId)

        const result = await request
            .query('DELETE FROM Author WHERE AuthorID = @authorId');
        return result.recordset
    }
}

export default AuthorModel;
