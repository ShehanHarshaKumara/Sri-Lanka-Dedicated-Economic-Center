import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, MessageSquareText, X, ShoppingCart, Users,
  MapPin, Star, UserRound, UserRoundPlus, Sparkle, Info,
  Crop, Zap, ShieldCheck, Plus, Sun, Moon, Settings, Leaf
} from 'lucide-react';

const DambullaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '🌾 Hi! Welcome to Dambulla Economic Centre.\nNeed help with buying, traceability, reviews, or chatting with farmers?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const messagesEndRef = useRef(null);

  // Check system preference for dark mode and store preference in localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('chatbotDarkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
    }
  }, []);

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatbotDarkMode', darkMode.toString());
  }, [darkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: ShoppingCart, text: 'How to Buy', action: 'buy', color: 'text-emerald-500' },
    { icon: MapPin, text: 'Product Origins', action: 'traceability', color: 'text-blue-500' },
    { icon: Users, text: 'Chat with Farmers', action: 'chat', color: 'text-purple-500' },
    { icon: Star, text: 'View Reviews', action: 'reviews', color: 'text-amber-500' },
    { icon: UserRoundPlus, text: 'Create Account', action: 'account', color: 'text-pink-500' },
    { icon: Sparkle, text: 'Features', action: 'features', color: 'text-yellow-500' }
  ];

  const faqResponses = [
    {
      question: "What is Dambulla DDEC?",
      answer: "The Dambulla Dedicated Economic Centre is a digital platform directly connecting farmers with customers. It eliminates middlemen to ensure fair prices while providing fresh, farm-grown produce across Sri Lanka.",
      icon: <Info className="w-4 h-4 text-blue-500" />
    },
    {
      question: "How to buy products?",
      answer: "1. Browse categories\n2. Add items to cart\n3. Place order\n4. Choose delivery address\n5. Confirm payment",
      icon: <ShoppingCart className="w-4 h-4 text-green-500" />
    },
    {
      question: "How does it help farmers?",
      answer: "• Direct customer access\n• Fair pricing (no middlemen)\n• Performance dashboards\n• Review response system\n• Market analytics",
      icon: <Crop className="w-4 h-4 text-amber-500" />
    },
    {
      question: "Can I chat with farmers?",
      answer: "Yes! Directly message farmers about product freshness, availability, and more before purchasing.",
      icon: <Users className="w-4 h-4 text-purple-500" />
    },
    {
      question: "What about product traceability?",
      answer: "Each product shows:\n• Farm name/location\n• Farmer contact\n• Harvest date\n• Growing methods",
      icon: <MapPin className="w-4 h-4 text-red-500" />
    },
    {
      question: "Future features?",
      answer: "• Real-time tracking\n• Loyalty rewards\n• AI suggestions\n• Farmer dashboards\n• Mobile apps",
      icon: <Zap className="w-4 h-4 text-yellow-500" />
    }
  ];

  const botResponses = {
    intro: "🌾 Dambulla Economic Centre is Sri Lanka's modern digital market.\nWe connect farmers directly with you—no middlemen. Want to start exploring?",
    buy: "🛒 To place an order:\n1. Browse categories or search.\n2. Add products to cart.\n3. Confirm delivery & payment.\n✅ Done!",
    traceability: "🔍 Transparency is key!\nAll products include origin info:\n• Farm name\n• Farmer info\n• Growing location",
    chat: "💬 You can chat directly with farmers before buying.\nAsk about quality, quantity, or delivery time.",
    reviews: "⭐ Read honest feedback from other buyers. After buying, you can leave your own review to help others.",
    account: "👤 Create an account to:\n• Save orders\n• Chat with farmers\n• Track your history\nChoose to register as Farmer or Customer.",
    features: "🚀 Platform Features:\n• Real-time order tracking\n• Reward systems\n• AI-based product suggestions\n• Farmer analytics dashboard",
    faq: "❓ Frequently Asked Questions\n\nSelect a question to view its answer:",
    default: "🤖 I'm here to help!\nAsk about:\n• Buying products\n• Product origins\n• Reviews\n• Creating accounts\n• New features"
  };

  const processUserMessage = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('buy') || lower.includes('order')) return 'buy';
    if (lower.includes('trace') || lower.includes('origin') || lower.includes('where')) return 'traceability';
    if (lower.includes('chat') || lower.includes('farmer')) return 'chat';
    if (lower.includes('review') || lower.includes('rating')) return 'reviews';
    if (lower.includes('account') || lower.includes('register') || lower.includes('login')) return 'account';
    if (lower.includes('feature') || lower.includes('new')) return 'features';
    if (lower.includes('platform') || lower.includes('about') || lower.includes('who')) return 'intro';
    if (lower.includes('faq') || lower.includes('question') || lower.includes('help')) return 'faq';
    return 'default';
  };

  const renderFAQAnswer = (faq) => (
    <div className={`p-3 rounded-lg mb-2 ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} border ${darkMode ? 'border-gray-700' : 'border-blue-100'}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 pt-0.5">
          {faq.icon}
        </div>
        <div>
          <h4 className={`font-medium text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{faq.question}</h4>
          <p className={`mt-1 whitespace-pre-line text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{faq.answer}</p>
        </div>
      </div>
    </div>
  );

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responseKey = processUserMessage(currentInput);
      
      if (responseKey === 'faq') {
        const botMsg = {
          id: messages.length + 2,
          type: 'bot',
          text: botResponses.faq,
          timestamp: new Date(),
          options: faqResponses.map(item => item.question)
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg = {
          id: messages.length + 2,
          type: 'bot',
          text: botResponses[responseKey],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action) => {
    if (action === 'faq') {
      const botMsg = {
        id: messages.length + 1,
        type: 'bot',
        text: botResponses.faq,
        timestamp: new Date(),
        options: faqResponses.map(item => item.question)
      };
      setMessages([...messages, botMsg]);
    } else {
      const botMsg = {
        id: messages.length + 1,
        type: 'bot',
        text: botResponses[action],
        timestamp: new Date()
      };
      setMessages([...messages, botMsg]);
    }
  };

  const handleOptionClick = (option) => {
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: option,
      timestamp: new Date()
    };
    setMessages([...messages, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const faqMatch = faqResponses.find(item => item.question === option);
      if (faqMatch) {
        const botMsg = {
          id: messages.length + 2,
          type: 'bot',
          text: '',
          custom: renderFAQAnswer(faqMatch),
          timestamp: new Date(),
          options: ['More FAQs', 'Main Menu']
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const responseKey = processUserMessage(option);
        const botMsg = {
          id: messages.length + 2,
          type: 'bot',
          text: botResponses[responseKey],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`fixed inset-0 pointer-events-none ${darkMode ? 'dark' : ''}`}>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg z-50 pointer-events-auto flex items-center justify-center transition-all duration-300 ${
          darkMode ? 'bg-emerald-700 hover:bg-emerald-600 border border-emerald-500' : 'bg-emerald-600 hover:bg-emerald-500'
        }`}
        style={{
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
        }}
        onMouseEnter={() => setShowThemeToggle(true)}
        onMouseLeave={() => setShowThemeToggle(false)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
            {/* Theme toggle that appears on hover */}
            {showThemeToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-3 h-3 text-yellow-300" />
                ) : (
                  <Moon className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-96 h-[600px] rounded-lg shadow-xl flex flex-col z-40 pointer-events-auto animate-slideIn overflow-hidden transition-colors duration-300 ${
          darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`p-3 rounded-t-lg flex items-center justify-between transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dambulla Assistant</h3>
                <p className={`text-xs flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Leaf className="inline w-3 h-3 mr-1" />
                  Your Smart Agro Guide
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={toggleTheme}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  darkMode ? 'hover:bg-gray-700/30 text-gray-300' : 'hover:bg-gray-200/70 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className={`p-1.5 rounded-md transition-colors duration-200 ${
                darkMode ? 'hover:bg-gray-700/30 text-gray-300' : 'hover:bg-gray-200/70 text-gray-600'
              }`}>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-2 border-b transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {quickActions.map(({ icon: Icon, text, action, color }, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-300 ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[90%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    msg.type === 'user' 
                      ? darkMode ? 'bg-blue-600' : 'bg-blue-500'
                      : darkMode ? 'bg-emerald-600' : 'bg-emerald-500'
                  }`}>
                    {msg.type === 'user' ? 
                      <UserRound className="w-3.5 h-3.5 text-white" /> : 
                      <Bot className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                  <div>
                    {msg.custom ? (
                      msg.custom
                    ) : (
                      <div className={`p-3 rounded-lg transition-colors duration-300 ${
                        msg.type === 'user' 
                          ? darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white'
                          : darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
                      }`}>
                        <p className={`whitespace-pre-line text-sm ${
                          msg.type === 'user' ? 'text-white' : darkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}>{msg.text}</p>
                      </div>
                    )}
                    {msg.options && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(option)}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors duration-200 ${
                              darkMode
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      msg.type === 'user' 
                        ? darkMode ? 'text-blue-300 text-right' : 'text-blue-100 text-right'
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    darkMode ? 'bg-emerald-600' : 'bg-emerald-500'
                  }`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        darkMode ? 'bg-gray-500' : 'bg-gray-400'
                      } animate-bounce`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        darkMode ? 'bg-gray-500' : 'bg-gray-400'
                      } animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        darkMode ? 'bg-gray-500' : 'bg-gray-400'
                      } animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <button className={`p-1.5 rounded-md transition-colors duration-200 ${
                darkMode ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
              }`}>
                <Plus className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 focus:bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 focus:bg-white text-gray-800 border border-gray-200 placeholder-gray-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  inputValue.trim() === ''
                    ? darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'
                    : darkMode 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className={`flex items-center justify-center mt-2 text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DambullaChatbot;