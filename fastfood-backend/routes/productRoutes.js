const express = require('express');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// 👇 1. IMPORT CẤU HÌNH CLOUDINARY
const uploadCloud = require('../middlewares/uploadCloud');

const router = express.Router();

// Route lấy danh sách (công khai) và tạo sản phẩm (admin)
router.route('/')
    .get(getAllProducts)
    // 👇 2. THÊM MIDDLEWARE UPLOAD VÀO ĐÂY
    // uploadCloud.single('image'): Chặn file có key là 'image', đẩy lên Cloud, rồi mới chạy createProduct
    .post(uploadCloud.single('image'), createProduct); 

// Route lấy, cập nhật, xóa sản phẩm theo ID
router.route('/:id')
    .get(getProductById)
    // 👇 3. THÊM MIDDLEWARE VÀO CẢ ROUTE SỬA (Để sau này sửa ảnh cũng dùng được)
    .put(uploadCloud.single('image'), updateProduct) 
    .delete(deleteProduct);

module.exports = router;