const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- LOG DEBUG (Đã sửa tên biến cho khớp với Render) ---
console.log("-----------------------------------------");
console.log("🕵️ KIỂM TRA KẾT NỐI CLOUDINARY (LOG MỚI):");
// Sửa tên biến ở đây để log đúng
console.log("- CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Đã nhận" : "❌ NULL");
console.log("- API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Đã nhận" : "❌ NULL");
console.log("- API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Đã nhận" : "❌ NULL");
console.log("-----------------------------------------");
// ------------------------------------------------------

cloudinary.config({
  // 👇 QUAN TRỌNG: Sửa lại tên biến môi trường ở 3 dòng này
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,       
  api_secret: process.env.CLOUDINARY_API_SECRET  
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png', 'jpeg'],
  params: {
    folder: 'fast_food_tasty',
  }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;