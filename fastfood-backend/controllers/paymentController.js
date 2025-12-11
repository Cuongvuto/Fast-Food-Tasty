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
        let returnUrl = process.env.VNP_RETURN_URL;

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