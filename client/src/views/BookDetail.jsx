import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
function BookDetail() {
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { bookId } = useParams();
  const { user } = useAuth(); // Lấy user từ context
  const userId = user?.userId; // Nếu user tồn tại, lấy userId

  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isAdded, setIsAdded] = useState(false); // Trạng thái thêm vào giỏ hàng

  useEffect(() => {
    const fetchBookDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/get-book/${bookId}`);
        if (!response.ok) {
          throw new Error("Lỗi khi tải thông tin sách");
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) fetchBookDetail();
  }, [bookId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.error("Error loading image:", err);
      return null;
    }
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (userId) {
        addToCart(bookId, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 500); // Ẩn thông báo sau 2s
      } else {
        alert("Bạn cần đăng nhập trước khi thêm vào giỏ hàng!");
        return;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  const handleBuy = async () => {
    try {
      if (userId) {
        addToCart(bookId, quantity);
        navigate("/checkout");
      } else {
        alert("Bạn cần đăng nhập trước khi thêm vào giỏ hàng!");
        return;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const discountedPrice = book.Price * (1 - book.Discount / 100);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <span>Trang chủ</span>
        <span className="mx-2">/</span>
        <span>{book.CategoryName}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{book.Title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-white border rounded-lg p-4">
            <img
              src={getBookImage(book.Image)}
              alt={book.Title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-20 h-20 flex-shrink-0 border rounded-md p-1"
              >
                <img
                  src={getBookImage(book.Image)}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <h1 className="text-2xl font-medium">{book.Title}</h1>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Nhà cung cấp:</span>
              <a href="/" className="text-blue-600">
                AlfaBook
              </a>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tác giả: {book.AuthorName}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div> */}
              {/* <span className="text-gray-500">(22 đánh giá)</span>
              <span className="text-gray-500">Đã bán 66</span> */}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-red-600 text-3xl font-medium">
                {formatPrice(discountedPrice)} đ
              </span>
              <span className="text-gray-500 line-through">
                {formatPrice(book.Price)} đ
              </span>
              {book.Discount > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 text-sm rounded">
                  -{Math.round(book.Discount)}%
                </span>
              )}
            </div>
            <div className="text-blue-600">
              {book.Quantity > 0 ? `Còn hàng` : "Hết hàng"}
            </div>
          </div>

          <div className="space-y-4">
            {/* <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Thông tin vận chuyển</h3>
              <div className="flex items-center justify-between">
                <div>Giao hàng đến Phường Bến Nghé, Quận 1, Hồ Chí Minh</div>
                <button className="text-blue-600">Thay đổi</button>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">Giao hàng tiêu chuẩn</span>
                  <span>Dự kiến giao Thứ sáu - 24/01</span>
                </div>
              </div>
            </div> */}

            {/* <div>
              <h3 className="font-medium mb-2">Ưu đãi liên quan</h3>
              <div className="flex gap-2 overflow-x-auto">
                {["Free Ship"].map((text, i) => (
                  <div key={i} className="flex-shrink-0 border rounded p-2 text-sm">
                    {text}
                  </div>
                ))}
              </div>
            </div> */}

            <div className="flex items-center gap-4">
              <span>Số lượng:</span>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="p-2"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-12 text-center border-x"
                />
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="p-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <>
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                >
                  Mua ngay
                </button>
              </div>

              {/* Success Modal */}
              {isAdded && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="fixed inset-0 bg-black opacity-30"></div>
                  <div className="relative bg-white rounded-lg shadow-lg px-8 py-6 flex items-center gap-3 animate-fade-in">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-800 font-medium">
                      Đã thêm vào giỏ hàng
                    </span>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab("description")}
              className={`py-4 relative ${
                selectedTab === "description"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600"
              }`}
            >
              Mô tả sách
            </button>
            <button
              onClick={() => setSelectedTab("details")}
              className={`py-4 relative ${
                selectedTab === "details"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600"
              }`}
            >
              Thông tin chi tiết
            </button>
          </div>
        </div>

        <div className="py-6">
          {selectedTab === "description" ? (
            <div className="prose max-w-none">
              <p>{book.Description}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Thông tin chung</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600">Tác giả:</td>
                      <td>{book.AuthorName}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Nhà xuất bản:</td>
                      <td>{book.PublisherName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Thông số kỹ thuật</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600">Định dạng:</td>
                      <td>Bìa mềm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
