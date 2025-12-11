// app.js
const express = require('express');
const cors = require('cors');

const path = require('path'); 
require('dotenv').config();

// === IMPORT ROUTES ===
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const comboRoutes = require('./routes/comboRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const app = express();
// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// === ROUTES ===
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/vouchers', voucherRoutes);

// === MIDDLEWARE XỬ LÝ LỖI ===
// Middleware xử lý lỗi 404 (Not Found)
app.use((req, res, next) => {
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((req, res, next) => {
    console.log(`REQUEST ĐẾN: ${req.method} ${req.originalUrl}`);
    next();
});

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
    });
});

module.exports = app;
