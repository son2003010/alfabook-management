// models/bookModel.js
import { sql } from '../config/db.js';

class BookModel {
  static async getBookById(bookId) {
    const request = new sql.Request();
    request.input('bookId', sql.Int, bookId);

    const result = await request
      .query(
        `SELECT 
          b.*, 
          c.CategoryName, 
          p.PublisherName, 
          a.AuthorName, 
          pr.StartDate as PromotionStartDate,
          pr.EndDate as PromotionEndDate,
          CASE 
            WHEN pr.PromotionID IS NOT NULL AND GETDATE() BETWEEN pr.StartDate AND pr.EndDate 
            THEN pr.Discount 
            ELSE 0 
          END AS Discount
        FROM Book b
        LEFT JOIN Category c ON b.CategoryID = c.CategoryID
        LEFT JOIN Publisher p ON b.PublisherID = p.PublisherID
        LEFT JOIN BookAuthor ba ON b.BookID = ba.BookID
        LEFT JOIN Author a ON ba.AuthorID = a.AuthorID
        LEFT JOIN Promotion pr ON b.PromotionID = pr.PromotionID
        WHERE b.BookID = @bookId`
        
      );
    return result.recordset
  }
  static async getBooksByCategory(categoryId, page = 1, pageSize = 20) {
    try {
      const request = new sql.Request();
      const offset = (page - 1) * pageSize; // Tính offset chính xác

      console.log(`categoryId: ${categoryId}, page: ${page}, offset: ${offset}, pageSize: ${pageSize}`);

      request.input('categoryId', sql.Int, categoryId);
      request.input('offset', sql.Int, offset);
      request.input('pageSize', sql.Int, pageSize);
      const result = await request.query(`
        SELECT b.*, c.CategoryName,
        CASE 
            WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
            THEN p.Discount 
            ELSE 0 
        END AS Discount
        FROM Book b
        LEFT JOIN dbo.Category c ON b.CategoryID = c.CategoryID
        LEFT JOIN dbo.Promotion p ON b.PromotionID = p.PromotionID
        WHERE b.CategoryID = @categoryId
        ORDER BY b.BookID
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
      `);
  
      const totalBooksResult = await request.query(`
        SELECT COUNT(*) AS totalBooks
        FROM Book
        WHERE CategoryID = @categoryId
      `);

      return {
        books: result.recordset,
        total: totalBooksResult.recordset[0].totalBooks,
      };
    } catch (error) {
      throw new Error(`Error getting books by category: ${error.message}`);
    }
  }
  
  
  static async getBooksByCategoryBySub(categoryId, sortBy = 'newest', page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const request = new sql.Request();
    
    let query = `
      SELECT 
        b.BookID,
        b.Title,
        b.Price,
        b.Image,
        CASE 
          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
          THEN p.Discount
          ELSE 0
        END as Discount
      FROM Book b
      LEFT JOIN Promotion p ON b.PromotionID = p.PromotionID
      WHERE b.CategoryID = @categoryId
      AND b.IsActive = 1
    `;

    // Add sorting
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY b.Price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY b.Price DESC';
        break;
      case 'newest':
        query += ' ORDER BY b.CreatedDate DESC';
        break;
      default:
        query += ' ORDER BY b.CreatedDate DESC';
    }

    // Add pagination
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

    request.input('categoryId', sql.Int, categoryId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    // Get total count
    const countRequest = new sql.Request();
    countRequest.input('categoryId', sql.Int, categoryId);
    const countResult = await countRequest.query(
      'SELECT COUNT(*) as total FROM Book WHERE CategoryID = @categoryId AND IsActive = 1'
    );

    const total = countResult.recordset[0].total;

    return {
      books: result.recordset,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getBooksByCategoryBySubWithPriceFilter(categoryId, sortBy = 'newest', page = 1, limit = 20, minPrice, maxPrice) {
    const offset = (page - 1) * limit;
    const request = new sql.Request();
    
    let query = `
      SELECT 
        b.BookID,
        b.Title,
        b.Price,
        b.Image,
        CASE 
          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
          THEN p.Discount
          ELSE 0
        END AS Discount,
        (b.Price * (1 - 
          CASE 
            WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
            THEN p.Discount / 100.0
            ELSE 0 
          END
        )) AS FinalPrice
      FROM Book b
      LEFT JOIN Promotion p ON b.PromotionID = p.PromotionID
      WHERE b.CategoryID = @categoryId
      AND b.IsActive = 1
    `;

    // Add price filter conditions
    if (minPrice !== null) {
      query += ` AND (b.Price * (1 - 
                        CASE 
                          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
                          THEN p.Discount / 100.0
                          ELSE 0 
                        END
                      )) >= @minPrice`;
      request.input('minPrice', sql.Decimal(10, 2), minPrice);
    }

    if (maxPrice !== null) {
      query += ` AND (b.Price * (1 - 
                        CASE 
                          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
                          THEN p.Discount / 100.0
                          ELSE 0 
                        END
                      )) <= @maxPrice`;
      request.input('maxPrice', sql.Decimal(10, 2), maxPrice);
    }

    // Add sorting
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY FinalPrice ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY FinalPrice DESC';
        break;
      case 'newest':
        query += ' ORDER BY b.CreatedDate DESC';
        break;
      default:
        query += ' ORDER BY b.CreatedDate DESC';
    }

    // Add pagination
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

    request.input('categoryId', sql.Int, categoryId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    // Get total count with price filter
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Book b
      LEFT JOIN Promotion p ON b.PromotionID = p.PromotionID
      WHERE b.CategoryID = @categoryId
      AND b.IsActive = 1
    `;

    if (minPrice !== null) {
      countQuery += ` AND (b.Price * (1 - 
                        CASE 
                          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
                          THEN p.Discount / 100.0
                          ELSE 0 
                        END
                      )) >= @minPrice`;
    }

    if (maxPrice !== null) {
      countQuery += ` AND (b.Price * (1 - 
                        CASE 
                          WHEN p.PromotionID IS NOT NULL AND GETDATE() BETWEEN p.StartDate AND p.EndDate 
                          THEN p.Discount / 100.0
                          ELSE 0 
                        END
                      )) <= @maxPrice`;
    }

    const countRequest = new sql.Request();
    countRequest.input('categoryId', sql.Int, categoryId);
    if (minPrice !== null) countRequest.input('minPrice', sql.Decimal(10,2), minPrice);
    if (maxPrice !== null) countRequest.input('maxPrice', sql.Decimal(10,2), maxPrice);
    
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    return {
      books: result.recordset,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };  
}

  static async searchBooks(query) {
    const request = new sql.Request();
    request.input('query', sql.NVarChar, `%${query}%`)
    const result = await request
    .query(`
      SELECT BookID, Title, Image, Price
      FROM Book
      WHERE Title LIKE @query
      ORDER BY Title ASC
    `);
    return result.recordset
  }
  static async addBook({ title, price, categoryId, publisherId, quantity, description, image, isActive = true, promotionId, authorIds }) {
    try {
        const request = new sql.Request();

        request.input('Title', sql.NVarChar(255), title);
        request.input('Price', sql.Decimal(18, 2), price);
        request.input('CategoryID', sql.Int, categoryId);
        request.input('PublisherID', sql.Int, publisherId);
        request.input('Quantity', sql.Int, quantity);
        request.input('Description', sql.NVarChar, description);
        request.input('Image', sql.VarChar, image);
        request.input('IsActive', sql.Bit, isActive);
        request.input('PromotionID', sql.Int, promotionId);
        request.input('CreatedDate', sql.DateTime, new Date());
        request.input('UpdatedDate', sql.DateTime, new Date());

        // Thêm sách vào bảng Book và lấy ID vừa tạo
        const result = await request.query(`
            INSERT INTO Book (Title, CategoryID, PublisherID, Price, Quantity, Description, Image, IsActive, CreatedDate, UpdatedDate, PromotionID)
            OUTPUT INSERTED.BookID
            VALUES (@Title, @CategoryID, @PublisherID, @Price, @Quantity, @Description, @Image, @IsActive, @CreatedDate, @UpdatedDate, @PromotionID);
        `);

        const newBookId = result.recordset[0].BookID;

        // Nếu có danh sách tác giả thì thêm vào bảng BookAuthor
        if (authorIds && authorIds.length > 0) {
            for (const authorId of authorIds) {
                await request.query(`
                    INSERT INTO BookAuthor (BookID, AuthorID) VALUES (${newBookId}, ${authorId});
                `);
            }
        }

        return { success: true, bookId: newBookId };
    } catch (error) {
        throw new Error(`Lỗi khi thêm sách: ${error.message}`);
    }
  }
}

export default BookModel;