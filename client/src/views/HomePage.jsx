import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatBot from "../views/ChatBot"; // Import ChatBot component

// Import hình ảnh banner
import banner_slide_1 from "../assets/banner_slide_1.png";
import banner_slide_2 from "../assets/banner_slide_2.png";

import tieuthuyet from "../assets/tieuthuyet.png";
import manga from "../assets/manga.png";

function HomePage() {
  // State management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [booksByCategory, setBooksByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const slides = [banner_slide_1, banner_slide_2];
  const mockCategories = [
    {
      CategoryID: 1,
      CategoryName: "Tiểu Thuyết",
      image: tieuthuyet,
    },
    {
      CategoryID: 2,
      CategoryName: "Marketing",
      image: tieuthuyet,
    },
    {
      CategoryID: 3,
      CategoryName: "Tâm Lý",
      image: tieuthuyet,
    },
    {
      CategoryID: 4,
      CategoryName: "Manga - Comic",
      image: manga,
    },
    {
      CategoryID: 5,
      CategoryName: "Câu chuyện cuộc đời",
      image: tieuthuyet,
    },
  ];

  const booksPerPage = 20; // Số sách mỗi danh mục hiển thị

  // Fetch danh sách categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/category");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch sách cho mỗi category
  useEffect(() => {
    const fetchBooksByCategory = async () => {
      try {
        const bookPromises = categories.map((category) =>
          fetch(
            `/api/get-book-by-category/${category.CategoryID}?page=1&pageSize=${booksPerPage}`
          )
            .then((res) => res.json())
            .then((data) => ({
              categoryId: category.CategoryID,
              books: data.books || [], // Chỉ lấy danh sách sách
            }))
        );

        const results = await Promise.all(bookPromises);
        const booksMap = results.reduce((acc, { categoryId, books }) => {
          acc[categoryId] = books;
          return acc;
        }, {});

        setBooksByCategory(booksMap);
      } catch (err) {
        setError("Error fetching books.");
      }
    };

    if (categories.length > 0) {
      fetchBooksByCategory();
    }
  }, [categories]);

  // Auto slide cho banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Format giá tiền theo định dạng VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Xử lý lấy hình ảnh sách
  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };

  // Xử lý scroll cho danh sách sách
  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scrollAmount = 800; // Độ lớn mỗi lần scroll
    const scrollPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  };

  // Xử lý click vào category
  const handleCategoryClick = (categoryId) => {
    if (categoryId) {
      navigate(`/category/${categoryId}`);
      console.log("Navigating to category:", categoryId);
    }
  };

  // Xử lý click vào sách
  const handleBookClick = (bookId) => {
    if (bookId) {
      navigate(`/book/${bookId}`);
      console.log("Navigating to book:", bookId);
    } else {
      console.error("Invalid book ID");
    }
  };

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-8">
      {/* Banner Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Bọc banner trong khung trắng */}
          <div className="bg-white shadow-sm p-4 rounded-lg">
            <div className="relative rounded-lg overflow-hidden h-[400px]">
              <div
                className="flex h-full transition-transform duration-500 absolute w-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="min-w-full h-full flex-shrink-0">
                    <img
                      src={slide}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Banner Controls */}
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-70"
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + slides.length) % slides.length
                  )
                }
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-70"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % slides.length)
                }
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Banner Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? "bg-white" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 gap-4">
            {mockCategories.map((category) => (
              <div
                key={category.CategoryID}
                onClick={() => handleCategoryClick(category.CategoryID)}
                className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.CategoryName}
                  className="w-12 h-12 rounded-full mb-2 object-cover"
                />
                <span className="text-sm text-gray-700">
                  {category.CategoryName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Books by Category Sections */}
      {categories.map((category) => (
        <section key={category.CategoryID} className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Category Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {category.CategoryName}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      scrollContainer(
                        `scroll-container-${category.CategoryID}`,
                        "left"
                      )
                    }
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={() =>
                      scrollContainer(
                        `scroll-container-${category.CategoryID}`,
                        "right"
                      )
                    }
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Books List */}
              <div className="relative">
                <div
                  id={`scroll-container-${category.CategoryID}`}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                  {booksByCategory[category.CategoryID]?.map((book) => {
                    const discountedPrice =
                      book.Price * (1 - book.Discount / 100);

                    return (
                      <div
                        key={book.BookID}
                        className="flex-shrink-0 w-[200px] bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
                      >
                        {/* Book Image */}
                        <div
                          className="relative w-full h-[200px] overflow-hidden cursor-pointer"
                          onClick={() => handleBookClick(book.BookID)}
                        >
                          <img
                            src={getBookImage(book.Image)}
                            alt={book.Title}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Book Info */}
                        <div className="p-2">
                          <h3
                            onClick={() => handleBookClick(book.BookID)}
                            className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 hover:text-red-600 cursor-pointer"
                          >
                            {book.Title}
                          </h3>

                          {/* Price Info */}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* See More Button */}
              <div className="text-center mt-6">
                <button
                  onClick={() => handleCategoryClick(category.CategoryID)}
                  className="px-8 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                >
                  Xem Thêm
                </button>
              </div>
            </div>
          </div>
        </section>
      ))}
      <ChatBot />
    </main>
  );
}

export default HomePage;
