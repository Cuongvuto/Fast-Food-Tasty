// fastfood-backend/routes/comboRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllCombos,
    getAllCombosAdmin,
    getComboById,
    createCombo,
    updateCombo,
    deleteCombo
} = require('../controllers/comboController');

// IMPORT MIDDLEWARE UPLOAD ẢNH (Giống bên productRoutes)
const upload = require('../middlewares/uploadCloud'); // Sửa lại đường dẫn này nếu của bạn khác nhé

// const { protect, admin } = require('../middleware/authMiddleware'); // Sẽ dùng sau

// === ADMIN ROUTES ===
router.route('/admin')
    .get(getAllCombosAdmin); 

// === PUBLIC & ADMIN ROUTES ===
router.route('/')
    .get(getAllCombos)
    // Thêm upload.single('image') vào đây để bắt file ảnh
    .post(upload.single('image'), createCombo); 

router.route('/:id')
    .get(getComboById)
    // Thêm upload.single('image') vào đây để bắt file ảnh
    .put(upload.single('image'), updateCombo) 
    .delete(deleteCombo); 

module.exports = router;