// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget'; 

// --- Public Pages ---
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import CategoryMenuPage from './pages/CategoryMenuPage';
import AboutPage from './pages/AboutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import PaymentResultPage from './pages/PaymentResultPage';
import ProfilePage from './pages/ProfilePage';

// --- Admin Pages ---
import AdminHomePage from './pages/AdminHomePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminEditProductPage from './pages/AdminEditProductPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCombosPage from './pages/AdminCombosPage';
import AdminAddComboPage from './pages/AdminAddComboPage';
import AdminEditComboPage from './pages/AdminEditComboPage';

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // --- Tự động cuộn lên đầu trang khi đổi route ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header công khai (ẩn ở trang admin) */}
      {!isAdminPath && <Header />}

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* === Public Routes === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:categorySlug" element={<CategoryMenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* === Admin Routes === */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/products" element={<AdminDashboard />} />
            <Route path="/admin/products/add" element={<AdminAddProductPage />} />
            <Route path="/admin/products/edit/:productId" element={<AdminEditProductPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/combos" element={<AdminCombosPage />} />
            <Route path="/admin/combos/add" element={<AdminAddComboPage />} />
            <Route path="/admin/combos/edit/:comboId" element={<AdminEditComboPage />} />
          </Route>
        </Routes>
      </Box>

      {/* ---  CHATBOT  --- */}
      
      {!isAdminPath && <ChatWidget />}

      
      {!isAdminPath && <Footer />}
    </Box>
  );
}

export default App;