import BookModel from '../models/bookModel.js';

export const getBookByID = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId || isNaN(bookId)) {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ',
      });
    }

    const book = await BookModel.getBookById(bookId);

    if (!book || book.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.status(200).json(book[0]);
  } catch (err) {
    next(err);
  }
};

export const getBooksByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, pageSize = 20 } = req.query; // Lấy page và pageSize từ query

    if (!categoryId) {
      return res.status(400).json({
        message: 'Category ID là bắt buộc',
      });
    }

    const books = await BookModel.getBooksByCategory(
      categoryId,
      parseInt(page),
      parseInt(pageSize),
    );
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};
export const getBooksByCategoryBySub = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    let {
      sortBy = 'price-asc',
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
    } = req.query;

    // ✅ Kiểm tra page và limit hợp lệ
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    let result;

    if (minPrice !== undefined && maxPrice !== undefined) {
      result = await BookModel.getBooksByCategoryBySubWithPriceFilter(
        categoryId,
        sortBy,
        page,
        limit,
        parseFloat(minPrice),
        parseFloat(maxPrice),
      );
    } else {
      result = await BookModel.getBooksByCategoryBySub(
        categoryId,
        sortBy,
        page,
        limit,
      );
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const searchBook = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const books = await BookModel.searchBooks(query);
    res.json(books);
  } catch (error) {
    next(err);
  }
};

export const addBook = async (req, res) => {
  try {
    const newBook = req.body;
    console.log(newBook);
    const createdBook = await BookModel.addBook(newBook);

    res.status(201).json({
      message: 'Book added successfully',
      book: createdBook,
    });
  } catch (err) {
    next(err);
  }
};
