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
          pr.Discount,
          pr.StartDate as PromotionStartDate,
          pr.EndDate as PromotionEndDate
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
        SELECT b.*, c.CategoryName, p.Discount, p.StartDate, p.EndDate
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
        BookID,
        Title,
        Price,
        Image,
        CASE 
          WHEN PromotionID IS NOT NULL THEN
            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID)
          ELSE 0
        END as Discount
      FROM Book
      WHERE CategoryID = @categoryId
      AND IsActive = 1
    `;

    // Thêm sắp xếp
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY Price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY Price DESC';
        break;
      case 'newest':
        query += ' ORDER BY CreatedDate DESC';
        break;
      default:
        query += ' ORDER BY CreatedDate DESC';
    }

    // Thêm phân trang
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

    request.input('categoryId', sql.Int, categoryId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    // Lấy tổng số sách
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
        BookID,
        Title,
        Price,
        Image,
        CASE 
          WHEN PromotionID IS NOT NULL THEN 
            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID)
          ELSE 0
        END AS Discount,
        (Price * (1 - 
          CASE 
            WHEN PromotionID IS NOT NULL THEN 
              (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID) / 100.0
            ELSE 0 
          END
        )) AS FinalPrice
      FROM Book
      WHERE CategoryID = @categoryId
      AND IsActive = 1
    `;

    // ✅ **Thêm điều kiện lọc giá theo FinalPrice**
    if (minPrice !== null) {
      query += ` AND (Price * (1 - 
                        CASE 
                          WHEN PromotionID IS NOT NULL THEN 
                            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID) / 100.0
                          ELSE 0 
                        END
                      )) >= @minPrice`;
      request.input('minPrice', sql.Decimal(10, 2), minPrice);
    }

    if (maxPrice !== null) {
      query += ` AND (Price * (1 - 
                        CASE 
                          WHEN PromotionID IS NOT NULL THEN 
                            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID) / 100.0
                          ELSE 0 
                        END
                      )) <= @maxPrice`;
      request.input('maxPrice', sql.Decimal(10, 2), maxPrice);
    }

    // ✅ **Thêm sắp xếp**
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY FinalPrice ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY FinalPrice DESC';
        break;
      case 'newest':
        query += ' ORDER BY CreatedDate DESC';
        break;
      default:
        query += ' ORDER BY CreatedDate DESC';
    }

    // ✅ **Thêm phân trang (ĐẢM BẢO LUÔN CÓ ORDER BY TRƯỚC OFFSET)**
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

    request.input('categoryId', sql.Int, categoryId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    // ✅ **Lấy tổng số sách thỏa mãn điều kiện lọc**
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Book 
      WHERE CategoryID = @categoryId
      AND IsActive = 1
    `;

    if (minPrice !== null) countQuery += ` AND (Price * (1 - 
                        CASE 
                          WHEN PromotionID IS NOT NULL THEN 
                            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID) / 100.0
                          ELSE 0 
                        END
                      )) >= @minPrice`;

    if (maxPrice !== null) countQuery += ` AND (Price * (1 - 
                        CASE 
                          WHEN PromotionID IS NOT NULL THEN 
                            (SELECT TOP 1 Discount FROM Promotion WHERE PromotionID = Book.PromotionID) / 100.0
                          ELSE 0 
                        END
                      )) <= @maxPrice`;

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

  static async addBook({ bookId, title, price, categoryId, publisherId, quantity, description, image, isActive = true, promotionId, authorIds}) {
    try {
      const request = new sql.Request();
      
      request.input('BookID', sql.Int, bookId);  
      request.input('Title', sql.NVarChar, title);
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
  
      // Kiểm tra nếu BookID đã tồn tại
      const checkExisting = await request.query(`SELECT COUNT(*) AS count FROM Book WHERE BookID = @BookID`);
      if (checkExisting.recordset[0].count > 0) {
        return { success: false, message: "BookID đã tồn tại" };
      }
  
      // Thêm sách vào bảng Book
      await request.query(`
        INSERT INTO Book (BookID, Title, CategoryID, PublisherID, Price, Quantity, Description, Image, IsActive, CreatedDate, UpdatedDate, PromotionID)
        VALUES (@BookID, @Title, @CategoryID, @PublisherID, @Price, @Quantity, @Description, @Image, @IsActive, @CreatedDate, @UpdatedDate, @PromotionID);
      `);
  
      // Thêm dữ liệu vào bảng BookAuthor
      if (authorIds && authorIds.length > 0) {
        for (const authorId of authorIds) {
          await request.query(`
            INSERT INTO BookAuthor (BookID, AuthorID) VALUES (@BookID, ${authorId});
          `);
        }
      }
  
      return { success: true, bookId: bookId };
    } catch (error) {
      throw new Error(`Lỗi khi thêm sách: ${error.message}`);
    }
  }
  
  
  
  
  
  
}

export default BookModel;