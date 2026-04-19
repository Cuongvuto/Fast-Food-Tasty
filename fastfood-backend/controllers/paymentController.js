// fastfood-backend/controllers/paymentController.js
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');

// Hàm sắp xếp tham số (Bắt buộc theo chuẩn VNPay)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

exports.createPaymentUrl = (req, res) => {
    try {
        const { amount, orderId, orderInfo } = req.body;
        
        // 1. Lấy ngày giờ hiện tại & IP
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        // 2. Lấy cấu hình từ .env
        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        // let returnUrl = process.env.VNP_RETURN_URL;

        let returnUrl;

            if (process.env.NODE_ENV === 'production') {
    
            returnUrl = 'https://fast-food-tasty.vercel.app/payment-result'; 
            } else {
            returnUrl = 'http://localhost:5173/payment-result';
}

        // 3. Tạo tham số thanh toán
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng
        vnp_Params['vnp_OrderInfo'] = orderInfo || 'Thanh toan don hang FastFood';
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100 (Ví dụ 10k => 1000000)
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        // 4. Sắp xếp tham số (QUAN TRỌNG)
        vnp_Params = sortObject(vnp_Params);

        // 5. Tạo chữ ký bảo mật (Secure Hash)
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        // 6. Tạo URL cuối cùng
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        // Trả link về cho Frontend
        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        console.error("Lỗi tạo URL thanh toán:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo thanh toán' });
    }
};

// fastfood-backend/controllers/paymentController.js

// 1. THÊM CẶP NGOẶC NHỌN {} Ở ĐÂY
const { PayOS } = require("@payos/node");

// Khởi tạo PayOS
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

exports.createQrPaymentUrl = async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // Xác định domain Frontend
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://fast-food-tasty.vercel.app' 
            : 'http://localhost:5173';

        // Chuẩn bị dữ liệu theo chuẩn PayOS
        const orderData = {
            orderCode: Number(orderId), // BẮT BUỘC là số nguyên
            amount: Number(amount),
            description: `Thanh toan don ${orderId}`.substring(0, 25),
            returnUrl: `${frontendUrl}/order-success`, 
            cancelUrl: `${frontendUrl}/checkout`,
        };

        // 2. CẬP NHẬT LẠI HÀM TẠO LINK (phiên bản mới dùng paymentRequests.create)
        const paymentLinkRes = await payos.paymentRequests.create(orderData);

        // Trả link trang thanh toán của PayOS về cho Frontend
        res.status(200).json({ paymentUrl: paymentLinkRes.checkoutUrl });

    } catch (error) {
        console.error("Lỗi tạo link PayOS:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo thanh toán QR' });
    }
};

exports.handlePayOSWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        // 3. CẬP NHẬT LẠI HÀM XÁC THỰC WEBHOOK (phiên bản mới dùng webhooks.verify)
        const verifiedData = payos.webhooks.verify(webhookData);
        
        // Nếu thanh toán thành công
        if (verifiedData.code === '00' || verifiedData.success === true) {
            const orderId = verifiedData.data ? verifiedData.data.orderCode : verifiedData.orderCode;
            const amountPaid = verifiedData.data ? verifiedData.data.amount : verifiedData.amount;

            // Mở comment đoạn này ra khi bạn có model Order
            const order = await order.findById(orderId);
            order.status = 'PAID';
            await order.save();
            
            console.log(`Đã nhận ${amountPaid}đ cho đơn hàng ${orderId}`);
        }

        // BẮT BUỘC phải trả về status 200 cho PayOS
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Lỗi Webhook PayOS:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};