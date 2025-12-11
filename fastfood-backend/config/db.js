const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    // 👇 Sửa lại cho khớp với bên Render (DB_PASS)
    password: process.env.DB_PASS, 
    // 👇 Sửa lại cho khớp với bên Render (DB_NAME)
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT || 3306, // Thêm port cho chắc chắn
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 👇 QUAN TRỌNG: Thêm đoạn này để kết nối được Aiven
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool.promise();