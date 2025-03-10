import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [phone] = useState("");
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("Thanh toán tiền mặt");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    notes: "",
  });

  useEffect(() => {
    const newTotal = selectedItems.reduce((sum, cartId) => {
      const item = cartItems.find((i) => i.CartID === cartId);
      return item
        ? sum + item.Price * (1 - item.Discount / 100) * item.Quantity
        : sum;
    }, 0);
    setTotalAmount(newTotal);
  }, [selectedItems, cartItems]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((response) => response.json())
      .then((data) => setProvinces(data))
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    const selectedProvince = provinces.find(
      (province) => province.name === provinceName
    );
    setShippingInfo((prev) => ({
      ...prev,
      province: provinceName,
      district: "",
      ward: "",
    }));

    if (selectedProvince) {
      fetch(
        `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`
      )
        .then((response) => response.json())
        .then((data) => setDistricts(data.districts))
        .catch((error) => console.error("Error fetching districts:", error));
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    const selectedDistrict = districts.find(
      (district) => district.name === districtName
    );
    setShippingInfo((prev) => ({ ...prev, district: districtName, ward: "" }));

    if (selectedDistrict) {
      fetch(
        `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
      )
        .then((response) => response.json())
        .then((data) => setWards(data.wards))
        .catch((error) => console.error("Error fetching wards:", error));
    } else {
      setWards([]);
    }
  };
  const validatePhone = (phone) => {
    const phoneRegex = /^(0|\+84)\d{9}$/; // Kiểm tra số điện thoại VN
    return phoneRegex.test(phone);
  };
  const validateFullName = (name) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ]{3,}(?:\s[a-zA-ZÀ-ỹ]+)*$/;
    return nameRegex.test(name);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }
    if (!validatePhone(shippingInfo.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (phải có 10-11 số).";
    }
    if (!validateFullName(shippingInfo.fullName)) {
      newErrors.fullName = "Tên phải có ít nhất 3 ký tự và không chứa số.";
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống.";
    }
    if (!shippingInfo.province) {
      newErrors.province = "Vui lòng chọn tỉnh/thành phố.";
    }
    if (!shippingInfo.district) {
      newErrors.district = "Vui lòng chọn quận/huyện.";
    }
    if (!shippingInfo.ward) {
      newErrors.ward = "Vui lòng chọn phường/xã.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const orderDetails = cartItems
      .filter((item) => selectedItems.includes(item.CartID))
      .map((item) => ({
        bookId: item.BookID,
        quantity: item.Quantity,
        price: item.Price * (1 - item.Discount / 100),
      }));

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: shippingInfo.fullName,
          receiverPhone: shippingInfo.phone,
          province: shippingInfo.province,
          district: shippingInfo.district,
          ward: shippingInfo.ward,
          streetAddress: shippingInfo.address,
          totalPrice: totalAmount,
          paymentMethod: paymentMethod,
          userId: user?.userId,
          orderDetails,
          note: shippingInfo.notes,
        }),
      });

      if (response.status === 429) {
        throw new Error("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
      }

      if (!response.ok) {
        throw new Error("Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
      }

      selectedItems.forEach((cartId) => removeFromCart(cartId));
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error.message);
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    }
  };

  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      return null;
    }
  };
  const handleSelectAll = (e) => {
    setSelectedItems(
      e.target.checked ? cartItems.map((item) => item.CartID) : []
    );
  };
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Thông Tin Giao Hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 ${
                      errors.fullName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    pattern="[0-9]{10}"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={shippingInfo.province}
                    onChange={handleProvinceChange}
                    className={`w-full p-2 border rounded-md focus:ring-2 ${
                      errors.province
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  >
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province}
                      </p>
                    )}
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quận/Huyện
                  </label>
                  <select
                    value={shippingInfo.district}
                    onChange={handleDistrictChange}
                    className={`w-full p-2 border rounded-md focus:ring-2 ${
                      errors.district
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                    disabled={!districts.length}
                  >
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.district}
                      </p>
                    )}
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phường/Xã
                  </label>
                  <select
                    value={shippingInfo.ward}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        ward: e.target.value,
                      }))
                    }
                    className={`w-full p-2 border rounded-md focus:ring-2 ${
                      errors.ward
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                    disabled={!wards.length}
                  >
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}

                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ cụ thể
                </label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-md focus:ring-2 ${
                    errors.address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  required
                  placeholder="Số nhà, tên đường..."
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={shippingInfo.notes}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                />
              </div>
            </form>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Xem lại ({cartItems.length} sản phẩm)
            </h2>
            <label className="flex items-center text-gray-600 hover:text-gray-800">
              <input
                type="checkbox"
                className="w-4 h-4 mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                checked={
                  selectedItems.length === cartItems.length &&
                  cartItems.length > 0
                }
                onChange={handleSelectAll}
              />
              Chọn tất cả
            </label>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.CartID}
                  className="flex items-center py-4 border-b"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.CartID)}
                    onChange={() => {
                      setSelectedItems((prev) =>
                        prev.includes(item.CartID)
                          ? prev.filter((id) => id !== item.CartID)
                          : [...prev, item.CartID]
                      );
                    }}
                    className="w-4 h-4 mt-2 mr-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <img
                    src={getBookImage(item.Image)}
                    alt={item.Title}
                    className="w-20 h-28 object-cover rounded-md"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-medium">{item.Title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.CartID,
                              Math.max(1, item.Quantity - 1)
                            )
                          }
                          className="p-1 border rounded-md hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.Quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.CartID, item.Quantity + 1)
                          }
                          className="p-1 border rounded-md hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium text-red-600">
                        {(
                          item.Price *
                          (1 - item.Discount / 100) *
                          item.Quantity
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-red-600">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-4">Phương thức thanh toán</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="Thanh toán tiền mặt"
                    checked={paymentMethod === "Thanh toán tiền mặt"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3">Thanh toán khi nhận hàng</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="Thanh toán "
                    checked={paymentMethod === "Thanh toán tiền mặt"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3">Thanh toán Online</span>
                </label>
                {/* <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3">Thanh toán online</span>
                </label> */}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
              className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg font-medium
                hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
      {/* Modal Xác Nhận Đặt Hàng Thành Công */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold">Đặt hàng thành công!</h2>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => navigate(`/profile`)}
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
