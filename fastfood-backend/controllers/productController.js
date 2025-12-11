// controllers/productController.js
const db = require('../config/db');

// === LẤY DANH SÁCH SẢN PHẨM CÓ PHÂN TRANG ===
const getAllProducts = async (req, res) => {
  try {
    const { category, search, is_hot, include_unavailable } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    let baseSql = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (include_unavailable !== 'true') {
      conditions.push('p.is_available = TRUE');
    }
    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('p.name LIKE ? OR p.description LIKE ?');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (is_hot === 'true') {
      conditions.push('p.is_hot = TRUE');
    }

    if (conditions.length > 0) {
      baseSql += ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseSql}`, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const dataSql = `
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.category_id, p.is_available, p.is_hot,
        c.name as category_name, c.slug as category_slug
      ${baseSql}
      ORDER BY p.id ASC
      LIMIT ? OFFSET ?
    `;
    const [products] = await db.query(dataSql, [...params, limit, offset]);

    res.status(200).json({
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// === LẤY SẢN PHẨM THEO ID ===
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const sql = `
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.category_id, p.is_available, p.is_hot,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [products] = await db.query(sql, [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.status(200).json({ message: 'Lấy sản phẩm thành công', data: products[0] });
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// === TẠO SẢN PHẨM MỚI (ĐÃ NÂNG CẤP UPLOAD) ===
const createProduct = async (req, res) => {
  // Lấy các trường thông tin từ form
  const { name, description, price, category_id, is_available = true, is_hot = false } = req.body;

  // --- LOGIC XỬ LÝ ẢNH MỚI ---
  let finalImageUrl = req.body.image_url; // Mặc định lấy link nhập tay (nếu có)

  // Nếu có file được upload qua Cloudinary, ghi đè link ảnh bằng link Cloudinary
  if (req.file && req.file.path) {
    finalImageUrl = req.file.path;
  }
  // -----------------------------

  // Kiểm tra dữ liệu (dùng finalImageUrl để check)
  if (!name || !price || !category_id || !finalImageUrl) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: tên, giá, danh mục, hình ảnh.' });
  }

  try {
    const sql = `
      INSERT INTO products
      (name, description, price, category_id, image_url, is_available, is_hot)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    // Dùng finalImageUrl để lưu vào DB
    const params = [name, description, price, category_id, finalImageUrl, is_available ? 1 : 0, is_hot ? 1 : 0];
    const [result] = await db.query(sql, params);

    const [newProduct] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      data: newProduct[0]
    });
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// === CẬP NHẬT SẢN PHẨM (ĐÃ NÂNG CẤP UPLOAD) ===
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category_id, is_available, is_hot } = req.body;

  // --- LOGIC XỬ LÝ ẢNH MỚI ---
  let finalImageUrl = req.body.image_url;

  if (req.file && req.file.path) {
    finalImageUrl = req.file.path;
  }
  // -----------------------------

  if (!name || price === undefined || category_id === undefined || !finalImageUrl) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: tên, giá, danh mục, hình ảnh.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại để cập nhật.' });
    }

    const sql = `
      UPDATE products SET
        name = ?, description = ?, price = ?, category_id = ?,
        image_url = ?, is_available = ?, is_hot = ?
      WHERE id = ?
    `;
    const params = [name, description, price, category_id, finalImageUrl, is_available ? 1 : 0, is_hot ? 1 : 0, productId];
    await db.query(sql, params);

    const [updatedProduct] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [productId]
    );

    res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct[0]
    });
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// === XÓA SẢN PHẨM ===
const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại để xóa.' });
    }

    const sql = 'DELETE FROM products WHERE id = ?';
    await db.query(sql, [productId]);

    res.status(200).json({ message: `Xóa sản phẩm ID ${productId} thành công` });
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Không thể xóa sản phẩm vì nó đang tồn tại trong đơn hàng hoặc bảng khác.' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};