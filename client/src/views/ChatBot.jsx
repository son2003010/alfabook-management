import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

function ChatBot () {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Tôi có thể giúp gì cho bạn về sách?', isBot: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Lịch sử hội thoại cho ngữ cảnh
  const [conversationHistory, setConversationHistory] = useState([
    { role: "system", content: "Bạn là trợ lý AI của một cửa hàng sách. Hãy cung cấp thông tin hữu ích về sách, giúp đỡ người dùng tìm kiếm sách theo thể loại, tác giả, và trả lời các câu hỏi về đặt hàng, vận chuyển, khuyến mãi. Giữ câu trả lời ngắn gọn, thân thiện và hữu ích. Trả lời bằng tiếng Việt." }
  ]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === '') return;

    // Thêm tin nhắn của người dùng
    const userMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: newMessage, isBot: false },
    ]);

    // Cập nhật lịch sử hội thoại
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: newMessage }
    ];
    setConversationHistory(updatedHistory);
    
    setNewMessage('');
    setIsTyping(true);

    try {
      // Gọi API AI để lấy phản hồi
      const aiResponse = await getAIResponse(updatedHistory);
      
      // Cập nhật lịch sử hội thoại với phản hồi của AI
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ]);
      
      // Hiển thị phản hồi
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId + 1,
          text: aiResponse,
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId + 1,
          text: "Xin lỗi, tôi đang gặp vấn đề kết nối. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua hotline 1900.xxxx.xxx.",
          isBot: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Gọi API AI để lấy phản hồi
  const getAIResponse = async (conversationHistory) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversationHistory }), // Sửa lại đúng format
      });
  
      if (!response.ok) {
        throw new Error(`Lỗi backend: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Lỗi gọi API backend:", error);
      throw error;
    }
  };
  
  
  

  // Fallback function khi không có kết nối Internet hoặc API bị lỗi
  const getFallbackResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('xin chào') || lowerMsg.includes('hello')) {
      return 'Xin chào! Tôi có thể giúp gì cho bạn về sách?';
    } 
    else if (lowerMsg.includes('sách mới') || lowerMsg.includes('sách hay')) {
      return 'Chúng tôi có nhiều sách mới và nổi bật trong tháng này. Bạn có thể xem ở trang chủ hoặc cho tôi biết thể loại bạn quan tâm?';
    }
    // Thêm các câu trả lời mặc định khác...
    else {
      return 'Cảm ơn câu hỏi của bạn. Bạn vui lòng cung cấp thêm thông tin hoặc bạn có thể gọi số hotline 1900.xxxx.xxx để được tư vấn trực tiếp.';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        aria-label="Mở chatbot hỗ trợ"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Chat Bot</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 max-w-[80%] ${
                  msg.isBot ? 'ml-0 mr-auto' : 'ml-auto mr-0'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    msg.isBot
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-3 max-w-[80%] ml-0 mr-auto">
                <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-800">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              disabled={newMessage.trim() === ''}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;