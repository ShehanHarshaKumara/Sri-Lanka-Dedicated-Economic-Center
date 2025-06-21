import { useState, useEffect } from 'react';
import { 
  FaUserTie, 
  FaUsers, 
  FaTractor, 
  FaBox, 
  FaChartBar, 
  FaBell, 
  FaCog, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaUserPlus, 
  FaHome, 
  FaBars, 
  FaClipboardList, 
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaStar,
  FaLock,
  FaUnlock,
  FaDownload,
  FaUpload,
  FaPlus,
  FaSave,
  FaSort,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaTruck,
  FaImage,
  FaPercent
} from 'react-icons/fa';

// ===== CUSTOM RESPONSIVE CSS STYLES =====
const customResponsiveCSS = `
  * {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }
  
  .admin-container {
    width: 100vw;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  @media (max-width: 640px) {
    .mobile-optimized {
      padding: 0.75rem;
    }
    
    .mobile-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    
    .mobile-text {
      font-size: 0.875rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 1024px) {
    .tablet-optimized {
      padding: 1rem;
    }
    
    .tablet-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  }
  
  @media (min-width: 1025px) {
    .desktop-optimized {
      padding: 1.5rem;
    }
    
    .desktop-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
  }
  
  /* Responsive breakpoints */
  .responsive-container {
    width: 100%;
    max-width: 100vw;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  @media (min-width: 640px) {
    .responsive-container {
      padding: 0 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .responsive-container {
      padding: 0 2rem;
    }
  }
  
  @media (min-width: 1280px) {
    .responsive-container {
      padding: 0 2.5rem;
    }
  }
`;

// Inject CSS into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customResponsiveCSS;
  document.head.appendChild(styleSheet);
}

const AdminPortal = ({ user, onLogout }) => {
  // Current admin user - use the actual logged-in user data
  const [currentAdmin] = useState({
    id: user?.id || user?.userId || 1,
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@srilankanfarmers.lk',
    role: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  });

  // Farmers state: now loaded from backend
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [errorFarmers, setErrorFarmers] = useState(null);

  // Customers state: now loaded from backend
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);

  // Replace mock products with real state
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    total_products: 0,
    active_products: 0,
    low_stock_products: 0,
    total_categories: 0
  });
  const [loading, setLoading] = useState({
    products: false,
    stats: false
  });
  const [error, setError] = useState(null);

  // Mock data for orders
  const [orders] = useState([
    {
      id: 'ORD-001',
      customer: 'Saman Silva',
      customerId: 1,
      products: ['Organic Rice', 'Fresh Vegetables Mix'],
      total: 2500,
      status: 'delivered',
      orderDate: '2024-01-28',
      deliveryDate: '2024-01-30',
      farmer: 'Sunil Rathnayake'
    },
    {
      id: 'ORD-002',
      customer: 'Malini Jayawardena',
      customerId: 2,
      products: ['Ceylon Cinnamon'],
      total: 1600,
      status: 'processing',
      orderDate: '2024-01-29',
      deliveryDate: null,
      farmer: 'Nimal Perera'
    },
    {
      id: 'ORD-003',
      customer: 'Ranjan Kumar',
      customerId: 3,
      products: ['Organic Rice'],
      total: 750,
      status: 'pending',
      orderDate: '2024-01-30',
      deliveryDate: null,
      farmer: 'Sunil Rathnayake'
    }
  ]);
  // UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userType, setUserType] = useState('farmer');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Notifications
  const [notifications] = useState([
    { id: 1, message: 'New farmer registration pending', time: '10 minutes ago', type: 'farmer', priority: 'high' },
    { id: 2, message: 'Customer complaint received', time: '2 hours ago', type: 'customer', priority: 'medium' },
    { id: 3, message: 'System backup completed', time: '1 day ago', type: 'system', priority: 'low' }
  ]);
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
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    setFullViewport();
    window.addEventListener('resize', setFullViewport);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', setFullViewport);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    setError(null);
    try {
      console.log('Fetching products from API...');
      const response = await fetch('http://localhost:5001/api/admin/products');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Products fetched successfully:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Fetch product statistics
  const fetchProductStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      console.log('Fetching product stats from API...');
      const response = await fetch('http://localhost:5001/api/admin/product-stats');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch product stats: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Product stats fetched successfully:', data);
      setProductStats(data);
    } catch (err) {
      console.error('Error fetching product stats:', err);
      // Don't show error for stats, just use defaults
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    setErrorCustomers(null);
    try {
      // Adjust API endpoint if needed
      const response = await fetch('http://localhost:3000/api/customer/all');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setErrorCustomers(err.message);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch farmers from backend
  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    setErrorFarmers(null);
    try {
      // Adjust API endpoint as needed
      const response = await fetch('http://localhost:5002/api/farmer/all');
      if (!response.ok) {
        throw new Error('Failed to fetch farmers');
      }
      const data = await response.json();
      setFarmers(data);
    } catch (err) {
      setErrorFarmers(err.message);
    } finally {
      setLoadingFarmers(false);
    }
  };

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchProducts();
    fetchProductStats();
    fetchCustomers();
    fetchFarmers();
  }, []);

  // Calculate dashboard statistics
  const dashboardStats = {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter(f => f.status === 'active').length,
    pendingFarmers: farmers.filter(f => f.status === 'pending').length,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: farmers.reduce((sum, f) => sum + f.revenue, 0),
    totalProducts: productStats.total_products,
    activeProducts: productStats.active_products,
    lowStockProducts: productStats.low_stock_products,
    totalCategories: productStats.total_categories,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length
  };

  // Handle user status change
  const handleStatusChange = (userId, newStatus, type) => {
    if (type === 'farmer') {
      setFarmers(prev => prev.map(f => f.user_id === userId ? { ...f, status: newStatus } : f));
    } else {
      setCustomers(prev => prev.map(c => c.id === userId ? { ...c, status: newStatus } : c));
    }
  };

  // Handle user verification
  const handleVerification = (userId, type) => {
    if (type === 'farmer') {
      setFarmers(prev => prev.map(f => f.user_id === userId ? { ...f, verified: !f.verified } : f));
    } else {
      setCustomers(prev => prev.map(c => c.id === userId ? { ...c, verified: !c.verified } : c));
    }
  };
  // View user details
  const viewUserDetails = (user, type) => {
    setSelectedUser(user);
    setUserType(type);
    setShowUserModal(true);
  };

  // Edit farmer details
  const editFarmerDetails = (farmer) => {
    setEditingFarmer(farmer);
    setEditFormData({
      first_name: farmer.first_name || '',
      last_name: farmer.last_name || '',
      email: farmer.email || '',
      phone: farmer.phone || '',
      age: farmer.age || '',
      nic_number: farmer.nic_number || '',
      experience: farmer.experience || '',
      farming_type: farmer.farming_type || 'Mixed Farming',
      address: farmer.address || '',
      city: farmer.city || '',
      bio: farmer.bio || '',
      location_lat: farmer.location_lat || '',
      location_lng: farmer.location_lng || '',
      location_address: farmer.location_address || ''
    });
    setProfileImagePreview(farmer.profile_image);
    setShowEditModal(true);
  };

  // Delete farmer
  const deleteFarmer = async (farmer) => {
    if (!window.confirm(`Are you sure you want to delete ${farmer.name || farmer.first_name + ' ' + farmer.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/farmer/profile/${farmer.user_id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove farmer from the state
        setFarmers(prev => prev.filter(f => f.user_id !== farmer.user_id));
        alert('Farmer deleted successfully');
      } else {
        alert(data.error || 'Failed to delete farmer');
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
      alert('Failed to delete farmer: ' + error.message);
    }
  };

  // Save farmer edits
  const saveEditedFarmer = async () => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) {
          formData.append(key, editFormData[key]);
        }
      });

      // Add existing image if no new image
      if (!profileImageFile && profileImagePreview) {
        formData.append('existing_image', profileImagePreview);
      }

      // Add new image if selected
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }

      const response = await fetch(`http://localhost:5002/api/farmer/profile/${editingFarmer.user_id}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update farmer in the state
        setFarmers(prev => prev.map(f => 
          f.user_id === editingFarmer.user_id 
            ? { 
                ...f, 
                ...editFormData,
                profile_image: profileImageFile ? URL.createObjectURL(profileImageFile) : profileImagePreview,
                name: `${editFormData.first_name} ${editFormData.last_name}`
              }
            : f
        ));
        
        setShowEditModal(false);
        setEditingFarmer(null);
        setEditFormData({});
        setProfileImageFile(null);
        setProfileImagePreview(null);
        alert('Farmer details updated successfully');
      } else {
        alert(data.error || 'Failed to update farmer details');
      }
    } catch (error) {
      console.error('Error updating farmer:', error);
      alert('Failed to update farmer: ' + error.message);
    }
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Filter and sort users (add support for customers with more fields)
  const filterAndSortUsers = (users) => {
    let filtered = users.filter(user => {
      const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`;
      const matchesSearch = (name.toLowerCase()).includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.location?.toLowerCase() || user.city?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy] || a.first_name || '';
      let bValue = b[sortBy] || b.first_name || '';
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Common card wrapper component for consistent styling
  const CardWrapper = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-lg border border-green-100 ${className}`}>
      {children}
    </div>
  );

  // Common page header component
  const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      {action && action}
    </div>
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'farmers', label: 'Manage Farmers', icon: FaTractor },
    { id: 'customers', label: 'Manage Customers', icon: FaUsers },
    { id: 'products', label: 'Products', icon: FaBox },
    { id: 'orders', label: 'Orders', icon: FaClipboardList },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Delete customer handler
  const handleDeleteCustomer = async (user) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try {
      const userId = user.user_id || user.id;
      const response = await fetch(`http://localhost:3000/api/customer/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(prev => prev.filter(c => (c.user_id || c.id) !== userId));
        setShowUserModal(false);
        setSelectedUser(null);
        alert('Customer deleted successfully.');
      } else {
        alert(data.error || 'Failed to delete customer.');
      }
    } catch (err) {
      alert('Failed to delete customer: ' + err.message);
    }
  };
  return (
    <div className="min-h-screen w-full bg-green-50 admin-container" style={{ 
      margin: 0, 
      padding: 0,
      width: '100vw',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 border-b ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-green-200 py-1 sm:py-2' 
          : 'bg-white shadow-lg py-2 sm:py-3 border-green-100'
      }`}>
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle lg:hidden mr-2 p-1 sm:p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors flex-shrink-0"
              >
                <FaBars className="text-green-700 text-base sm:text-lg" />
              </button>
              <FaUserTie className="text-green-700 text-xl sm:text-2xl mr-2 flex-shrink-0" />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">
                <span className="hidden sm:inline">Administrator Portal</span>
                <span className="sm:hidden">Admin Portal</span>
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Notifications */}
              <div className="relative">
                <button className="p-1 sm:p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors relative">
                  <FaBell className="text-green-700 text-base sm:text-lg" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-20 sm:max-w-32">{currentAdmin.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 truncate max-w-20 sm:max-w-32">{currentAdmin.role}</p>
                </div>
                <img 
                  src={currentAdmin.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border-2 border-green-200 flex-shrink-0" 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>      <div className="flex pt-16 sm:pt-20 w-full min-h-screen">
        {/* Sidebar */}
        <aside className={`sidebar fixed lg:static inset-y-0 left-0 z-40 w-60 sm:w-64 bg-white border-r border-green-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 sm:p-6 pt-0 h-full overflow-y-auto">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left rounded-xl transition-all duration-200 text-sm sm:text-base ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <item.icon className="mr-2 sm:mr-3 text-lg sm:text-xl" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base"
              >
                <FaSignOutAlt className="mr-2 sm:mr-3 text-lg sm:text-xl" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 bg-green-50">
          <div className="px-4 sm:px-6 lg:px-8 py-6 w-full">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="w-full space-y-8">                <PageHeader 
                  title="System Administration Dashboard"
                  subtitle="Manage users, monitor platform activity, and ensure system integrity"
                />{/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <CardWrapper className="p-4 sm:p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Farmers</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalFarmers}</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">{dashboardStats.activeFarmers} active</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaTractor className="text-green-700 text-xl sm:text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-4 sm:p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Customers</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalCustomers}</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">{dashboardStats.activeCustomers} active</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaUsers className="text-green-700 text-xl sm:text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-4 sm:p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Products</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalProducts}</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">Across all farmers</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaBox className="text-green-700 text-xl sm:text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-4 sm:p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Platform Revenue</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">Rs.{(dashboardStats.totalRevenue / 1000000).toFixed(1)}M</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">Total transactions</p>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaMoneyBillWave className="text-green-700 text-xl sm:text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>
                </div>                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <CardWrapper className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Pending Approvals</h2>
                      <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {farmers.filter(f => f.status === 'pending').length} pending
                      </span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {farmers.filter(f => f.status === 'pending').map((farmer) => (
                        <div key={farmer.id} className="flex items-center justify-between p-3 sm:p-4 border border-green-100 rounded-lg hover:bg-green-50">
                          <div className="flex items-center">
                            <img src={farmer.avatar} alt={farmer.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3" />
                            <div>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{farmer.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{farmer.location} • {farmer.farmSize}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <button 
                              onClick={() => handleStatusChange(farmer.user_id || farmer.id, 'active', 'farmer')}
                              className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(farmer.user_id || farmer.id, 'rejected', 'farmer')}
                              className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Recent Notifications</h2>
                    <div className="space-y-3 sm:space-y-4">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start p-3 sm:p-4 border border-green-100 rounded-lg hover:bg-green-50">
                          <div className={`p-2 rounded-full mr-2 sm:mr-3 ${
                            notification.priority === 'high' ? 'bg-red-100' :
                            notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {notification.type === 'farmer' && <FaTractor className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600 text-sm sm:text-base`} />}
                            {notification.type === 'customer' && <FaUsers className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600 text-sm sm:text-base`} />}
                            {notification.type === 'system' && <FaCog className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600 text-sm sm:text-base`} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm sm:text-base">{notification.message}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardWrapper>
                </div>                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <button 
                    onClick={() => setActiveTab('farmers')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 sm:p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaTractor className="text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg sm:text-xl">Manage Farmers</h3>
                    <p className="text-green-100 text-sm sm:text-base">Review and approve farmers</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('customers')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 sm:p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaUsers className="text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg sm:text-xl">Manage Customers</h3>
                    <p className="text-green-100 text-sm sm:text-base">Monitor customer activity</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 sm:p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaChartBar className="text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg sm:text-xl">View Analytics</h3>
                    <p className="text-green-100 text-sm sm:text-base">Platform insights & reports</p>
                  </button>
                </div>
              </div>
            )}

            {/* Farmers Management Tab */}
            {activeTab === 'farmers' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Farmer Management"
                  subtitle="Manage farmer accounts, verify documents, and monitor activity"
                  action={
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                      <FaUserPlus className="mr-2" /> Add New Farmer
                    </button>
                  }
                />

                {/* Search and Filter */}
                <CardWrapper className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, email, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="joinDate">Sort by Join Date</option>
                        <option value="revenue">Sort by Revenue</option>
                      </select>
                      <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center"
                      >
                        {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                      </button>
                    </div>
                  </div>
                </CardWrapper>

                {/* Loading/Error State */}
                {loadingFarmers && (
                  <CardWrapper className="p-12">
                    <div className="text-center">
                      <FaClock className="text-4xl text-green-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading farmers...</p>
                    </div>
                  </CardWrapper>
                )}
                {errorFarmers && (
                  <CardWrapper className="p-6 bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-600 mr-2" />
                      <p className="text-red-700">{errorFarmers}</p>
                    </div>
                  </CardWrapper>
                )}

                {/* Farmers Table */}
                {!loadingFarmers && !errorFarmers && (
                  <CardWrapper className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-green-50 border-b border-green-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Farmer</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Verified</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filterAndSortUsers(farmers).map((farmer) => (
                            <tr key={farmer.user_id || farmer.id} className="hover:bg-green-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img src={farmer.profile_image || farmer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((farmer.first_name || '') + ' ' + (farmer.last_name || ''))} alt={farmer.first_name || farmer.name} className="w-10 h-10 rounded-full mr-3" />
                                  <div>
                                    <p className="font-semibold text-gray-900">{farmer.name || `${farmer.first_name || ''} ${farmer.last_name || ''}`}</p>
                                    <p className="text-sm text-gray-500">{farmer.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-gray-900">{farmer.location || farmer.city || '-'}</p>
                                  <p className="text-sm text-gray-500">{farmer.address || '-'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-gray-900">{farmer.totalProducts || '-'}</p>
                                  <p className="text-sm text-gray-500">{farmer.totalSales || '-'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-gray-900 font-semibold">Rs.{farmer.revenue ? (farmer.revenue / 1000000).toFixed(2) + 'M' : '-'}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={farmer.status || 'active'}
                                  onChange={(e) => handleStatusChange(farmer.user_id || farmer.id, e.target.value, 'farmer')}
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    (farmer.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                                    (farmer.status || 'active') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <option value="active">Active</option>
                                  <option value="pending">Pending</option>
                                  <option value="suspended">Suspended</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleVerification(farmer.user_id || farmer.id, 'farmer')}
                                  className={`flex items-center ${(farmer.verified ? 'text-green-600' : 'text-gray-400')} hover:text-green-700`}
                                >
                                  {farmer.verified ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
                                </button>
                              </td>                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => viewUserDetails(farmer, 'farmer')}
                                    className="text-green-600 hover:text-green-700"
                                    title="View Details"
                                  >
                                    <FaEye className="text-lg" />
                                  </button>
                                  <button 
                                    onClick={() => editFarmerDetails(farmer)}
                                    className="text-gray-600 hover:text-gray-700"
                                    title="Edit Farmer"
                                  >
                                    <FaEdit className="text-lg" />
                                  </button>
                                  <button 
                                    onClick={() => deleteFarmer(farmer)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Farmer"
                                  >
                                    <FaTrash className="text-lg" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardWrapper>
                )}
              </div>
            )}

            {/* Customers Management Tab */}
            {activeTab === 'customers' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Customer Management"
                  subtitle="Monitor customer accounts and purchase activity"
                  action={
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                      <FaDownload className="mr-2" /> Export Customer Data
                    </button>
                  }
                />

                {/* Search and Filter */}
                <CardWrapper className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, email, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center">
                        <FaFilter className="mr-2" /> More Filters
                      </button>
                    </div>
                  </div>
                </CardWrapper>

                {/* Loading/Error State */}
                {loadingCustomers && (
                  <CardWrapper className="p-12">
                    <div className="text-center">
                      <FaClock className="text-4xl text-green-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading customers...</p>
                    </div>
                  </CardWrapper>
                )}
                {errorCustomers && (
                  <CardWrapper className="p-6 bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-600 mr-2" />
                      <p className="text-red-700">{errorCustomers}</p>
                    </div>
                  </CardWrapper>
                )}

                {/* Customers Grid */}
                {!loadingCustomers && !errorCustomers && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filterAndSortUsers(customers).map((customer) => (
                      <CardWrapper key={customer.user_id || customer.id} className="overflow-hidden hover:shadow-xl transition-all">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <img src={customer.profile_image || customer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer.first_name + ' ' + customer.last_name)} alt={customer.first_name} className="w-16 h-16 rounded-full" />
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status || (customer.email ? 'active' : 'pending')}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{customer.first_name} {customer.last_name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{customer.email}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-semibold">{customer.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-semibold">{customer.city || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">NIC:</span>
                              <span className="font-semibold">{customer.nic_number || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Age:</span>
                              <span className="font-semibold">{customer.age ? customer.age + ' years' : '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Verified:</span>
                              <span>{customer.verified ? 
                                <FaCheckCircle className="text-green-600" /> : 
                                <FaTimesCircle className="text-gray-400" />
                              }</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => viewUserDetails(customer, 'customer')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                            >
                              <FaEye className="mr-1" /> View
                            </button>
                            <button 
                              onClick={() => handleStatusChange(customer.id, customer.status === 'active' ? 'suspended' : 'active', 'customer')}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                                customer.status === 'active'
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {customer.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </CardWrapper>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Product Management"
                  subtitle="Monitor and manage all products on the platform"
                  action={
                    <div className="flex gap-2">
                      <button 
                        onClick={fetchProducts}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        disabled={loading.products}
                      >
                        {loading.products ? <FaClock className="mr-2 animate-spin" /> : <FaDownload className="mr-2" />}
                        Refresh
                      </button>
                      <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                        <FaPlus className="mr-2" /> Add New Product
                      </button>
                    </div>
                  }
                />
                
                {/* Show error message if any */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-600 mr-2" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                {/* Product Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {loading.stats ? '...' : productStats.total_products}
                        </p>
                      </div>
                      <FaBox className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Active Products</p>
                        <p className="text-2xl font-bold text-green-600">
                          {loading.stats ? '...' : productStats.active_products}
                        </p>
                      </div>
                      <FaCheckCircle className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Low Stock</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {loading.stats ? '...' : productStats.low_stock_products}
                        </p>
                      </div>
                      <FaExclamationTriangle className="text-3xl text-orange-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Categories</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {loading.stats ? '...' : productStats.total_categories}
                        </p>
                      </div>
                      <FaFilter className="text-3xl text-blue-600" />
                    </div>
                  </CardWrapper>
                </div>

                {/* Search and Filter */}
                <CardWrapper className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="all">All Categories</option>
                        {[...new Set(products.map(p => p.category))].map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </CardWrapper>

                {/* Loading State */}
                {loading.products && (
                  <CardWrapper className="p-12">
                    <div className="text-center">
                      <FaClock className="text-4xl text-green-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  </CardWrapper>
                )}

                {/* Products Grid */}
                {!loading.products && products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <CardWrapper key={product.id} className="overflow-hidden hover:shadow-xl transition-all">
                        <div className="p-6">
                          <div className="relative mb-4">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
                              }}
                              onLoad={(e) => {
                                // Optional: Add loading state management
                                e.target.style.opacity = '1';
                              }}
                              style={{ opacity: '0.8', transition: 'opacity 0.3s ease' }}
                            />
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                              product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status}
                            </span>
                            {product.stock < 50 && (
                              <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                Low Stock
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                          <p className="text-gray-600 text-sm mb-3">By {product.farmer}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-semibold text-green-600">Rs.{product.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Stock:</span>
                              <span className={`font-semibold ${product.stock < 50 ? 'text-orange-600' : 'text-gray-800'}`}>
                                {product.stock} units
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Sales:</span>
                              <span className="font-semibold">{product.sales}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rating:</span>
                              <span className="font-semibold flex items-center">
                                <FaStar className="text-yellow-500 mr-1" />
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center">
                              <FaEye className="mr-1" /> View
                            </button>
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center">
                              <FaEdit className="mr-1" /> Edit
                            </button>
                          </div>
                        </div>
                      </CardWrapper>
                    ))}
                  </div>
                )}

                {/* No Products Found */}
                {!loading.products && products.length === 0 && !error && (
                  <CardWrapper className="p-12">
                    <div className="text-center">
                      <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                      <p className="text-gray-500">No products have been added to the platform yet.</p>
                    </div>
                  </CardWrapper>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Order Management"
                  subtitle="Track and manage platform orders"
                  action={
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                      <FaDownload className="mr-2" /> Export Orders
                    </button>
                  }
                />
                
                {/* Order Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-800">{dashboardStats.totalOrders}</p>
                      </div>
                      <FaClipboardList className="text-3xl text-gray-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Pending Orders</p>
                        <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingOrders}</p>
                      </div>
                      <FaClock className="text-3xl text-yellow-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Processing</p>
                        <p className="text-2xl font-bold text-blue-600">{dashboardStats.processingOrders}</p>
                      </div>
                      <FaTruck className="text-3xl text-blue-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{dashboardStats.completedOrders}</p>
                      </div>
                      <FaCheckCircle className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                </div>

                {/* Search and Filter */}
                <CardWrapper className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search orders by ID or customer..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input
                        type="date"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardWrapper>

                {/* Orders Table */}
                <CardWrapper className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-green-50 border-b border-green-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">{order.id}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900">{order.customer}</p>
                              <p className="text-sm text-gray-500">ID: {order.customerId}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                {order.products.map((product, index) => (
                                  <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                    {product}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900 font-semibold">Rs.{order.total.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900">{order.orderDate}</p>
                              {order.deliveryDate && (
                                <p className="text-sm text-gray-500">Delivered: {order.deliveryDate}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button className="text-green-600 hover:text-green-700">
                                  <FaEye className="text-lg" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-700">
                                  <FaEdit className="text-lg" />
                                </button>
                                <button className="text-red-600 hover:text-red-700">
                                  <FaTrash className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardWrapper>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Platform Analytics"
                  subtitle="Comprehensive platform insights and performance metrics"
                  action={
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                      <FaDownload className="mr-2" /> Export Report
                    </button>
                  }
                />
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-green-600">Rs.8.5M</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <FaArrowUp className="mr-1" /> +12.5% from last month
                        </p>
                      </div>
                      <FaMoneyBillWave className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-blue-600">2,847</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <FaArrowUp className="mr-1" /> +8.2% from last month
                        </p>
                      </div>
                      <FaUsers className="text-3xl text-blue-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-600">3.2%</p>
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <FaArrowDown className="mr-1" /> -0.8% from last month
                        </p>
                      </div>
                      <FaPercent className="text-3xl text-purple-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Platform Growth</p>
                        <p className="text-2xl font-bold text-orange-600">24.8%</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <FaArrowUp className="mr-1" /> +5.3% from last month
                        </p>
                      </div>
                      <FaChartBar className="text-3xl text-orange-600" />
                    </div>
                  </CardWrapper>
                </div>

                {/* Analytics Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaChartBar className="mr-2 text-green-600" /> Revenue Trends
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaChartBar className="text-6xl text-green-300 mx-auto mb-4" />
                        <p className="text-gray-600">Revenue Chart Visualization</p>
                        <p className="text-sm text-gray-500">Monthly revenue growth analysis</p>
                      </div>
                    </div>
                  </CardWrapper>
                  
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUsers className="mr-2 text-blue-600" /> User Growth
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaUsers className="text-6xl text-blue-300 mx-auto mb-4" />
                        <p className="text-gray-600">User Growth Chart</p>
                        <p className="text-sm text-gray-500">New registrations and active users</p>
                      </div>
                    </div>
                  </CardWrapper>
                  
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaBox className="mr-2 text-orange-600" /> Product Performance
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaBox className="text-6xl text-orange-300 mx-auto mb-4" />
                        <p className="text-gray-600">Product Analytics</p>
                        <p className="text-sm text-gray-500">Best selling products and categories</p>
                      </div>
                    </div>
                  </CardWrapper>
                  
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaClipboardList className="mr-2 text-purple-600" /> Order Analytics
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FaClipboardList className="text-6xl text-purple-300 mx-auto mb-4" />
                        <p className="text-gray-600">Order Insights</p>
                        <p className="text-sm text-gray-500">Order patterns and fulfillment rates</p>
                      </div>
                    </div>
                  </CardWrapper>
                </div>

                {/* Detailed Reports */}
                <CardWrapper className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Platform Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                      <div className="flex items-center mb-2">
                        <FaTractor className="text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Farmer Performance Report</h4>
                      </div>
                      <p className="text-sm text-gray-600">Detailed analysis of farmer activity and sales</p>
                      <button className="mt-2 text-green-600 text-sm font-medium hover:text-green-700">
                        Generate Report →
                      </button>
                    </div>
                    
                    <div className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                      <div className="flex items-center mb-2">
                        <FaUsers className="text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Customer Behavior Report</h4>
                      </div>
                      <p className="text-sm text-gray-600">Customer purchasing patterns and preferences</p>
                      <button className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-700">
                        Generate Report →
                      </button>
                    </div>
                    
                    <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                      <div className="flex items-center mb-2">
                        <FaMoneyBillWave className="text-orange-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Financial Summary</h4>
                      </div>
                      <p className="text-sm text-gray-600">Revenue, expenses, and profit analysis</p>
                      <button className="mt-2 text-orange-600 text-sm font-medium hover:text-orange-700">
                        Generate Report →
                      </button>
                    </div>
                  </div>
                </CardWrapper>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="System Settings"
                  subtitle="Configure platform settings and preferences"
                />
                
                {/* Settings Navigation */}
                <CardWrapper className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 text-left border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                      <FaCog className="text-green-600 text-2xl mb-2" />
                      <h3 className="font-semibold text-gray-800">General Settings</h3>
                      <p className="text-sm text-gray-600">Basic platform configuration</p>
                    </button>
                    
                    <button className="p-4 text-left border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                      <FaUsers className="text-blue-600 text-2xl mb-2" />
                      <h3 className="font-semibold text-gray-800">User Management</h3>
                      <p className="text-sm text-gray-600">Admin users and permissions</p>
                    </button>
                    
                    <button className="p-4 text-left border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                      <FaBell className="text-orange-600 text-2xl mb-2" />
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <p className="text-sm text-gray-600">Email and system notifications</p>
                    </button>
                    
                    <button className="p-4 text-left border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                      <FaLock className="text-purple-600 text-2xl mb-2" />
                      <h3 className="font-semibold text-gray-800">Security</h3>
                      <p className="text-sm text-gray-600">Security and access control</p>
                    </button>
                  </div>
                </CardWrapper>

                {/* General Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <FaCog className="mr-2 text-green-600" /> Platform Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                        <input
                          type="text"
                          defaultValue="Sri Lankan Farmers Platform"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                          <option value="LKR">Sri Lankan Rupee (LKR)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                          <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                          <option value="UTC">UTC (GMT+0:00)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" id="maintenance" className="mr-2" />
                        <label htmlFor="maintenance" className="text-sm text-gray-700">Enable maintenance mode</label>
                      </div>
                    </div>
                  </CardWrapper>
                  
                  <CardWrapper className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <FaBell className="mr-2 text-orange-600" /> Notification Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Email Notifications</p>
                          <p className="text-sm text-gray-600">Send email notifications for important events</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">SMS Notifications</p>
                          <p className="text-sm text-gray-600">Send SMS for urgent notifications</p>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Push Notifications</p>
                          <p className="text-sm text-gray-600">Browser push notifications</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                        <input
                          type="email"
                          defaultValue="admin@srilankanfarmers.lk"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </CardWrapper>
                </div>

                {/* Admin Users */}
                <CardWrapper className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaUserTie className="mr-2 text-blue-600" /> Administrator Accounts
                    </h3>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                      <FaPlus className="mr-2" /> Add Admin
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img src={currentAdmin.avatar} alt={currentAdmin.name} className="w-10 h-10 rounded-full mr-3" />
                              <p className="font-medium text-gray-900">{currentAdmin.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currentAdmin.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {currentAdmin.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Just now</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                           
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-700">
                                <FaEdit />
                              </button>
                              <button className="text-red-600 hover:text-red-700">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardWrapper>

                {/* Save Settings */}
                <div className="flex justify-end">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center">
                    <FaSave className="mr-2" /> Save All Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-green-100 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {userType === 'farmer' ? 'Farmer' : 'Customer'} Details
                </h2>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* User Header */}
              <div className="flex items-start space-x-6 mb-8">
                <img 
                  src={selectedUser.profile_image || selectedUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((selectedUser.first_name || '') + ' ' + (selectedUser.last_name || ''))} 
                  alt={selectedUser.first_name || selectedUser.name} 
                  className="w-24 h-24 rounded-full border-4 border-green-100"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedUser.name || `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <FaEnvelope className="mr-2 text-green-600" /> {selectedUser.email}
                      </p>
                      <p className="text-gray-600 flex items-center mt-2">
                        <FaPhone className="mr-2 text-green-600" /> {selectedUser.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" /> {selectedUser.location || selectedUser.city}
                      </p>
                      <p className="text-gray-600 flex items-center mt-2">
                        <FaCalendar className="mr-2 text-green-600" /> Joined {selectedUser.joinDate || selectedUser.created_at || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block mb-2 ${
                    (selectedUser.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                    (selectedUser.status || 'active') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status || 'active'}
                  </span>
                  <div className="flex items-center justify-end mt-2">
                    {selectedUser.verified ? (
                      <span className="text-green-600 flex items-center">
                        <FaCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center">
                        <FaTimesCircle className="mr-1" /> Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {userType === 'farmer' ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Farm Size</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.farmSize || '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Products</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.totalProducts || '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Sales</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.totalSales || '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Revenue</p>
                      <p className="text-xl font-bold text-gray-800">Rs.{selectedUser.revenue ? (selectedUser.revenue / 1000000).toFixed(2) + 'M' : '-'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.phone || '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">NIC</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.nic_number || '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Age</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.age ? selectedUser.age + ' years' : '-'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">City</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.city || '-'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Information */}
              {userType === 'farmer' && selectedUser.documents && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.documents.map((doc, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-green-100">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center">
                  <FaEnvelope className="mr-2" /> Send Message
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center">
                  {selectedUser.verified ? <FaLock className="mr-2" /> : <FaUnlock className="mr-2" />}
                  {selectedUser.verified ? 'Revoke Verification' : 'Verify User'}
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center">
                  {selectedUser.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                </button>
                {userType === 'customer' && (
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center"
                    onClick={() => handleDeleteCustomer(selectedUser)}
                  >
                    <FaTrash className="mr-2" /> Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Farmer Modal */}
      {showEditModal && editingFarmer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-green-100 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Edit Farmer Details</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFarmer(null);
                    setEditFormData({});
                    setProfileImageFile(null);
                    setProfileImagePreview(null);
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Profile Image Section */}
              <div className="mb-8 text-center">
                <div className="relative inline-block">
                  <img 
                    src={profileImagePreview || editingFarmer.profile_image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((editFormData.first_name || '') + ' ' + (editFormData.last_name || ''))} 
                    alt="Profile Preview" 
                    className="w-32 h-32 rounded-full border-4 border-green-100 object-cover"
                  />
                  <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer">
                    <FaImage className="text-lg" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">Click the camera icon to change profile picture</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => handleEditFormChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => handleEditFormChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
                  <input
                    type="text"
                    value={editFormData.nic_number}
                    onChange={(e) => handleEditFormChange('nic_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    value={editFormData.experience}
                    onChange={(e) => handleEditFormChange('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farming Type</label>
                  <select
                    value={editFormData.farming_type}
                    onChange={(e) => handleEditFormChange('farming_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Mixed Farming">Mixed Farming</option>
                    <option value="Organic Farming">Organic Farming</option>
                    <option value="Crop Farming">Crop Farming</option>
                    <option value="Livestock Farming">Livestock Farming</option>
                    <option value="Dairy Farming">Dairy Farming</option>
                    <option value="Poultry Farming">Poultry Farming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => handleEditFormChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => handleEditFormChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => handleEditFormChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us about your farming experience..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-green-100 mt-8">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFarmer(null);
                    setEditFormData({});
                    setProfileImageFile(null);
                    setProfileImagePreview(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEditedFarmer}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

export default AdminPortal;