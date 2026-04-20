// server.js

// 👇 1. Thêm đoạn này lên ĐẦU file
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    // 👇 2. Thêm dòng này để biết Server đang chạy ở mode nào
    console.log(`MODE: ${process.env.NODE_ENV || 'development'}`);
});