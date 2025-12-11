// fastfood-backend/controllers/voucherController.js
const db = require('../config/db');

const applyVoucher = async (req, res) => {
    const { code, cartTotal } = req.body;
    const userId = req.user.id; // Lấy từ token

    if (!code || !cartTotal) {
        return res.status(400).json({ message: 'Thiếu thông tin mã hoặc tổng tiền.' });
    }

    try {
        // 1. Tìm voucher theo mã
        const [vouchers] = await db.query('SELECT * FROM vouchers WHERE code = ?', [code]);
        
        if (vouchers.length === 0) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại.' });
        }

        const voucher = vouchers[0];
        const now = new Date();

        // 2. Kiểm tra trạng thái và thời hạn
        if (!voucher.is_active) {
            return res.status(400).json({ message: 'Mã giảm giá này đang bị khóa.' });
        }
        if (now < new Date(voucher.start_date)) {
            return res.status(400).json({ message: 'Mã giảm giá chưa đến đợt áp dụng.' });
        }
        if (now > new Date(voucher.end_date)) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn.' });
        }

        // 3. Kiểm tra số lượng sử dụng (Toàn hệ thống)
        if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' });
        }

        // 4. Kiểm tra điều kiện đơn tối thiểu
        // Chuyển cartTotal sang số để so sánh cho chuẩn
        if (Number(cartTotal) < Number(voucher.min_order_value)) {
            return res.status(400).json({ 
                message: `Đơn hàng phải từ ${Number(voucher.min_order_value).toLocaleString()}đ mới được dùng mã này.` 
            });
        }

        // 5. Kiểm tra xem User này đã dùng mã này chưa (Quan trọng!)
        const [history] = await db.query(
            'SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_id = ?', 
            [userId, voucher.id]
        );
        if (history.length > 0) {
            return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi.' });
        }

        // 6. TÍNH TOÁN SỐ TIỀN ĐƯỢC GIẢM
        let discountAmount = 0;

        if (voucher.discount_type === 'fixed') {
            // Giảm tiền mặt (ví dụ 20k)
            discountAmount = Number(voucher.discount_value);
        } else if (voucher.discount_type === 'percent') {
            // Giảm phần trăm (ví dụ 10%)
            discountAmount = (Number(cartTotal) * Number(voucher.discount_value)) / 100;
            
            // Nếu có áp trần giảm tối đa (ví dụ giảm 10% nhưng tối đa 50k)
            if (voucher.max_discount_amount && discountAmount > Number(voucher.max_discount_amount)) {
                discountAmount = Number(voucher.max_discount_amount);
            }
        }

        // Đảm bảo tiền giảm không vượt quá tổng đơn (không để âm tiền)
        if (discountAmount > Number(cartTotal)) {
            discountAmount = Number(cartTotal);
        }

        // Tính tổng cuối
        const finalTotal = Number(cartTotal) - discountAmount;

        // Trả kết quả về Frontend
        res.json({
            success: true,
            message: 'Áp dụng mã thành công!',
            data: {
                voucherId: voucher.id,
                code: voucher.code,
                discountAmount: discountAmount,
                finalTotal: finalTotal
            }
        });

    } catch (error) {
        console.error('Lỗi check voucher:', error);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra mã.' });
    }
};

module.exports = { applyVoucher };