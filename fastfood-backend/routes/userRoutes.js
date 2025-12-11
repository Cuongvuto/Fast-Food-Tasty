// fastfood-backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Import Controller
const {
    updateUserProfile,
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/userController');

// Import Middleware
// (Đã kiểm tra: thư mục tên 'middlewares' và biến tên 'isAdmin')
const { protect, isAdmin } = require('../middlewares/authMiddleware'); 

// --- 1. ROUTE CHO USER THƯỜNG ---
// Cập nhật hồ sơ cá nhân
router.put('/profile', protect, updateUserProfile);


// --- 2. ROUTE CHO ADMIN ---

// Lấy danh sách users (Hỗ trợ phân trang ?page=1&limit=10)
router.get('/', protect, isAdmin, getAllUsers);

// Cập nhật quyền (role)
router.put('/:id/role', protect, isAdmin, updateUserRole);

// Xóa user
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;