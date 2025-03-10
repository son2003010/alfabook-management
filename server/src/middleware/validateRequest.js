export const validateChatRequest = (req, res, next) => {
    const { messages } = req.body;
  
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }
  
    next(); // Nếu hợp lệ, tiếp tục xử lý
  };
  