// fastfood-backend/controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db'); 
require('dotenv').config(); 

exports.chatWithAI = async (req, res) => {
    const { message } = req.body;
    console.log("📩 Client hỏi:", message);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "Lỗi Server: Thiếu API Key." });
    }

    try {
        // 1. TỐI ƯU MENU
        const [products] = await db.execute('SELECT name, price FROM products LIMIT 50');
        const menuText = products.map(p => `${p.name} (${parseInt(p.price).toLocaleString()}đ)`).join(', ');

        // 2. CẤU HÌNH AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Vai: Nhân viên FastFood Tasty.
        Menu: ${menuText}.
        Khách hỏi: "${message}"
        Yêu cầu: Trả lời ngắn (dưới 40 từ), thân thiện, có emoji. Báo giá chính xác.
        `;

        // 3. GỬI YÊU CẦU
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Chat thành công:", text);
        res.json({ reply: text });

    } catch (error) {
        console.error("❌ LỖI GEMINI:", error.message);

        // Xử lý lỗi hết quota (429)
        if (error.message.includes("429") || error.status === 429) {
            return res.json({ 
                reply: "Hiện tại quán đông khách quá (Hết quota AI) 😅. Bạn chờ 1 phút rồi hỏi lại nha!" 
            });
        }

        // Xử lý lỗi sai tên model (404)
        if (error.message.includes("404") || error.status === 404) {
             return res.json({ 
                reply: "Lỗi cấu hình AI (Sai tên Model). Vui lòng báo Admin kiểm tra lại code!" 
            });
        }

        res.status(500).json({ 
            reply: "Robot đang bảo trì, bạn thử lại sau nha! 🤖",
            errorDetails: error.message 
        });
    }
};