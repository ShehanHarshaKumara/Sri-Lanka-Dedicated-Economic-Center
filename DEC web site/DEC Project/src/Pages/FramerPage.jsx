import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, MapPin, Phone, Mail, Star, Wheat, Users, Award, 
  Calendar, ShoppingCart, Heart, Share2, Truck, Filter, Search,
  TrendingUp, Shield, Leaf, Clock, MessageCircle, Globe, X,
  ChevronRight, BarChart3, Package, Plus, Minus, Check,
  ArrowRight, ArrowLeft, Home, Info, Settings, LogOut, User, Menu,
  Send, Smile, Paperclip, Camera
} from 'lucide-react';
import { API_BASES } from '../config/api';

const ModernFarmerMarketplace = ({ onBack, onLogout }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [darkMode, setDarkMode] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch farmers data from backend API
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASES.farmerDirectory}/farmers`);
        if (!response.ok) {
          throw new Error('Failed to fetch farmers data');
        }
        const data = await response.json();
        
        // Transform API data to match frontend structure
        const transformedFarmers = data.map(farmer => ({
          id: farmer.user_id,
          name: farmer.full_name,
          location: `${farmer.city || 'Unknown'}, ${farmer.farming_type || 'Farm'}`,
          image: farmer.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=400&fit=crop',
          rating: 4.5, // Default rating since API doesn't provide this
          specialties: farmer.farming_type ? [farmer.farming_type] : ['Organic Farming'],
          experience: farmer.experience || '10+ years',
          farmSize: '100 acres', // Default since API doesn't provide this
          phone: farmer.phone || '+1 (555) 000-0000',
          email: farmer.email || 'farmer@example.com',
          bio: farmer.bio || 'Passionate farmer dedicated to sustainable agriculture.',
          achievements: ['Certified Organic', 'Local Farming Award'],
          followers: 500, // Default
          deliveryTime: "2-3 days",
          responseTime: "< 2 hours",
          sustainability: 90, // Default
          totalProducts: farmer.total_products || 0,
          totalOrders: 1000, // Default
          isOnline: Math.random() > 0.5, // Random online status
          lastSeen: Math.random() > 0.5 ? "Active now" : "1 hour ago",
          products: farmer.products ? farmer.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: "per item",
            image: product.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
            description: product.description || 'Fresh farm product',
            inStock: product.quantity > 0,
            harvest: "Weekly",
            category: product.category || 'Vegetables',
            rating: 4.5, // Default
            reviews: 50, // Default
            nutrients: "Rich in vitamins",
            farmingMethod: "Organic"
          })) : []
        }));
        
        setFarmers(transformedFarmers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  // Fetch single farmer details when selected
  useEffect(() => {
    if (selectedFarmer && selectedFarmer.id) {
      const fetchFarmerDetails = async () => {
        try {
          const response = await fetch(`${API_BASES.farmerDirectory}/farmers/${selectedFarmer.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch farmer details');
          }
          const data = await response.json();
          
          // Update the selected farmer with detailed data
          setSelectedFarmer(prev => ({
            ...prev,
            products: data.products ? data.products.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              unit: "per item",
              image: product.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
              description: product.description || 'Fresh farm product',
              inStock: product.quantity > 0,
              harvest: "Weekly",
              category: product.category || 'Vegetables',
              rating: 4.5,
              reviews: 50,
              nutrients: "Rich in vitamins",
              farmingMethod: "Organic"
            })) : prev.products || [],
            stats: data.stats
          }));
        } catch (err) {
          console.error('Error fetching farmer details:', err);
        }
      };

      fetchFarmerDetails();
    }
  }, [selectedFarmer?.id]);

  // Filter and sort farmers
  const filteredFarmers = farmers
    .filter(farmer => 
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'followers':
          return b.followers - a.followers;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

  const handleCardClick = (farmer) => {
    setSelectedFarmer(farmer);
    setShowMessaging(false);
    setSidebarOpen(false);
  };

  const handleBackClick = () => {
    setSelectedFarmer(null);
    setShowMessaging(false);
    setSidebarOpen(false);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleMarketplaceClick = () => {
    setSelectedFarmer(null);
    setShowMessaging(false);
    closeSidebar();
  };

  const handleMessagesClick = () => {
    if (!selectedFarmer) return;
    setShowMessaging(true);
    closeSidebar();
  };

  const toggleLike = (productId) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
  };

  const toggleCart = (productId, product) => {
    const newCart = new Map(cartItems);
    if (newCart.has(productId)) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, { product, quantity: 1 });
    }
    setCartItems(newCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = new Map(cartItems);
    if (newCart.has(productId)) {
      newCart.set(productId, { 
        ...newCart.get(productId), 
        quantity: newQuantity 
      });
      setCartItems(newCart);
    }
  };

  const sendMessage = () => {
    if (messageText.trim() && selectedFarmer) {
      const newMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
        farmerId: selectedFarmer.id
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      // Simulate farmer response
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: "Thanks for your message! I'll get back to you soon with details about our fresh produce.",
          sender: 'farmer',
          timestamp: new Date(),
          farmerId: selectedFarmer.id
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const categories = ['all', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Fruits'];

  // Enhanced theme with light green, yellow, and white
  const theme = {
    primary: darkMode ? '#22c55e' : '#16a34a',
    secondary: darkMode ? '#eab308' : '#facc15',
    background: darkMode ? '#0f172a' : 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #ffffff 100%)',
    card: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: darkMode ? '#cbd5e1' : '#64748b',
    border: darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(34, 197, 94, 0.2)',
    shadow: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(34, 197, 94, 0.1)',
  };

  const sidebarItems = [
    {
      label: 'Marketplace',
      icon: Home,
      active: !selectedFarmer && !showMessaging,
      disabled: false,
      onClick: handleMarketplaceClick
    },
    {
      label: 'Farmer Profile',
      icon: User,
      active: !!selectedFarmer && !showMessaging,
      disabled: !selectedFarmer,
      onClick: closeSidebar
    },
    {
      label: 'Messages',
      icon: MessageCircle,
      active: showMessaging,
      disabled: !selectedFarmer,
      onClick: handleMessagesClick
    }
  ];

  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: theme.card,
          borderRight: `1px solid ${theme.border}`,
          boxShadow: `0 20px 50px ${theme.shadow}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex h-full flex-col">
          <div className="border-b px-5 py-6" style={{ borderColor: theme.border }}>
            <div className="mb-4 flex items-center justify-between lg:justify-start">
              <div>
                <div
                  className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                  }}
                >
                  FarmConnect
                </div>
                <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
                  Browse farmers, open conversations, and manage your session from one place.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={closeSidebar}
                className="rounded-full p-2 transition-all hover:scale-110 lg:hidden"
                style={{ color: theme.text }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}16, ${theme.secondary}18)`,
                border: `1px solid ${theme.border}`
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}
                >
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: theme.text }}>
                    {selectedFarmer ? selectedFarmer.name : 'Marketplace Viewer'}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {selectedFarmer ? 'Farmer detail panel active' : 'Browsing all listed farmers'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-medium transition-all duration-300"
                  style={{
                    backgroundColor: item.active ? `${theme.primary}18` : 'transparent',
                    border: `1px solid ${item.active ? theme.primary : 'transparent'}`,
                    color: item.disabled ? theme.textSecondary : theme.text,
                    opacity: item.disabled ? 0.55 : 1
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: item.active ? theme.primary : theme.textSecondary }}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="space-y-3 border-t px-4 py-5" style={{ borderColor: theme.border }}>
            {onBack && (
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  onBack();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-300 hover:scale-[1.01]"
                style={{
                  backgroundColor: `${theme.secondary}18`,
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back To Customer Home</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium text-white transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: `0 12px 24px ${theme.shadow}`
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  // Messaging Component
  const MessagingView = () => {
    const farmerMessages = messages.filter(m => m.farmerId === selectedFarmer.id);
    
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ 
        background: theme.background,
        backdropFilter: 'blur(20px)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b backdrop-blur-md" style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 4px 20px ${theme.shadow}`
        }}>
          <button
            onClick={() => setShowMessaging(false)}
            className="flex items-center gap-2 text-lg font-medium transition-all hover:scale-105"
            style={{ color: theme.primary }}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedFarmer.image}
                alt={selectedFarmer.name}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: theme.primary }}
              />
              {selectedFarmer.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: theme.primary }}></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: theme.text }}>{selectedFarmer.name}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {selectedFarmer.isOnline ? 'Online' : `Last seen ${selectedFarmer.lastSeen}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-full transition-all hover:scale-110"
                style={{ color: theme.text }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 rounded-full transition-all hover:scale-110" style={{ color: theme.text }}>
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {farmerMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
                style={{ backgroundColor: `${theme.primary}20` }}>
                <MessageCircle className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
                Start a conversation
              </h3>
              <p style={{ color: theme.textSecondary }}>
                Send a message to {selectedFarmer.name} about their products
              </p>
            </div>
          ) : (
            farmerMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-lg transform transition-all hover:scale-105 ${
                  message.sender === 'user' 
                    ? 'rounded-br-md' 
                    : 'rounded-bl-md'
                }`} style={{
                  backgroundColor: message.sender === 'user' ? theme.primary : theme.card,
                  color: message.sender === 'user' ? 'white' : theme.text,
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}>
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : ''
                  }`} style={{
                    color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : theme.textSecondary
                  }}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t backdrop-blur-md" style={{
          backgroundColor: theme.card,
          borderColor: theme.border
        }}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full transition-all hover:scale-110" style={{ color: theme.textSecondary }}>
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full transition-all hover:scale-110" style={{ color: theme.textSecondary }}>
              <Camera className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${selectedFarmer.name}...`}
                className="w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  focusRingColor: theme.primary
                }}
              />
              <button 
                onClick={sendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all hover:scale-110"
                style={{ 
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button className="p-2 rounded-full transition-all hover:scale-110" style={{ color: theme.textSecondary }}>
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show messaging view
  if (showMessaging && selectedFarmer) {
    return <MessagingView />;
  }

  // Individual Farmer Profile View
  if (selectedFarmer) {
    const filteredProducts = selectedCategory === 'all' 
      ? (selectedFarmer.products || [])
      : (selectedFarmer.products || []).filter(p => p.category === selectedCategory);

    return (
      <div className="fixed inset-0 flex overflow-hidden" style={{ 
        background: theme.background,
        color: theme.text
      }}>
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md" style={{
          backgroundColor: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: `0 4px 20px ${theme.shadow}`
        }}>
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={openSidebar}
                className="rounded-full p-2 transition-all hover:scale-110 lg:hidden"
                style={{ color: theme.text }}
                title="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 transition-all hover:scale-105 transform"
                style={{ color: theme.primary }}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back to Farmers</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMessaging(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 transform shadow-lg"
                style={{ 
                  backgroundColor: theme.primary,
                  color: 'white',
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Message</span>
              </button>
              <button className="p-2 transition-all hover:scale-110 transform" style={{ color: theme.text }}>
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 transition-all hover:scale-110 transform relative" style={{ color: theme.text }}>
                <ShoppingCart className="w-5 h-5" />
                {cartItems.size > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: theme.secondary }}>
                    {cartItems.size}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section with 3D Effect */}
          <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
            <div className="absolute inset-0 transform transition-transform duration-700 hover:scale-110">
              <img 
                src={selectedFarmer.coverImage} 
                alt="Farm landscape" 
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.9)' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
              <div className="flex items-end gap-4">
                <div className="relative transform transition-all duration-300 hover:scale-110">
                  <img
                    src={selectedFarmer.image}
                    alt={selectedFarmer.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl"
                    style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                  />
                  {selectedFarmer.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white animate-pulse"
                      style={{ backgroundColor: theme.primary }}></div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{selectedFarmer.name}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedFarmer.location}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedFarmer.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="container mx-auto px-4 py-6">
            {/* About Section with 3D Cards */}
            <section className="mb-8 rounded-2xl shadow-2xl p-6 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1" style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 10px 40px ${theme.shadow}`,
              backdropFilter: 'blur(20px)'
            }}>
              <h2 className="text-xl font-bold mb-4">About the Farm</h2>
              <p className="leading-relaxed mb-6" style={{ color: theme.textSecondary }}>{selectedFarmer.bio}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Wheat className="w-5 h-5" style={{ color: theme.primary }} />
                    <span className="font-medium">Farm Size</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.farmSize}</div>
                </div>
                
                <div className="p-4 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ 
                  background: `linear-gradient(135deg, ${theme.secondary}15, ${theme.primary}15)`,
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Calendar className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    <span className="font-medium">Experience</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.experience}</div>
                </div>
                
                <div className="p-4 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Leaf className="w-5 h-5" style={{ color: theme.primary }} />
                    <span className="font-medium">Sustainability</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.sustainability}%</div>
                </div>
                
                <div className="p-4 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ 
                  background: `linear-gradient(135deg, ${theme.secondary}15, ${theme.primary}15)`,
                  boxShadow: `0 4px 15px ${theme.shadow}`
                }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                    <span className="font-medium">Followers</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.followers}</div>
                </div>
              </div>
            </section>

            {/* Achievements with 3D Effect */}
            {selectedFarmer.achievements && selectedFarmer.achievements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>Achievements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedFarmer.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.border}`,
                        backdropFilter: 'blur(10px)'
                      }}>
                      <div className="flex-shrink-0 p-2 rounded-full animate-pulse" style={{ backgroundColor: `${theme.secondary}30` }}>
                        <Award className="w-5 h-5" style={{ color: theme.secondary }} />
                      </div>
                      <div className="font-medium" style={{ color: theme.text }}>{achievement}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Products Section */}
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold" style={{ color: theme.text }}>Products</h2>
                
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'text-white shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category ? theme.primary : theme.card,
                        color: selectedCategory === category ? 'white' : theme.text,
                        border: `1px solid ${theme.border}`,
                        boxShadow: selectedCategory === category ? `0 4px 15px ${theme.shadow}` : `0 2px 8px ${theme.shadow}`
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:shadow-2xl" style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  backdropFilter: 'blur(20px)'
                }}>
                  <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.textSecondary }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>No products found</h3>
                  <p style={{ color: theme.textSecondary }}>This farmer doesn't have any products in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const isInCart = cartItems.has(product.id);
                    const cartQuantity = isInCart ? cartItems.get(product.id).quantity : 1;
                    
                    return (
                      <div key={product.id} className="rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105"
                        style={{
                          backgroundColor: theme.card,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 10px 30px ${theme.shadow}`,
                          backdropFilter: 'blur(20px)'
                        }}>
                        {/* Product Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-1 text-white text-xs rounded-full font-medium backdrop-blur-md"
                              style={{ backgroundColor: `${theme.primary}CC` }}>
                              {product.category}
                            </span>
                            {product.farmingMethod && (
                              <span className="px-2 py-1 text-white text-xs rounded-full font-medium backdrop-blur-md"
                                style={{ backgroundColor: `${theme.secondary}CC` }}>
                                {product.farmingMethod}
                              </span>
                            )}
                          </div>
                          
                          {/* Like Button */}
                          <button 
                            onClick={() => toggleLike(product.id)}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              likedProducts.has(product.id) 
                                ? 'bg-red-500 text-white shadow-lg' 
                                : 'backdrop-blur-md shadow-md'
                            }`}
                            style={{
                              backgroundColor: likedProducts.has(product.id) ? '#ef4444' : `${theme.card}CC`,
                              color: likedProducts.has(product.id) ? 'white' : theme.text
                            }}
                          >
                            <Heart className="w-5 h-5" fill={likedProducts.has(product.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold" style={{ color: theme.text }}>{product.name}</h3>
                            <div className="text-right">
                              <span className="text-xl font-bold" style={{ color: theme.primary }}>${product.price}</span>
                              <div className="text-xs" style={{ color: theme.textSecondary }}>{product.unit}</div>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium" style={{ color: theme.text }}>{product.rating}</span>
                              <span className="text-xs ml-1" style={{ color: theme.textSecondary }}>({product.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: theme.textSecondary }}>
                              <Truck className="w-3 h-3" />
                              <span>{product.harvest}</span>
                            </div>
                          </div>
                          
                          {/* Quantity Selector */}
                          {isInCart ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-lg shadow-md" style={{ 
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.card
                              }}>
                                <button 
                                  onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                                  className="px-3 py-2 transition-all hover:scale-110 transform"
                                  style={{ color: theme.text }}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-2 font-medium" style={{ color: theme.text }}>{cartQuantity}</span>
                                <button 
                                  onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                                  className="px-3 py-2 transition-all hover:scale-110 transform"
                                  style={{ color: theme.text }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => toggleCart(product.id)}
                                className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-white shadow-lg"
                                style={{ backgroundColor: theme.primary }}
                              >
                                <Check className="w-4 h-4" />
                                Added
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => toggleCart(product.id, product)}
                              disabled={!product.inStock}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center gap-2 shadow-lg ${
                                product.inStock
                                  ? 'hover:shadow-2xl'
                                  : 'cursor-not-allowed opacity-50'
                              }`}
                              style={{
                                backgroundColor: product.inStock ? theme.secondary : theme.border,
                                color: product.inStock ? 'white' : theme.textSecondary
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ 
        background: theme.background,
        color: theme.text
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Farmers...</h2>
          <p style={{ color: theme.textSecondary }}>Connecting you with local farmers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ 
        background: theme.background,
        color: theme.text
      }}>
        <div className="text-center p-6 rounded-xl shadow-xl" style={{ 
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`
        }}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="mb-4" style={{ color: theme.textSecondary }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: theme.primary,
              color: 'white'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Farmers List View
  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ 
      background: theme.background,
      color: theme.text
    }}>
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{
        backgroundColor: theme.card,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: `0 4px 20px ${theme.shadow}`
      }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={openSidebar}
                className="rounded-full p-2 transition-all hover:scale-110 lg:hidden"
                style={{ color: theme.text }}
                title="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 p-2 rounded-full transition-all hover:scale-110 transform"
                  style={{ 
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Back</span>
                </button>
              )}
              
              <h1 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent" 
                style={{ 
                  backgroundImage: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                }}>
                🌱 FarmConnect
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 transition-all hover:scale-110 transform rounded-full"
                onClick={() => setDarkMode(!darkMode)}
                style={{ color: theme.text }}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button className="p-2 relative transition-all hover:scale-110 transform rounded-full" style={{ color: theme.text }}>
                <ShoppingCart className="w-5 h-5" />
                {cartItems.size > 0 && (
                  <span className="absolute top-0 right-0 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce"
                    style={{ backgroundColor: theme.secondary }}>
                    {cartItems.size}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
            <input
              type="text"
              placeholder="Search farmers, products, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 shadow-lg backdrop-blur-md"
              style={{
                backgroundColor: `${theme.card}CC`,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                focusRingColor: theme.primary
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Hero Banner with 3D Effect */}
          <div className="relative rounded-2xl overflow-hidden mb-8 h-48 sm:h-56 transform transition-all duration-300 hover:scale-105" style={{
            boxShadow: `0 20px 50px ${theme.shadow}`
          }}>
            <img 
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=400&fit=crop" 
              alt="Farm landscape"
              className="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 flex items-center p-6">
              <div className="max-w-lg transform transition-all duration-500 hover:scale-105">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 drop-shadow-lg">Fresh From the Farm</h2>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg drop-shadow leading-relaxed">Connect directly with local farmers for the freshest produce and build sustainable communities together</p>
              </div>
            </div>
          </div>

          {/* Categories with 3D Cards */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.filter(c => c !== 'all').map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-2xl shadow-lg p-6 flex flex-col items-center transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-2 hover:scale-105"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`,
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transform transition-all duration-300 hover:rotate-12"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`
                    }}>
                    {category === 'Vegetables' && <Leaf className="w-8 h-8" style={{ color: theme.primary }} />}
                    {category === 'Dairy' && <Wheat className="w-8 h-8" style={{ color: '#d97706' }} />}
                    {category === 'Grains' && <Package className="w-8 h-8" style={{ color: '#2563eb' }} />}
                    {category === 'Meat' && <TrendingUp className="w-8 h-8" style={{ color: '#dc2626' }} />}
                    {category === 'Fruits' && <Globe className="w-8 h-8" style={{ color: '#ea580c' }} />}
                  </div>
                  <span className="font-semibold text-lg" style={{ color: theme.text }}>{category}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Farmers List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Featured Farmers</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300 shadow-lg backdrop-blur-md"
                style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  focusRingColor: theme.primary
                }}
              >
                <option value="rating">⭐ Top Rated</option>
                <option value="followers">👥 Most Popular</option>
                <option value="experience">🎯 Most Experienced</option>
              </select>
            </div>

            {filteredFarmers.length === 0 ? (
              <div className="rounded-2xl shadow-lg p-12 text-center transform transition-all duration-300 hover:shadow-2xl" style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`,
                backdropFilter: 'blur(20px)'
              }}>
                <User className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>No farmers found</h3>
                <p style={{ color: theme.textSecondary }}>Try adjusting your search or filters to discover amazing local farmers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="flex">
                      {/* Farmer Image */}
                      <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative overflow-hidden">
                        <img
                          src={farmer.image}
                          alt={farmer.name}
                          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                        {farmer.isOnline && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white animate-pulse"
                            style={{ backgroundColor: theme.primary }}></div>
                        )}
                      </div>
                      
                      {/* Farmer Info */}
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold" style={{ color: theme.text }}>{farmer.name}</h3>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full shadow-md transform transition-all duration-300 hover:scale-105"
                            style={{ 
                              background: `linear-gradient(45deg, ${theme.primary}20, ${theme.secondary}20)`
                            }}>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold" style={{ color: theme.text }}>{farmer.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{farmer.location}</span>
                          <span className="mx-2">•</span>
                          <span>{farmer.isOnline ? '🟢 Online' : `⏰ ${farmer.lastSeen}`}</span>
                        </div>
                        
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.textSecondary }}>
                          {farmer.bio.substring(0, 120)}...
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {farmer.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                              style={{ 
                                backgroundColor: `${theme.primary}15`,
                                color: theme.primary,
                                border: `1px solid ${theme.primary}30`
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 flex justify-between items-center"
                      style={{
                        backgroundColor: `${theme.primary}08`,
                        borderTop: `1px solid ${theme.border}`
                      }}>
                      <div className="flex items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{farmer.followers} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{farmer.responseTime} response</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFarmer(farmer);
                            setShowMessaging(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          style={{ 
                            backgroundColor: theme.primary,
                            color: 'white'
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Message</span>
                        </button>
                        <button 
                          onClick={() => handleCardClick(farmer)}
                          className="font-medium flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                          style={{ 
                            color: theme.primary,
                            backgroundColor: `${theme.primary}15`
                          }}>
                          <span>View Profile</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      </div>
    </div>
  );
};

export default ModernFarmerMarketplace;
