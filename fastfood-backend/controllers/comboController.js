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

   // 4. Tính toán giá gốc
    let calculatedOriginalPrice = 0;
    for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
            throw new Error('Số lượng sản phẩm trong combo phải lớn hơn 0.');
        }
        const price = priceMap.get(item.product_id);
        if (!price) {
            throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại hoặc không có giá.`);
        }
        calculatedOriginalPrice += price * item.quantity;
    }

    // 5. Tính toán giá cuối cùng
    const discount = parseFloat(discountAmount) || 0;
    if (discount < 0) {
        throw new Error('Số tiền giảm giá không được là số âm.');
    }
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
 */
const createCombo = async (req, res) => {
    // 1. Lấy dữ liệu từ req.body (tất cả đều đang là chuỗi do FormData)
    const { name, description, discount_amount_from_form, is_available, items } = req.body;

    // 2. Xử lý Ảnh (Lấy từ Cloudinary nếu có file up lên, nếu không lấy link cũ)
    let finalImageUrl = req.body.image_url || ""; 
    if (req.file && req.file.path) {
        finalImageUrl = req.file.path;
    }

    // 3. Xử lý Mảng Items (Dịch từ chuỗi JSON sang Array)
    let parsedItems = [];
    try {
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (error) {
        return res.status(400).json({ message: 'Định dạng danh sách sản phẩm không hợp lệ.' });
    }

    if (!name || !parsedItems || parsedItems.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên và ít nhất 1 sản phẩm cho combo.' });
    }

    // 4. Xử lý Boolean (FormData gửi lên 'true' hoặc 'false' dạng chữ)
    const isAvail = (is_available === 'true' || is_available === true) ? 1 : 0;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { original_price, discount_amount, final_price } = await calculateComboPrices(
            parsedItems,
            discount_amount_from_form,
            connection
        );

        const comboSql = `
            INSERT INTO combos (name, description, original_price, discount_amount, price, image_url, is_available) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [comboResult] = await connection.query(comboSql, [
            name, description, original_price, discount_amount, final_price, finalImageUrl, isAvail
        ]);
        
        const newComboId = comboResult.insertId;

        const itemValues = parsedItems.map(item => [newComboId, item.product_id, item.quantity]);
        const itemSql = 'INSERT INTO combo_items (combo_id, product_id, quantity) VALUES ?';
        await connection.query(itemSql, [itemValues]);

        await connection.commit();
        
        res.status(201).json({
            message: 'Tạo combo mới thành công',
            data: { id: newComboId, name, final_price }
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
 */
const updateCombo = async (req, res) => {
    const comboId = req.params.id;
    // Log để kiểm tra xem Frontend gửi gì lên
    console.log("Dữ liệu nhận được từ Frontend:", req.body);

    const { name, description, discount_amount_from_form, is_available, items } = req.body;

    // 1. Xử lý Ảnh
    let finalImageUrl = req.body.image_url || "";
    if (req.file && req.file.path) {
        finalImageUrl = req.file.path;
    }

    // 2. Xử lý Mảng Items
    let parsedItems = [];
    try {
        // Nếu là string thì parse, nếu đã là object/array thì dùng luôn
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (error) {
        console.error("Lỗi Parse JSON items:", error);
        return res.status(400).json({ message: 'Định dạng danh sách sản phẩm không hợp lệ.' });
    }

    // KIỂM TRA ĐIỀU KIỆN (Lỗi 400 thường ở đây)
    if (!name) {
        return res.status(400).json({ message: 'Tên combo không được để trống.' });
    }
    if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
        return res.status(400).json({ message: 'Combo phải có ít nhất 1 sản phẩm.' });
    }

    // 3. Xử lý Boolean (Đảm bảo không bị lỗi kiểu dữ liệu)
    const isAvail = (is_available === 'true' || is_available === true || is_available === '1' || is_available === 1) ? 1 : 0;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 4. Tính toán giá (Hàm này phải tồn tại ở đầu file controller)
        const { original_price, discount_amount, final_price } = await calculateComboPrices(
            parsedItems,
            discount_amount_from_form,
            connection
        );

        // 5. Cập nhật SQL
        const comboSql = `
            UPDATE combos SET 
            name = ?, description = ?, original_price = ?, discount_amount = ?, price = ?, 
            image_url = ?, is_available = ? 
            WHERE id = ?
        `;
        await connection.query(comboSql, [
            name, description, original_price, discount_amount, final_price, finalImageUrl, isAvail, comboId
        ]);

        // 6. Cập nhật danh sách sản phẩm (Xóa cũ thêm mới)
        await connection.query('DELETE FROM combo_items WHERE combo_id = ?', [comboId]);
        
        if (parsedItems.length > 0) {
            const itemValues = parsedItems.map(item => [comboId, item.product_id, item.quantity]);
            const itemSql = 'INSERT INTO combo_items (combo_id, product_id, quantity) VALUES ?';
            await connection.query(itemSql, [itemValues]);
        }

        await connection.commit();
        res.status(200).json({ message: 'Cập nhật combo thành công' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Lỗi hệ thống (500):`, error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
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
        // Đã thêm: WHERE is_deleted = 0
        const sql = "SELECT id, name, description, price, original_price, discount_amount, image_url, is_available FROM combos WHERE is_deleted = 0 ORDER BY id DESC";
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
 * @desc    Xóa combo (Soft Delete - Ẩn khỏi hệ thống nhưng giữ lịch sử DB)
 * @route   DELETE /api/combos/:id
 * @access  Admin
 */
const deleteCombo = async (req, res) => {
    const comboId = req.params.id;
    try {
        // Cập nhật is_deleted = 1 (đã xóa) và is_available = 0 (ngừng bán)
        // Thêm điều kiện is_deleted = 0 để tránh việc update lại một combo đã bị xóa rồi
        const sql = 'UPDATE combos SET is_deleted = 1, is_available = 0 WHERE id = ? AND is_deleted = 0';
        const [result] = await db.query(sql, [comboId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy combo hoặc combo đã được xóa từ trước' });
        }
        
        res.status(200).json({ message: 'Xóa combo thành công' });
    } catch (error) {
        console.error(`Lỗi khi xóa combo ${comboId}:`, error);
        res.status(500).json({ message: 'Lỗi server khi xóa combo' });
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