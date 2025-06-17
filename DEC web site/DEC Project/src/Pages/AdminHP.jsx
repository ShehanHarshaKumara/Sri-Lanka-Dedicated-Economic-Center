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

const AdminPortal = ({ user, onLogout }) => {
  // Current admin user
  const [currentAdmin] = useState({
    id: 1,
    name: 'Admin Silva',
    email: 'admin@srilankanfarmers.lk',
    role: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  });

  // Mock data for farmers
  const [farmers, setFarmers] = useState([
    {
      id: 1,
      name: 'Sunil Rathnayake',
      email: 'sunil@farmer.lk',
      phone: '+94 77 123 4567',
      location: 'Galle District',
      farmSize: '15 acres',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      status: 'active',
      joinDate: '2022-03-15',
      totalProducts: 45,
      totalSales: 1250,
      revenue: 2500000,
      rating: 4.8,
      verified: true,
      documents: ['NIC', 'Farm Registration']
    },
    {
      id: 2,
      name: 'Kamala Fernando',
      email: 'kamala@farmer.lk',
      phone: '+94 71 234 5678',
      location: 'Kandy District',
      farmSize: '8 acres',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      status: 'pending',
      joinDate: '2024-01-10',
      totalProducts: 0,
      totalSales: 0,
      revenue: 0,
      rating: 0,
      verified: false,
      documents: ['NIC']
    },
    {
      id: 3,
      name: 'Nimal Perera',
      email: 'nimal@farmer.lk',
      phone: '+94 75 345 6789',
      location: 'Matara District',
      farmSize: '20 acres',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      status: 'active',
      joinDate: '2021-11-20',
      totalProducts: 78,
      totalSales: 3420,
      revenue: 5800000,
      rating: 4.9,
      verified: true,
      documents: ['NIC', 'Farm Registration', 'Organic Certification']
    }
  ]);

  // Mock data for customers
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Saman Silva',
      email: 'saman@email.com',
      phone: '+94 77 987 6543',
      location: 'Colombo',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face',
      status: 'active',
      joinDate: '2023-05-10',
      totalOrders: 28,
      totalSpent: 125000,
      lastOrder: '2024-01-28',
      verified: true
    },
    {
      id: 2,
      name: 'Malini Jayawardena',
      email: 'malini@email.com',
      phone: '+94 71 876 5432',
      location: 'Gampaha',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      status: 'active',
      joinDate: '2023-08-22',
      totalOrders: 15,
      totalSpent: 68000,
      lastOrder: '2024-01-25',
      verified: true
    },
    {
      id: 3,
      name: 'Ranjan Kumar',
      email: 'ranjan@email.com',
      phone: '+94 75 765 4321',
      location: 'Negombo',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
      status: 'suspended',
      joinDate: '2023-12-01',
      totalOrders: 5,
      totalSpent: 22000,
      lastOrder: '2024-01-10',
      verified: false
    }
  ]);

  // Mock data for products
  const [products] = useState([
    {
      id: 1,
      name: 'Organic Rice',
      category: 'Grains',
      farmer: 'Sunil Rathnayake',
      farmerId: 1,
      price: 150,
      stock: 500,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop',
      status: 'active',
      sales: 1200,
      rating: 4.8,
      description: 'Premium organic rice grown without pesticides'
    },
    {
      id: 2,
      name: 'Fresh Vegetables Mix',
      category: 'Vegetables',
      farmer: 'Kamala Fernando',
      farmerId: 2,
      price: 200,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop',
      status: 'active',
      sales: 450,
      rating: 4.6,
      description: 'Fresh seasonal vegetables harvested daily'
    },
    {
      id: 3,
      name: 'Ceylon Cinnamon',
      category: 'Spices',
      farmer: 'Nimal Perera',
      farmerId: 3,
      price: 800,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      status: 'active',
      sales: 320,
      rating: 4.9,
      description: 'Authentic Ceylon cinnamon sticks'
    }
  ]);

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
  const [sortOrder, setSortOrder] = useState('asc');

  // Notifications
  const [notifications] = useState([
    { id: 1, message: 'New farmer registration pending', time: '10 minutes ago', type: 'farmer', priority: 'high' },
    { id: 2, message: 'Customer complaint received', time: '2 hours ago', type: 'customer', priority: 'medium' },
    { id: 3, message: 'System backup completed', time: '1 day ago', type: 'system', priority: 'low' }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Calculate dashboard statistics
  const dashboardStats = {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter(f => f.status === 'active').length,
    pendingFarmers: farmers.filter(f => f.status === 'pending').length,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: farmers.reduce((sum, f) => sum + f.revenue, 0),
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length
  };

  // Handle user status change
  const handleStatusChange = (userId, newStatus, type) => {
    if (type === 'farmer') {
      setFarmers(prev => prev.map(f => f.id === userId ? { ...f, status: newStatus } : f));
    } else {
      setCustomers(prev => prev.map(c => c.id === userId ? { ...c, status: newStatus } : c));
    }
  };

  // Handle user verification
  const handleVerification = (userId, type) => {
    if (type === 'farmer') {
      setFarmers(prev => prev.map(f => f.id === userId ? { ...f, verified: !f.verified } : f));
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

  // Filter and sort users
  const filterAndSortUsers = (users) => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
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

  return (
    <div className="min-h-screen w-full bg-green-50">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 border-b ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-green-200 py-2' 
          : 'bg-white shadow-lg py-3 border-green-100'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle lg:hidden mr-2 p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors flex-shrink-0"
              >
                <FaBars className="text-green-700 text-lg" />
              </button>
              <FaUserTie className="text-green-700 text-2xl mr-2 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                <span className="hidden sm:inline">Administrator Portal</span>
                <span className="sm:hidden">Admin Portal</span>
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors relative">
                  <FaBell className="text-green-700 text-lg" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-32">{currentAdmin.name}</p>
                  <p className="text-xs text-gray-600 truncate max-w-32">{currentAdmin.role}</p>
                </div>
                <img 
                  src={currentAdmin.avatar} 
                  alt="Profile" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-green-200 flex-shrink-0" 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20 w-full min-h-screen">
        {/* Sidebar */}
        <aside className={`sidebar fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-green-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 pt-0 h-full overflow-y-auto">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <item.icon className="mr-3 text-xl" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-6 left-6 right-6">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="mr-3 text-xl" />
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
              <div className="w-full space-y-8">
                <PageHeader 
                  title="System Administration Dashboard"
                  subtitle="Manage users, monitor platform activity, and ensure system integrity"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CardWrapper className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-sm font-medium">Total Farmers</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalFarmers}</p>
                        <p className="text-sm text-green-600 mt-1">{dashboardStats.activeFarmers} active</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaTractor className="text-green-700 text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-sm font-medium">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalCustomers}</p>
                        <p className="text-sm text-green-600 mt-1">{dashboardStats.activeCustomers} active</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaUsers className="text-green-700 text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-sm font-medium">Total Products</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{dashboardStats.totalProducts}</p>
                        <p className="text-sm text-green-600 mt-1">Across all farmers</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaBox className="text-green-700 text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 text-sm font-medium">Platform Revenue</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">Rs.{(dashboardStats.totalRevenue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-green-600 mt-1">Total transactions</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-100 flex-shrink-0">
                        <FaMoneyBillWave className="text-green-700 text-2xl" />
                      </div>
                    </div>
                  </CardWrapper>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CardWrapper className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        {farmers.filter(f => f.status === 'pending').length} pending
                      </span>
                    </div>
                    <div className="space-y-4">
                      {farmers.filter(f => f.status === 'pending').map((farmer) => (
                        <div key={farmer.id} className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50">
                          <div className="flex items-center">
                            <img src={farmer.avatar} alt={farmer.name} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                              <p className="font-semibold text-gray-800">{farmer.name}</p>
                              <p className="text-sm text-gray-600">{farmer.location} • {farmer.farmSize}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleStatusChange(farmer.id, 'active', 'farmer')}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(farmer.id, 'rejected', 'farmer')}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Notifications</h2>
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start p-4 border border-green-100 rounded-lg hover:bg-green-50">
                          <div className={`p-2 rounded-full mr-3 ${
                            notification.priority === 'high' ? 'bg-red-100' :
                            notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {notification.type === 'farmer' && <FaTractor className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600`} />}
                            {notification.type === 'customer' && <FaUsers className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600`} />}
                            {notification.type === 'system' && <FaCog className={`text-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}-600`} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800">{notification.message}</p>
                            <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardWrapper>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setActiveTab('farmers')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaTractor className="text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-xl">Manage Farmers</h3>
                    <p className="text-green-100">Review and approve farmers</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('customers')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaUsers className="text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-xl">Manage Customers</h3>
                    <p className="text-green-100">Monitor customer activity</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaChartBar className="text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-xl">View Analytics</h3>
                    <p className="text-green-100">Platform insights & reports</p>
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

                {/* Farmers Table */}
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
                          <tr key={farmer.id} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img src={farmer.avatar} alt={farmer.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                  <p className="font-semibold text-gray-900">{farmer.name}</p>
                                  <p className="text-sm text-gray-500">{farmer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-gray-900">{farmer.location}</p>
                                <p className="text-sm text-gray-500">{farmer.farmSize}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-gray-900">{farmer.totalProducts} products</p>
                                <p className="text-sm text-gray-500">{farmer.totalSales} sales</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900 font-semibold">Rs.{(farmer.revenue / 1000000).toFixed(2)}M</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={farmer.status}
                                onChange={(e) => handleStatusChange(farmer.id, e.target.value, 'farmer')}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  farmer.status === 'active' ? 'bg-green-100 text-green-800' :
                                  farmer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
                                onClick={() => handleVerification(farmer.id, 'farmer')}
                                className={`flex items-center ${farmer.verified ? 'text-green-600' : 'text-gray-400'} hover:text-green-700`}
                              >
                                {farmer.verified ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => viewUserDetails(farmer, 'farmer')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <FaEye className="text-lg" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-700">
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

                {/* Customers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filterAndSortUsers(customers).map((customer) => (
                    <CardWrapper key={customer.id} className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-full" />
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{customer.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{customer.email}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-semibold">{customer.location}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Orders:</span>
                            <span className="font-semibold">{customer.totalOrders}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Spent:</span>
                            <span className="font-semibold text-green-600">Rs.{customer.totalSpent.toLocaleString()}</span>
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
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Product Management"
                  subtitle="Monitor and manage all products on the platform"
                  action={
                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg">
                      <FaPlus className="mr-2" /> Add New Product
                    </button>
                  }
                />
                
                {/* Product Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                      </div>
                      <FaBox className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Active Products</p>
                        <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</p>
                      </div>
                      <FaCheckCircle className="text-3xl text-green-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Low Stock</p>
                        <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.stock < 50).length}</p>
                      </div>
                      <FaExclamationTriangle className="text-3xl text-orange-600" />
                    </div>
                  </CardWrapper>
                  <CardWrapper className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Categories</p>
                        <p className="text-2xl font-bold text-blue-600">{[...new Set(products.map(p => p.category))].length}</p>
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
                        <option value="grains">Grains</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="spices">Spices</option>
                      </select>
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </CardWrapper>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <CardWrapper key={product.id} className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="p-6">
                        <div className="relative mb-4">
                          <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
                          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
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
                              {product.rating}
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
      </div>

      {/* User Details Modal */}
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
                  src={selectedUser.avatar} 
                  alt={selectedUser.name} 
                  className="w-24 h-24 rounded-full border-4 border-green-100"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedUser.name}</h3>
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
                        <FaMapMarkerAlt className="mr-2 text-green-600" /> {selectedUser.location}
                      </p>
                      <p className="text-gray-600 flex items-center mt-2">
                        <FaCalendar className="mr-2 text-green-600" /> Joined {selectedUser.joinDate}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block mb-2 ${
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status}
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
                      <p className="text-xl font-bold text-gray-800">{selectedUser.farmSize}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Products</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.totalProducts}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Sales</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.totalSales}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Revenue</p>
                      <p className="text-xl font-bold text-gray-800">Rs.{(selectedUser.revenue / 1000000).toFixed(2)}M</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Total Spent</p>
                      <p className="text-xl font-bold text-gray-800">Rs.{selectedUser.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Last Order</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.lastOrder}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className="text-xl font-bold text-gray-800">{selectedUser.status}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Information */}
              {userType === 'farmer' && (
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
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center">
                  <FaTrash className="mr-2" /> Delete Account
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