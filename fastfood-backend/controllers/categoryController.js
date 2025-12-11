// fastfood-backend/controllers/categoryController.js
const db = require('../config/db');

// Hàm lấy tất cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const sql = 'SELECT id, name, slug FROM categories ORDER BY name ASC'; 
        const [categories] = await db.query(sql);

        res.status(200).json({
            message: 'Lấy danh sách danh mục thành công',
            data: categories
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
};



module.exports = {
    getAllCategories
};