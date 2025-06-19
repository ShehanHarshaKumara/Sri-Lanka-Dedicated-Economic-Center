import { useState, useEffect } from 'react';
import { 
  FaTractor, FaPlus, FaEdit, FaTrash, FaEye, FaBell, FaChartBar, FaShoppingCart, 
  FaMapMarkerAlt, FaStar, FaUpload, FaCamera, FaTimes, FaCheck, FaLeaf, FaUser, 
  FaBars, FaHome, FaBox, FaClipboardList, FaUsers, FaCog, FaSignOutAlt, FaRupeeSign, 
  FaCalendar, FaWeight, FaTag, FaImage, FaSave, FaSpinner, FaEllipsisV, FaArrowRight,
  FaChevronRight, FaWallet, FaSeedling, FaCloudSun, FaTruck, FaHandshake, FaSearch,
  FaFilter, FaSort, FaDownload, FaPrint, FaShare, FaHeart, FaComment, FaPhoneAlt,
  FaEnvelope, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaQuestionCircle,
  FaExclamationTriangle, FaInfoCircle, FaLightbulb, FaMedal, FaTrophy, FaAward, FaBug, FaTint,
  FaChartLine, FaHandHoldingUsd
} from 'react-icons/fa';

const ModernFarmerPortal = ({ user, onLogout }) => {
  // Full viewport setup
  useEffect(() => {
    const setFullViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'auto';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
    };

    setFullViewport();
    window.addEventListener('resize', setFullViewport);
    return () => window.removeEventListener('resize', setFullViewport);
  }, []);

  // State Management
  const [currentUser] = useState({
    id: user?.id || 1,
    name: user?.name || 'Rajitha Perera',
    email: user?.email || 'rajitha.farmer@gmail.com',
    location: user?.location || 'Galle District',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    farmSize: user?.farmSize || '15 acres',
    joinDate: user?.joinDate || '2022-03-15',
    phone: '+94 77 123 4567',
    crops: ['Tea', 'Cinnamon', 'Pepper', 'Coconut'],
    certifications: ['Organic Certified', 'Fair Trade'],
    rating: 4.8,
    totalSales: 1250,
    badge: 'Gold Farmer'
  });

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: '', stock: '', unit: '', description: '', 
    images: [], status: 'active', organic: false, featured: false
  });
  
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Data Arrays
  const categories = [
    'Fresh Produce', 'Spices', 'Grains', 'Fruits', 'Vegetables', 
    'Herbs', 'Dairy', 'Coconut Products', 'Tea', 'Other'
  ];
  
  const units = ['kg', 'g', 'pieces', 'liters', 'ml', 'bunches', 'bags', 'dozens'];

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order for King Coconuts - 50 pieces', time: '2 hours ago', type: 'order', icon: FaShoppingCart, read: false },
    { id: 2, message: 'Your Cinnamon listing was approved', time: '1 day ago', type: 'approval', icon: FaCheck, read: false },
    { id: 3, message: 'Weather alert: Heavy rain expected tomorrow', time: '3 hours ago', type: 'weather', icon: FaCloudSun, read: true },
    { id: 4, message: 'You earned a Gold Badge!', time: '2 days ago', type: 'achievement', icon: FaTrophy, read: true },
    { id: 5, message: 'Price alert: Tea prices increased by 15%', time: '4 hours ago', type: 'price', icon: FaChartBar, read: false }
  ]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'products', label: 'My Products', icon: FaBox },
    { id: 'orders', label: 'Orders', icon: FaClipboardList },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar }
  ];

  const quickStats = [
    { label: 'Today\'s Orders', value: '12', change: '+3 from yesterday', positive: true },
    { label: 'Pending Deliveries', value: '5', change: 'Due today', positive: false },
    { label: 'Low Stock Items', value: '3', change: 'Restock needed', positive: false },
    { label: 'Customer Messages', value: '8', change: 'Unread', positive: true }
  ];

  // Mock weather data
  const weatherData = {
    temp: 28,
    condition: 'Partly Cloudy',
    humidity: 75,
    rainfall: '2mm expected',
    forecast: 'Good for harvesting',
    icon: '☁️'
  };

  // Initialize with mock products
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
        setShowDropdownId(null);
      }
      if (!event.target.closest('.notification-panel') && !event.target.closest('.notification-trigger')) {
        setShowNotifications(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    fetchProducts();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    // Simulated products with Sri Lankan agricultural items
    setProducts([
      { 
        id: 1, name: 'Fresh Tomatoes', price: 80, category: 'Vegetables', 
        quantity: 50, unit: 'kg', status: 'active', sales: 120, views: 450, 
        image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&h=300&fit=crop', 
        description: 'Fresh organic tomatoes from Galle farms', rating: 4.5, 
        featured: true, organic: true
      },
      { 
        id: 2, name: 'Ceylon Cinnamon', price: 2500, category: 'Spices', 
        quantity: 20, unit: 'kg', status: 'active', sales: 45, views: 230, 
        image_url: 'https://images.unsplash.com/photo-1563743983221-8fa7caa49e8d?w=400&h=300&fit=crop', 
        description: 'Premium quality Ceylon cinnamon sticks', rating: 4.9,
        featured: true, organic: true
      },
      { 
        id: 3, name: 'King Coconuts', price: 60, category: 'Coconut Products', 
        quantity: 200, unit: 'pieces', status: 'active', sales: 350, views: 890, 
        image_url: 'https://images.unsplash.com/photo-1560769680-ba2f3767c785?w=400&h=300&fit=crop', 
        description: 'Fresh king coconuts, rich in electrolytes', rating: 4.7,
        featured: false, organic: true
      },
      {
        id: 4, name: 'Ceylon Tea', price: 800, category: 'Tea',
        quantity: 30, unit: 'kg', status: 'active', sales: 200, views: 560,
        image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop',
        description: 'Premium Ceylon black tea from Nuwara Eliya', rating: 4.8,
        featured: true, organic: false
      }
    ]);
  };

  // Calculate dashboard statistics
  const dashboardStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalSales: products.reduce((sum, p) => sum + (p.sales || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.sales || 0)), 0),
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    avgRating: (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [];
    const newPreviews = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(file);
        newPreviews.push(imageUrl);
      }
    });
    
    setProductForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setProductForm(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Validation
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock || !productForm.unit || !productForm.description) {
      setFormError('Please fill in all required fields');
      setIsUploading(false);
      return;
    }
    
    // Simulate upload
    setTimeout(() => {
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({ 
        name: '', price: '', category: '', stock: '', unit: '', 
        description: '', images: [], status: 'active', organic: false, featured: false 
      });
      setPreviewImages([]);
      setFormError('');
      showSuccessNotification(editingProduct ? 'Product updated successfully!' : 'Product uploaded successfully!');
      setIsUploading(false);
      fetchProducts();
    }, 1500);
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      price: product.price ? product.price.toString() : '',
      category: product.category || '',
      stock: product.quantity ? product.quantity.toString() : '',
      unit: product.unit || 'kg',
      description: product.description || '',
      images: [],
      status: product.status || 'active',
      organic: product.organic || false,
      featured: product.featured || false
    });
    setPreviewImages(product.image_url ? [product.image_url] : []);
    setShowAddProduct(true);
  };

  const deleteProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccessNotification(`Product "${product.name}" deleted successfully!`);
      setShowDropdownId(null);
    }
  };

  const toggleProductStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showSuccessNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.id - a.id;
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'popular': return b.views - a.views;
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" 
         style={{ margin: 0, padding: 0, width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Modern Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 lg:hidden"
              >
                <FaBars className="text-emerald-700 text-lg" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <FaTractor className="text-white text-xl sm:text-2xl" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">Sri Lankan Farmer Portal</span>
                    <span className="sm:hidden">Farmer Portal</span>
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Grow. Connect. Prosper.</p>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="notification-trigger relative p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 group"
                >
                  <FaBell className="text-emerald-700 text-base sm:text-lg group-hover:animate-wiggle" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="notification-panel absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-emerald-100 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <button 
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`flex items-start space-x-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer ${
                              !notif.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'order' ? 'bg-blue-100 text-blue-600' :
                              notif.type === 'approval' ? 'bg-green-100 text-green-600' :
                              notif.type === 'weather' ? 'bg-orange-100 text-orange-600' :
                              notif.type === 'achievement' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <notif.icon className="text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Section */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600">{currentUser.location}</p>
                </div>
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl ring-2 ring-emerald-500/30 hover:ring-emerald-500 transition-all cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 sm:pt-20 w-full min-h-screen">
        {/* Modern Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 transition-all duration-500 ${
          sidebarOpen ? 'w-64 xl:w-72' : 'w-0 lg:w-20'
        } bg-white/80 backdrop-blur-lg border-r border-emerald-100 shadow-xl`}>
          <div className="h-full overflow-y-auto pt-20 pb-6">
            <nav className="px-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center mb-2 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <item.icon className={`text-lg transition-all duration-300 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <FaChevronRight className="ml-auto text-sm" />
                      )}
                    </>
                  )}
                </button>
              ))}
            </nav>
            
            {/* Sidebar Footer */}
            <div className="absolute bottom-4 left-0 right-0 px-3">
              <button 
                onClick={onLogout}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 ${
                  sidebarOpen ? '' : 'justify-center'
                }`}
              >
                <FaSignOutAlt className={`text-lg ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Hero Section */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 lg:p-8 text-white shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                      <div>
                        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">
                          Welcome back, {currentUser.name}! 👋
                        </h1>
                        <p className="text-emerald-100 text-sm lg:text-base mb-4">
                          Your farm is thriving! Let's check today's progress.
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                          {quickStats.map((stat, index) => (
                            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                              <p className="text-2xl font-bold">{stat.value}</p>
                              <p className="text-xs text-emerald-100">{stat.label}</p>
                              <p className={`text-xs mt-1 ${stat.positive ? 'text-green-300' : 'text-yellow-300'}`}>
                                {stat.change}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setShowAddProduct(true)}
                          className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" /> Add Product
                        </button>
                      </div>
                    </div>
                    
                    {/* Weather Widget */}
                    <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{weatherData.icon}</div>
                          <div>
                            <p className="text-sm">Today's Weather</p>
                            <p className="text-xl font-semibold">{weatherData.temp}°C, {weatherData.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Humidity: {weatherData.humidity}%</p>
                          <p className="text-sm">{weatherData.rainfall}</p>
                          <p className="text-sm font-semibold text-green-300">{weatherData.forecast}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.certifications.map((cert, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center">
                            <FaMedal className="mr-1" /> {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    { 
                      title: 'Total Products', 
                      value: dashboardStats.totalProducts, 
                      icon: FaBox, 
                      color: 'from-blue-500 to-indigo-600', 
                      trend: '+12%',
                      subtitle: 'Active listings'
                    },
                    { 
                      title: 'Total Sales', 
                      value: dashboardStats.totalSales, 
                      icon: FaShoppingCart, 
                      color: 'from-purple-500 to-pink-600', 
                      trend: '+25%',
                      subtitle: 'This month'
                    },
                    { 
                      title: 'Revenue', 
                      value: `Rs.${(dashboardStats.totalRevenue / 1000).toFixed(1)}K`, 
                      icon: FaWallet, 
                      color: 'from-orange-500 to-red-600', 
                      trend: '+18%',
                      subtitle: 'Total earnings'
                    },
                    { 
                      title: 'Customer Rating', 
                      value: dashboardStats.avgRating, 
                      icon: FaStar, 
                      color: 'from-yellow-500 to-amber-600', 
                      trend: '+0.3',
                      subtitle: 'Average rating'
                    }
                  ].map((stat, index) => (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg transform transition-transform duration-500 ${
                            hoveredCard === index ? 'scale-110 rotate-6' : ''
                          }`}>
                            <stat.icon className="text-white text-xl" />
                          </div>
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                            {stat.trend}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">{stat.title}</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  {[
                    { 
                      icon: FaTruck, 
                      title: 'Track Deliveries', 
                      desc: '3 orders in transit', 
                      color: 'from-blue-500 to-cyan-600',
                      action: () => setActiveTab('orders')
                    },
                    { 
                      icon: FaChartBar, 
                      title: 'View Analytics', 
                      desc: 'Weekly report ready', 
                      color: 'from-orange-500 to-pink-600',
                      action: () => setActiveTab('analytics')
                    },
                    { 
                      icon: FaBox, 
                      title: 'Manage Products', 
                      desc: 'Update your listings', 
                      color: 'from-green-500 to-emerald-600',
                      action: () => setActiveTab('products')
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative z-10 group-hover:text-white transition-colors duration-500">
                        <action.icon className="text-3xl mb-3" />
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <p className="text-sm opacity-80">{action.desc}</p>
                        <FaArrowRight className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Featured Products Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Featured Products</h2>
                      <p className="text-gray-600 text-sm mt-1">Your top performing products</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center group"
                    >
                      View All <FaChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="relative overflow-hidden">
                    <div className="flex space-x-4 animate-scroll-x hover:pause">
                      {[...products.filter(p => p.featured), ...products.filter(p => p.featured)].map((product, index) => (
                        <div
                          key={`${product.id}-${index}`}
                          className="flex-shrink-0 w-64 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {product.organic && (
                              <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs rounded-lg flex items-center">
                                <FaLeaf className="mr-1 text-xs" /> Organic
                              </span>
                            )}
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                              product.status === 'active' 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-400 text-white'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                              <p className="text-emerald-600 font-bold flex items-center">
                                <FaRupeeSign className="mr-1" /> {product.price}
                                <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center">
                                <FaStar className="text-yellow-400 text-xs mr-1" />
                                <span className="text-xs font-medium">{product.rating}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.sales} sold
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Products</h1>
                    <p className="text-gray-600">Manage your farm products and listings</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setShowAddProduct(true);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Product
                  </button>
                </div>

                {/* Products Filter/Search Bar */}
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      
                      <select
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                      </select>
                      
                      <button className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                        <FaFilter /> Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">No products found</h3>
                      <p className="text-gray-500 mt-2">Try adjusting your search or add a new product</p>
                      <button 
                        onClick={() => setShowAddProduct(true)}
                        className="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
                      >
                        <FaPlus className="mr-2" /> Add Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group relative"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Product Badges */}
                          <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
                            {product.organic && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-lg flex items-center">
                                <FaLeaf className="mr-1" /> Organic
                              </span>
                            )}
                            {product.featured && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-lg flex items-center">
                                <FaStar className="mr-1" /> Featured
                              </span>
                            )}
                          </div>
                          
                          {/* Status Dropdown */}
                          <div className="absolute top-3 right-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdownId(showDropdownId === product.id ? null : product.id);
                              }}
                              className="dropdown-trigger p-1 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                            >
                              <FaEllipsisV className="text-gray-600" />
                            </button>
                            
                            {showDropdownId === product.id && (
                              <div className="dropdown-menu absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
                                <button 
                                  onClick={() => editProduct(product)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                                >
                                  <FaEdit className="mr-2 text-gray-500" /> Edit
                                </button>
                                <button 
                                  onClick={() => toggleProductStatus(product.id)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                                >
                                  {product.status === 'active' ? (
                                    <>
                                      <FaTimes className="mr-2 text-gray-500" /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <FaCheck className="mr-2 text-gray-500" /> Activate
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => deleteProduct(product.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center"
                                >
                                  <FaTrash className="mr-2" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                            <p className="text-emerald-600 font-bold flex items-center whitespace-nowrap">
                              <FaRupeeSign className="mr-1" /> {product.price}
                              <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{product.category}</span>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 text-xs mr-1" />
                              <span className="text-xs font-medium">{product.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 text-xs">
                            <div className="flex items-center text-gray-500">
                              <FaShoppingCart className="mr-1" /> {product.sales} sold
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div 
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button 
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        setProductForm({
                          name: '', price: '', category: '', stock: '', unit: '', 
                          description: '', images: [], status: 'active', organic: false, featured: false
                        });
                        setPreviewImages([]);
                        setFormError('');
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitProduct} className="p-4 sm:p-6">
                    {formError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {formError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="e.g. Organic Cinnamon Sticks"
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        />
                      </div>
                      
                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaRupeeSign className="text-gray-400" />
                          </div>
                          <input
                            type="number"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="0.00"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      {/* Stock */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Available quantity"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        />
                      </div>
                      
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                          value={productForm.category}
                          onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Unit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                          value={productForm.unit}
                          onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                        >
                          <option value="">Select unit</option>
                          {units.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Organic */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="organic"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            checked={productForm.organic}
                            onChange={(e) => setProductForm({...productForm, organic: e.target.checked})}
                          />
                          <label htmlFor="organic" className="ml-2 block text-sm text-gray-700 flex items-center">
                            <FaLeaf className="text-green-500 mr-1" /> Organic Certified
                          </label>
                        </div>
                      </div>
                      
                      {/* Featured */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Listing Options</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="featured"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                          />
                          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 flex items-center">
                            <FaStar className="text-yellow-400 mr-1" /> Featured Product
                          </label>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                              name="status"
                              value="active"
                              checked={productForm.status === 'active'}
                              onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                              name="status"
                              value="inactive"
                              checked={productForm.status === 'inactive'}
                              onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                            />
                            <span className="ml-2 text-sm text-gray-700">Inactive</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Describe your product in detail..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        />
                      </div>
                      
                      {/* Image Upload */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images *</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                              >
                                <span>Upload images</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                        
                        {/* Preview Images */}
                        {previewImages.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-3">
                              {previewImages.map((img, index) => (
                                <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                                  <img src={img} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-red-100 transition-colors"
                                  >
                                    <FaTimes className="text-red-500 text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProduct(false);
                          setEditingProduct(null);
                          setProductForm({
                            name: '', price: '', category: '', stock: '', unit: '', 
                            description: '', images: [], status: 'active', organic: false, featured: false
                          });
                          setPreviewImages([]);
                          setFormError('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white font-medium hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center min-w-24"
                      >
                        {isUploading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" /> Processing...
                          </>
                        ) : editingProduct ? (
                          <>
                            <FaSave className="mr-2" /> Update Product
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" /> Upload Product
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Orders</h1>
                    <p className="text-gray-600">Manage and track your product orders</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center">
                      <FaDownload className="mr-2" /> Export
                    </button>
                    <button className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center">
                      <FaPrint className="mr-2" /> Print
                    </button>
                  </div>
                </div>

                {/* Orders Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    { title: 'Total Orders', value: '48', change: '+12%', icon: FaClipboardList, color: 'from-blue-500 to-indigo-600' },
                    { title: 'Pending', value: '5', change: 'Due today', icon: FaBell, color: 'from-orange-500 to-red-600' },
                    { title: 'Completed', value: '38', change: 'This month', icon: FaCheck, color: 'from-green-500 to-emerald-600' },
                    { title: 'Revenue', value: 'Rs.125K', change: '+18%', icon: FaRupeeSign, color: 'from-purple-500 to-pink-600' }
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                            <stat.icon className="text-white text-xl" />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                            index === 1 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">{stat.title}</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-sm"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                        <option>Filter by status</option>
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <button className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center">
                        <FaFilter className="mr-2" /> Filter
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((order) => (
                          <tr key={order} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #ORD{1000 + order}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-lg object-cover" src={`https://images.unsplash.com/photo-1560769680-ba2f3767c785?w=100&h=100&fit=crop&crop=face&ixid=${order}`} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">King Coconuts</div>
                                  <div className="text-sm text-gray-500">50 pieces</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <img className="h-8 w-8 rounded-full mr-2" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="" />
                                <span>Sunil Perera</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              50
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaRupeeSign className="mr-1 text-xs" /> 3,000
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order % 3 === 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : order % 2 === 0 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                                {order % 3 === 0 ? 'Completed' : order % 2 === 0 ? 'Pending' : 'Processing'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-emerald-600 hover:text-emerald-900 mr-3">
                                <FaEye />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <FaEdit />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                          <span className="font-medium">24</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Previous</span>
                            <FaChevronRight className="h-4 w-4 transform rotate-180" />
                          </button>
                          <button aria-current="page" className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            1
                          </button>
                          <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            2
                          </button>
                          <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            3
                          </button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                          <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            8
                          </button>
                          <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Next</span>
                            <FaChevronRight className="h-4 w-4" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Farm Analytics</h1>
                    <p className="text-gray-600">Track your farm's performance and growth</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                      <option>Last year</option>
                    </select>
                    <button className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center">
                      <FaDownload className="mr-2" /> Export
                    </button>
                  </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  {[
                    { title: 'Total Revenue', value: 'Rs.125,450', change: '+18% from last month', icon: FaRupeeSign, color: 'from-green-500 to-emerald-600' },
                    { title: 'Total Orders', value: '48', change: '+12% from last month', icon: FaShoppingCart, color: 'from-blue-500 to-indigo-600' },
                    { title: 'Customer Growth', value: '23%', change: '+8 new customers', icon: FaUsers, color: 'from-purple-500 to-pink-600' }
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                            <stat.icon className="text-white text-xl" />
                          </div>
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                        <p className="text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Chart */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Sales Performance</h3>
                        <p className="text-gray-600 text-sm">Last 30 days</p>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                        View Report <FaChevronRight className="ml-1 text-xs" />
                      </button>
                    </div>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Sales chart will appear here</p>
                    </div>
                  </div>
                  
                  {/* Revenue Chart */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Revenue Growth</h3>
                        <p className="text-gray-600 text-sm">Last 12 months</p>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                        View Report <FaChevronRight className="ml-1 text-xs" />
                      </button>
                    </div>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Revenue chart will appear here</p>
                    </div>
                  </div>
                </div>

                {/* Product Performance */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Product Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conversion
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.slice(0, 5).map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-lg object-cover" src={product.image_url} alt={product.name} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.views}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.sales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaRupeeSign className="mr-1 text-xs" /> {product.price * product.sales}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {((product.sales / product.views) * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FaStar className="text-yellow-400 text-xs mr-1" />
                                <span className="text-xs font-medium">{product.rating}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center animate-fade-in-up">
            <FaCheck className="mr-2" />
            <span>{successMessage}</span>
            <button 
              onClick={() => setShowSuccess(false)}
              className="ml-4 p-1 rounded-full hover:bg-green-600 transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernFarmerPortal;