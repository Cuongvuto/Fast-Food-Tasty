const express = require('express');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategoryId
} = require('../controllers/productController');

// 👇 1. IMPORT CẤU HÌNH CLOUDINARY
const uploadCloud = require('../middlewares/uploadCloud');

const router = express.Router();

// Route lấy danh sách (công khai) và tạo sản phẩm (admin)
router.route('/')
    .get(getAllProducts)
    .post(uploadCloud.single('image'), createProduct); 


router.get('/category/:categoryId', getProductsByCategoryId);
// Route lấy, cập nhật, xóa sản phẩm theo ID
router.route('/:id')
    .get(getProductById)
    .put(uploadCloud.single('image'), updateProduct) 
    .delete(deleteProduct);


module.exports = router;