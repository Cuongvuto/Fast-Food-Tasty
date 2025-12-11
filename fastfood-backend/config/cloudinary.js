const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Cấu hình kết nối Cloudinary (Lấy key từ file .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cấu hình nơi lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fastfood-products', // Tên thư mục sẽ tạo trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép up ảnh
    // transformation: [{ width: 500, height: 500, crop: 'limit' }], // (Tùy chọn)
  },
});

// 3. Khởi tạo Multer với cấu hình storage trên
const uploadCloud = multer({ storage });

module.exports = uploadCloud;