// fastfood-backend/controllers/userController.js
const db = require('../config/db');

// --- 1. CẬP NHẬT HỒ SƠ CÁ NHÂN (Dành cho User) ---
const updateUserProfile = async (req, res) => {
    const userId = req.user.id; 
    const { full_name, phone, address } = req.body;

    try {
        await db.execute(
            'UPDATE users SET full_name = ?, phone_number = ?, address = ?, updated_at = NOW() WHERE id = ?',
            [full_name, phone, address, userId]
        );

        const [updatedUser] = await db.execute(
            'SELECT id, full_name, email, phone_number, address, role FROM users WHERE id = ?', 
            [userId]
        );

        res.json({
            message: 'Cập nhật thông tin thành công',
            data: updatedUser[0]
        });
    } catch (error) {
        console.error('Lỗi update profile:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật profile' });
    }
};

// --- 2. LẤY DANH SÁCH NGƯỜI DÙNG (ADMIN - CÓ PHÂN TRANG) ---
const getAllUsers = async (req, res) => {
    try {
        // 1. Lấy tham số page và limit (Mặc định: trang 1, 10 user/trang)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. Đếm tổng số user để tính tổng số trang
        const countSql = 'SELECT COUNT(*) as total FROM users';
        const [countRows] = await db.query(countSql);
        const totalUsers = countRows[0].total;
        const totalPages = Math.ceil(totalUsers / limit);

        // 3. Lấy dữ liệu phân trang
        // Sắp xếp ID giảm dần (DESC) để thấy user mới đăng ký trước
        const sql = `
            SELECT id, full_name, email, role, created_at 
            FROM users 
            ORDER BY id DESC 
            LIMIT ? OFFSET ?
        `;
        
        // Truyền limit và offset vào query
        const [users] = await db.query(sql, [limit, offset]);

        // 4. Format dữ liệu
        const formattedUsers = users.map(user => ({
            ...user,
            name: user.full_name
        }));

        // 5. Trả về kết quả kèm thông tin phân trang
        res.status(200).json({
            message: 'Lấy danh sách người dùng thành công',
            data: formattedUsers,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
    }
};

// --- 3. CẬP NHẬT VAI TRÒ (ADMIN) ---
const updateUserRole = async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || (role !== 'admin' && role !== 'user')) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

        const sql = 'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?';
        await db.query(sql, [role, userId]);
        res.status(200).json({ message: `Cập nhật vai trò thành công` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// --- 4. XÓA NGƯỜI DÙNG (ADMIN) ---
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.status(200).json({ message: `Xóa người dùng thành công` });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ message: 'Không thể xóa người dùng này vì có dữ liệu liên quan.' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// XUẤT TẤT CẢ
module.exports = {
    updateUserProfile, 
    getAllUsers,
    updateUserRole,
    deleteUser
};