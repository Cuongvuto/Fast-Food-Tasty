# FastFood Tasty 🍔🚀

![FastFood Tasty Logo](file:///C:/Users/anhde/.gemini/antigravity/brain/b6fb6f14-f0a0-4a13-99ca-76b1f213f167/fastfood_tasty_logo_1776652341647.png)

Chào mừng bạn đến với **FastFood Tasty** - Hệ thống đặt đồ ăn nhanh hiện đại, tích hợp thanh toán thông minh và quản lý chuyên nghiệp.

## 🌟 Tính năng nổi bật

### 🛒 Dành cho Khách hàng
- **Giao diện hiện đại**: Responsive tốt trên mọi thiết bị (Mobile, Tablet, Desktop) sử dụng Material UI.
- **Thanh toán đa kênh**: Tích hợp các cổng thanh toán hàng đầu: **VietQR (PayOS)**, **MoMo**, và **VNPay**.
- **Giỏ hàng mượt mà**: Trải nghiệm thêm món và thanh toán tối ưu hóa cho người dùng.
- **AI Smart Menu**: Tích hợp Google Gemini AI hỗ trợ tạo mô tả và gợi ý món ăn.

### 🛡️ Dành cho Quản trị viên (Admin)
- **Dashboard trực quan**: Theo dõi doanh thu và tăng trưởng qua các biểu đồ sinh động (Chart.js & Recharts).
- **Quản lý sản phẩm**: Quản lý menu linh hoạt, hỗ trợ upload ảnh trực tiếp lên Cloudinary.
- **Quản lý đơn hàng**: Hệ thống theo dõi trạng thái đơn hàng thời gian thực.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: React 19 + Vite.
- **Styling**: Material UI (MUI).
- **Thư viện liên quan**: Axios, React Router, Slick Carousel.
- **Biểu đồ**: Chart.js, Recharts.

### Backend
- **Nền tảng**: Node.js (Express 5).
- **Cơ sở dữ liệu**: MySQL.
- **Bảo mật**: JWT (JSON Web Token), Bcrypt (mã hóa mật khẩu).
- **Lưu trữ ảnh**: Cloudinary API.
- **Thanh toán**: PayOS SDK, VNPay.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.x trở lên.
- **MySQL**: Server database sẵn sàng.

### 2. Cài đặt Backend
Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd fastfood-backend
npm install
```
Cấu hình file `.env` với các thông tin của bạn:
- Database config (Host, User, Password, Name).
- JWT Secret key.
- Google Gemini API Key.
- Cloudinary & Payment Gateway (PayOS, VNPay) Credentials.

### 3. Cài đặt Frontend
Di chuyển vào thư mục frontend và cài đặt dependencies:
```bash
cd fastfood-frontend
npm install
```

### 4. Khởi chạy
- **Backend**: `node app.js` (hoặc server.js).
- **Frontend**: `npm run dev` sau đó truy cập `http://localhost:5173`.

---

## 📂 Tổ chức dự án
- `/fastfood-frontend`: Chứa toàn bộ mã nguồn Client-side.
- `/fastfood-backend`: Chứa API, controllers, routes và cấu hình server.

---

## 🤝 Đóng góp & Bản quyền
Dự án được phát triển bởi **Cuongvuto**. Vui lòng liên hệ nếu bạn có bất kỳ câu hỏi nào.
