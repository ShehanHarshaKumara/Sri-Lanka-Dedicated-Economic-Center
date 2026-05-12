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
  FaPercent,
  FaChevronRight,
  FaSync
} from 'react-icons/fa';
import { API_BASES } from '../config/api';
import { confirmAction } from '../utils/sweetAlert';

const buildAdminAvatar = (name, customAvatar = '') =>
  customAvatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Admin')}&background=7c3aed&color=ffffff&size=256`;

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
    width: 100%;
    min-height: 100dvh;
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
    max-width: 100%;
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

const AdminPortal = ({ user, onLogout, onUserUpdate }) => {
  // Current admin user - use the actual logged-in user data
  const [currentAdmin, setCurrentAdmin] = useState({
    id: user?.id || user?.userId || 1,
    userId: user?.userId || user?.id || 1,
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@srilankanfarmers.lk',
    role: 'Super Administrator',
    accountRole: user?.role || 'admin',
    created_at: null,
    updated_at: null,
    last_login: null,
    avatar: buildAdminAvatar(user?.name || 'Administrator', user?.avatar || '')
  });
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@srilankanfarmers.lk'
  });
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingAdminProfile, setLoadingAdminProfile] = useState(false);
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [savingAdminPassword, setSavingAdminPassword] = useState(false);
  const [adminProfileStatus, setAdminProfileStatus] = useState(null);
  const [adminPasswordStatus, setAdminPasswordStatus] = useState(null);
  const [adminProfileImageFile, setAdminProfileImageFile] = useState(null);
  const [adminProfileImagePreview, setAdminProfileImagePreview] = useState(null);

  // Farmers state: now loaded from backend
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [errorFarmers, setErrorFarmers] = useState(null);
  const [farmerActionStatus, setFarmerActionStatus] = useState(null);
  const [updatingFarmerId, setUpdatingFarmerId] = useState(null);
  const [deletingFarmerId, setDeletingFarmerId] = useState(null);

  // Customers state: now loaded from backend
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);
  const [customerActionStatus, setCustomerActionStatus] = useState(null);
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  // Database users state
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [errorAdminUsers, setErrorAdminUsers] = useState(null);

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
  const [productActionStatus, setProductActionStatus] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSortBy, setProductSortBy] = useState('created_at');
  const [productSortOrder, setProductSortOrder] = useState('desc');
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productEditForm, setProductEditForm] = useState({});
  const [savingProductId, setSavingProductId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Mock data for orders
  const [orders, setOrders] = useState([
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
  const [sidebarOpen, setSidebarOpen] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  ));
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userType, setUserType] = useState('farmer');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [orderEditForm, setOrderEditForm] = useState({});
  const [orderActionStatus, setOrderActionStatus] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('');
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
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }

      if (!event.target.closest('.admin-notification-panel') && !event.target.closest('.admin-notification-trigger')) {
        setShowNotifications(false);
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
    setProductActionStatus(null);
    try {
      console.log('Fetching products from API...');
      const response = await fetch(`${API_BASES.adminProducts}/products`);
      
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
      const response = await fetch(`${API_BASES.adminProducts}/product-stats`);
      
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
    setCustomerActionStatus(null);
    try {
      // Adjust API endpoint if needed
      const response = await fetch(`${API_BASES.customer}/all`);
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
    setFarmerActionStatus(null);
    try {
      // Adjust API endpoint as needed
      const response = await fetch(`${API_BASES.farmerProfile}/all`);
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

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null);

    try {
      const response = await fetch(`${API_BASES.payments}/admin/orders`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      const apiOrders = Array.isArray(data.orders) ? data.orders : [];
      setOrders(apiOrders.map(mapApiOrderToAdminOrder));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorOrders(error.message || 'Failed to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch database users from auth service
  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    setErrorAdminUsers(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASES.auth}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }

      const data = await response.json();
      setAdminUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error('Error fetching database users:', err);
      setErrorAdminUsers(err.message);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const syncAdminSessionUser = (updatedUser) => {
    const nextUser = {
      ...(user || {}),
      ...updatedUser,
      role: updatedUser.role || user?.role || 'admin'
    };

    try {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } catch (error) {
      console.error('Failed to sync admin session locally:', error);
    }

    if (onUserUpdate) {
      onUserUpdate(nextUser);
    }
  };

  const fetchAdminProfile = async () => {
    setLoadingAdminProfile(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASES.auth}/admin-profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch admin profile: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }

      const data = await response.json();
      const profile = data.user || {};

      setCurrentAdmin((prev) => ({
        ...prev,
        id: profile.id || profile.userId || prev.id,
        userId: profile.userId || profile.id || prev.userId,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        accountRole: profile.role || prev.accountRole,
        created_at: profile.created_at || prev.created_at,
        updated_at: profile.updated_at || prev.updated_at,
        last_login: profile.last_login || prev.last_login,
        avatar: buildAdminAvatar(profile.name || prev.name, profile.avatar || prev.avatar || user?.avatar || '')
      }));
      setAdminProfileImageFile(null);
      setAdminProfileImagePreview(null);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setAdminProfileStatus({
        type: 'error',
        text: 'The latest admin profile could not be loaded. Showing the current session details instead.'
      });
    } finally {
      setLoadingAdminProfile(false);
    }
  };

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchProducts();
    fetchProductStats();
    fetchCustomers();
    fetchFarmers();
    fetchOrders();
    fetchAdminUsers();
    fetchAdminProfile();
  }, []);

  useEffect(() => {
    setAdminProfileForm({
      name: currentAdmin.name || 'Administrator',
      email: currentAdmin.email || ''
    });
  }, [currentAdmin.email, currentAdmin.name]);

  useEffect(() => {
    if (activeTab === 'profile' && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [activeTab]);

  // Calculate dashboard statistics
  const dashboardStats = {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter(f => f.status === 'active').length,
    pendingFarmers: farmers.filter(f => f.status === 'pending').length,
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: farmers.reduce((sum, f) => sum + (Number(f.revenue) || 0), 0),
    totalProducts: productStats.total_products,
    activeProducts: productStats.active_products,
    lowStockProducts: productStats.low_stock_products,
    totalCategories: productStats.total_categories,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length
  };

  const getFarmerId = (farmer) => farmer?.user_id ?? farmer?.id ?? null;
  const isSameFarmer = (farmer, farmerId) =>
    farmerId !== null && farmerId !== undefined && String(getFarmerId(farmer)) === String(farmerId);
  const getFarmerName = (farmer) =>
    farmer?.name || `${farmer?.first_name || ''} ${farmer?.last_name || ''}`.trim() || 'this farmer';
  const getCustomerId = (customer) => customer?.user_id ?? customer?.id ?? null;
  const isSameCustomer = (customer, customerId) =>
    customerId !== null && customerId !== undefined && String(getCustomerId(customer)) === String(customerId);
  const getCustomerName = (customer) =>
    customer?.name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'this customer';
  const normalizeCustomerStatus = (status, fallback = 'active') => {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    return ['active', 'pending', 'suspended', 'rejected'].includes(normalizedStatus) ? normalizedStatus : fallback;
  };
  const getCustomerStatus = (customer) =>
    normalizeCustomerStatus(customer?.status, customer?.email ? 'active' : 'pending');
  const getProductId = (product) => product?.id ?? null;
  const getProductName = (product) => product?.name || 'this product';
  const getProductStock = (product) => Number(product?.stock ?? product?.quantity ?? 0);
  const getProductImage = (product) =>
    product?.image || product?.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
  const getProductStatus = (product) => {
    const normalizedStatus = String(product?.status || 'active').trim().toLowerCase();
    return ['active', 'inactive'].includes(normalizedStatus) ? normalizedStatus : 'active';
  };
  const normalizeAdminOrderStatus = (status) => {
    const normalizedStatus = String(status || 'pending').trim().toLowerCase();
    if (normalizedStatus === 'completed') return 'delivered';
    if (normalizedStatus === 'packing' || normalizedStatus === 'delivery') return 'processing';
    return ['pending', 'processing', 'delivered', 'cancelled'].includes(normalizedStatus)
      ? normalizedStatus
      : 'pending';
  };
  const mapApiOrderToAdminOrder = (apiOrder) => {
    const items = Array.isArray(apiOrder?.items) ? apiOrder.items : [];
    const firstItem = items[0] || {};
    const createdAt = apiOrder?.createdAt ? new Date(apiOrder.createdAt) : null;
    const orderDate = createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    return {
      id: apiOrder?.orderNumber || `ORD-${String(apiOrder?.id || '').padStart(6, '0')}`,
      orderId: apiOrder?.id,
      customer: apiOrder?.customer?.name || 'Unknown customer',
      customerId: apiOrder?.customer?.id || '-',
      customerEmail: apiOrder?.customer?.email || '',
      customerPhone: apiOrder?.customer?.phone || '',
      customerAddress: apiOrder?.customer?.address || '',
      customerCity: apiOrder?.customer?.city || '',
      customerZip: apiOrder?.customer?.zipCode || '',
      products: items.length ? items.map((item) => item.productName || 'Ordered product') : ['Ordered product'],
      total: Number(apiOrder?.totals?.total ?? 0),
      status: normalizeAdminOrderStatus(apiOrder?.status),
      orderDate,
      deliveryDate: ['delivered', 'completed'].includes(apiOrder?.status) ? orderDate : null,
      farmer: firstItem.farmerName || 'Product farmer',
      shippingMethod: apiOrder?.shippingMethod || '',
      paymentMethod: apiOrder?.paymentMethod || '',
      raw: apiOrder
    };
  };
  const getOrderStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || 'Pending';
  };
  const getNextOrderStatus = (status) => {
    const nextStatuses = {
      pending: 'processing',
      processing: 'delivered'
    };
    return nextStatuses[status] || null;
  };
  const getOrderStatusClassName = (status) => (
    status === 'delivered' ? 'bg-green-100 text-green-800' :
    status === 'processing' ? 'bg-blue-100 text-blue-800' :
    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  );
  const updateOrderStatus = async (orderId, nextStatus) => {
    const deliveryDate = nextStatus === 'delivered'
      ? new Date().toISOString().slice(0, 10)
      : null;
    const currentOrder = orders.find((order) => order.id === orderId);
    const databaseOrderId = currentOrder?.orderId || currentOrder?.raw?.id;

    if (databaseOrderId) {
      try {
        const response = await fetch(`${API_BASES.payments}/orders/${databaseOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update order status');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setOrderActionStatus({ type: 'error', message: error.message || 'Failed to update order status.' });
        return;
      }
    }

    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: nextStatus,
            deliveryDate: nextStatus === 'delivered' ? (order.deliveryDate || deliveryDate) : null
          }
        : order
    ));
    setSelectedOrder(prev => (
      prev?.id === orderId
        ? {
            ...prev,
            status: nextStatus,
            deliveryDate: nextStatus === 'delivered' ? (prev.deliveryDate || deliveryDate) : null
          }
        : prev
    ));
    setOrderActionStatus({ type: 'success', message: `Order ${orderId} moved to ${getOrderStatusLabel(nextStatus)}.` });
  };
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setOrderActionStatus(null);
  };
  const openOrderEditModal = (order) => {
    setEditingOrder(order);
    setOrderEditForm({
      id: order.id,
      customer: order.customer || '',
      customerId: order.customerId || '',
      customerPhone: order.customerPhone || '',
      deliveryAddress: [order.customerAddress, order.customerCity, order.customerZip].filter(Boolean).join(', '),
      products: (order.products || []).join(', '),
      total: order.total ?? '',
      status: order.status || 'pending',
      orderDate: order.orderDate || '',
      deliveryDate: order.deliveryDate || '',
      farmer: order.farmer || ''
    });
    setShowOrderEditModal(true);
    setOrderActionStatus(null);
  };
  const closeOrderEditModal = () => {
    setShowOrderEditModal(false);
    setEditingOrder(null);
    setOrderEditForm({});
  };
  const handleOrderEditFormChange = (field, value) => {
    setOrderEditForm(prev => ({ ...prev, [field]: value }));
  };
  const saveEditedOrder = async () => {
    if (!editingOrder) {
      return;
    }

    const total = Number(orderEditForm.total);
    const products = String(orderEditForm.products || '')
      .split(',')
      .map(product => product.trim())
      .filter(Boolean);

    if (!orderEditForm.customer?.trim()) {
      setOrderActionStatus({ type: 'error', message: 'Customer name is required.' });
      return;
    }

    if (products.length === 0) {
      setOrderActionStatus({ type: 'error', message: 'Add at least one product.' });
      return;
    }

    if (!Number.isFinite(total) || total < 0) {
      setOrderActionStatus({ type: 'error', message: 'Order total must be a valid number.' });
      return;
    }

    const updatedOrder = {
      ...editingOrder,
      customer: orderEditForm.customer.trim(),
      customerId: orderEditForm.customerId,
      products,
      total,
      status: orderEditForm.status || 'pending',
      orderDate: orderEditForm.orderDate || editingOrder.orderDate,
      deliveryDate: orderEditForm.status === 'delivered' ? (orderEditForm.deliveryDate || new Date().toISOString().slice(0, 10)) : null,
      farmer: orderEditForm.farmer.trim()
    };
    const databaseOrderId = editingOrder.orderId || editingOrder.raw?.id;

    if (databaseOrderId) {
      try {
        const [customerAddress = updatedOrder.customerAddress, customerCity = updatedOrder.customerCity, customerZip = updatedOrder.customerZip] =
          String(orderEditForm.deliveryAddress || editingOrder.customerAddress || '')
            .split(',')
            .map((part) => part.trim());

        const response = await fetch(`${API_BASES.payments}/orders/${databaseOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: updatedOrder.customer,
            customerPhone: orderEditForm.customerPhone || editingOrder.customerPhone || '',
            customerAddress,
            customerCity,
            customerZip,
            status: updatedOrder.status,
            total: updatedOrder.total
          })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save order');
        }

        if (data.order) {
          Object.assign(updatedOrder, mapApiOrderToAdminOrder(data.order));
        }
      } catch (error) {
        console.error('Error saving order:', error);
        setOrderActionStatus({ type: 'error', message: error.message || 'Failed to save order.' });
        return;
      }
    }

    setOrders(prev => prev.map(order => order.id === editingOrder.id ? updatedOrder : order));
    setSelectedOrder(prev => prev?.id === editingOrder.id ? updatedOrder : prev);
    closeOrderEditModal();
    setOrderActionStatus({ type: 'success', message: `Order ${editingOrder.id} updated successfully.` });
  };
  const handleOrderStatusChange = (orderId, nextStatus) => {
    updateOrderStatus(orderId, nextStatus);
  };
  const advanceOrderStatus = async (order) => {
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) {
      setOrderActionStatus({ type: 'error', message: `Order ${order.id} cannot be moved forward from ${getOrderStatusLabel(order.status)}.` });
      return;
    }

    await updateOrderStatus(order.id, nextStatus);
  };
  const deleteOrder = async (order) => {
    const shouldDelete = await confirmAction({
      title: 'Delete order?',
      text: `Are you sure you want to delete ${order.id}? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete order'
    });

    if (!shouldDelete) {
      return;
    }
    const databaseOrderId = order.orderId || order.raw?.id;

    if (databaseOrderId) {
      try {
        const response = await fetch(`${API_BASES.payments}/orders/${databaseOrderId}`, {
          method: 'DELETE'
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        setOrderActionStatus({ type: 'error', message: error.message || 'Failed to delete order.' });
        return;
      }
    }

    setOrders(prev => prev.filter(currentOrder => currentOrder.id !== order.id));
    setOrderActionStatus({ type: 'success', message: `Order ${order.id} deleted successfully.` });

    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setShowOrderModal(false);
    }
  };
  const exportOrders = () => {
    const rows = [
      ['Order ID', 'Customer', 'Customer ID', 'Products', 'Total', 'Status', 'Order Date', 'Delivery Date', 'Farmer'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer,
        order.customerId,
        order.products.join('; '),
        order.total,
        getOrderStatusLabel(order.status),
        order.orderDate,
        order.deliveryDate || '',
        order.farmer
      ])
    ];
    const csv = rows
      .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setOrderActionStatus({ type: 'success', message: 'Orders exported successfully.' });
  };

  // Handle user status change
  const handleStatusChange = async (userId, newStatus, type) => {
    if (!userId) {
      if (type === 'farmer') {
        setFarmerActionStatus({ type: 'error', message: 'Farmer ID is missing. Please refresh and try again.' });
      }
      if (type === 'customer') {
        setCustomerActionStatus({ type: 'error', message: 'Customer ID is missing. Please refresh and try again.' });
      }
      return;
    }

    if (type === 'farmer') {
      setUpdatingFarmerId(userId);
      setFarmerActionStatus(null);

      try {
        const response = await fetch(`${API_BASES.farmerProfile}/profile/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.error || 'Failed to update farmer status');
        }

        setFarmers(prev => prev.map(f =>
          isSameFarmer(f, userId) ? { ...f, status: newStatus } : f
        ));
        setFarmerActionStatus({ type: 'success', message: `Farmer status changed to ${newStatus}.` });
      } catch (error) {
        console.error('Error updating farmer status:', error);
        setFarmerActionStatus({ type: 'error', message: error.message || 'Failed to update farmer status.' });
      } finally {
        setUpdatingFarmerId(null);
      }
      return;
    }

    if (type === 'customer') {
      setUpdatingCustomerId(userId);
      setCustomerActionStatus(null);

      try {
        const response = await fetch(`${API_BASES.customer}/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.error || 'Failed to update customer status');
        }

        setCustomers(prev => prev.map(c =>
          isSameCustomer(c, userId) ? { ...c, status: newStatus } : c
        ));
        setCustomerActionStatus({ type: 'success', message: `Customer status changed to ${newStatus}.` });
      } catch (error) {
        console.error('Error updating customer status:', error);
        setCustomerActionStatus({ type: 'error', message: error.message || 'Failed to update customer status.' });
      } finally {
        setUpdatingCustomerId(null);
      }
    }
  };

  // Handle user verification
  const handleVerification = (userId, type) => {
    if (type === 'farmer') {
      setFarmers(prev => prev.map(f => isSameFarmer(f, userId) ? { ...f, verified: !f.verified } : f));
    } else {
      setCustomers(prev => prev.map(c => isSameCustomer(c, userId) ? { ...c, verified: !c.verified } : c));
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
    const farmerId = getFarmerId(farmer);
    const farmerName = getFarmerName(farmer);

    if (!farmerId) {
      setFarmerActionStatus({ type: 'error', message: 'Farmer ID is missing. Please refresh and try again.' });
      return;
    }

    const shouldDelete = await confirmAction({
      title: 'Delete farmer?',
      text: `Are you sure you want to delete ${farmerName}? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete farmer'
    });

    if (!shouldDelete) {
      return;
    }

    setDeletingFarmerId(farmerId);
    setFarmerActionStatus(null);

    try {
      const response = await fetch(`${API_BASES.farmerProfile}/profile/${farmerId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to delete farmer');
      }

      setFarmers(prev => prev.filter(f => !isSameFarmer(f, farmerId)));
      setFarmerActionStatus({ type: 'success', message: `${farmerName} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting farmer:', error);
      setFarmerActionStatus({ type: 'error', message: error.message || 'Failed to delete farmer.' });
    } finally {
      setDeletingFarmerId(null);
    }
  };

  // Save farmer edits
  const saveEditedFarmer = async () => {
    try {
      const editingFarmerId = getFarmerId(editingFarmer);
      if (!editingFarmerId) {
        setFarmerActionStatus({ type: 'error', message: 'Farmer ID is missing. Please refresh and try again.' });
        return;
      }

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

      const response = await fetch(`${API_BASES.farmerProfile}/profile/${editingFarmerId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update farmer in the state
        setFarmers(prev => prev.map(f => 
          isSameFarmer(f, editingFarmerId)
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
        setFarmerActionStatus({ type: 'success', message: 'Farmer details updated successfully.' });
      } else {
        setFarmerActionStatus({ type: 'error', message: data.error || 'Failed to update farmer details.' });
      }
    } catch (error) {
      console.error('Error updating farmer:', error);
      setFarmerActionStatus({ type: 'error', message: 'Failed to update farmer: ' + error.message });
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
      const searchText = [
        name,
        user.email,
        user.phone,
        user.nic_number,
        user.location,
        user.city,
        user.address,
        user.location_address
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
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

  const filteredCustomers = filterAndSortUsers(customers);
  const customerStatusSummary = {
    total: customers.length,
    active: customers.filter((customer) => getCustomerStatus(customer) === 'active').length,
    pending: customers.filter((customer) => getCustomerStatus(customer) === 'pending').length,
    suspended: customers.filter((customer) => getCustomerStatus(customer) === 'suspended').length
  };

  const pendingFarmers = farmers.filter((farmer) => farmer.status === 'pending');
  const compactRevenue = `Rs.${((Number(dashboardStats.totalRevenue) || 0) / 1000000).toFixed(1)}M`;
  const displayAdminAvatar = adminProfileImagePreview || currentAdmin.avatar;
  const totalUsers = dashboardStats.totalFarmers + dashboardStats.totalCustomers;
  const activeUsers = dashboardStats.activeFarmers + dashboardStats.activeCustomers;
  const totalOrderValue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const analyticsRevenue = dashboardStats.totalRevenue || totalOrderValue;
  const productInventoryValue = products.reduce(
    (sum, product) => sum + ((Number(product.price) || 0) * (Number(product.stock ?? product.quantity) || 0)),
    0
  );

  const formatNumber = (value) => (Number(value) || 0).toLocaleString('en-LK');
  const formatCurrency = (value) => `Rs.${formatNumber(Math.round(Number(value) || 0))}`;
  const formatRate = (part, total) => {
    if (!Number(total)) return '0.0%';
    return `${(((Number(part) || 0) / Number(total)) * 100).toFixed(1)}%`;
  };

  const productCategories = [...new Set(products.map(product => product.category).filter(Boolean))].sort();
  const filteredOrders = orders.filter((order) => {
    const searchText = [
      order.id,
      order.customer,
      order.customerId,
      order.farmer,
      ...(order.products || [])
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = searchText.includes(orderSearchQuery.trim().toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesDate = !orderDateFilter || order.orderDate === orderDateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });
  const filteredProducts = products
    .filter((product) => {
      const productStatus = getProductStatus(product);
      const productText = [
        product.name,
        product.description,
        product.category,
        product.farmer,
        product.address
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = productText.includes(productSearchQuery.trim().toLowerCase());
      const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
      const matchesStatus = productStatusFilter === 'all' || productStatus === productStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = productSortBy === 'stock' ? getProductStock(a) : a[productSortBy] ?? '';
      let bValue = productSortBy === 'stock' ? getProductStock(b) : b[productSortBy] ?? '';

      if (productSortBy === 'price') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (productSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });
  const productSummary = {
    total: products.length,
    active: products.filter(product => getProductStatus(product) === 'active').length,
    inactive: products.filter(product => getProductStatus(product) === 'inactive').length,
    inventoryValue: products.reduce(
      (sum, product) => sum + ((Number(product.price) || 0) * getProductStock(product)),
      0
    )
  };

  const productCategoryRows = Object.values(products.reduce((categoryMap, product) => {
    const category = product.category || 'Uncategorized';
    const stock = Number(product.stock ?? product.quantity) || 0;
    const price = Number(product.price) || 0;

    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        products: 0,
        stock: 0,
        inventoryValue: 0
      };
    }

    categoryMap[category].products += 1;
    categoryMap[category].stock += stock;
    categoryMap[category].inventoryValue += price * stock;

    return categoryMap;
  }, {}))
    .sort((a, b) => b.products - a.products)
    .slice(0, 5);

  const lowStockRows = products
    .filter((product) => (Number(product.stock ?? product.quantity) || 0) < 50)
    .sort((a, b) => (Number(a.stock ?? a.quantity) || 0) - (Number(b.stock ?? b.quantity) || 0))
    .slice(0, 5);

  const topFarmerRows = farmers
    .map((farmer) => ({
      id: farmer.user_id || farmer.id || farmer.email,
      name: farmer.name || `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || 'Unknown farmer',
      city: farmer.city || farmer.location_address || 'Sri Lanka',
      status: farmer.status || 'active',
      revenue: Number(farmer.revenue) || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const analyticsMetricCards = [
    {
      id: 'revenue',
      label: 'Platform Revenue',
      value: formatCurrency(analyticsRevenue),
      detail: `${formatCurrency(totalOrderValue)} tracked through visible orders`,
      icon: FaMoneyBillWave,
      colorClassName: 'text-emerald-700',
      surfaceClassName: 'bg-emerald-50'
    },
    {
      id: 'users',
      label: 'Active Users',
      value: formatNumber(activeUsers),
      detail: `${formatRate(activeUsers, totalUsers)} of ${formatNumber(totalUsers)} total accounts`,
      icon: FaUsers,
      colorClassName: 'text-sky-700',
      surfaceClassName: 'bg-sky-50'
    },
    {
      id: 'orders',
      label: 'Order Completion',
      value: formatRate(dashboardStats.completedOrders, dashboardStats.totalOrders),
      detail: `${dashboardStats.completedOrders} completed, ${dashboardStats.pendingOrders} pending`,
      icon: FaClipboardList,
      colorClassName: 'text-indigo-700',
      surfaceClassName: 'bg-indigo-50'
    },
    {
      id: 'inventory',
      label: 'Inventory Value',
      value: formatCurrency(productInventoryValue),
      detail: `${dashboardStats.lowStockProducts} low-stock items need attention`,
      icon: FaBox,
      colorClassName: 'text-amber-700',
      surfaceClassName: 'bg-amber-50'
    }
  ];

  const analyticsHealthRows = [
    {
      label: 'Farmer activation',
      value: dashboardStats.activeFarmers,
      total: dashboardStats.totalFarmers,
      colorClassName: 'bg-emerald-500'
    },
    {
      label: 'Customer activation',
      value: dashboardStats.activeCustomers,
      total: dashboardStats.totalCustomers,
      colorClassName: 'bg-sky-500'
    },
    {
      label: 'Product availability',
      value: dashboardStats.activeProducts,
      total: dashboardStats.totalProducts,
      colorClassName: 'bg-amber-500'
    },
    {
      label: 'Order completion',
      value: dashboardStats.completedOrders,
      total: dashboardStats.totalOrders,
      colorClassName: 'bg-indigo-500'
    }
  ];

  const exportAnalyticsReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        platformRevenue: analyticsRevenue,
        activeUsers,
        totalUsers,
        totalProducts: dashboardStats.totalProducts,
        activeProducts: dashboardStats.activeProducts,
        lowStockProducts: dashboardStats.lowStockProducts,
        totalOrders: dashboardStats.totalOrders,
        completedOrders: dashboardStats.completedOrders,
        pendingOrders: dashboardStats.pendingOrders
      },
      categories: productCategoryRows,
      lowStock: lowStockRows,
      topFarmers: topFarmerRows
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dec-platform-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const overviewStats = [
    {
      id: 'farmers',
      label: 'Total Farmers',
      value: dashboardStats.totalFarmers,
      detail: `${dashboardStats.activeFarmers} active accounts`,
      icon: FaTractor,
      iconClassName: 'bg-emerald-100 text-emerald-600',
      accentClassName: 'from-emerald-400 via-lime-400 to-emerald-100'
    },
    {
      id: 'customers',
      label: 'Total Customers',
      value: dashboardStats.totalCustomers,
      detail: `${dashboardStats.activeCustomers} active buyers`,
      icon: FaUsers,
      iconClassName: 'bg-sky-100 text-sky-600',
      accentClassName: 'from-sky-400 via-indigo-400 to-sky-100'
    },
    {
      id: 'products',
      label: 'Active Products',
      value: dashboardStats.totalProducts,
      detail: `${dashboardStats.activeProducts} live in catalog`,
      icon: FaBox,
      iconClassName: 'bg-amber-100 text-amber-600',
      accentClassName: 'from-amber-400 via-orange-400 to-amber-100'
    },
    {
      id: 'revenue',
      label: 'Platform Revenue',
      value: compactRevenue,
      detail: `${dashboardStats.totalOrders} tracked orders`,
      icon: FaMoneyBillWave,
      iconClassName: 'bg-violet-100 text-violet-600',
      accentClassName: 'from-violet-500 via-fuchsia-400 to-violet-100'
    }
  ];

  const formatDateTime = (value) => {
    if (!value) return 'Never';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Unknown';

    return parsedDate.toLocaleString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role = '') => {
    switch ((role || '').toLowerCase()) {
      case 'administrator':
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'farmer':
        return 'bg-emerald-100 text-emerald-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPasswordStatusMeta = (status = '') => {
    switch (status) {
      case 'hashed':
        return {
          label: 'Hidden (hashed)',
          className: 'bg-emerald-100 text-emerald-800',
          icon: FaLock
        };
      case 'legacy_plain_text':
        return {
          label: 'Legacy storage',
          className: 'bg-red-100 text-red-800',
          icon: FaUnlock
        };
      default:
        return {
          label: 'Not set',
          className: 'bg-amber-100 text-amber-800',
          icon: FaExclamationTriangle
        };
    }
  };

  const getNotificationMeta = (notification) => {
    const priorityMeta = {
      high: {
        badgeClassName: 'bg-rose-100 text-rose-700',
        iconClassName: 'bg-rose-100 text-rose-600'
      },
      medium: {
        badgeClassName: 'bg-amber-100 text-amber-700',
        iconClassName: 'bg-amber-100 text-amber-600'
      },
      low: {
        badgeClassName: 'bg-emerald-100 text-emerald-700',
        iconClassName: 'bg-emerald-100 text-emerald-600'
      }
    };

    const typeIconMap = {
      farmer: FaTractor,
      customer: FaUsers,
      system: FaCog
    };

    return {
      Icon: typeIconMap[notification.type] || FaBell,
      ...(priorityMeta[notification.priority] || priorityMeta.low)
    };
  };

  // Common card wrapper component for consistent styling
  const CardWrapper = ({ children, className = "" }) => (
    <div className={`rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(76,29,149,0.08)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );

  // Common page header component
  const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-700 shadow-sm">
          DEC Admin Workspace
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p>
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );

  const sidebarItems = [
    { id: 'overview-section', kind: 'section', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard', icon: FaHome, description: 'Platform snapshot' },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar, description: 'Growth and trends' },
    { id: 'operations-section', kind: 'section', label: 'Operations' },
    { id: 'farmers', label: 'Manage Farmers', icon: FaTractor, description: 'Seller approvals and updates' },
    { id: 'customers', label: 'Manage Customers', icon: FaUsers, description: 'Buyer accounts and support' },
    { id: 'products', label: 'Products', icon: FaBox, description: 'Catalog oversight' },
    { id: 'orders', label: 'Orders', icon: FaClipboardList, description: 'Order operations' },
    { id: 'system-section', kind: 'section', label: 'System' },
    { id: 'profile', label: 'My Profile', icon: FaUserTie, description: 'Account details and password' },
    { id: 'settings', label: 'Settings', icon: FaCog, description: 'Security and platform controls' }
  ];

  const activeSidebarItem = sidebarItems.find((item) => item.id === activeTab && item.kind !== 'section');
  const unreadNotifications = notifications.filter((item) => item.priority === 'high').length;

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleAdminProfileFieldChange = (field, value) => {
    setAdminProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAdminProfileDraft = () => {
    setAdminProfileForm({
      name: currentAdmin.name || '',
      email: currentAdmin.email || ''
    });
    setAdminProfileImageFile(null);
    setAdminProfileImagePreview(null);
    setAdminProfileStatus(null);
  };

  const handleAdminProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminProfileStatus({
        type: 'error',
        text: 'Please choose a valid image file for the admin profile photo.'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAdminProfileStatus({
        type: 'error',
        text: 'The admin profile photo must be 5MB or smaller.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setAdminProfileImageFile(file);
      setAdminProfileImagePreview(loadEvent.target?.result || null);
      setAdminProfileStatus(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAdminPasswordFieldChange = (field, value) => {
    setAdminPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveAdminProfile = async () => {
    const trimmedName = adminProfileForm.name.trim();
    const trimmedEmail = adminProfileForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setAdminProfileStatus({
        type: 'error',
        text: 'Admin name and email are required before saving the profile.'
      });
      return;
    }

    try {
      setSavingAdminProfile(true);
      setAdminProfileStatus(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('email', trimmedEmail);

      if (adminProfileImageFile) {
        formData.append('avatar', adminProfileImageFile);
      }

      const response = await fetch(`${API_BASES.auth}/admin-profile`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update the admin profile.');
      }

      const updatedUser = result.user || {};

      setCurrentAdmin((prev) => ({
        ...prev,
        id: updatedUser.id || updatedUser.userId || prev.id,
        userId: updatedUser.userId || updatedUser.id || prev.userId,
        name: updatedUser.name || prev.name,
        email: updatedUser.email || prev.email,
        accountRole: updatedUser.role || prev.accountRole,
        created_at: updatedUser.created_at || prev.created_at,
        updated_at: updatedUser.updated_at || prev.updated_at,
        last_login: updatedUser.last_login || prev.last_login,
        avatar: buildAdminAvatar(
          updatedUser.name || prev.name,
          updatedUser.avatar || prev.avatar || user?.avatar || ''
        )
      }));

      syncAdminSessionUser({
        id: updatedUser.id || currentAdmin.id,
        userId: updatedUser.userId || updatedUser.id || currentAdmin.userId,
        name: updatedUser.name || trimmedName,
        email: updatedUser.email || trimmedEmail,
        avatar: updatedUser.avatar || currentAdmin.avatar || '',
        role: updatedUser.role || currentAdmin.accountRole
      });
      setAdminProfileImageFile(null);
      setAdminProfileImagePreview(null);

      setAdminProfileStatus({
        type: 'success',
        text: 'Admin profile updated successfully.'
      });
    } catch (error) {
      console.error('Failed to update admin profile:', error);
      setAdminProfileStatus({
        type: 'error',
        text: error.message || 'Failed to update the admin profile.'
      });
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const saveAdminPassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = adminPasswordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setAdminPasswordStatus({
        type: 'error',
        text: 'Enter the current password, new password, and confirm password.'
      });
      return;
    }

    if (newPassword.length < 6) {
      setAdminPasswordStatus({
        type: 'error',
        text: 'The new password must be at least 6 characters long.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAdminPasswordStatus({
        type: 'error',
        text: 'The new password and confirm password do not match.'
      });
      return;
    }

    try {
      setSavingAdminPassword(true);
      setAdminPasswordStatus(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASES.auth}/admin-profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update the admin password.');
      }

      setAdminPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAdminPasswordStatus({
        type: 'success',
        text: 'Admin password updated successfully.'
      });
    } catch (error) {
      console.error('Failed to update admin password:', error);
      setAdminPasswordStatus({
        type: 'error',
        text: error.message || 'Failed to update the admin password.'
      });
    } finally {
      setSavingAdminPassword(false);
    }
  };

  const quickAdminActions = [
    {
      id: 'farmers',
      title: 'Farmer approvals',
      description: 'Review onboarding, activation, and seller profile updates.',
      icon: FaTractor,
      iconClassName: 'bg-emerald-100 text-emerald-600',
      accentClassName: 'from-emerald-500 to-lime-400',
      hoverClassName: 'hover:border-emerald-200 hover:bg-emerald-50/70'
    },
    {
      id: 'customers',
      title: 'Customer records',
      description: 'Track user activity, support requests, and account health.',
      icon: FaUsers,
      iconClassName: 'bg-sky-100 text-sky-600',
      accentClassName: 'from-sky-500 to-indigo-500',
      hoverClassName: 'hover:border-sky-200 hover:bg-sky-50/70'
    },
    {
      id: 'analytics',
      title: 'Analytics center',
      description: 'Watch orders, revenue, and platform performance in one place.',
      icon: FaChartBar,
      iconClassName: 'bg-violet-100 text-violet-600',
      accentClassName: 'from-violet-500 to-fuchsia-500',
      hoverClassName: 'hover:border-violet-200 hover:bg-violet-50/70'
    }
  ];

  const renderAnalyticsTab = () => (
    <div className="w-full space-y-6">
      <PageHeader
        title="Platform Analytics"
        subtitle="Operational metrics for revenue, user activity, inventory health, and order flow."
        action={
          <button
            type="button"
            onClick={exportAnalyticsReport}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-700 sm:w-auto"
          >
            <FaDownload className="mr-2" /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsMetricCards.map(({ id, label, value, detail, icon: Icon, colorClassName, surfaceClassName }) => (
          <CardWrapper key={id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className={`mt-3 truncate text-2xl font-bold ${colorClassName}`}>{value}</p>
                <p className="mt-2 text-sm text-slate-600">{detail}</p>
              </div>
              <div className={`rounded-2xl p-3 ${surfaceClassName} ${colorClassName}`}>
                <Icon className="text-xl" />
              </div>
            </div>
          </CardWrapper>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <CardWrapper className="p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Operational Health</h3>
              <p className="mt-1 text-sm text-slate-600">Live ratios from the current admin data set.</p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {formatNumber(totalUsers)} accounts
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {analyticsHealthRows.map((row) => {
              const percent = Number(row.total) ? Math.round((Number(row.value) / Number(row.total)) * 100) : 0;

              return (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                    <p className="text-sm text-slate-500">{formatNumber(row.value)} / {formatNumber(row.total)}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${row.colorClassName}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{percent}%</p>
                </div>
              );
            })}
          </div>
        </CardWrapper>

        <CardWrapper className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Order Pipeline</h3>
              <p className="mt-1 text-sm text-slate-600">Current fulfilment status mix.</p>
            </div>
            <FaClipboardList className="text-2xl text-indigo-600" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{dashboardStats.pendingOrders}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Pending</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4 text-center">
              <p className="text-2xl font-bold text-sky-700">{dashboardStats.processingOrders}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Processing</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{dashboardStats.completedOrders}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Delivered</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Average order value</p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(dashboardStats.totalOrders ? totalOrderValue / dashboardStats.totalOrders : 0)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Completion rate</p>
              <p className="text-sm font-bold text-emerald-700">{formatRate(dashboardStats.completedOrders, dashboardStats.totalOrders)}</p>
            </div>
          </div>
        </CardWrapper>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CardWrapper className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Category Performance</h3>
              <p className="mt-1 text-sm text-slate-600">Product count, stock, and inventory value by category.</p>
            </div>
            <FaBox className="text-2xl text-amber-600" />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Products</th>
                  <th className="py-3 pr-4">Stock</th>
                  <th className="py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productCategoryRows.length > 0 ? (
                  productCategoryRows.map((row) => (
                    <tr key={row.category}>
                      <td className="py-4 pr-4 text-sm font-semibold text-slate-900">{row.category}</td>
                      <td className="py-4 pr-4 text-sm text-slate-600">{formatNumber(row.products)}</td>
                      <td className="py-4 pr-4 text-sm text-slate-600">{formatNumber(row.stock)}</td>
                      <td className="py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(row.inventoryValue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-sm text-slate-500">No product categories available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        <CardWrapper className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Low Stock Watch</h3>
              <p className="mt-1 text-sm text-slate-600">Items below the 50-unit stock threshold.</p>
            </div>
            <FaExclamationTriangle className="text-2xl text-rose-600" />
          </div>

          <div className="mt-5 space-y-3">
            {lowStockRows.length > 0 ? (
              lowStockRows.map((product) => {
                const stock = Number(product.stock ?? product.quantity) || 0;

                return (
                  <div key={product.id || product.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.category || 'Uncategorized'} by {product.farmer || 'Unknown seller'}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">
                      {formatNumber(stock)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No low-stock products right now.
              </div>
            )}
          </div>
        </CardWrapper>
      </div>

      <CardWrapper className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Farmer Revenue Leaders</h3>
            <p className="mt-1 text-sm text-slate-600">Top seller accounts based on the revenue field available to the admin panel.</p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {formatNumber(farmers.length)} farmers
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="py-3 pr-4">Farmer</th>
                <th className="py-3 pr-4">Location</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topFarmerRows.length > 0 ? (
                topFarmerRows.map((farmer) => (
                  <tr key={farmer.id || farmer.name}>
                    <td className="py-4 pr-4 text-sm font-semibold text-slate-900">{farmer.name}</td>
                    <td className="py-4 pr-4 text-sm text-slate-600">{farmer.city}</td>
                    <td className="py-4 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        farmer.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : farmer.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {farmer.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(farmer.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-sm text-slate-500">No farmer revenue data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardWrapper>
    </div>
  );

  const renderAdminProfileTab = () => (
    <div className="relative z-20 w-full space-y-8" onClick={(event) => event.stopPropagation()}>
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your account photo, update the admin email, and change the password from one secure workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
        <CardWrapper className="overflow-hidden">
          <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-6 text-white sm:p-7">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Account center
            </span>
            <div className="mt-5 flex items-center gap-4">
              <img
                src={displayAdminAvatar}
                alt={currentAdmin.name}
                className="h-20 w-20 rounded-[24px] border border-white/30 object-cover shadow-lg"
              />
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold">{currentAdmin.name}</h2>
                <p className="truncate text-sm text-white/80">{currentAdmin.email}</p>
                <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {currentAdmin.role}
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm text-white/80">
              Keep your admin identity current so notifications, access logs, and platform ownership stay accurate.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last login</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(currentAdmin.last_login)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Created</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(currentAdmin.created_at)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account role</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{currentAdmin.accountRole || 'admin'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Password state</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">Protected with secure update flow</p>
            </div>
          </div>
        </CardWrapper>

        <CardWrapper className="relative z-20 pointer-events-auto p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit admin details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Update the account photo, display name, and sign-in email used for the admin workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAdminProfile}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              <FaSync className={`mr-2 ${loadingAdminProfile ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {adminProfileStatus && (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              adminProfileStatus.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}>
              {adminProfileStatus.text}
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={displayAdminAvatar}
                    alt={currentAdmin.name}
                    className="h-20 w-20 rounded-[24px] border border-white bg-white object-cover shadow-sm"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Admin profile photo</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Upload a JPG, PNG, GIF, or WEBP image up to 5MB.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
                    <FaUpload className="mr-2" /> Change photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminProfileImageChange}
                      className="hidden"
                    />
                  </label>
                  {adminProfileImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminProfileImageFile(null);
                        setAdminProfileImagePreview(null);
                        setAdminProfileStatus(null);
                      }}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      <FaTimes className="mr-2" /> Use saved photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="relative z-50 block cursor-text sm:col-span-2" onClick={(event) => event.stopPropagation()}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Admin name
              </span>
              <input
                id="admin-profile-name"
                type="text"
                value={adminProfileForm.name}
                onChange={(event) => handleAdminProfileFieldChange('name', event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="relative z-50 block w-full pointer-events-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Administrator name"
                autoComplete="off"
              />
            </label>

            <label className="relative z-50 block cursor-text sm:col-span-2" onClick={(event) => event.stopPropagation()}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Admin email
              </span>
              <input
                id="admin-profile-email"
                type="email"
                value={adminProfileForm.email}
                onChange={(event) => handleAdminProfileFieldChange('email', event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="relative z-50 block w-full pointer-events-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="admin@example.com"
                autoComplete="off"
              />
              <p className="mt-2 text-xs text-slate-500">
                This email will be used for the admin sign-in and account notifications.
              </p>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveAdminProfile}
              disabled={savingAdminProfile}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaSave className="mr-2" /> {savingAdminProfile ? 'Saving profile...' : 'Save profile'}
            </button>
            <button
              type="button"
              onClick={resetAdminProfileDraft}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              Reset fields
            </button>
          </div>
        </CardWrapper>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
        <CardWrapper className="p-6 sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change password</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enter the current password first, then save a stronger replacement for this admin account.
            </p>
          </div>

          {adminPasswordStatus && (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              adminPasswordStatus.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}>
              {adminPasswordStatus.text}
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="admin-current-password">
                Current password
              </label>
              <input
                id="admin-current-password"
                type="password"
                value={adminPasswordForm.currentPassword}
                onChange={(event) => handleAdminPasswordFieldChange('currentPassword', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="admin-new-password">
                New password
              </label>
              <input
                id="admin-new-password"
                type="password"
                value={adminPasswordForm.newPassword}
                onChange={(event) => handleAdminPasswordFieldChange('newPassword', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="admin-confirm-password">
                Confirm password
              </label>
              <input
                id="admin-confirm-password"
                type="password"
                value={adminPasswordForm.confirmPassword}
                onChange={(event) => handleAdminPasswordFieldChange('confirmPassword', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Repeat the new password"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveAdminPassword}
              disabled={savingAdminPassword}
              className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaLock className="mr-2" /> {savingAdminPassword ? 'Updating password...' : 'Update password'}
            </button>
            <button
              type="button"
              onClick={() => setAdminPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              Clear password form
            </button>
          </div>
        </CardWrapper>

        <CardWrapper className="p-6 sm:p-7">
          <h2 className="text-xl font-bold text-slate-900">Profile activity</h2>
          <p className="mt-1 text-sm text-slate-600">
            A quick view of this admin account and the current security posture.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <FaEnvelope className="text-base" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Sign-in email</p>
                <p className="mt-1 text-sm text-slate-600">{currentAdmin.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <FaCheckCircle className="text-base" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Access role</p>
                <p className="mt-1 text-sm text-slate-600">{currentAdmin.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <FaCalendar className="text-base" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Latest access</p>
                <p className="mt-1 text-sm text-slate-600">{formatDateTime(currentAdmin.last_login)}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Security note</p>
              <p className="mt-3 text-sm text-white/85">
                Password changes require the current password first, so only the logged-in admin can rotate credentials.
              </p>
            </div>
          </div>
        </CardWrapper>
      </div>
    </div>
  );

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };  // Delete customer handler
  const handleDeleteCustomer = async (user) => {
    const userId = getCustomerId(user);
    const customerName = getCustomerName(user);

    if (!userId) {
      setCustomerActionStatus({ type: 'error', message: 'Customer ID is missing. Please refresh and try again.' });
      return;
    }

    const shouldDelete = await confirmAction({
      title: 'Delete customer?',
      text: `Are you sure you want to delete ${customerName}? This action cannot be undone and will remove all customer data including profile, orders, and reviews.`,
      confirmButtonText: 'Yes, delete customer'
    });

    if (!shouldDelete) return;
    
    setDeletingCustomerId(userId);
    setCustomerActionStatus(null);

    try {
      console.log('Deleting customer with ID:', userId);
      
      const response = await fetch(`${API_BASES.customer}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json().catch(() => ({}));
      console.log('Delete response:', data);
      
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to delete customer. Please try again.');
      }

      setCustomers(prev => prev.filter(c => !isSameCustomer(c, userId)));
      setShowUserModal(false);
      setSelectedUser(null);
      setCustomerActionStatus({ type: 'success', message: `${customerName} deleted successfully.` });
    } catch (err) {
      console.error('Error deleting customer:', err);
      setCustomerActionStatus({ type: 'error', message: 'Failed to delete customer: ' + err.message });
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const openProductEditModal = (product) => {
    setEditingProduct(product);
    setProductEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      quantity: getProductStock(product),
      category: product.category || '',
      status: getProductStatus(product),
      unit: product.unit || 'kg',
      address: product.address || '',
      image_url: getProductImage(product)
    });
    setProductActionStatus(null);
    setShowProductEditModal(true);
  };

  const handleProductEditFormChange = (field, value) => {
    setProductEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEditedProduct = async () => {
    const productId = getProductId(editingProduct);
    const price = Number(productEditForm.price);
    const quantity = Number(productEditForm.quantity);

    if (!productId) {
      setProductActionStatus({ type: 'error', message: 'Product ID is missing. Please refresh and try again.' });
      return;
    }

    if (!productEditForm.name?.trim()) {
      setProductActionStatus({ type: 'error', message: 'Product name is required.' });
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setProductActionStatus({ type: 'error', message: 'Product price must be a valid positive number.' });
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      setProductActionStatus({ type: 'error', message: 'Product stock must be zero or a positive number.' });
      return;
    }

    setSavingProductId(productId);
    setProductActionStatus(null);

    try {
      const payload = {
        name: productEditForm.name.trim(),
        description: productEditForm.description?.trim() || '',
        price,
        quantity,
        category: productEditForm.category?.trim() || '',
        status: productEditForm.status || 'active',
        unit: productEditForm.unit || 'kg',
        address: productEditForm.address?.trim() || '',
        image_url: productEditForm.image_url || getProductImage(editingProduct),
        lat: editingProduct?.lat || null,
        lng: editingProduct?.lng || null
      };

      const response = await fetch(`${API_BASES.products}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to update product');
      }

      setProducts(prev => prev.map(product =>
        getProductId(product) === productId
          ? {
              ...product,
              ...payload,
              stock: quantity,
              quantity,
              image: payload.image_url,
              image_url: payload.image_url
            }
          : product
      ));
      setShowProductEditModal(false);
      setEditingProduct(null);
      setProductEditForm({});
      setProductActionStatus({ type: 'success', message: `${payload.name} updated successfully.` });
      fetchProductStats();
    } catch (err) {
      console.error('Error updating product:', err);
      setProductActionStatus({ type: 'error', message: err.message || 'Failed to update product.' });
    } finally {
      setSavingProductId(null);
    }
  };

  const updateProductStatus = async (product, nextStatus) => {
    const productId = getProductId(product);

    if (!productId) {
      setProductActionStatus({ type: 'error', message: 'Product ID is missing. Please refresh and try again.' });
      return;
    }

    setSavingProductId(productId);
    setProductActionStatus(null);

    try {
      const response = await fetch(`${API_BASES.products}/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to update product status');
      }

      setProducts(prev => prev.map(item =>
        getProductId(item) === productId ? { ...item, status: nextStatus } : item
      ));
      setProductActionStatus({ type: 'success', message: `${getProductName(product)} marked as ${nextStatus}.` });
      fetchProductStats();
    } catch (err) {
      console.error('Error updating product status:', err);
      setProductActionStatus({ type: 'error', message: err.message || 'Failed to update product status.' });
    } finally {
      setSavingProductId(null);
    }
  };

  const deleteProduct = async (product) => {
    const productId = getProductId(product);
    const productName = getProductName(product);

    if (!productId) {
      setProductActionStatus({ type: 'error', message: 'Product ID is missing. Please refresh and try again.' });
      return;
    }

    const shouldDelete = await confirmAction({
      title: 'Delete product?',
      text: `Delete ${productName}? This will remove the farmer product from the platform.`,
      confirmButtonText: 'Yes, delete product'
    });

    if (!shouldDelete) {
      return;
    }

    setDeletingProductId(productId);
    setProductActionStatus(null);

    try {
      const response = await fetch(`${API_BASES.products}/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts(prev => prev.filter(item => getProductId(item) !== productId));
      setProductActionStatus({ type: 'success', message: `${productName} deleted successfully.` });
      fetchProductStats();
    } catch (err) {
      console.error('Error deleting product:', err);
      setProductActionStatus({ type: 'error', message: err.message || 'Failed to delete product.' });
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div
      className="min-h-screen mobile-safe-shell relative w-full overflow-x-hidden bg-[#f5f3ff] admin-container"
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        minHeight: '100dvh',
        overflowX: 'hidden'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: 'radial-gradient(circle at top left, rgba(139,92,246,0.18), transparent 32%), radial-gradient(circle at top right, rgba(236,72,153,0.14), transparent 24%), radial-gradient(circle at bottom left, rgba(59,130,246,0.1), transparent 28%), linear-gradient(180deg, rgba(245,243,255,0.96) 0%, rgba(238,242,255,0.98) 52%, rgba(248,250,252,1) 100%)'
        }}
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/90 py-2 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'
          : 'bg-transparent py-4'
      }`}>
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleSidebarToggle}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className="sidebar-toggle inline-flex items-center justify-center rounded-2xl border border-violet-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md"
              >
                <FaBars className="text-lg text-violet-700" />
              </button>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-2.5 shadow-[0_18px_30px_rgba(109,40,217,0.28)]">
                  <FaUserTie className="text-xl text-white sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 bg-clip-text text-base font-bold text-transparent sm:text-lg lg:text-xl">
                    <span className="hidden sm:inline">Dedicated Economic Center Admin</span>
                    <span className="sm:hidden">Admin Panel</span>
                  </h1>
                  <p className="hidden text-xs text-slate-600 sm:block">
                    {activeSidebarItem?.label || 'Control center'}{activeSidebarItem?.description ? ` | ${activeSidebarItem.description}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users, orders, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-72 rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="admin-notification-trigger relative rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:border-violet-200 hover:bg-violet-50 hover:shadow-md"
                >
                  <FaBell className="text-base text-slate-700 sm:text-lg" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-semibold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="admin-notification-panel absolute right-0 mt-2 w-72 rounded-[24px] border border-slate-200 bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:w-80">
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        <p className="text-xs text-slate-500">System and moderation alerts</p>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="mb-1 rounded-2xl p-3 transition-colors hover:bg-violet-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{notification.message}</p>
                              <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                              notification.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : notification.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className="flex items-center gap-3 rounded-2xl px-1 py-1 transition-all hover:bg-white/60"
              >
                <div className="hidden text-right md:block">
                  <p className="max-w-36 truncate text-sm font-semibold text-slate-800">{currentAdmin.name}</p>
                  <p className="max-w-40 truncate text-xs text-slate-500">{currentAdmin.role}</p>
                </div>
                <img
                  src={displayAdminAvatar}
                  alt="Profile"
                  className="h-10 w-10 rounded-2xl border border-white shadow-sm ring-2 ring-violet-500/20 transition-all hover:ring-violet-500 sm:h-11 sm:w-11"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div className="relative z-10 flex w-full min-h-screen pt-16 sm:pt-20">
        <aside className={`sidebar fixed inset-y-0 left-0 z-40 transition-all duration-500 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen
            ? 'w-64 translate-x-0 xl:w-72'
            : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
        } border-r border-slate-200/80 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl`}>
          <div className="relative h-full overflow-y-auto pt-20 pb-6">
            <div className="px-3 pb-4">
              {sidebarOpen ? (
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-4 text-left text-white shadow-[0_20px_50px_rgba(109,40,217,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={displayAdminAvatar}
                      alt="Admin profile"
                      className="h-14 w-14 rounded-2xl border border-white/40 object-cover shadow-lg"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">Administrator</p>
                      <h2 className="truncate text-base font-semibold">{currentAdmin.name}</h2>
                      <p className="truncate text-sm text-white/80">{currentAdmin.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">Workspace</p>
                      <p className="text-sm font-medium">Purple dashboard shell</p>
                    </div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Online</span>
                  </div>
                </button>
              ) : (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange('profile')}
                    className="rounded-2xl transition-transform hover:-translate-y-0.5"
                  >
                  <img
                    src={displayAdminAvatar}
                    alt="Admin profile"
                    className="h-12 w-12 rounded-2xl border border-violet-100 object-cover shadow-md"
                  />
                  </button>
                </div>
              )}
            </div>
            <nav className="px-3">
              {sidebarItems.map((item) => {
                if (item.kind === 'section') {
                  return sidebarOpen ? (
                    <div
                      key={item.id}
                      className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400"
                    >
                      {item.label}
                    </div>
                  ) : (
                    <div key={item.id} className="mx-auto my-4 h-px w-10 bg-slate-200" />
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group mb-2 flex w-full items-center rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                      activeTab === item.id
                        ? 'scale-[1.01] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 text-white shadow-[0_14px_32px_rgba(109,40,217,0.25)]'
                        : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700'
                    } ${sidebarOpen ? '' : 'justify-center px-2'}`}
                    title={item.label}
                  >
                    <item.icon className={`text-lg transition-all duration-300 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && (
                      <>
                        <div className="min-w-0">
                          <span className="block truncate font-medium">{item.label}</span>
                          <span className={`block truncate text-[11px] ${
                            activeTab === item.id ? 'text-white/75' : 'text-slate-400 group-hover:text-violet-600'
                          }`}>
                            {item.description}
                          </span>
                        </div>
                        {activeTab === item.id && <FaChevronRight className="ml-auto text-sm" />}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-4 left-0 right-0 px-3">
              <button
                onClick={handleLogout}
                className={`flex w-full items-center rounded-2xl px-4 py-3 text-red-600 transition-all duration-300 hover:bg-red-50 ${
                  sidebarOpen ? '' : 'justify-center'
                }`}
                title="Logout"
              >
                <FaSignOutAlt className={`text-lg ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="w-full px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 xl:px-8">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="w-full space-y-6 xl:space-y-8">
                <PageHeader
                  title="System Administration Dashboard"
                  subtitle="Monitor every side of the platform from one admin workspace with a cleaner Purple-style layout."
                  action={
                    <button
                      onClick={() => handleTabChange('settings')}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-violet-700 sm:w-auto"
                    >
                      <FaCog className="mr-2" /> Open settings
                    </button>
                  }
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                  <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 p-6 text-white shadow-[0_24px_60px_rgba(109,40,217,0.28)] sm:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_28%)]" />
                    <div className="relative">
                      <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                        Purple Dashboard Shell
                      </span>
                      <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                        Platform command center for farmers, customers, products, and system operations.
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
                        This admin dashboard now uses a more structured template style with a focused navbar, profile sidebar, and cleaner overview cards.
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Pending farmers</p>
                          <p className="mt-2 text-2xl font-bold">{pendingFarmers.length}</p>
                          <p className="mt-1 text-sm text-white/75">Need approval or rejection</p>
                        </div>
                        <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Orders tracked</p>
                          <p className="mt-2 text-2xl font-bold">{dashboardStats.totalOrders}</p>
                          <p className="mt-1 text-sm text-white/75">{dashboardStats.processingOrders} processing right now</p>
                        </div>
                        <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Secure accounts</p>
                          <p className="mt-2 text-2xl font-bold">{adminUsers.length}</p>
                          <p className="mt-1 text-sm text-white/75">Admins and users monitored</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => handleTabChange('farmers')}
                          className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-lg transition-all hover:-translate-y-0.5 hover:text-fuchsia-600"
                        >
                          <FaCheckCircle className="mr-2" /> Review approvals
                        </button>
                        <button
                          onClick={() => handleTabChange('analytics')}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/18"
                        >
                          <FaChartBar className="mr-2" /> View analytics
                        </button>
                      </div>
                    </div>
                  </section>

                  <CardWrapper className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700">
                          Today at a glance
                        </span>
                        <h3 className="mt-3 text-xl font-bold text-slate-900">Admin brief</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Quick health signals pulled from live farmers, customers, products, and orders.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-md">
                        <FaBell className="text-lg" />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">Farmer activation rate</span>
                          <span className="text-sm font-bold text-violet-700">
                            {dashboardStats.totalFarmers > 0 ? `${Math.round((dashboardStats.activeFarmers / dashboardStats.totalFarmers) * 100)}%` : '0%'}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                            style={{
                              width: `${dashboardStats.totalFarmers > 0 ? Math.min(100, Math.round((dashboardStats.activeFarmers / dashboardStats.totalFarmers) * 100)) : 0}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Low stock</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900">{dashboardStats.lowStockProducts}</p>
                          <p className="mt-1 text-sm text-slate-600">Products need attention</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revenue</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900">{compactRevenue}</p>
                          <p className="mt-1 text-sm text-slate-600">Across all farmer transactions</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-violet-900 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Priority queue</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{pendingFarmers.length}</p>
                            <p className="text-sm text-white/75">farmer approvals waiting</p>
                          </div>
                          <button
                            onClick={() => handleTabChange('farmers')}
                            className="rounded-2xl bg-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                          >
                            Review now
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardWrapper>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {overviewStats.map(({ id, label, value, detail, icon: Icon, iconClassName, accentClassName }) => (
                    <CardWrapper key={id} className="relative overflow-hidden p-5 sm:p-6">
                      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-gradient-to-r ${accentClassName}`} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                          <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-[2rem]">{value}</p>
                          <p className="mt-2 text-sm text-slate-600">{detail}</p>
                        </div>
                        <div className={`rounded-2xl p-3 shadow-sm ${iconClassName}`}>
                          <Icon className="text-xl" />
                        </div>
                      </div>
                    </CardWrapper>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <CardWrapper className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Pending approvals</h2>
                        <p className="mt-1 text-sm text-slate-600">Farmer registrations waiting for admin review.</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                        {pendingFarmers.length} pending
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {pendingFarmers.length > 0 ? (
                        pendingFarmers.slice(0, 4).map((farmer) => {
                          const farmerName = farmer.name || `${farmer.first_name || ''} ${farmer.last_name || ''}`.trim() || 'Unnamed farmer';
                          const farmerImage = farmer.profile_image || farmer.avatar || currentAdmin.avatar;
                          const farmerMeta = [farmer.location, farmer.farmSize].filter(Boolean).join(' | ') || 'Profile details pending';

                          return (
                            <div key={farmer.user_id || farmer.id} className="flex flex-col gap-4 rounded-[22px] border border-slate-200 p-4 transition-colors hover:bg-violet-50/60 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={farmerImage}
                                  alt={farmerName}
                                  className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">{farmerName}</p>
                                  <p className="truncate text-sm text-slate-600">{farmerMeta}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusChange(getFarmerId(farmer), 'active', 'farmer')}
                                  disabled={updatingFarmerId === getFarmerId(farmer)}
                                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
                                  type="button"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(getFarmerId(farmer), 'rejected', 'farmer')}
                                  disabled={updatingFarmerId === getFarmerId(farmer)}
                                  className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
                                  type="button"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                          <p className="text-base font-semibold text-slate-800">No approvals waiting right now.</p>
                          <p className="mt-2 text-sm text-slate-600">New farmer registrations will appear here for quick review.</p>
                        </div>
                      )}
                    </div>
                  </CardWrapper>

                  <CardWrapper className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Recent notifications</h2>
                        <p className="mt-1 text-sm text-slate-600">Priority messages for the admin team.</p>
                      </div>
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                        {notifications.length} alerts
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {notifications.map((notification) => {
                        const { Icon, badgeClassName, iconClassName } = getNotificationMeta(notification);

                        return (
                          <div key={notification.id} className="flex items-start gap-3 rounded-[22px] border border-slate-200 p-4 transition-colors hover:bg-violet-50/60">
                            <div className={`rounded-2xl p-3 ${iconClassName}`}>
                              <Icon className="text-base" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{notification.message}</p>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${badgeClassName}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-slate-600">{notification.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardWrapper>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                  {quickAdminActions.map(({ id, title, description, icon: Icon, iconClassName, accentClassName, hoverClassName }) => (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id)}
                      className={`group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 text-left shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 ${hoverClassName}`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClassName}`} />
                      <div className={`inline-flex rounded-2xl p-3 ${iconClassName}`}>
                        <Icon className="text-xl" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{description}</p>
                      <div className="mt-5 inline-flex items-center text-sm font-semibold text-violet-700 transition-transform group-hover:translate-x-1">
                        Open section <FaChevronRight className="ml-2 text-xs" />
                      </div>
                    </button>
                  ))}
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
                        <option value="rejected">Rejected</option>
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
                        type="button"
                      >
                        {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                      </button>
                      <button
                        onClick={fetchFarmers}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center"
                        type="button"
                      >
                        <FaSync className="mr-2" /> Refresh
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
                {farmerActionStatus && (
                  <CardWrapper className={`p-4 border ${
                    farmerActionStatus.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex items-center ${
                      farmerActionStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {farmerActionStatus.type === 'success'
                        ? <FaCheckCircle className="mr-2" />
                        : <FaExclamationTriangle className="mr-2" />}
                      <p>{farmerActionStatus.message}</p>
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
                            <tr key={getFarmerId(farmer) || farmer.email || getFarmerName(farmer)} className="hover:bg-green-50">
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
                                  onChange={(e) => handleStatusChange(getFarmerId(farmer), e.target.value, 'farmer')}
                                  disabled={updatingFarmerId === getFarmerId(farmer)}
                                  className={`px-3 py-1 rounded-full text-sm font-semibold border-0 focus:ring-2 focus:ring-green-500 ${
                                    (farmer.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                                    (farmer.status || 'active') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    (farmer.status || 'active') === 'suspended' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  } ${updatingFarmerId === getFarmerId(farmer) ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                                >
                                  <option value="active">Active</option>
                                  <option value="pending">Pending</option>
                                  <option value="suspended">Suspended</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                {updatingFarmerId === getFarmerId(farmer) && (
                                  <p className="mt-1 text-xs text-gray-500">Saving...</p>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleVerification(getFarmerId(farmer), 'farmer')}
                                  className={`flex items-center ${(farmer.verified ? 'text-green-600' : 'text-gray-400')} hover:text-green-700`}
                                  type="button"
                                >
                                  {farmer.verified ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => viewUserDetails(farmer, 'farmer')}
                                    className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                    title="View Details"
                                    type="button"
                                  >
                                    <FaEye className="mr-1" /> View
                                  </button>
                                  <button 
                                    onClick={() => editFarmerDetails(farmer)}
                                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                    title="Edit Farmer"
                                    type="button"
                                  >
                                    <FaEdit className="mr-1" /> Edit
                                  </button>
                                  {(farmer.status || 'active') !== 'active' && (
                                    <button
                                      onClick={() => handleStatusChange(getFarmerId(farmer), 'active', 'farmer')}
                                      disabled={updatingFarmerId === getFarmerId(farmer)}
                                      className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
                                      title="Approve Farmer"
                                      type="button"
                                    >
                                      <FaCheck className="mr-1" /> Approve
                                    </button>
                                  )}
                                  {(farmer.status || 'active') === 'active' && (
                                    <button
                                      onClick={() => handleStatusChange(getFarmerId(farmer), 'suspended', 'farmer')}
                                      disabled={updatingFarmerId === getFarmerId(farmer)}
                                      className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-60"
                                      title="Suspend Farmer"
                                      type="button"
                                    >
                                      <FaLock className="mr-1" /> Suspend
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => deleteFarmer(farmer)}
                                    disabled={deletingFarmerId === getFarmerId(farmer)}
                                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                    title="Delete Farmer"
                                    type="button"
                                  >
                                    <FaTrash className="mr-1" /> {deletingFarmerId === getFarmerId(farmer) ? 'Deleting...' : 'Delete'}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Total customers', value: customerStatusSummary.total, icon: FaUsers, className: 'bg-green-50 text-green-700' },
                    { label: 'Active', value: customerStatusSummary.active, icon: FaCheckCircle, className: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Pending', value: customerStatusSummary.pending, icon: FaClock, className: 'bg-amber-50 text-amber-700' },
                    { label: 'Suspended', value: customerStatusSummary.suspended, icon: FaLock, className: 'bg-orange-50 text-orange-700' }
                  ].map(({ label, value, icon: Icon, className }) => (
                    <CardWrapper key={label} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{label}</p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                        <div className={`rounded-2xl p-3 ${className}`}>
                          <Icon className="text-xl" />
                        </div>
                      </div>
                    </CardWrapper>
                  ))}
                </div>

                {/* Search and Filter */}
                <CardWrapper className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search customers by name, email, phone, or city..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="city">Sort by City</option>
                        <option value="age">Sort by Age</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        type="button"
                      >
                        {sortOrder === 'asc' ? <FaArrowUp className="mr-2" /> : <FaArrowDown className="mr-2" />}
                        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterStatus('all');
                          setSortBy('name');
                          setSortOrder('asc');
                        }}
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        type="button"
                      >
                        Clear
                      </button>
                      <button
                        onClick={fetchCustomers}
                        className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:col-span-1"
                        type="button"
                      >
                        <FaSync className="mr-2" /> Refresh
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
                {customerActionStatus && (
                  <CardWrapper className={`p-4 border ${
                    customerActionStatus.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex items-center ${
                      customerActionStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {customerActionStatus.type === 'success'
                        ? <FaCheckCircle className="mr-2" />
                        : <FaExclamationTriangle className="mr-2" />}
                      <p>{customerActionStatus.message}</p>
                    </div>
                  </CardWrapper>
                )}

                {/* Customers Table */}
                {!loadingCustomers && !errorCustomers && (
                  <CardWrapper className="overflow-hidden border border-green-100">
                    <div className="flex flex-col gap-3 border-b border-green-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Customer directory</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Showing {filteredCustomers.length} of {customers.length} customer accounts
                        </p>
                      </div>
                      <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                        Flexible table
                      </span>
                    </div>

                    {filteredCustomers.length === 0 ? (
                      <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                          <FaSearch className="text-xl" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-gray-900">No customers found</p>
                        <p className="mt-2 text-sm text-gray-500">Try changing the search text or clearing the selected filters.</p>
                      </div>
                    ) : (
                      <>
                        <div className="hidden overflow-x-auto lg:block">
                          <table className="w-full min-w-[1120px]">
                            <thead className="sticky top-0 z-10 bg-green-50">
                              <tr className="border-b border-green-100">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Profile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Verified</th>
                                <th className="sticky right-0 z-20 bg-green-50 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {filteredCustomers.map((customer) => {
                              const customerId = getCustomerId(customer);
                              const customerName = getCustomerName(customer);
                              const customerStatus = getCustomerStatus(customer);
                              const isUpdatingCustomer = isSameCustomer(customer, updatingCustomerId);
                              const isDeletingCustomer = isSameCustomer(customer, deletingCustomerId);
                              const avatarUrl = customer.profile_image || customer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customerName);

                              return (
                                <tr key={customerId || customer.email || customerName} className="group transition hover:bg-green-50/70">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <img src={avatarUrl} alt={customerName} className="h-12 w-12 rounded-2xl border border-green-100 object-cover" />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-gray-900">{customerName}</p>
                                        <p className="text-sm text-gray-500">ID: {customerId || '-'}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="max-w-[240px]">
                                      <p className="truncate text-gray-900">{customer.email || '-'}</p>
                                      <p className="text-sm text-gray-500">{customer.phone || '-'}</p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="max-w-[260px]">
                                      <p className="font-medium text-gray-900">{customer.city || customer.location || '-'}</p>
                                      <p className="truncate text-sm text-gray-500">{customer.address || customer.location_address || '-'}</p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <p className="text-gray-900">{customer.age ? `${customer.age} years` : '-'}</p>
                                      <p className="text-sm text-gray-500">NIC: {customer.nic_number || '-'}</p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                      value={customerStatus}
                                      onChange={(e) => handleStatusChange(customerId, e.target.value, 'customer')}
                                      disabled={isUpdatingCustomer}
                                      className={`px-3 py-1 rounded-full text-sm font-semibold border-0 focus:ring-2 focus:ring-green-500 ${
                                        customerStatus === 'active' ? 'bg-green-100 text-green-800' :
                                        customerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        customerStatus === 'suspended' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                      } ${isUpdatingCustomer ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                                    >
                                      <option value="active">Active</option>
                                      <option value="pending">Pending</option>
                                      <option value="suspended">Suspended</option>
                                      <option value="rejected">Rejected</option>
                                    </select>
                                    {isUpdatingCustomer && (
                                      <p className="mt-1 text-xs text-gray-500">Saving...</p>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleVerification(customerId, 'customer')}
                                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                                        customer.verified
                                          ? 'border-green-200 bg-green-50 text-green-600'
                                          : 'border-gray-200 bg-gray-50 text-gray-400'
                                      } hover:text-green-700`}
                                      type="button"
                                    >
                                      {customer.verified ? <FaCheckCircle /> : <FaTimesCircle />}
                                    </button>
                                  </td>
                                  <td className="sticky right-0 bg-white px-6 py-4 shadow-[-12px_0_20px_rgba(15,23,42,0.05)] group-hover:bg-green-50">
                                    <div className="flex min-w-[260px] flex-wrap gap-2">
                                      <button
                                        onClick={() => viewUserDetails(customer, 'customer')}
                                        className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                        title="View Details"
                                        type="button"
                                      >
                                        <FaEye className="mr-1" /> View
                                      </button>
                                      {customerStatus === 'active' ? (
                                        <button
                                          onClick={() => handleStatusChange(customerId, 'suspended', 'customer')}
                                          disabled={isUpdatingCustomer}
                                          className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-60"
                                          title="Suspend Customer"
                                          type="button"
                                        >
                                          <FaLock className="mr-1" /> Suspend
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleStatusChange(customerId, 'active', 'customer')}
                                          disabled={isUpdatingCustomer}
                                          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
                                          title="Activate Customer"
                                          type="button"
                                        >
                                          <FaUnlock className="mr-1" /> Activate
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteCustomer(customer)}
                                        disabled={isDeletingCustomer}
                                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                        title="Delete Customer"
                                        type="button"
                                      >
                                        <FaTrash className="mr-1" /> {isDeletingCustomer ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-4 p-4 lg:hidden">
                          {filteredCustomers.map((customer) => {
                            const customerId = getCustomerId(customer);
                            const customerName = getCustomerName(customer);
                            const customerStatus = getCustomerStatus(customer);
                            const isUpdatingCustomer = isSameCustomer(customer, updatingCustomerId);
                            const isDeletingCustomer = isSameCustomer(customer, deletingCustomerId);
                            const avatarUrl = customer.profile_image || customer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customerName);

                            return (
                              <div key={customerId || customer.email || customerName} className="rounded-[24px] border border-green-100 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <img src={avatarUrl} alt={customerName} className="h-14 w-14 rounded-2xl border border-green-100 object-cover" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-gray-900">{customerName}</p>
                                    <p className="truncate text-sm text-gray-500">{customer.email || '-'}</p>
                                    <p className="mt-1 text-xs text-gray-400">ID: {customerId || '-'}</p>
                                  </div>
                                  <button
                                    onClick={() => handleVerification(customerId, 'customer')}
                                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                                      customer.verified
                                        ? 'border-green-200 bg-green-50 text-green-600'
                                        : 'border-gray-200 bg-gray-50 text-gray-400'
                                    }`}
                                    type="button"
                                  >
                                    {customer.verified ? <FaCheckCircle /> : <FaTimesCircle />}
                                  </button>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
                                    <p className="mt-1 truncate font-medium text-gray-800">{customer.phone || '-'}</p>
                                  </div>
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">City</p>
                                    <p className="mt-1 truncate font-medium text-gray-800">{customer.city || customer.location || '-'}</p>
                                  </div>
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Age</p>
                                    <p className="mt-1 font-medium text-gray-800">{customer.age ? `${customer.age} years` : '-'}</p>
                                  </div>
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">NIC</p>
                                    <p className="mt-1 truncate font-medium text-gray-800">{customer.nic_number || '-'}</p>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <select
                                    value={customerStatus}
                                    onChange={(e) => handleStatusChange(customerId, e.target.value, 'customer')}
                                    disabled={isUpdatingCustomer}
                                    className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold border-0 focus:ring-2 focus:ring-green-500 ${
                                      customerStatus === 'active' ? 'bg-green-100 text-green-800' :
                                      customerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      customerStatus === 'suspended' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    } ${isUpdatingCustomer ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                                  >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <button
                                    onClick={() => viewUserDetails(customer, 'customer')}
                                    className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                                    type="button"
                                  >
                                    <FaEye className="mr-1" /> View
                                  </button>
                                  {customerStatus === 'active' ? (
                                    <button
                                      onClick={() => handleStatusChange(customerId, 'suspended', 'customer')}
                                      disabled={isUpdatingCustomer}
                                      className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 disabled:cursor-wait disabled:opacity-60"
                                      type="button"
                                    >
                                      <FaLock className="mr-1" /> Hold
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStatusChange(customerId, 'active', 'customer')}
                                      disabled={isUpdatingCustomer}
                                      className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 disabled:cursor-wait disabled:opacity-60"
                                      type="button"
                                    >
                                      <FaUnlock className="mr-1" /> Active
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCustomer(customer)}
                                    disabled={isDeletingCustomer}
                                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:cursor-wait disabled:opacity-60"
                                    type="button"
                                  >
                                    <FaTrash className="mr-1" /> {isDeletingCustomer ? '...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardWrapper>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="w-full space-y-8">
                <PageHeader 
                  title="Product Management"
                  subtitle="Manage every farmer product, edit prices, control stock, and remove unavailable listings"
                  action={
                    <button 
                      onClick={fetchProducts}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                      disabled={loading.products}
                      type="button"
                    >
                      {loading.products ? <FaClock className="mr-2 animate-spin" /> : <FaSync className="mr-2" />}
                      Refresh Products
                    </button>
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
                {productActionStatus && (
                  <CardWrapper className={`p-4 border ${
                    productActionStatus.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex items-center ${
                      productActionStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {productActionStatus.type === 'success'
                        ? <FaCheckCircle className="mr-2" />
                        : <FaExclamationTriangle className="mr-2" />}
                      <p>{productActionStatus.message}</p>
                    </div>
                  </CardWrapper>
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
                          {loading.stats ? '...' : productSummary.active}
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
                        <p className="text-2xl font-bold text-blue-600" title={formatCurrency(productSummary.inventoryValue)}>
                          {loading.stats ? '...' : productStats.total_categories}
                        </p>
                      </div>
                      <FaFilter className="text-3xl text-blue-600" />
                    </div>
                  </CardWrapper>
                </div>

                {/* Search and Filter */}
                <CardWrapper className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search product, farmer, category, or location..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
                      >
                        <option value="all">All Categories</option>
                        {productCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <select
                        value={productSortBy}
                        onChange={(e) => setProductSortBy(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 sm:w-auto"
                      >
                        <option value="created_at">Newest</option>
                        <option value="name">Name</option>
                        <option value="farmer">Farmer</option>
                        <option value="price">Price</option>
                        <option value="stock">Stock</option>
                      </select>
                      <button
                        onClick={() => setProductSortOrder(productSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        type="button"
                      >
                        {productSortOrder === 'asc' ? <FaArrowUp className="mr-2" /> : <FaArrowDown className="mr-2" />}
                        {productSortOrder === 'asc' ? 'Asc' : 'Desc'}
                      </button>
                      <button
                        onClick={() => {
                          setProductSearchQuery('');
                          setProductCategoryFilter('all');
                          setProductStatusFilter('all');
                          setProductSortBy('created_at');
                          setProductSortOrder('desc');
                        }}
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        type="button"
                      >
                        Clear
                      </button>
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

                {/* Products Management Table */}
                {!loading.products && !error && (
                  <CardWrapper className="overflow-hidden border border-green-100">
                    <div className="flex flex-col gap-3 border-b border-green-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">All farmer selling products</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Showing {filteredProducts.length} of {products.length} products. Admin can edit price, stock, status, and delete products.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                          Active {productSummary.active}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          Inventory {formatCurrency(productSummary.inventoryValue)}
                        </span>
                      </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                          <FaBox className="text-xl" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-700">No Products Found</h3>
                        <p className="mt-2 text-gray-500">Try changing the search text or filters.</p>
                      </div>
                    ) : (
                      <>
                        <div className="hidden overflow-x-auto lg:block">
                          <table className="w-full min-w-[1180px]">
                            <thead className="sticky top-0 z-10 bg-green-50">
                              <tr className="border-b border-green-100">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Farmer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Location</th>
                                <th className="sticky right-0 z-20 bg-green-50 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {filteredProducts.map((product) => {
                                const productId = getProductId(product);
                                const productStatus = getProductStatus(product);
                                const productStock = getProductStock(product);
                                const isSavingProduct = savingProductId === productId;
                                const isDeletingProduct = deletingProductId === productId;

                                return (
                                  <tr key={productId} className="group transition hover:bg-green-50/70">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={getProductImage(product)}
                                          alt={product.name}
                                          className="h-14 w-14 rounded-2xl border border-green-100 object-cover"
                                          onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
                                          }}
                                        />
                                        <div className="min-w-0">
                                          <p className="font-semibold text-gray-900">{product.name}</p>
                                          <p className="max-w-[260px] truncate text-sm text-gray-500">{product.description || 'No description'}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="font-medium text-gray-900">{product.farmer || 'Unknown farmer'}</p>
                                      <p className="text-sm text-gray-500">Farmer ID: {product.farmerId || product.farmer_id || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                        {product.category || 'Uncategorized'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-lg font-bold text-green-700">{formatCurrency(product.price)}</p>
                                      <p className="text-xs text-gray-500">Admin editable</p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                        productStock < 50 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {formatNumber(productStock)} {product.unit || 'units'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <select
                                        value={productStatus}
                                        onChange={(e) => updateProductStatus(product, e.target.value)}
                                        disabled={isSavingProduct}
                                        className={`rounded-full border-0 px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-green-500 ${
                                          productStatus === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-700'
                                        } ${isSavingProduct ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                                      >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="max-w-[220px] truncate text-sm text-gray-700">{product.address || '-'}</p>
                                    </td>
                                    <td className="sticky right-0 bg-white px-6 py-4 shadow-[-12px_0_20px_rgba(15,23,42,0.05)] group-hover:bg-green-50">
                                      <div className="flex min-w-[210px] flex-wrap gap-2">
                                        <button
                                          onClick={() => openProductEditModal(product)}
                                          className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                          type="button"
                                        >
                                          <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button
                                          onClick={() => deleteProduct(product)}
                                          disabled={isDeletingProduct}
                                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                          type="button"
                                        >
                                          <FaTrash className="mr-1" /> {isDeletingProduct ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-4 p-4 lg:hidden">
                          {filteredProducts.map((product) => {
                            const productId = getProductId(product);
                            const productStatus = getProductStatus(product);
                            const productStock = getProductStock(product);
                            const isSavingProduct = savingProductId === productId;
                            const isDeletingProduct = deletingProductId === productId;

                            return (
                              <div key={productId} className="rounded-[24px] border border-green-100 bg-white p-4 shadow-sm">
                                <div className="flex gap-3">
                                  <img
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="h-16 w-16 rounded-2xl border border-green-100 object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-gray-900">{product.name}</p>
                                    <p className="truncate text-sm text-gray-500">By {product.farmer || 'Unknown farmer'}</p>
                                    <p className="mt-1 text-lg font-bold text-green-700">{formatCurrency(product.price)}</p>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Category</p>
                                    <p className="mt-1 truncate font-medium text-gray-800">{product.category || '-'}</p>
                                  </div>
                                  <div className="rounded-2xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Stock</p>
                                    <p className={`mt-1 font-medium ${productStock < 50 ? 'text-orange-700' : 'text-gray-800'}`}>
                                      {formatNumber(productStock)} {product.unit || 'units'}
                                    </p>
                                  </div>
                                </div>

                                <select
                                  value={productStatus}
                                  onChange={(e) => updateProductStatus(product, e.target.value)}
                                  disabled={isSavingProduct}
                                  className={`mt-4 w-full rounded-2xl border-0 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 ${
                                    productStatus === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-700'
                                  } ${isSavingProduct ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => openProductEditModal(product)}
                                    className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                                    type="button"
                                  >
                                    <FaEdit className="mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(product)}
                                    disabled={isDeletingProduct}
                                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:cursor-wait disabled:opacity-60"
                                    type="button"
                                  >
                                    <FaTrash className="mr-1" /> {isDeletingProduct ? '...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
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
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={fetchOrders}
                        disabled={loadingOrders}
                        className="flex items-center rounded-xl border border-green-200 bg-white px-5 py-3 font-semibold text-green-700 shadow-sm hover:bg-green-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        <FaSync className={`mr-2 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                      <button
                        type="button"
                        onClick={exportOrders}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg"
                      >
                        <FaDownload className="mr-2" /> Export Orders
                      </button>
                    </div>
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
                          value={orderSearchQuery}
                          onChange={(event) => setOrderSearchQuery(event.target.value)}
                          placeholder="Search orders by ID or customer..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={orderStatusFilter}
                        onChange={(event) => setOrderStatusFilter(event.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input
                        type="date"
                        value={orderDateFilter}
                        onChange={(event) => setOrderDateFilter(event.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardWrapper>

                {orderActionStatus && (
                  <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
                    orderActionStatus.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {orderActionStatus.message}
                  </div>
                )}

                {errorOrders && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                    {errorOrders}
                  </div>
                )}

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
                        {loadingOrders ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-sm font-semibold text-gray-500">
                              Loading orders from the payment system...
                            </td>
                          </tr>
                        ) : filteredOrders.map((order) => (
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
                                onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusClassName(order.status)}`}
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
                                <button
                                  type="button"
                                  onClick={() => viewOrderDetails(order)}
                                  className="text-green-600 hover:text-green-700"
                                  title="View order details"
                                >
                                  <FaEye className="text-lg" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openOrderEditModal(order)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit order"
                                >
                                  <FaEdit className="text-lg" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteOrder(order)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete order"
                                >
                                  <FaTrash className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!loadingOrders && filteredOrders.length === 0 && (
                      <div className="px-6 py-12 text-center">
                        <p className="text-lg font-semibold text-gray-800">No orders found</p>
                        <p className="mt-2 text-sm text-gray-500">Try changing the search, status, or date filter.</p>
                      </div>
                    )}
                  </div>
                </CardWrapper>
              </div>
            )}

            {activeTab === 'analytics' && renderAnalyticsTab()}

            {/* Analytics Tab */}
            {false && activeTab === 'analytics' && (
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

            {/* Profile Tab */}
            {activeTab === 'profile' && renderAdminProfileTab()}

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
                              <img src={displayAdminAvatar} alt={currentAdmin.name} className="w-10 h-10 rounded-full mr-3" />
                              <p className="font-medium text-gray-900">{currentAdmin.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currentAdmin.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {currentAdmin.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(currentAdmin.last_login)}
                          </td>
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

                <CardWrapper className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaUsers className="mr-2 text-emerald-600" /> Database Account Records
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        This table includes both normal users and admin accounts. Passwords are protected and are never displayed as plain text.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm">
                        <p className="text-gray-500">Total users</p>
                        <p className="text-lg font-bold text-emerald-700">{adminUsers.length}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                        <p className="text-gray-500">Protected passwords</p>
                        <p className="text-lg font-bold text-slate-800">
                          {adminUsers.filter((account) => account.password_status === 'hashed').length}
                        </p>
                      </div>
                      <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm">
                        <p className="text-gray-500">Admin accounts</p>
                        <p className="text-lg font-bold text-blue-800">
                          {adminUsers.filter((account) => account.account_type === 'admin').length}
                        </p>
                      </div>
                      <button
                        onClick={fetchAdminUsers}
                        className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <FaSync className="mr-2" /> Refresh
                      </button>
                    </div>
                  </div>

                  {loadingAdminUsers && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-6 text-center text-gray-600">
                      Loading database users...
                    </div>
                  )}

                  {errorAdminUsers && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                      {errorAdminUsers}
                    </div>
                  )}

                  {!loadingAdminUsers && !errorAdminUsers && (
                    <div className="overflow-x-auto rounded-2xl border border-green-100">
                      <table className="w-full min-w-[820px]">
                        <thead className="bg-green-50 border-b border-green-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Login Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Created</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Last Login</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Password Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {adminUsers.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                No account records found in the database.
                              </td>
                            </tr>
                          ) : (
                            adminUsers.map((account) => {
                              const passwordMeta = getPasswordStatusMeta(account.password_status);
                              const PasswordStatusIcon = passwordMeta.icon;

                              return (
                                <tr key={account.id} className="hover:bg-green-50/60">
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      account.account_type === 'admin'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {account.account_type === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                                        {(account.name || account.email || 'U').charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{account.name || 'Unnamed User'}</p>
                                        <p className="text-sm text-gray-500">User ID: {account.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-800">{account.email}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(account.role)}`}>
                                      {account.role || 'unknown'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(account.created_at)}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(account.last_login)}</td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${passwordMeta.className}`}>
                                      <PasswordStatusIcon className="mr-2" />
                                      {passwordMeta.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
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

      {/* Edit Product Modal */}
      {showProductEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-green-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit Farmer Product</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update product details, price, stock, and visibility for {editingProduct.farmer || 'this farmer'}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowProductEditModal(false);
                    setEditingProduct(null);
                    setProductEditForm({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-4 sm:flex-row sm:items-center">
                <img
                  src={productEditForm.image_url || getProductImage(editingProduct)}
                  alt={productEditForm.name || editingProduct.name}
                  className="h-24 w-24 rounded-2xl border border-green-100 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Farmer product</p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">{productEditForm.name || editingProduct.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">Seller: {editingProduct.farmer || 'Unknown farmer'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Product Name</label>
                  <input
                    type="text"
                    value={productEditForm.name || ''}
                    onChange={(e) => handleProductEditFormChange('name', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
                  <input
                    type="text"
                    value={productEditForm.category || ''}
                    onChange={(e) => handleProductEditFormChange('category', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Price (Rs.)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={productEditForm.price ?? ''}
                    onChange={(e) => handleProductEditFormChange('price', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={productEditForm.quantity ?? ''}
                    onChange={(e) => handleProductEditFormChange('quantity', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={productEditForm.unit || ''}
                    onChange={(e) => handleProductEditFormChange('unit', e.target.value)}
                    placeholder="kg, item, bunch"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={productEditForm.status || 'active'}
                    onChange={(e) => handleProductEditFormChange('status', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Address / Pickup Location</label>
                  <input
                    type="text"
                    value={productEditForm.address || ''}
                    onChange={(e) => handleProductEditFormChange('address', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Image URL</label>
                  <input
                    type="text"
                    value={productEditForm.image_url || ''}
                    onChange={(e) => handleProductEditFormChange('image_url', e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    value={productEditForm.description || ''}
                    onChange={(e) => handleProductEditFormChange('description', e.target.value)}
                    rows="4"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setShowProductEditModal(false);
                    setEditingProduct(null);
                    setProductEditForm({});
                  }}
                  className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedProduct}
                  disabled={savingProductId === getProductId(editingProduct)}
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60"
                  type="button"
                >
                  <FaSave className="mr-2" />
                  {savingProductId === getProductId(editingProduct) ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showOrderEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-green-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit Order {editingOrder.id}</h2>
                  <p className="mt-1 text-sm text-gray-500">Update customer, products, amount, status, and delivery details.</p>
                </div>
                <button
                  type="button"
                  onClick={closeOrderEditModal}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Customer</label>
                  <input
                    type="text"
                    value={orderEditForm.customer || ''}
                    onChange={(event) => handleOrderEditFormChange('customer', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Customer ID</label>
                  <input
                    type="text"
                    value={orderEditForm.customerId || ''}
                    onChange={(event) => handleOrderEditFormChange('customerId', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Customer Phone</label>
                  <input
                    type="text"
                    value={orderEditForm.customerPhone || ''}
                    onChange={(event) => handleOrderEditFormChange('customerPhone', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Delivery Address</label>
                  <input
                    type="text"
                    value={orderEditForm.deliveryAddress || ''}
                    onChange={(event) => handleOrderEditFormChange('deliveryAddress', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Products</label>
                  <input
                    type="text"
                    value={orderEditForm.products || ''}
                    onChange={(event) => handleOrderEditFormChange('products', event.target.value)}
                    placeholder="Separate products with commas"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Total (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={orderEditForm.total ?? ''}
                    onChange={(event) => handleOrderEditFormChange('total', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={orderEditForm.status || 'pending'}
                    onChange={(event) => handleOrderEditFormChange('status', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Order Date</label>
                  <input
                    type="date"
                    value={orderEditForm.orderDate || ''}
                    onChange={(event) => handleOrderEditFormChange('orderDate', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Delivery Date</label>
                  <input
                    type="date"
                    value={orderEditForm.deliveryDate || ''}
                    onChange={(event) => handleOrderEditFormChange('deliveryDate', event.target.value)}
                    disabled={orderEditForm.status !== 'delivered'}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Farmer</label>
                  <input
                    type="text"
                    value={orderEditForm.farmer || ''}
                    onChange={(event) => handleOrderEditFormChange('farmer', event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-green-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeOrderEditModal}
                  className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedOrder}
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  <FaSave className="mr-2" /> Save Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-green-100 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order {selectedOrder.id}</h2>
                  <p className="mt-1 text-sm text-gray-500">Customer, product, delivery, and farmer details</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getOrderStatusClassName(selectedOrder.status)}`}>
                  {getOrderStatusLabel(selectedOrder.status)}
                </span>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="mt-1 font-bold text-gray-900">{selectedOrder.customer}</p>
                  <p className="mt-1 text-sm text-gray-600">ID: {selectedOrder.customerId}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm text-gray-600">Farmer</p>
                  <p className="mt-1 font-bold text-gray-900">{selectedOrder.farmer}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="mt-1 font-bold text-gray-900">{selectedOrder.orderDate}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm text-gray-600">Delivery Date</p>
                  <p className="mt-1 font-bold text-gray-900">{selectedOrder.deliveryDate || 'Not delivered yet'}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Products</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.products.map((product, index) => (
                    <span key={index} className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-green-100 pt-6">
                <button
                  type="button"
                  onClick={() => openOrderEditModal(selectedOrder)}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <FaEdit className="mr-2" />
                  Edit Order
                </button>
                <button
                  type="button"
                  onClick={() => deleteOrder(selectedOrder)}
                  className="inline-flex items-center rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  <FaTrash className="mr-2" /> Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default AdminPortal;
