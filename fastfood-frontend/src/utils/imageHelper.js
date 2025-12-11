// src/utils/imageHelper.js

// 👇 Link Backend Render của bạn (Không có dấu / ở cuối)
const API_URL = 'https://fast-food-tasty.onrender.com'; 

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // Nếu ảnh là link online (Cloudinary, Imgur...) thì giữ nguyên
    if (imagePath.startsWith('http') && !imagePath.includes('localhost')) {
        return imagePath;
    }

    // Nếu ảnh dính localhost (dữ liệu cũ), thay bằng link Render
    if (imagePath.includes('localhost:5001')) {
        return imagePath.replace('http://localhost:5001', API_URL);
    }

    // Nếu ảnh là đường dẫn tương đối (/images/burger.jpg)
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
};