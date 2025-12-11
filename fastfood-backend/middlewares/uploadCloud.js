const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

console.log("-----------------------------------------");
console.log("🕵️ KIỂM TRA KẾT NỐI CLOUDINARY (TRÊN SERVER):");
console.log("- CLOUDINARY_NAME:", process.env.CLOUDINARY_NAME ? "✅ Đã nhận" : "❌ KHÔNG TÌM THẤY (NULL)");
console.log("- CLOUDINARY_KEY:", process.env.CLOUDINARY_KEY ? "✅ Đã nhận" : "❌ KHÔNG TÌM THẤY (NULL)");
console.log("- CLOUDINARY_SECRET:", process.env.CLOUDINARY_SECRET ? "✅ Đã nhận" : "❌ KHÔNG TÌM THẤY (NULL)");
console.log("-----------------------------------------");

// Cấu hình Cloudinary (lấy từ .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'node_products_app' // Tên folder trên Cloudinary
  }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;