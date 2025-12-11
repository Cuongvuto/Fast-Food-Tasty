// fastfood-backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Import Controller
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderPaid,
    getMyOrders,
    cancelOrder
} = require('../controllers/orderController');

// Import Middleware
const { protect, isAdmin } = require('../middlewares/authMiddleware'); 

// === USER ROUTES ===

// 1. Tạo đơn hàng

router.post('/', createOrder); 

// 2. Lấy đơn hàng của tôi
router.get('/my-orders', protect, getMyOrders);

// 3. Hủy đơn
router.put('/:id/cancel', protect, cancelOrder);


// === ADMIN ROUTES ===
router.get('/', protect, isAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

// === PAYMENT ROUTE ===
router.put('/:id/pay', updateOrderPaid);

module.exports = router;