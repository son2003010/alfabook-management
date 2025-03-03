import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

import logo from "../assets/logo.png";
import LoginPage from "../views/LoginPage";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const {
    cartCount,
    cartItems,
    fetchCartCount,
    fetchCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const userId = user?.userId; // Nếu user tồn tại, lấy userId
  const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // Lưu kết quả tìm kiếm
  const [showResults, setShowResults] = useState(false); // Hiển thị dropdown kết quả
  useEffect(() => {
    if (userId && cartCount === 0) {
      fetchCartCount();
      fetchCartItems();
    }
  }, [userId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchBooks = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/search-book?query=${searchTerm}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Lỗi tìm kiếm sách:", err);
        setSearchResults([]);
      }
    };

    const delayDebounce = setTimeout(fetchBooks, 300); // Giảm số lần gọi API
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
  const handleLogout = () => {
    clearCart();
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/profile");
  };
  const handleAccountClick = () => {
    if (isLoggedIn) {
      setShowDropdown(!showDropdown);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const toggleCartModal = async () => {
    setIsCartModalOpen(!isCartModalOpen);
  };

  const handleIncreaseQuantity = async (cartId, quantity) => {
    await updateQuantity(cartId, quantity + 1);
  };

  const handleDecreaseQuantity = async (cartId, quantity) => {
    if (quantity > 1) {
      await updateQuantity(cartId, quantity - 1);
    } else {
      await removeFromCart(cartId);
    }
  };
  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.error("Error loading image:", err);
      return null;
    }
  };
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.Price * (1 - item.Discount / 100) * item.Quantity,
    0
  );
  return (
    <div className="w-full bg-gray-100">
      <header className="w-full bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-2 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <a href="/">
              <img src={logo} alt="Logo" className="h-16 md:h-20 w-auto" />
            </a>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center space-x-4 lg:space-x-6 ml-4">
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
              {/* Category Dropdown Menu */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute left-0 top-full z-50 w-[calc(100vw-2rem)] md:w-[300px] bg-white shadow-lg rounded-lg mt-1 transition-all duration-200">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full bg-gray-50">
                    <div className="p-4 space-y-1">
                      {categories.map((category) => (
                        <div
                          key={category.CategoryID}
                          className="py-2 px-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-md transition-colors duration-150 cursor-pointer"
                          onClick={() =>
                            handleCategoryClick(category.CategoryID)
                          }
                        >
                          {category.CategoryName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="w-full px-4 py-2 text-sm border-2 border-red-500 rounded-full focus:outline-none focus:border-red-600 transition-colors duration-200"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full transition-colors duration-200">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
              {/* Dropdown hiển thị kết quả */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute left-0 w-full bg-white border border-gray-300 shadow-lg rounded-md mt-1 z-50 max-h-60 overflow-auto">
                  {searchResults.map((book) => (
                    <div
                      key={book.BookID}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/book/${book.BookID}`)}
                    >
                      <img
                        src={getBookImage(book.Image)}
                        alt={book.Title}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium">{book.Title}</p>
                        <p className="text-xs text-gray-500">
                          {book.Price.toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              {/* Notification */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors duration-200">
                  <svg
                    className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                </div>
                <span className="text-xs text-gray-700 group-hover:text-red-500 transition-colors duration-200">
                  Thông báo
                </span>
              </div>

              {/* Cart */}
              <div className="flex flex-col items-center group cursor-pointer relative">
                <div
                  className="p-2 rounded-full group-hover:bg-gray-100 transition-colors duration-200 relative"
                  onClick={toggleCartModal}
                >
                  <svg
                    className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                  </svg>
                  {userId && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-700 group-hover:text-red-500 transition-colors duration-200">
                  Giỏ hàng
                </span>

                {/* Dropdown Cart Modal */}
                {isCartModalOpen && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h2 className="text-lg font-semibold">
                        Giỏ hàng của bạn
                      </h2>
                      <button
                        onClick={toggleCartModal}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Cart Content */}
                    {cartItems.length === 0 ? (
                      <div className="p-6 text-center">
                        <svg
                          className="w-12 h-12 mx-auto text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <p className="text-gray-600 text-sm">
                          Giỏ hàng của bạn đang trống
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Items List */}
                        <div className="max-h-96 overflow-y-auto">
                          {cartItems.map((item) => (
                            <div
                              key={item.Id}
                              className="flex items-start p-4 border-b border-gray-100 hover:bg-gray-50"
                            >
                              <img
                                src={getBookImage(item.Image)}
                                alt={item.Title}
                                className="w-16 h-20 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 ml-3">
                                <p className="text-sm font-medium text-gray-800">
                                  {item.Title}
                                </p>
                                <p className="text-red-500 font-bold">
                                  {(
                                    item.Price *
                                    (1 - item.Discount / 100)
                                  ).toLocaleString()}
                                  ₫
                                </p>
                              </div>
                              <div className="flex items-center">
                                {/* Quantity Controls */}
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      handleDecreaseQuantity(
                                        item.CartID,
                                        item.Quantity
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors duration-150"
                                  >
                                    <span className="text-lg font-medium">
                                      −
                                    </span>
                                  </button>

                                  <span className="w-8 text-center text-gray-800 font-medium mx-1">
                                    {item.Quantity}
                                  </span>

                                  <button
                                    onClick={() =>
                                      handleIncreaseQuantity(
                                        item.CartID,
                                        item.Quantity
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors duration-150"
                                  >
                                    <span className="text-lg font-medium">
                                      +
                                    </span>
                                  </button>

                                  {/* Delete Button - Closer to quantity controls */}
                                  <button
                                    onClick={() => removeFromCart(item.CartID)}
                                    className="w-7 h-7 flex items-center justify-center ml-2 text-gray-400 hover:text-red-600 transition-colors duration-150"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            className="w-full mt-3 bg-red-600 text-white py-2 rounded"
                            onClick={clearCart}
                          >
                            Xóa toàn bộ
                          </button>
                        </div>

                        {/* Cart Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="text-lg font-bold text-red-600">
                              {totalPrice.toLocaleString()}₫
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={toggleCartModal}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Đóng
                            </button>
                            <button
                              className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              onClick={() => {
                                toggleCartModal();
                                navigate("/checkout");
                              }}
                            >
                              Thanh toán
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Account */}
              <div className="relative group account-dropdown">
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleAccountClick}
                >
                  <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <svg
                      className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                  <span
                    className="text-xs text-gray-700 group-hover:text-red-500 transition-colors duration-200"
                    title={isLoggedIn ? user?.email : "Tài Khoản"}
                  >
                    {isLoggedIn ? user?.email.split("@")[0] : "Tài Khoản"}
                  </span>
                </div>

                {isLoggedIn && showDropdown && (
                  <div className="absolute right-0 top-full bg-white shadow-md rounded-lg mt-2 w-48 z-50">
                    <div
                      className="py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={handleProfileClick}
                    >
                      Xem Đơn Hàng
                    </div>
                    <div
                      className="py-2 px-4 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <LoginPage isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default Header;
