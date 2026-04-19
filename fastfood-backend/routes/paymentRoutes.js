// fastfood-backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// API để Frontend gọi lấy link
router.post('/create_payment_url', paymentController.createPaymentUrl);

router.post('/create_qr_url', paymentController.createQrPaymentUrl);

router.post('/webhook/payos', paymentController.handlePayOSWebhook);
module.exports = router;