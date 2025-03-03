import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

function CategoryPage() {
  const { categoryId } = useParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  const navigate = useNavigate();

  const booksPerPage = 20; // Số sách mỗi trang
  const priceRanges = [
    { id: 1, label: "0đ - 80,000đ", min: 0, max: 80000 },
    { id: 2, label: "80,000đ - 200,000đ", min: 80000, max: 200000 },
    { id: 3, label: "200,000đ - 500,000đ", min: 200000, max: 500000 },
  ];

  useEffect(() => {
    fetchData(currentPage);
  }, [categoryId, currentPage]);
  useEffect(() => {
    setCurrentPage(1); // Reset về trang đầu tiên
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesRes = await fetch("/api/category");
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
      const selectedCategory = categoriesData.find(
        (cat) => cat.CategoryID === parseInt(categoryId)
      );
      setCurrentCategory(selectedCategory);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceFilter = (range) => {
    setSelectedPriceRange(range.id);
    setMinPrice(range.min);
    setMaxPrice(range.max);
    setCurrentPage(1); // Reset về trang đầu tiên khi chọn bộ lọc mới
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `/api/get-book-by-category-by-sub/${categoryId}?sortBy=${sortBy}&page=${currentPage}&limit=${booksPerPage}`;

        // 🔥 Giữ bộ lọc giá khi chuyển trang
        if (minPrice !== null && maxPrice !== null) {
          url += `&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        }

        console.log("Fetching URL:", url); // Debug API request
        const response = await fetch(url);
        const data = await response.json();

        setBooks(data.books);
        setTotalPages(Math.ceil(data.pagination.total / booksPerPage));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [categoryId, minPrice, maxPrice, sortBy, currentPage]); // Giữ nguyên bộ lọc khi chuyển trang

  useEffect(() => {
    setCurrentPage(1); // Reset về trang đầu tiên khi đổi danh mục
    setSelectedPriceRange(null);
    setMinPrice(null);
    setMaxPrice(null);
  }, [categoryId]); // Khi đổi danh mục, reset bộ lọc giá

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center space-x-2 text-sm mb-6">
        <Link to="/" className="text-gray-600">
          TRANG CHỦ
        </Link>
        <span className="text-gray-400">&gt;</span>
        {currentCategory ? (
          <span className="text-orange-500">
            {currentCategory.CategoryName}
          </span>
        ) : (
          <span className="text-gray-500">Đang tải...</span>
        )}
      </div>
      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-gray-800 mb-4">NHÓM SẢN PHẨM</h2>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-800">
                Tất Cả Nhóm Sản Phẩm
              </div>
              {categories.map((cat) => (
                <Link
                  key={cat.CategoryID}
                  to={`/category/${cat.CategoryID}`}
                  className={`block hover:text-orange-500 cursor-pointer 
                    ${
                      cat.CategoryID === parseInt(categoryId)
                        ? "text-orange-500"
                        : "text-gray-600"
                    }`}
                >
                  {cat.CategoryName}
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="font-bold text-gray-800 mb-4">GIÁ</h2>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label
                    key={range.id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={selectedPriceRange === range.id}
                      onChange={() => handlePriceFilter(range)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* <div className="mt-8">
              <h2 className="font-bold text-gray-800 mb-4">GENRES</h2>
              <div className="space-y-2">
                {genres.map((genre) => (
                  <label key={genre.id} className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    <span className="text-gray-600">{genre.label}</span>
                  </label>
                ))}
              </div>
            </div> */}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sắp xếp theo :</span>
              <div className="relative">
                <select
                  className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="price-asc">Giá Thấp đến Cao</option>
                  <option value="price-desc">Giá Cao đến Thấp</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => {
              const discountedPrice = book.Price * (1 - book.Discount / 100);
              return (
                <div
                  key={book.BookId}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                  onClick={() => handleBookClick(book.BookID)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
                    <img
                      src={getBookImage(book.Image)}
                      alt={book.Title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 hover:text-red-600 cursor-pointer">
                      {book.Title}
                    </h3>
                    <div className="mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-medium">
                          {formatPrice(discountedPrice)} đ
                        </span>
                        {book.Discount > 0 && (
                          <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
                            -{Math.round(book.Discount)}%
                          </span>
                        )}
                      </div>
                      {book.Discount > 0 && (
                        <span className="text-gray-500 text-sm line-through">
                          {formatPrice(book.Price)} đ
                        </span>
                      )}
                    </div>
                    {book.OriginalPrice && book.OriginalPrice > book.Price && (
                      <div className="text-xs text-gray-400 line-through">
                        {book.OriginalPrice?.toLocaleString("vi-VN")}đ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className={`px-4 py-2 bg-gray-200 rounded-lg ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                className={`px-4 py-2 bg-gray-200 rounded-lg ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
