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

// === CẤU HÌNH CORS (QUAN TRỌNG NHẤT) ===
const allowedOrigins = [
    'http://localhost:5173',             // Frontend chạy ở máy (Vite)
    'http://localhost:5001',             // Backend chạy ở máy (đề phòng)
    'https://fast-food-tasty.vercel.app' // <--- Frontend trên Vercel (KHÔNG CÓ DẤU / Ở CUỐI)
];

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép request không có origin (như Postman, App Mobile) hoặc nằm trong danh sách cho phép
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS Error: Origin này không được phép truy cập!'));
        }
    },
    credentials: true, // Cho phép nhận cookie/token
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// === MIDDLEWARES KHÁC ===
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// Middleware Log (Nên để lên trên cùng để xem log request)
app.use((req, res, next) => {
    console.log(`REQUEST ĐẾN: ${req.method} ${req.originalUrl}`);
    next();
});

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

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
    });
});

module.exports = app;