/* eslint-disable react-hooks/exhaustive-deps */
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
  FaChartLine, FaHandHoldingUsd, FaStore, FaAddressBook
} from 'react-icons/fa';
import FarmerProfile from './FarmerProfile';
import FarmerShopPage from './FarmerShopPage';
import FarmerProductListPage from './FarmerProductListPage';
import FarmerCreateProductPage from './FarmerCreateProductPage';
import FarmerCommunityPage from './FarmerCommunityPage';
import FarmerPendingOrdersPage from './FarmerPendingOrdersPage';
import FarmerProcessingOrdersPage from './FarmerProcessingOrdersPage';
import FarmerPackingOrdersPage from './FarmerPackingOrdersPage';
import FarmerDeliveryOrdersPage from './FarmerDeliveryOrdersPage';
import FarmerCompletedOrdersPage from './FarmerCompletedOrdersPage';
import FarmerCustomerDetailsPage from './FarmerCustomerDetailsPage';
import { createFarmerSampleOrders } from './farmerOrderConfig';
import { API_BASES } from '../config/api';
import { confirmAction, showErrorAlert } from '../utils/sweetAlert';

const createEmptyProductForm = () => ({
  name: '',
  price: '',
  category: '',
  stock: '',
  unit: '',
  description: '',
  address: '',
  images: [],
  status: 'active',
  organic: false,
  featured: false
});

const getFarmerOrdersStorageKey = (farmerId) => `farmer-orders-${farmerId}`;

const loadStoredFarmerOrders = (farmerId) => {
  if (typeof window === 'undefined') {
    return createFarmerSampleOrders();
  }

  try {
    const storedOrders = window.localStorage.getItem(getFarmerOrdersStorageKey(farmerId));

    if (!storedOrders) {
      return createFarmerSampleOrders();
    }

    const parsedOrders = JSON.parse(storedOrders);
    return Array.isArray(parsedOrders) ? parsedOrders : createFarmerSampleOrders();
  } catch {
    return createFarmerSampleOrders();
  }
};

const normalizeFarmerOrderStatus = (status) => {
  const normalizedStatus = String(status || 'pending').trim().toLowerCase();
  if (normalizedStatus === 'delivered') return 'completed';
  if (['pending', 'processing', 'packing', 'delivery', 'completed'].includes(normalizedStatus)) {
    return normalizedStatus;
  }
  return 'pending';
};

const mapApiOrderToFarmerOrder = (apiOrder) => {
  const items = Array.isArray(apiOrder?.items) ? apiOrder.items : [];
  const firstItem = items[0] || {};
  const createdAt = apiOrder?.createdAt || new Date().toISOString();
  const address = [
    apiOrder?.customer?.address,
    apiOrder?.customer?.city,
    apiOrder?.customer?.zipCode
  ].filter(Boolean).join(', ');

  return {
    id: apiOrder?.orderNumber || `ORD-${String(apiOrder?.id || '').padStart(6, '0')}`,
    backendOrderId: apiOrder?.id,
    customerName: apiOrder?.customer?.name || 'Unknown customer',
    customerPhone: apiOrder?.customer?.phone || 'Not provided',
    productName: items.length > 1
      ? `${firstItem.productName || 'Ordered product'} +${items.length - 1} more`
      : firstItem.productName || 'Ordered product',
    quantity: firstItem.quantity || 1,
    unit: firstItem.unit || 'unit',
    amount: Number(apiOrder?.totals?.total ?? firstItem.price ?? 0),
    requestedDate: createdAt,
    deliveryAddress: address || 'Delivery address not provided',
    status: normalizeFarmerOrderStatus(apiOrder?.status),
    customerConfirmed: !['pending'].includes(normalizeFarmerOrderStatus(apiOrder?.status)),
    notes: `Payment: ${apiOrder?.paymentMethod || 'not recorded'} | Shipping: ${apiOrder?.shippingMethod || 'not recorded'}`,
    createdAt,
    updatedAt: createdAt,
    lastContactedAt: normalizeFarmerOrderStatus(apiOrder?.status) === 'pending' ? null : createdAt,
    completedAt: ['completed', 'delivered'].includes(String(apiOrder?.status || '').toLowerCase()) ? createdAt : null
  };
};

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
  const [orders, setOrders] = useState(() => loadStoredFarmerOrders(user?.id || 1));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastPortalTab, setLastPortalTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [productForm, setProductForm] = useState(createEmptyProductForm());
  
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    setOrders(loadStoredFarmerOrders(user?.id || 1));
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        getFarmerOrdersStorageKey(user?.id || 1),
        JSON.stringify(orders)
      );
    } catch {
      // Ignore storage write failures and keep the in-memory orders available.
    }
  }, [orders, user?.id]);

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
    { id: 'shop', label: 'Shop', icon: FaStore },
    { id: 'product-management', label: 'Product Management', kind: 'section' },
    { id: 'product-list', label: 'Product List', icon: FaBox },
    { id: 'create-product', label: 'Create Product', icon: FaPlus },
    { id: 'order-management', label: 'Order Management', kind: 'section' },
    { id: 'pending-orders', label: 'Pending Orders', icon: FaClipboardList },
    { id: 'processing-orders', label: 'Processing Orders', icon: FaSpinner },
    { id: 'packing-orders', label: 'Packing Orders', icon: FaBox },
    { id: 'delivery-orders', label: 'Delivery Orders', icon: FaTruck },
    { id: 'completed-orders', label: 'Completed Orders', icon: FaCheck },
    { id: 'customer-details', label: 'Customer Details', icon: FaAddressBook },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'community', label: 'Community', icon: FaUsers },
    { id: 'profile', label: 'Profile', icon: FaUser }
  ];

  const quickStats = [
    { label: 'Today\'s Orders', value: '12', change: '+3 from yesterday', positive: true },
    { label: 'Pending Deliveries', value: '5', change: 'Due today', positive: false },
    { label: 'Low Stock Items', value: '3', change: 'Restock needed', positive: false },
    { label: 'Community Chats', value: '8', change: 'Joined farmers', positive: true }
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
      if (!event.target.closest('.notification-panel') && !event.target.closest('.notification-trigger')) {
        setShowNotifications(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    fetchProducts();
    fetchProfile();
    fetchFarmerOrders();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch products from backend for this farmer
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError('');
    try {
      const farmerId = user?.id || 1;
      console.log('Fetching products for farmer:', farmerId);
      
      const response = await fetch(`${API_BASES.products}/products?farmer_id=${farmerId}`);
      
      console.log('Fetch products response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
      }

      const data = await response.json();
      console.log('Fetch products response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setProducts(Array.isArray(data) ? data : []);
      setProductsError('');
    } catch (error) {
      console.error('Fetch products error:', error);
      setProducts([]);
      setProductsError(error.message || 'Failed to load products. Please check your internet connection and try again.');
    }
    setIsLoadingProducts(false);
  };

  // Fetch farmer profile from backend
  const fetchProfile = async () => {
    try {
      const userId = user?.id || 1;
      const res = await fetch(`${API_BASES.farmerProfile}/profile/${userId}`);
      const data = await res.json();
      setFarmerProfile(data);
    } catch {
      setFarmerProfile(null);
    }
  };

  const fetchFarmerOrders = async () => {
    const farmerId = user?.id || 1;
    setOrdersError('');

    try {
      const response = await fetch(`${API_BASES.payments}/farmer/${farmerId}/orders`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch farmer orders');
      }

      const apiOrders = Array.isArray(data.orders) ? data.orders : [];

      if (apiOrders.length > 0) {
        setOrders(apiOrders.map(mapApiOrderToFarmerOrder));
      }
    } catch (error) {
      console.error('Fetch farmer orders error:', error);
      setOrdersError(error.message || 'Live orders could not be loaded.');
    }
  };

  const syncFarmerOrderToBackend = async (order) => {
    if (!order?.backendOrderId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASES.payments}/orders/${order.backendOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: order.status === 'completed' ? 'delivered' : order.status,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.deliveryAddress,
          total: Number(order.amount || 0)
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to sync order update');
      }
    } catch (error) {
      console.error('Sync farmer order error:', error);
      setOrdersError(error.message || 'Order updated locally, but backend sync failed.');
    }
  };

  const deleteFarmerOrderFromBackend = async (order) => {
    if (!order?.backendOrderId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASES.payments}/orders/${order.backendOrderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete backend order');
      }
    } catch (error) {
      console.error('Delete farmer order error:', error);
      setOrdersError(error.message || 'Order deleted locally, but backend delete failed.');
    }
  };

  const updateOrdersAndSync = (updater) => {
    setOrders((currentOrders) => {
      const nextOrders = typeof updater === 'function' ? updater(currentOrders) : updater;
      const currentById = new Map(currentOrders.map((order) => [order.id, order]));
      const nextIds = new Set(nextOrders.map((order) => order.id));

      nextOrders.forEach((order) => {
        const previousOrder = currentById.get(order.id);
        if (
          order.backendOrderId &&
          previousOrder &&
          JSON.stringify(previousOrder) !== JSON.stringify(order)
        ) {
          syncFarmerOrderToBackend(order);
        }
      });

      currentOrders.forEach((order) => {
        if (order.backendOrderId && !nextIds.has(order.id)) {
          deleteFarmerOrderFromBackend(order);
        }
      });

      return nextOrders;
    });
  };

  // Calculate dashboard statistics
  const dashboardStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalSales: products.reduce((sum, p) => sum + (p.sales || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.sales || 0)), 0),
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    avgRating: products.length
      ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
      : '0.0'
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

  const resetProductEditor = () => {
    setEditingProduct(null);
    setProductForm(createEmptyProductForm());
    setPreviewImages([]);
    setFormError('');
  };

  const openCreateProductPage = () => {
    resetProductEditor();
    setActiveTab('create-product');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Add/Edit product (send to backend)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setFormError('');

    // Validation
    if (!productForm.name?.trim()) {
      setFormError('Product name is required');
      setIsUploading(false);
      return;
    }

    if (!productForm.price || isNaN(parseFloat(productForm.price)) || parseFloat(productForm.price) <= 0) {
      setFormError('Please enter a valid price greater than 0');
      setIsUploading(false);
      return;
    }

    if (!productForm.category) {
      setFormError('Please select a category');
      setIsUploading(false);
      return;
    }

    if (!productForm.stock || isNaN(parseInt(productForm.stock)) || parseInt(productForm.stock) <= 0) {
      setFormError('Please enter a valid stock quantity greater than 0');
      setIsUploading(false);
      return;
    }

    if (!productForm.unit) {
      setFormError('Please select a unit');
      setIsUploading(false);
      return;
    }

    if (!productForm.description?.trim()) {
      setFormError('Product description is required');
      setIsUploading(false);
      return;
    }

    // Check if image is provided for new products
    if (!editingProduct && productForm.images.length === 0) {
      setFormError('Please upload at least one product image');
      setIsUploading(false);
      return;
    }

    try {
      const farmerId = user?.id || 1;
      const formData = new FormData();
      
      // Add all required fields
      formData.append('farmer_id', farmerId.toString());
      formData.append('name', productForm.name.trim());
      formData.append('price', parseFloat(productForm.price).toString());
      formData.append('quantity', parseInt(productForm.stock).toString());
      formData.append('category', productForm.category);
      formData.append('unit', productForm.unit);
      formData.append('description', productForm.description.trim());
      formData.append('status', productForm.status);

      // Add optional fields
      if (productForm.lat) formData.append('lat', productForm.lat);
      if (productForm.lng) formData.append('lng', productForm.lng);
      if (productForm.address) formData.append('address', productForm.address);

      // Handle existing image for edit mode
      if (editingProduct && productForm.images.length === 0 && previewImages.length > 0) {
        const existingImageUrl = previewImages[0];
        if (typeof existingImageUrl === 'string' && !existingImageUrl.startsWith('blob:')) {
          formData.append('image_url', existingImageUrl);
        }
      }

      // Add new images
      productForm.images.forEach((img) => {
        formData.append('images', img);
      });

      let url = `${API_BASES.products}/products/upload`;
      let method = 'POST';
      if (editingProduct) {
        url = `${API_BASES.products}/products/${editingProduct.id}`;
        method = 'PUT';
      }

      console.log('Sending request to:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method,
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
      }

      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success && !result.productId) {
        throw new Error(result.error || 'Failed to save product');
      }

      // Success
      resetProductEditor();
      showSuccessNotification(editingProduct ? 'Product updated successfully!' : 'Product uploaded successfully!');
      setActiveTab('product-list');
      setIsUploading(false);
      await fetchProducts(); // Refresh products list

    } catch (error) {
      console.error('Submit error:', error);
      setFormError(error.message || 'Failed to save product. Please check your internet connection and try again.');
      setIsUploading(false);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...createEmptyProductForm(),
      name: product.name || '',
      price: product.price ? product.price.toString() : '',
      category: product.category || '',
      stock: product.quantity ? product.quantity.toString() : '',
      unit: product.unit || 'kg',
      description: product.description || '',
      address: product.address || '',
      images: [],
      status: product.status || 'active',
      organic: product.organic || false,
      featured: product.featured || false
    });
    setPreviewImages(product.image_url ? [product.image_url] : []);
    setFormError('');
    setActiveTab('create-product');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Delete product (call backend)
  const deleteProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const shouldDelete = await confirmAction({
      title: 'Delete product?',
      text: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete product'
    });

    if (!shouldDelete) return;

    try {
      console.log('Deleting product:', id);
      
      const response = await fetch(`${API_BASES.products}/products/${id}`, { 
        method: 'DELETE' 
      });

      console.log('Delete response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
      }

      const result = await response.json();
      console.log('Delete response result:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }

      showSuccessNotification(`Product "${product.name}" deleted successfully!`);
      await fetchProducts(); // Refresh products list

    } catch (error) {
      console.error('Delete error:', error);
      const message = error.message || 'Failed to delete product. Please check your internet connection and try again.';
      setProductsError(message);
      showErrorAlert('Delete failed', message);
    }
  };

  // Toggle product status (call backend)
  const toggleProductStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      console.log('Toggling product status:', id, 'to', newStatus);
      
      const response = await fetch(`${API_BASES.products}/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('Status toggle response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
      }

      const result = await response.json();
      console.log('Status toggle response result:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to update product status');
      }

      showSuccessNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      await fetchProducts(); // Refresh products list

    } catch (error) {
      console.error('Status toggle error:', error);
      setProductsError(error.message || 'Failed to update product status. Please check your internet connection and try again.');
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Filter and sort products (use backend data)
  const filteredProducts = products
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return (b.id || 0) - (a.id || 0);
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'popular': return (b.views || 0) - (a.views || 0);
        default: return 0;
      }
    });

  const handleTabChange = (tabId) => {
    if (tabId === 'profile') {
      setLastPortalTab(activeTab === 'profile' ? lastPortalTab : activeTab);
    }

    if (tabId === 'create-product') {
      openCreateProductPage();
    } else {
      setActiveTab(tabId);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }
  };

  if (activeTab === 'profile') {
    return (
      <div
        className="w-full min-h-screen"
        style={{ margin: 0, padding: 0, width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}
      >
        <FarmerProfile
          user={user}
          goBack={() => setActiveTab(lastPortalTab || 'dashboard')}
          onLogout={onLogout}
          onProfileSaved={fetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen mobile-safe-shell w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" 
         style={{ margin: 0, padding: 0, width: '100%', minHeight: '100dvh', overflowX: 'hidden' }}>
      
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
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-md"
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
                  src={
                    farmerProfile?.profile_image
                      ? farmerProfile.profile_image
                      : (user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face')
                  }
                  alt="Profile" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl ring-2 ring-emerald-500/30 hover:ring-emerald-500 transition-all cursor-pointer" 
                  onClick={() => handleTabChange('profile')}
                  title="View Profile"
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
              {sidebarItems.map((item) => {
                if (item.kind === 'section') {
                  return sidebarOpen ? (
                    <div
                      key={item.id}
                      className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400"
                    >
                      {item.label}
                    </div>
                  ) : (
                    <div key={item.id} className="mx-auto my-4 h-px w-10 bg-emerald-100" />
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
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
                );
              })}
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

                 { /* Main Content Area */}
                  <main className="flex-1 w-full min-w-0 overflow-x-hidden">
                  <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8">
                    {ordersError && (
                      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
                        {ordersError}
                      </div>
                    )}
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                  {/* Welcome Hero Section with Video Background */}
                  <div className="rounded-3xl p-6 lg:p-8 text-white shadow-2xl overflow-hidden relative">
                    {/* Video Background */}
                    <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    >
                    <source src="https://cdn.pixabay.com/video/2015/10/18/1080-142790249_medium.mp4" type="video/mp4" />
                    </video>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
                    
                    <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                      <div>
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">
                    Welcome back, {currentUser.name}! 👋
                    </h1>
                    <p className="text-white/80 text-sm lg:text-base mb-4">
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
                          onClick={openCreateProductPage}
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
                      desc: `${orders.filter((order) => order.status === 'delivery').length} orders in transit`, 
                      color: 'from-blue-500 to-cyan-600',
                      action: () => handleTabChange('delivery-orders')
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
                      action: () => handleTabChange('product-list')
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
                      <p className="text-gray-600 text-sm mt-1">Your latest products</p>
                    </div>
                    <button 
                      onClick={() => handleTabChange('product-list')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center group"
                    >
                      View All <FaChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="relative overflow-hidden">
                    {products.length === 0 ? (
                      <div className="text-center py-12">
                        <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No products available</h3>
                        <p className="text-gray-500 mt-2">Add your first product to get started</p>
                        <button 
                          onClick={openCreateProductPage}
                          className="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
                        >
                          <FaPlus className="mr-2" /> Add Product
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-4 overflow-x-auto pb-4">
                        {products.slice(0, 6).map((product) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 w-64 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
                          >
                            <div className="relative h-40 overflow-hidden">
                              <img 
                                src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                                }}
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
                                {product.status || 'active'}
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800 truncate flex-1 mr-2">{product.name}</h3>
                                <p className="text-emerald-600 font-bold flex items-center whitespace-nowrap">
                                  <FaRupeeSign className="mr-1" /> {product.price}
                                  <span className="text-xs text-gray-500 ml-1">/{product.unit || 'kg'}</span>
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <FaStar className="text-yellow-400 text-xs mr-1" />
                                  <span className="text-xs font-medium">{product.rating || '4.5'}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {product.quantity || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'product-list' && (
              <FarmerProductListPage
                products={products}
                filteredProducts={filteredProducts}
                isLoading={isLoadingProducts}
                categories={categories}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onCreateProduct={openCreateProductPage}
                onEditProduct={editProduct}
                onToggleProductStatus={toggleProductStatus}
                onDeleteProduct={deleteProduct}
                productsError={productsError}
              />
            )}

            {activeTab === 'create-product' && (
              <FarmerCreateProductPage
                editingProduct={editingProduct}
                productForm={productForm}
                setProductForm={setProductForm}
                categories={categories}
                units={units}
                previewImages={previewImages}
                isUploading={isUploading}
                formError={formError}
                onSubmit={handleSubmitProduct}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                onCancel={resetProductEditor}
                onOpenProductList={() => handleTabChange('product-list')}
              />
            )}

            {activeTab === 'shop' && (
              <FarmerShopPage
                farmer={currentUser}
                products={products}
                isLoading={isLoadingProducts}
                onAddProduct={openCreateProductPage}
                onManageProducts={() => handleTabChange('product-list')}
              />
            )}

            {activeTab === 'community' && (
              <FarmerCommunityPage user={currentUser} />
            )}

            {activeTab === 'pending-orders' && (
              <FarmerPendingOrdersPage
                orders={orders}
                setOrders={updateOrdersAndSync}
                onNavigateToStage={handleTabChange}
              />
            )}

            {activeTab === 'processing-orders' && (
              <FarmerProcessingOrdersPage
                orders={orders}
                setOrders={updateOrdersAndSync}
                onNavigateToStage={handleTabChange}
              />
            )}

            {activeTab === 'packing-orders' && (
              <FarmerPackingOrdersPage
                orders={orders}
                setOrders={updateOrdersAndSync}
                onNavigateToStage={handleTabChange}
              />
            )}

            {activeTab === 'delivery-orders' && (
              <FarmerDeliveryOrdersPage
                orders={orders}
                setOrders={updateOrdersAndSync}
                onNavigateToStage={handleTabChange}
              />
            )}

            {activeTab === 'completed-orders' && (
              <FarmerCompletedOrdersPage
                orders={orders}
                setOrders={updateOrdersAndSync}
                onNavigateToStage={handleTabChange}
              />
            )}

            {activeTab === 'customer-details' && (
              <FarmerCustomerDetailsPage
                orders={orders}
                setOrders={updateOrdersAndSync}
              />
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
                      <div className="relative z-10 group-hover:text-white transition-colors duration-500">
                        <stat.icon className="text-3xl mb-3" />
                        <h3 className="font-semibold text-lg">{stat.title}</h3>
                        <p className="text-sm opacity-80">{stat.change}</p>
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
