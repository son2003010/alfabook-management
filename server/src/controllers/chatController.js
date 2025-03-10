import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatModel from '../models/chatModel.js'; // Import ChatModel để lấy danh mục sách

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export const chatWithGemini = async (req, res) => {
    try {
        const messages = req.body.messages;
        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
        }

        // Lấy danh mục sách từ ChatModel
        const categories = await ChatModel.getCategory();
        const categoryList = categories.length > 0 
            ? categories.map(c => c.CategoryName).join(", ") 
            : "Hiện tại chưa có danh mục sách.";

        // Thêm dữ liệu vào prompt cho AI
        const bookStoreInfo = `
            Bạn là trợ lý AI của cửa hàng sách Alfabook. Dưới đây là danh mục sách hiện có:
            ${categoryList}.
            Khi người dùng hỏi về sách, hãy ưu tiên trả lời dựa trên danh mục này.
        `;

        // Tin nhắn người dùng gửi đến AI
        const userMessage = `${bookStoreInfo}\nNgười dùng: ${messages[messages.length - 1].content}`;

        // Gửi request đến Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const resultAI = await model.generateContent(userMessage);
        const response = await resultAI.response;

        res.json({ content: response.text() });
    } catch (error) {
        console.error("Lỗi chat AI:", error);
        res.status(500).json({ error: error.message });
    }
};
