// fastfood-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Lấy thông tin user từ token và gắn vào request
            const [users] = await db.query('SELECT id, full_name, email,phone_number, address, role FROM users WHERE id = ?', [decoded.id]);

            // Kiểm tra xem user có còn tồn tại không
            if (!users[0]) {
                return res.status(401).json({ message: 'Không có quyền truy cập, người dùng không tồn tại' });
            }

            req.user = users[0]; // Gắn user vào request

            next(); // Chuyển sang bước tiếp theo
        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            // Thêm return để ngăn chạy code bên dưới
            return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    }

    if (!token) {
        // Thêm return để ngăn chạy code bên dưới (mặc dù trường hợp này ít xảy ra)
        return res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
    }
};

const isAdmin = (req, res, next) => {
    // Hàm này chạy *sau* hàm protect, nên req.user đã có
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập, yêu cầu quyền admin' });
    }
};

module.exports = { protect, isAdmin }; // Sửa tên export thành isAdmin