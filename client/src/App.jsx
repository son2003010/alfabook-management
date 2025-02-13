import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './views/HomePage';
import ProfilePage from './views/ProfilePage';
import AdminLoginPage from './views/AdminLoginPage';
import CategoryPage from './views/CategoryPage';
import BookDetail from './views/BookDetail';
import CheckoutPage from './views/CheckoutPage';
import AdminPage from './views/AdminPage';
import AdminDashboard from './views/AdminDashboard';
import AdminProducts from './views/AdminProducts';
import AdminOrder from './views/AdminOrder';
import AdminUser from './views/AdminUser';
import AdminPublisher from './views/AdminPublisher'
import AdminAuthor from './views/AdminAuthor'

import AdminPromotion from './views/AdminPromotion'

import './App.css'; 
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminPage />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrder />} />
              <Route path="users" element={<AdminUser />} />
              <Route path="publisher" element={<AdminPublisher />} />
              <Route path="author" element={<AdminAuthor />} />
              <Route path="promotion" element={<AdminPromotion />} />

            </Route>

            {/* Public routes */}
            <Route 
              path="/*" 
              element={
                <div className="flex-1">
                  <Header />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/book/:bookId" element={<BookDetail />} />
                    <Route path="/category/:categoryId" element={<CategoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />
                  </Routes>
                  <Footer />
                </div>
              } 
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;