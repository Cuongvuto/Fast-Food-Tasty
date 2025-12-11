// fastfood-backend/controllers/comboController.js
const db = require('../config/db');

// --- Helper: Hàm tính toán giá combo từ DB ---
const calculateComboPrices = async (items, discountAmount, connection) => {
    // 1. Lấy ID sản phẩm
    const productIds = items.map(item => item.product_id);
    if (productIds.length === 0) {
        throw new Error('Combo phải có ít nhất 1 sản phẩm.');
    }

    // 2. Truy vấn giá *thực tế* của các sản phẩm đó từ CSDL
    const [products] = await (connection || db).query(
        'SELECT id, price FROM products WHERE id IN (?)',
        [productIds]
    );

    // 3. Tạo map để tra cứu giá
    const priceMap = new Map();
    products.forEach(p => priceMap.set(p.id, parseFloat(p.price)));

    // 4. Tính toán giá gốc (original_price)
    let calculatedOriginalPrice = 0;
    for (const item of items) {
        const price = priceMap.get(item.product_id);
        if (!price) {
            throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại hoặc không có giá.`);
        }
        calculatedOriginalPrice += price * item.quantity;
    }

    // 5. Tính toán giá cuối cùng (final_price)
    const discount = parseFloat(discountAmount) || 0;
    const calculatedFinalPrice = calculatedOriginalPrice - discount;

    // Đảm bảo giá cuối cùng không âm
    if (calculatedFinalPrice < 0) {
        throw new Error('Số tiền giảm giá không thể lớn hơn giá gốc của combo.');
    }

    return {
        original_price: calculatedOriginalPrice,
        discount_amount: discount,
        final_price: calculatedFinalPrice
    };
};

/**
 * @desc    Tạo combo mới (cho Admin)
 * @route   POST /api/combos
 * @access  Admin
 */
const createCombo = async (req, res) => {
    
    const { name, description, discount_amount_from_form, image_url, is_available, items } = req.body;

    if (!name || !items || items.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên và danh sách sản phẩm cho combo.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Tính toán các loại giá một cách an toàn
        const { original_price, discount_amount, final_price } = await calculateComboPrices(
            items,
            discount_amount_from_form,
            connection
        );

        // 2. Thêm vào bảng 'combos' với các giá đã tính
        const comboSql = `
            INSERT INTO combos (name, description, original_price, discount_amount, price, image_url, is_available) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [comboResult] = await connection.query(comboSql, [
            name, description,
            original_price,      // Giá gốc
            discount_amount,     // Tiền giảm
            final_price,         // Giá cuối cùng
            image_url,
            is_available === true ? 1 : 0
        ]);
        const newComboId = comboResult.insertId;

        // 3. Thêm vào bảng 'combo_items'
        const itemValues = items.map(item => [newComboId, item.product_id, item.quantity]);
        const itemSql = 'INSERT INTO combo_items (combo_id, product_id, quantity) VALUES ?';
        await connection.query(itemSql, [itemValues]);

        await connection.commit();
        
        res.status(201).json({
            message: 'Tạo combo mới thành công',
            data: { id: newComboId, ...req.body }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Lỗi khi tạo combo:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo combo' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc    Cập nhật combo (cho Admin)
 * @route   PUT /api/combos/:id
 * @access  Admin
 */
const updateCombo = async (req, res) => {
    const comboId = req.params.id;
    const { name, description, discount_amount_from_form, image_url, is_available, items } = req.body;

    if (!name || !items || items.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên và danh sách sản phẩm.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Tính toán lại giá
        const { original_price, discount_amount, final_price } = await calculateComboPrices(
            items,
            discount_amount_from_form,
            connection
        );

        // 2. Cập nhật bảng 'combos'
        const comboSql = `
            UPDATE combos SET 
            name = ?, description = ?, 
            original_price = ?, discount_amount = ?, price = ?, 
            image_url = ?, is_available = ?, updated_at = NOW() 
            WHERE id = ?
        `;
        await connection.query(comboSql, [
            name, description,
            original_price,
            discount_amount,
            final_price,
            image_url,
            is_available === true ? 1 : 0,
            comboId
        ]);

        // 3. Xóa sản phẩm cũ
        await connection.query('DELETE FROM combo_items WHERE combo_id = ?', [comboId]);

        // 4. Thêm lại sản phẩm mới
        const itemValues = items.map(item => [comboId, item.product_id, item.quantity]);
        const itemSql = 'INSERT INTO combo_items (combo_id, product_id, quantity) VALUES ?';
        await connection.query(itemSql, [itemValues]);

        await connection.commit();
        
        res.status(200).json({
            message: 'Cập nhật combo thành công',
            data: { id: comboId, ...req.body }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Lỗi khi cập nhật combo ${comboId}:`, error);
        res.status(500).json({ message: error.message || 'Lỗi server khi cập nhật combo' });
    } finally {
        if (connection) connection.release();
    }
};



/**
 * @desc    Lấy tất cả combo (cho khách hàng)
 * @route   GET /api/combos
 * @access  Public
 */
const getAllCombos = async (req, res) => {
    try {
        // Lấy thêm original_price và discount_amount để hiển thị (VD: 120k -> 100k)
        const sql = "SELECT id, name, description, price, original_price, discount_amount, image_url, is_available FROM combos WHERE is_available = TRUE ORDER BY name ASC";
        const [combos] = await db.query(sql);
        res.status(200).json({
            message: 'Lấy danh sách combo thành công',
            data: combos
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách combo:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

/**
 * @desc    Lấy tất cả combo (cho Admin)
 * @route   GET /api/combos/admin
 * @access  Admin
 */
const getAllCombosAdmin = async (req, res) => {
     try {
        const sql = "SELECT id, name, description, price, original_price, discount_amount, image_url, is_available FROM combos ORDER BY id DESC";
        const [combos] = await db.query(sql);
        res.status(200).json({
            message: 'Lấy danh sách combo cho admin thành công',
            data: combos
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách combo admin:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

/**
 * @desc    Lấy chi tiết 1 combo
 * @route   GET /api/combos/:id
 * @access  Public
 */
const getComboById = async (req, res) => {
    const comboId = req.params.id;
    try {
        // 1. Lấy thông tin combo
        const [combos] = await db.query('SELECT * FROM combos WHERE id = ?', [comboId]);
        if (combos.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy combo' });
        }
        const comboInfo = combos[0];

        // 2. Lấy các sản phẩm thuộc combo
        const itemsSql = `
            SELECT p.id, p.name, p.image_url, p.price as product_original_price, ci.quantity
            FROM combo_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.combo_id = ?
        `;
        const [items] = await db.query(itemsSql, [comboId]);

        res.status(200).json({
            message: 'Lấy chi tiết combo thành công',
            data: {
                ...comboInfo,
                items: items 
            }
        });
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết combo ${comboId}:`, error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


/**
 * @desc    Xóa combo (cho Admin)
 * @route   DELETE /api/combos/:id
 * @access  Admin
 */
const deleteCombo = async (req, res) => {
    const comboId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM combos WHERE id = ?', [comboId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy combo để xóa' });
        }
        
        res.status(200).json({ message: 'Xóa combo thành công' });
    } catch (error) {
        console.error(`Lỗi khi xóa combo ${comboId}:`, error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


module.exports = {
    getAllCombos,
    getAllCombosAdmin,
    getComboById,
    createCombo,
    updateCombo,
    deleteCombo
};