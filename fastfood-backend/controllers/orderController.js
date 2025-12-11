// fastfood-backend/controllers/orderController.js
const db = require('../config/db');

// --- 1. LẤY ĐƠN HÀNG CỦA TÔI (CÓ PHÂN TRANG) ---
const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; 
    const offset = (page - 1) * limit;

    try {
        const countSql = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
        const [countRows] = await db.query(countSql, [userId]);
        const totalOrders = countRows[0].total;
        const totalPages = Math.ceil(totalOrders / limit);

        const sql = `
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [orders] = await db.query(sql, [userId, limit, offset]);

        res.json({
            data: orders,
            pagination: { page, limit, totalOrders, totalPages }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy lịch sử đơn hàng' });
    }
};

// --- 2. HỦY ĐƠN HÀNG ---
const cancelOrder = async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        const [order] = await db.execute(
            'SELECT status FROM orders WHERE id = ? AND user_id = ?', 
            [orderId, userId]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order[0].status !== 'pending') {
            return res.status(400).json({ message: 'Không thể hủy đơn hàng này (Đã được xử lý hoặc đang giao).' });
        }

        await db.execute("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId]);
        res.json({ message: 'Đã hủy đơn hàng thành công' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi hủy đơn' });
    }
};

// --- 3. TẠO ĐƠN HÀNG (CÓ XỬ LÝ VOUCHER) ---
const createOrder = async (req, res) => {
    const { 
        userId, items, 
        shippingAddress, shippingPhone, shippingFullName,
        paymentMethod, shippingMethod,
        itemsPrice, shippingPrice, 
        note, voucherCode 
    } = req.body;

    if (!userId) return res.status(401).json({ message: 'Bạn phải đăng nhập để đặt hàng.' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống.' });

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // --- XỬ LÝ VOUCHER ---
        let finalDiscountAmount = 0;
        let validVoucherId = null;

        if (voucherCode) {
            const [vouchers] = await connection.query('SELECT * FROM vouchers WHERE code = ? FOR UPDATE', [voucherCode]);
            
            if (vouchers.length === 0) throw new Error('Mã giảm giá không tồn tại.');
            
            const voucher = vouchers[0];
            const now = new Date();

            if (!voucher.is_active) throw new Error('Mã giảm giá đang bị khóa.');
            if (now < new Date(voucher.start_date)) throw new Error('Mã chưa đến giờ áp dụng.');
            if (now > new Date(voucher.end_date)) throw new Error('Mã đã hết hạn.');
            if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) throw new Error('Mã đã hết lượt sử dụng.');
            if (itemsPrice < voucher.min_order_value) throw new Error('Đơn hàng chưa đủ giá trị tối thiểu để dùng mã này.');

            // Check lịch sử dùng
            const [history] = await connection.query(
                'SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_id = ?', 
                [userId, voucher.id]
            );
            if (history.length > 0) throw new Error('Bạn đã sử dụng mã này rồi.');

            // Tính tiền giảm
            if (voucher.discount_type === 'fixed') {
                finalDiscountAmount = Number(voucher.discount_value);
            } else {
                finalDiscountAmount = (itemsPrice * Number(voucher.discount_value)) / 100;
                if (voucher.max_discount_amount && finalDiscountAmount > Number(voucher.max_discount_amount)) {
                    finalDiscountAmount = Number(voucher.max_discount_amount);
                }
            }
            if (finalDiscountAmount > itemsPrice) finalDiscountAmount = itemsPrice;

            validVoucherId = voucher.id;

            // Tăng số lần sử dụng voucher
            await connection.query('UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?', [validVoucherId]);
        }

        // Tính tổng tiền cuối cùng
        const finalTotalPrice = Number(itemsPrice) + Number(shippingPrice) - finalDiscountAmount;

        // Tạo đơn hàng
        const orderSql = `
            INSERT INTO orders (
                user_id, voucher_id, discount_amount, 
                shipping_full_name, shipping_address, shipping_phone,
                status, items_price, shipping_price, total_price, 
                payment_method, shipping_method,
                is_paid, paid_at, note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const initialStatus = paymentMethod === 'cod' ? 'processing' : 'pending';
        const isPaid = paymentMethod !== 'cod';
        const paidAt = isPaid ? new Date() : null;

        const [orderResult] = await connection.query(orderSql, [
            userId, validVoucherId, finalDiscountAmount,
            shippingFullName, shippingAddress, shippingPhone,
            initialStatus, itemsPrice, shippingPrice, finalTotalPrice,
            paymentMethod, shippingMethod,
            isPaid ? 1 : 0, paidAt, note
        ]);
        
        const orderId = orderResult.insertId;

        // Lưu chi tiết sản phẩm
        if (items && items.length > 0) {
            const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, price_at_purchase) VALUES ?';
            const itemValues = items.map(item => [
                orderId, item.productId, item.quantity, item.price, item.price
            ]);
            await connection.query(itemSql, [itemValues]);
        }

        // Lưu lịch sử dùng voucher
        if (validVoucherId) {
            await connection.query(
                'INSERT INTO user_vouchers (user_id, voucher_id, order_id) VALUES (?, ?, ?)',
                [userId, validVoucherId, orderId]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Đặt hàng thành công', orderId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo đơn hàng.' });
    } finally {
        if (connection) connection.release();
    }
};

// --- 4. LẤY TẤT CẢ ĐƠN HÀNG (ADMIN) ---
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { status, searchId, date } = req.query;
        let baseSql = ` FROM orders o LEFT JOIN users u ON o.user_id = u.id `;
        let conditions = [];
        let params = [];

        if (status) { conditions.push("o.status = ?"); params.push(status); }
        if (searchId) { conditions.push("o.id = ?"); params.push(searchId); }
        if (date) { conditions.push("DATE(o.created_at) = ?"); params.push(date); }

        if (conditions.length > 0) baseSql += " WHERE " + conditions.join(" AND ");

        const countSql = "SELECT COUNT(o.id) as totalCount " + baseSql;
        const [countRows] = await db.query(countSql, params);
        const totalCount = countRows[0].totalCount;
        const totalPages = Math.ceil(totalCount / limit);

        const dataSql = `
            SELECT o.id, o.user_id, o.total_price, o.discount_amount, 
                o.shipping_address, o.shipping_full_name, 
                o.shipping_phone, o.payment_method, o.status, o.created_at,
                u.full_name as user_name, u.email as user_email
            ${baseSql}
            ORDER BY o.created_at DESC LIMIT ? OFFSET ?
        `;
        const dataParams = [...params, limit, offset];
        const [orders] = await db.query(dataSql, dataParams);

        res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders,
            pagination: { currentPage: page, totalPages, totalCount, limit }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng' });
    }
};

// --- 5. CẬP NHẬT TRẠNG THÁI (ADMIN) ---
const updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'failed'];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ.' });
    }
    try {
        const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
        const [result] = await db.query(sql, [status, orderId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        res.status(200).json({ message: `Cập nhật thành công` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// --- 6. LẤY CHI TIẾT ĐƠN HÀNG ---
const getOrderById = async (req, res) => {
    const orderId = req.params.id;
    try {
        const orderSql = `SELECT o.*, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`;
        const [orderDetails] = await db.query(orderSql, [orderId]);
        if (orderDetails.length === 0) return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });

        const itemsSql = `SELECT oi.*, p.name as product_name, p.image_url as product_image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`;
        const [orderItems] = await db.query(itemsSql, [orderId]);

        res.status(200).json({ message: 'Thành công', data: { ...orderDetails[0], items: orderItems } });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// --- 7. CẬP NHẬT THANH TOÁN (VNPAY) ---
const updateOrderPaid = async (req, res) => {
    const orderId = req.params.id;
    try {
        await db.execute(`UPDATE orders SET is_paid = 1, status = 'processing', paid_at = NOW() WHERE id = ?`, [orderId]);
        res.json({ message: "Đã cập nhật trạng thái thanh toán thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { 
    createOrder, 
    getAllOrders, 
    updateOrderStatus, 
    getOrderById,
    updateOrderPaid,
    getMyOrders,   
    cancelOrder    
};