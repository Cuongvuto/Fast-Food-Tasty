// fastfood-backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- HÀM ĐĂNG KÝ (ĐÃ SỬA) ---
const registerUser = async (req, res) => {
    // 1. SỬA LẠI ĐỂ NHẬN SĐT
    
    const { fullName, email, password, phoneNumber } = req.body; 

    // 2. SỬA LẠI KIỂM TRA
    if (!fullName || !email || !password || !phoneNumber) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: họ tên, email, mật khẩu và SĐT.' });
    }

    try {
        // Kiểm tra email tồn tại
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email đã được đăng ký.' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. SỬA LẠI CÂU LỆNH SQL 
        const sql = 'INSERT INTO users (full_name, email, password_hash, phone_number, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
        const defaultRole = 'user';
        
        // 4. SỬA LẠI MẢNG THAM SỐ 
        const [result] = await db.query(sql, [fullName, email, hashedPassword, phoneNumber, defaultRole]);
        const newUserId = result.insertId;

        // Tạo JWT
        const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Lấy lại thông tin user vừa tạo
        const [newUser] = await db.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [newUserId]);

        // Trả về kết quả
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            data: newUser[0]
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
    }
};

// --- HÀM ĐĂNG NHẬP  ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        const user = users[0];

        if (!user.password_hash) {
             console.error(`Lỗi: User ${email} không có password_hash trong database.`);
             return res.status(500).json({ message: 'Lỗi cấu hình tài khoản.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Đăng nhập thành công',
            token,
            data: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone_number: user.phone_number,
                address: user.address
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};

// --- HÀM LẤY THÔNG TIN USER HIỆN TẠI  ---
const getUserProfile = async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: 'Lấy thông tin người dùng thành công',
            data: req.user
        });
    } else {
        res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }
};

// Export các hàm
module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};