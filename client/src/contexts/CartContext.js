import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Import AuthContext

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const userId = user?.userId; // Lấy userId nếu user đã đăng nhập
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItem] = useState([]);

  const fetchCartCount = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart/count/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    }
  };

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCartItem(data.items);

      }
    } catch (error) {
      console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    }
  };

  const addToCart = async (bookId, quantity) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, bookId, quantity }),
      });

      const data = await response.json();
      if (data.success) {
        // Cập nhật lại cả số lượng và danh sách sản phẩm
        await Promise.all([fetchCartCount(), fetchCartItems()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
      return false
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart/update/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      console.log("Received cartId:", cartId);  // Kiểm tra giá trị cartId nhận được từ URL

      const data = await response.json();
      if (data.success) {
        await Promise.all([fetchCartCount(), fetchCartItems()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      return false;
    }
  };

  const removeFromCart = async (cartId) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart/delete/${cartId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await Promise.all([fetchCartCount(), fetchCartItems()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi xóa khỏi giỏ hàng:", error);
      return false;
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart/clear/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setCartItem([]);
        setCartCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartCount();
      fetchCartItems();
    }
  }, [userId]);
  return (
    <CartContext.Provider value={{ cartCount, cartItems, fetchCartCount, fetchCartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
