// fastfood-backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// API để Frontend gọi lấy link
router.post('/create_payment_url', paymentController.createPaymentUrl);

module.exports = router;