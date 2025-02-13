import BookModel from '../models/bookModel.js';

export const getBookByID = async (req, res) => {  
  try {
    const { bookId } = req.params;
    
    const book = await BookModel.getBookById(bookId);
    
    // Kiểm tra nếu không tìm thấy sách
    if (!book || book.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Vì ta tìm theo ID (unique), nên chỉ cần trả về phần tử đầu tiên
    res.status(200).json(book[0]);

  } catch (err) {
    console.error('Error in getBookByID:', err); // Log lỗi để debug
    res.status(500).json({ 
      message: 'Error retrieving book',
      error: err.message // Chỉ trả về message lỗi, không trả về toàn bộ object err
    });
  }
};


export const getBooksByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, pageSize = 20 } = req.query; // Lấy page và pageSize từ query

    if (!categoryId) {
      return res.status(400).json({ 
        message: 'Category ID is required' 
      });
    }

    const books = await BookModel.getBooksByCategory(categoryId, parseInt(page), parseInt(pageSize));
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error retrieving books by category', 
      error: err 
    });
  }
};
export const getBooksByCategoryBySub = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    let { sortBy = 'price-asc', page = 1, limit = 20, minPrice, maxPrice } = req.query;

    // ✅ Kiểm tra page và limit hợp lệ
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    let result;
    
    if (minPrice !== undefined && maxPrice !== undefined) {
      result = await BookModel.getBooksByCategoryBySubWithPriceFilter(
        categoryId, sortBy, page, limit, parseFloat(minPrice), parseFloat(maxPrice)
      );
    } else {
      result = await BookModel.getBooksByCategoryBySub(categoryId, sortBy, page, limit);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Error in getBooksByCategoryBySub:', err);
    res.status(500).json({ 
      message: 'Error retrieving books', 
      error: err.message 
    });
  }
};

export const searchBook = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
        return res.json([]); // Nếu không có query, trả về mảng rỗng
    }

    const books = await BookModel.searchBooks(query);
    res.json(books);
  } catch (error) {
      console.error("Lỗi trong searchBooks Controller:", error);
      res.status(500).json({ message: "Lỗi server khi tìm kiếm sách" });
  }
};

export const addBook = async (req, res) => {
  try {
    const newBook = req.body; // Lấy dữ liệu sách từ request body
    console.log(newBook)
    // Gọi phương thức addBook từ bookModel
    const createdBook = await BookModel.addBook(newBook);

    res.status(201).json({
      message: "Book added successfully",
      book: createdBook
    });
  } catch (err) {
    console.error("Error in addBook:", err);
    res.status(500).json({
      message: "Error adding book",
      error: err.message
    });
  }
};