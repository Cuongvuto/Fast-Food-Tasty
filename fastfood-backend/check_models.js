// fastfood-backend/check_models.js
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    console.log("🔍 Đang kết nối đến Google để lấy danh sách Model...");
    
    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            console.error("❌ LỖI API:", data.error.message);
            return;
        }

        console.log("\n✅ DANH SÁCH CÁC MODEL BẠN CÓ THỂ DÙNG:");
        console.log("==========================================");
        
        // Lọc ra các model dùng để chat (generateContent)
        const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        chatModels.forEach(model => {
            console.log(`🔹 Tên: ${model.name}`); 
            console.log(`   Mô tả: ${model.displayName}`);
            console.log("------------------------------------------");
        });

    } catch (error) {
        console.error("❌ Lỗi kết nối:", error.message);
    }
}

listModels();