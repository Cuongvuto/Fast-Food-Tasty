const express = require('express');
const router = express.Router();
const { applyVoucher } = require('../controllers/voucherController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/vouchers/apply
// Yêu cầu phải đăng nhập (protect) để check lịch sử dùng mã
router.post('/apply', protect, applyVoucher);

module.exports = router;