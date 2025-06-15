import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Users, MapPin, Star, User, Bot } from 'lucide-react';

const DambullaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Welcome to the Dambulla Dedicated Economic Centre! 🌾 How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: ShoppingCart, text: 'How to Buy', action: 'buy' },
    { icon: MapPin, text: 'Product Origin', action: 'traceability' },
    { icon: Users, text: 'Chat with Farmers', action: 'chat' },
    { icon: Star, text: 'Reviews', action: 'reviews' }
  ];

  const botResponses = {
    intro: "Welcome to the Dambulla Dedicated Economic Centre! 🌾\nWe are a digital marketplace connecting local farmers directly with customers like you—no middlemen involved. You get fresh, traceable agricultural products while supporting Sri Lankan farmers. Would you like to browse products or learn how to order?",
    
    buy: "🛒 Here's how you can place an order:\n1. Browse products using categories or search.\n2. Click 'Add to Cart' on the product you want.\n3. Go to your Cart and click 'Place Order.'\n4. Choose your delivery address and confirm the payment.\n5. Once done, you'll receive a confirmation. You'll even be able to track your delivery in real-time soon!\n\nWould you like to start shopping now?",
    
    traceability: "Great question! Every product on our platform includes traceability details like:\n• The farm name\n• The location of origin\n• Farmer contact information\n\nWe believe in transparency and trust, so you know exactly what you're buying—and who you're supporting.\n\nWould you like to see some examples?",
    
    chat: "Yes! You can chat directly with the farmers before purchasing. 🤝\nAsk about freshness, quantity, delivery time, or anything you need.\n\nWould you like to connect with a farmer now?",
    
    reviews: "Our customers help keep standards high! 🏆\nYou can read ratings and reviews left by other buyers—and leave your own after purchasing.\n\nWant me to show you top-rated products?",
    
    account: "Yes, creating an account helps us:\n• Manage your orders\n• Enable chat with farmers\n• Secure your purchase history\n\nYou can register as a Customer or Farmer in a few simple steps. Shall I take you to the registration page?",
    
    features: "Yes! 🚀 We're working on:\n• Real-time delivery tracking\n• Loyalty & reward points\n• AI-based product recommendations\n• Farmer dashboards with analytics\n\nWould you like to receive updates when new features go live?",
    
    default: "I'm here to help! You can ask me about:\n• How to buy products\n• Product traceability\n• Chatting with farmers\n• Customer reviews\n• Account registration\n• Upcoming features\n\nWhat would you like to know?"
  };

  const processUserMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('buy') || lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      return 'buy';
    } else if (lowerMessage.includes('trace') || lowerMessage.includes('origin') || lowerMessage.includes('where')) {
      return 'traceability';
    } else if (lowerMessage.includes('chat') || lowerMessage.includes('farmer') || lowerMessage.includes('contact')) {
      return 'chat';
    } else if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('quality')) {
      return 'reviews';
    } else if (lowerMessage.includes('account') || lowerMessage.includes('register') || lowerMessage.includes('login')) {
      return 'account';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('new') || lowerMessage.includes('upcoming')) {
      return 'features';
    } else if (lowerMessage.includes('platform') || lowerMessage.includes('about') || lowerMessage.includes('what')) {
      return 'intro';
    }
    return 'default';
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const responseKey = processUserMessage(currentInput);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponses[responseKey],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    const botMessage = {
      id: messages.length + 1,
      type: 'bot',
      text: botResponses[action],
      timestamp: new Date()
    };
    setMessages([...messages, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 pointer-events-auto"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-40 pointer-events-auto animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dambulla Assistant</h3>
                <p className="text-sm opacity-90">Fresh produce, direct from farmers</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 border-b overflow-x-auto">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full text-sm whitespace-nowrap transition-colors"
                >
                  <IconComponent size={16} />
                  {action.text}
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DambullaChatbot;