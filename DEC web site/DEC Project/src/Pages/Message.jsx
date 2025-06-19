import React, { useState, useEffect } from 'react';
import { Phone, Video, Send, Sun, Moon, Search, MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';

// Sample farmer data
const farmers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    designation: "Rice Farmer",
    location: "Punjab, India",
    status: "online",
    lastSeen: "Active now",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    lastMessage: "The rice harvest is looking good this season!",
    time: "2:30 PM"
  },
  {
    id: 2,
    name: "Maria Santos",
    designation: "Organic Vegetable Farmer",
    location: "California, USA",
    status: "online",
    lastSeen: "Active 5 min ago",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c108?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Need help with pest control for tomatoes",
    time: "1:45 PM"
  },
  {
    id: 3,
    name: "James Mitchell",
    designation: "Dairy Farmer",
    location: "Wisconsin, USA",
    status: "offline",
    lastSeen: "Last seen 2 hours ago",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Milk production is up 15% this month",
    time: "11:20 AM"
  },
  {
    id: 4,
    name: "Priya Patel",
    designation: "Wheat Farmer",
    location: "Gujarat, India",
    status: "online",
    lastSeen: "Active now",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Weather forecast looks concerning...",
    time: "3:15 PM"
  },
  {
    id: 5,
    name: "Ahmed Hassan",
    designation: "Date Palm Farmer",
    location: "Egypt",
    status: "away",
    lastSeen: "Active 1 hour ago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Date harvest season is starting soon",
    time: "12:30 PM"
  },
  {
    id: 6,
    name: "Sarah Johnson",
    designation: "Fruit Farm Owner",
    location: "Florida, USA",
    status: "online",
    lastSeen: "Active now",
    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Orange prices are looking good this year",
    time: "4:00 PM"
  }
];

const messages = [
  { id: 1, sender: "Rajesh Kumar", message: "Hey everyone! How's the harvest season going?", time: "2:30 PM", isOwn: false },
  { id: 2, sender: "You", message: "Going well! Just finished harvesting the corn. Yield is better than expected.", time: "2:32 PM", isOwn: true },
  { id: 3, sender: "Maria Santos", message: "That's great news! I'm dealing with some pest issues on my tomatoes. Any organic solutions?", time: "2:35 PM", isOwn: false },
  { id: 4, sender: "You", message: "Try neem oil spray. It works wonders for organic pest control.", time: "2:36 PM", isOwn: true },
  { id: 5, sender: "Priya Patel", message: "Weather forecast shows rain for next week. Good for the crops!", time: "2:40 PM", isOwn: false },
  { id: 6, sender: "You", message: "Perfect timing! My wheat needs some water.", time: "2:42 PM", isOwn: true }
];

const AnimatedTooltip = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="flex items-center space-x-2">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-full border-2 border-green-500 transition-all duration-300 hover:scale-110 cursor-pointer"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              item.status === 'online' ? 'bg-green-500' : 
              item.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>
          
          {hoveredIndex === idx && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap z-10 animate-pulse">
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs opacity-80">{item.designation}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const FarmersChatApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(farmers[0]);
  const [messageInput, setMessageInput] = useState('');
  const [newMessages, setNewMessages] = useState(messages);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ===== VIEWPORT SETUP & EVENT LISTENERS =====
  useEffect(() => {
    // Set full viewport height and remove default margins/padding
    const setFullViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'auto';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      
      // Check if mobile
      setIsMobile(window.innerWidth < 768);
    };

    setFullViewport();
    window.addEventListener('resize', setFullViewport);

    // Performance optimization for smooth animations
    document.documentElement.style.scrollBehavior = 'smooth';

    // Cleanup
    return () => {
      window.removeEventListener('resize', setFullViewport);
    };
  }, []);

  // ===== RESPONSIVE CONTAINER STYLES =====
  const containerStyles = {
    margin: 0, 
    padding: 0,
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    overflowX: 'hidden'
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: newMessages.length + 1,
        sender: "You",
        message: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setNewMessages([...newMessages, newMessage]);
      setMessageInput('');
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      style={containerStyles}
      className={`transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-green-900' 
          : 'bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50'
      }`}
    >
      <div className="w-full h-full flex relative">
        {/* Mobile Header */}
        {isMobile && (
          <div className={`w-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b fixed top-0 left-0 z-50 transition-all duration-300 ${
            darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
          } backdrop-blur-md`}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              <Search size={16} />
            </button>
            <h1 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="hidden sm:inline">Farmers Chat</span>
              <span className="sm:hidden">Chat</span>
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                  : 'bg-gray-800 text-yellow-500 hover:bg-gray-700'
              }`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}

        {/* Sidebar */}
        <div className={`${
          isMobile 
            ? `fixed top-14 left-0 z-40 w-full sm:w-80 h-[calc(100vh-3.5rem)] transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-full md:w-1/3 lg:w-1/3 xl:w-1/4'
        } border-r transition-all duration-300 ${
          darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-md flex flex-col`}>
          {/* Desktop Header */}
          {!isMobile && (
            <div className={`p-3 sm:p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <span className="hidden sm:inline">Farmers Chat</span>
                  <span className="sm:hidden">Chat</span>
                </h1>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                      : 'bg-gray-800 text-yellow-500 hover:bg-gray-700'
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border transition-all duration-300 text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                />
              </div>
            </div>
          )}

          {/* Mobile Search */}
          {isMobile && (
            <div className={`p-3 sm:p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                />
              </div>
            </div>
          )}

          {/* Online Farmers Tooltip */}
          <div className={`p-3 sm:p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Online Farmers
            </h3>
            <AnimatedTooltip items={farmers.filter(f => f.status === 'online')} />
          </div>

          {/* Farmers List */}
          <div className="flex-1 overflow-y-auto">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                onClick={() => {
                  setSelectedFarmer(farmer);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedFarmer.id === farmer.id
                    ? (darkMode ? 'bg-green-800/50' : 'bg-green-100')
                    : (darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <img
                      src={farmer.image}
                      alt={farmer.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
                      }}
                    />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                      darkMode ? 'border-gray-800' : 'border-white'
                    } ${
                      farmer.status === 'online' ? 'bg-green-500' : 
                      farmer.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm sm:text-base font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {farmer.name}
                      </h3>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {farmer.time}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {farmer.designation}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {farmer.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'pt-14' : ''
        } ${
          darkMode ? 'bg-gray-900/50' : 'bg-white/70'
        } backdrop-blur-md h-full`}>
          {/* Chat Header */}
          <div className={`p-3 sm:p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <img
                    src={selectedFarmer.image}
                    alt={selectedFarmer.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
                    }}
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                    darkMode ? 'border-gray-900' : 'border-white'
                  } ${
                    selectedFarmer.status === 'online' ? 'bg-green-500' : 
                    selectedFarmer.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-sm sm:text-base lg:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedFarmer.name}
                  </h2>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="lg:hidden">{selectedFarmer.designation}</span>
                    <span className="hidden lg:inline">{selectedFarmer.designation} • {selectedFarmer.location}</span>
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedFarmer.lastSeen}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}>
                  <Phone size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  <Video size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}>
                  <MoreVertical size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
            {newMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    message.isOwn
                      ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
                      : (darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                  }`}
                >
                  {!message.isOwn && (
                    <p className={`text-xs font-semibold mb-1 ${
                      darkMode ? 'text-green-300' : 'text-green-600'
                    }`}>
                      {message.sender}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn 
                      ? 'text-green-100' 
                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className={`p-3 sm:p-4 lg:p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                <Paperclip size={16} className="sm:w-5 sm:h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-full border transition-all duration-300 text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                />
                <button className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}>
                  <Smile size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              <button className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                <Mic size={16} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Send size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmersChatApp;