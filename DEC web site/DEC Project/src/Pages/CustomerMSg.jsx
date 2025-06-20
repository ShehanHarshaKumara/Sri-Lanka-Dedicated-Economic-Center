//customer msg Hub
import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Video, Send, Sun, Moon, Search, MoreVertical, 
  Smile, Paperclip, Mic, Star, Clock, User, Headphones, 
  AlertCircle, CheckCircle, XCircle, Filter, BarChart,
  MessageSquare, TrendingUp, Activity, Users, Archive,
  Flag, Tag, FileText, Calendar, Bot, Zap, Shield,
  Settings, Download, Upload, Copy, ExternalLink
} from 'lucide-react';

// Enhanced customer data with more details
const customers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    status: "urgent",
    priority: "high",
    lastSeen: "Active now",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c108?w=150&h=150&fit=crop&crop=face",
    lastMessage: "My order hasn't arrived yet and it's been 5 days!",
    time: "2:30 PM",
    category: "Order Issue",
    ticketId: "#12345",
    satisfaction: 3,
    responseTime: "< 2 min",
    previousTickets: 2,
    customerSince: "2022",
    totalSpent: "$2,450",
    sentiment: "negative",
    notes: "Customer is upset about delayed shipment. Offered 15% discount.",
    history: [
      { date: "2023-05-15", interaction: "Order placed", agent: "Alex" },
      { date: "2023-11-22", interaction: "Return processed", agent: "Jamie" }
    ]
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    status: "online",
    priority: "medium",
    lastSeen: "Active 2 min ago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Can you help me with product installation?",
    time: "1:45 PM",
    category: "Technical Support",
    ticketId: "#12346",
    satisfaction: 4,
    responseTime: "< 5 min",
    previousTickets: 0,
    customerSince: "2024",
    totalSpent: "$450",
    sentiment: "neutral",
    notes: "New customer needing setup assistance.",
    history: [
      { date: "2024-01-10", interaction: "First purchase", agent: "Taylor" }
    ]
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    status: "waiting",
    priority: "low",
    lastSeen: "Last seen 30 min ago",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Thank you for the quick response!",
    time: "11:20 AM",
    category: "General Inquiry",
    ticketId: "#12347",
    satisfaction: 5,
    responseTime: "< 15 min",
    previousTickets: 5,
    customerSince: "2021",
    totalSpent: "$5,200",
    sentiment: "positive",
    notes: "Loyal customer, always satisfied with service.",
    history: [
      { date: "2021-08-03", interaction: "Account created", agent: "System" },
      { date: "2022-04-12", interaction: "Premium upgrade", agent: "Casey" },
      { date: "2023-09-18", interaction: "Billing question", agent: "Alex" }
    ]
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@email.com",
    status: "urgent",
    priority: "high",
    lastSeen: "Active now",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Billing error on my account, need immediate help",
    time: "3:15 PM",
    category: "Billing",
    ticketId: "#12348",
    satisfaction: 2,
    responseTime: "< 1 min",
    previousTickets: 3,
    customerSince: "2023",
    totalSpent: "$1,800",
    sentiment: "negative",
    notes: "Double charge on credit card. Needs urgent resolution.",
    history: [
      { date: "2023-02-28", interaction: "First purchase", agent: "System" },
      { date: "2023-07-15", interaction: "Return processed", agent: "Jamie" },
      { date: "2023-12-05", interaction: "Subscription renewal", agent: "Taylor" }
    ]
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@email.com",
    status: "online",
    priority: "medium",
    lastSeen: "Active 5 min ago",
    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    lastMessage: "Looking for product recommendations",
    time: "12:30 PM",
    category: "Sales",
    ticketId: "#12349",
    satisfaction: 4,
    responseTime: "< 10 min",
    previousTickets: 1,
    customerSince: "2024",
    totalSpent: "$320",
    sentiment: "positive",
    notes: "Interested in premium products. Good upsell opportunity.",
    history: [
      { date: "2024-01-25", interaction: "First contact", agent: "Casey" }
    ]
  }
];

// Enhanced messages with more features
const initialMessages = {
  1: [
    { id: 1, sender: "Sarah Johnson", message: "Hi, I need help with my recent order. It was supposed to arrive 3 days ago.", time: "2:25 PM", isOwn: false, type: "text", status: "read" },
    { id: 2, sender: "Support Agent", message: "Hello Sarah! I'm sorry to hear about the delay. Let me check your order status right away.", time: "2:26 PM", isOwn: true, type: "text", status: "delivered" },
    { id: 3, sender: "Sarah Johnson", message: "Thank you! My order number is #ORD-2024-001234", time: "2:27 PM", isOwn: false, type: "text", status: "read" },
    { id: 4, sender: "Support Agent", message: "I've located your order. It shows that there was a shipping delay due to weather conditions. Your package is now out for delivery and should arrive today.", time: "2:28 PM", isOwn: true, type: "text", status: "delivered" },
    { id: 5, sender: "Sarah Johnson", message: "That's a relief! Will I get any compensation for the delay?", time: "2:29 PM", isOwn: false, type: "text", status: "read" },
    { id: 6, sender: "Support Agent", message: "Absolutely! I've applied a 15% discount to your account for the inconvenience. You'll also receive priority shipping on your next order.", time: "2:30 PM", isOwn: true, type: "text", status: "delivered" }
  ],
  2: [
    { id: 1, sender: "Michael Chen", message: "Hello, I'm having trouble setting up the device I purchased.", time: "1:40 PM", isOwn: false, type: "text", status: "read" },
    { id: 2, sender: "Support Agent", message: "Hi Michael! I'd be happy to help with the setup. Which step are you having trouble with?", time: "1:42 PM", isOwn: true, type: "text", status: "delivered" }
  ],
  3: [
    { id: 1, sender: "Emily Davis", message: "Just wanted to say your support team is amazing!", time: "11:15 AM", isOwn: false, type: "text", status: "read" },
    { id: 2, sender: "Support Agent", message: "Thank you Emily! We really appreciate your kind words.", time: "11:18 AM", isOwn: true, type: "text", status: "delivered" }
  ],
  4: [
    { id: 1, sender: "David Wilson", message: "I was charged twice for my subscription! This needs to be fixed immediately.", time: "3:10 PM", isOwn: false, type: "text", status: "read" }
  ],
  5: [
    { id: 1, sender: "Lisa Rodriguez", message: "Can you recommend similar products to the one I bought last month?", time: "12:25 PM", isOwn: false, type: "text", status: "read" }
  ]
};

// Canned responses for quick replies
const cannedResponses = [
  { id: 1, title: "Greeting", text: "Hello! Thank you for contacting our support team. How may I assist you today?" },
  { id: 2, title: "Order Status", text: "I'll be happy to check your order status. Could you please provide your order number?" },
  { id: 3, title: "Technical Issue", text: "I understand you're experiencing technical difficulties. Let me help you resolve this issue." },
  { id: 4, title: "Refund Process", text: "I'll initiate the refund process for you. The refund typically takes 3-5 business days to reflect in your account." },
  { id: 5, title: "Escalation", text: "I understand your concern. Let me escalate this to our senior support team for immediate attention." },
  { id: 6, title: "Closing", text: "Is there anything else I can assist you with today?" },
  { id: 7, title: "Follow Up", text: "I'll follow up with you in 24 hours to ensure everything was resolved to your satisfaction." },
  { id: 8, title: "Documentation", text: "Here's the link to our knowledge base article that might help: [insert link]" }
];

// Performance metrics
const performanceMetrics = {
  avgResponseTime: "2.5 min",
  ticketsResolved: 145,
  satisfactionScore: 4.2,
  activeChats: 8,
  queueLength: 12,
  firstContactResolution: "78%",
  todayTarget: "92%",
  avgHandleTime: "7.2 min"
};

const CustomerSupportApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [internalNote, setInternalNote] = useState('');
  const messagesEndRef = useRef(null);

  // Emojis for picker
  const emojis = ['😊', '👍', '👎', '❤', '🎉', '🤝', '📦', '💳', '🔧', '⏰', '✅', '❌'];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages[selectedCustomer.id].length + 1,
        sender: "Support Agent",
        message: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        type: "text",
        status: "sent"
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedCustomer.id]: [...prev[selectedCustomer.id], newMessage]
      }));
      
      setMessageInput('');
      
      // Simulate message delivered status
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [selectedCustomer.id]: prev[selectedCustomer.id].map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        }));
      }, 1000);

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply = {
          id: messages[selectedCustomer.id].length + 2,
          sender: selectedCustomer.name,
          message: "Thanks for your help!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          type: "text",
          status: "read"
        };
        setMessages(prev => ({
          ...prev,
          [selectedCustomer.id]: [...prev[selectedCustomer.id], autoReply]
        }));
      }, 2000);
    }
  };

  const handleAddNote = () => {
    if (internalNote.trim()) {
      const updatedCustomer = {
        ...selectedCustomer,
        notes: selectedCustomer.notes 
 ? `${selectedCustomer.notes}\n${new Date().toLocaleString()}: ${internalNote}`
 : `${new Date().toLocaleString()}: ${internalNote}`
      };
      
      setSelectedCustomer(updatedCustomer);
      setInternalNote('');
      
      // In a real app, you would update the customer in your database here
    }
  };

  const handleCannedResponse = (response) => {
    setMessageInput(response.text);
    setShowCannedResponses(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <Activity className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'online': return <User className="w-4 h-4 text-green-500" />;
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    if (isMobile) setSidebarOpen(false);
    setActiveTab('chat');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            {messages[selectedCustomer.id]?.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                    msg.isOwn
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {!msg.isOwn && (
                    <p className={`text-xs font-semibold mb-1 ${
                      darkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      {msg.sender}
                    </p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {msg.time}
                    </span>
                    {msg.isOwn && (
                      <span>
                        {msg.status === 'sent' && <Clock className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'delivered' && <CheckCircle className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-400" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex mb-4 justify-start">
                <div className={`rounded-lg p-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        );
      case 'details':
        return (
          <div className="p-4 overflow-y-auto">
            <div className={`rounded-lg p-4 mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Customer Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Name:</span> {selectedCustomer.name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Email:</span> {selectedCustomer.email}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Customer Since:</span> {selectedCustomer.customerSince}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Total Spent:</span> {selectedCustomer.totalSpent}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Previous Tickets:</span> {selectedCustomer.previousTickets}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Avg Response Time:</span> {selectedCustomer.responseTime}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Current Ticket</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Ticket ID:</span> {selectedCustomer.ticketId}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Category:</span> {selectedCustomer.category}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Priority:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedCustomer.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedCustomer.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedCustomer.priority}
                    </span>
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Status:</span> 
                    <span className="ml-1 capitalize">{selectedCustomer.status}</span>
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Sentiment:</span> 
                    <span className="ml-1 capitalize">{selectedCustomer.sentiment}</span>
                    {getSentimentIcon(selectedCustomer.sentiment)}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Satisfaction:</span>
                    <span className="flex items-center ml-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < selectedCustomer.satisfaction 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                          }
                        />
                      ))}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button className={`flex items-center justify-center p-2 rounded-lg text-sm ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}>
                  <Phone size={14} className="mr-1" /> Call
                </button>
                <button className={`flex items-center justify-center p-2 rounded-lg text-sm ${
                  darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}>
                  <Video size={14} className="mr-1" /> Video
                </button>
                <button className={`flex items-center justify-center p-2 rounded-lg text-sm ${
                  darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                } text-white`}>
                  <CheckCircle size={14} className="mr-1" /> Resolve
                </button>
                <button className={`flex items-center justify-center p-2 rounded-lg text-sm ${
                  darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}>
                  <Shield size={14} className="mr-1" /> Escalate
                </button>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-4 overflow-y-auto">
            <div className={`rounded-lg p-4 mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`font-semibold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Interaction History</h3>
              <div className="space-y-3">
                {selectedCustomer.history?.map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>{item.interaction}</p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Handled by: {item.agent}</p>
                      </div>
                      <p className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{item.date}</p>
                    </div>
                  </div>
                ))}
                {!selectedCustomer.history?.length && (
                  <p className={`text-sm italic ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No previous interactions found</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'notes':
        return (
          <div className="p-4 overflow-y-auto">
            <div className={`rounded-lg p-4 mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h3 className={`font-semibold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Internal Notes</h3>
              <div className={`mb-4 p-3 rounded-lg whitespace-pre-wrap ${
                darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
              }`}>
                {selectedCustomer.notes || 'No notes available'}
              </div>
              <div className="flex space-x-2">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add a new note..."
                  className={`flex-1 p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!internalNote.trim()}
                  className={`self-end px-4 py-2 rounded-lg ${
                    !internalNote.trim()
                      ? darkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-screen h-screen flex flex-col transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Performance Metrics Bar */}
      {showMetrics && (
        <div className={`w-full p-4 border-b transition-all duration-300 ${
          darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-md`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-6 overflow-x-auto pb-2">
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Response</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{performanceMetrics.avgResponseTime}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolved Today</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{performanceMetrics.ticketsResolved}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>CSAT Score</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>⭐ {performanceMetrics.satisfactionScore}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Chats</p>
                <p className="text-xl font-bold text-green-500">{performanceMetrics.activeChats}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Queue</p>
                <p className="text-xl font-bold text-yellow-500">{performanceMetrics.queueLength}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>FCR Rate</p>
                <p className={`text-xl font-bold ${performanceMetrics.firstContactResolution >= performanceMetrics.todayTarget ? 'text-green-500' : 'text-yellow-500'}`}>
                  {performanceMetrics.firstContactResolution}
                </p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>AHT</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{performanceMetrics.avgHandleTime}</p>
              </div>
            </div>
            <button
              onClick={() => setShowMetrics(false)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <>
            <div className={`w-full h-16 flex items-center justify-between px-4 border-b fixed top-0 left-0 z-50 transition-all duration-300 ${
              darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            } backdrop-blur-md`}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <Headphones size={20} />
              </button>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Customer Support
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <BarChart size={20} />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                      : 'bg-gray-800 text-yellow-500 hover:bg-gray-700'
                  }`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sidebar */}
        <div className={`${
          isMobile 
            ? `fixed top-16 left-0 z-40 w-full sm:w-80 h-[calc(100vh-4rem)] transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-1/3 lg:w-1/4'
        } border-r transition-all duration-300 ${
          darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-md flex flex-col`}>
          
          {/* Desktop Header */}
          {!isMobile && (
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Headphones className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Support Hub
                  </h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowMetrics(!showMetrics)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <BarChart size={18} />
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                        : 'bg-gray-800 text-yellow-500 hover:bg-gray-700'
                    }`}
                  >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                {['all', 'urgent', 'online', 'waiting'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      filterStatus === status
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                        : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className={`p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] border-l-4 ${
                  selectedCustomer.id === customer.id
                    ? (darkMode ? 'bg-blue-800/50 border-l-blue-500' : 'bg-blue-100 border-l-blue-500')
                    : `border-l-transparent ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={customer.image}
                      alt={customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(customer.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {customer.name}
                      </h3>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {customer.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        customer.priority === 'high' ? 'bg-red-100 text-red-800' :
                        customer.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.priority}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {customer.category}
                      </span>
                      {getSentimentIcon(customer.sentiment)}
                    </div>
                    <p className={`text-sm truncate mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {customer.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {customer.ticketId}
                      </p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < customer.satisfaction ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
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
          isMobile ? 'pt-16' : ''
        } ${
          darkMode ? 'bg-gray-900/50' : 'bg-white/70'
        } backdrop-blur-md`}>
          
          {/* Chat Header */}
          <div className={`p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedCustomer.image}
                    alt={selectedCustomer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon(selectedCustomer.status)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedCustomer.name}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCustomer.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedCustomer.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedCustomer.priority} priority
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedCustomer.category} • {selectedCustomer.ticketId} • Customer since {selectedCustomer.customerSince}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedCustomer.lastSeen} • Total spent: {selectedCustomer.totalSpent}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}>
                  <Phone size={18} />
                </button>
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  <Video size={18} />
                </button>
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}>
                  <Bot size={18} />
                </button>
                <button className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}>
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mt-4">
              {['chat', 'details', 'history', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Message Input (only for chat tab) */}
          {activeTab === 'chat' && (
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Canned Responses Dropdown */}
              {showCannedResponses && (
                <div className={`mb-2 rounded-lg shadow-lg overflow-hidden ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`p-2 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Quick Responses</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {cannedResponses.map(response => (
                      <div
                        key={response.id}
                        onClick={() => handleCannedResponse(response)}
                        className={`p-3 cursor-pointer hover:bg-blue-500 hover:text-white ${
                          darkMode ? 'hover:bg-blue-600' : 'hover:bg-blue-500'
                        }`}
                      >
                        <h4 className="font-medium">{response.title}</h4>
                        <p className="text-sm">{response.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className={`mb-2 p-2 rounded-lg grid grid-cols-6 gap-2 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-xl p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    onClick={() => setShowCannedResponses(!showCannedResponses)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    <Paperclip size={18} />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className={`w-full pl-4 pr-12 py-3 rounded-lg border resize-none transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex space-x-1">
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        !messageInput.trim()
                          ? darkMode
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportApp;