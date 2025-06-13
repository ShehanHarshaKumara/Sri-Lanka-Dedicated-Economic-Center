import { useState, useEffect } from 'react';
import { 
  FaTractor, FaPlus, FaEdit, FaTrash, FaEye, FaBell, FaChartBar, FaShoppingCart, 
  FaMapMarkerAlt, FaStar, FaUpload, FaCamera, FaTimes, FaCheck, FaLeaf, FaUser, 
  FaBars, FaHome, FaBox, FaClipboardList, FaUsers, FaCog, FaSignOutAlt, FaRupeeSign, 
  FaCalendar, FaWeight, FaTag, FaImage, FaSave, FaSpinner
} from 'react-icons/fa';

const FarmerPortal = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState({
    id: user?.id || 1,
    name: user?.name || 'Farmer User',
    email: user?.email || 'farmer@example.com',
    location: user?.location || 'Galle District',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    farmSize: user?.farmSize || '15 acres',
    joinDate: user?.joinDate || '2022-03-15',
    totalProducts: 0,
    totalSales: 0
  });

  useEffect(() => {
    setCurrentUser({
      id: user?.id || 1,
      name: user?.name || 'Farmer User',
      email: user?.email || 'farmer@example.com',
      location: user?.location || 'Galle District',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      farmSize: user?.farmSize || '15 acres',
      joinDate: user?.joinDate || '2022-03-15',
      totalProducts: 0,
      totalSales: 0
    });
  }, [user]);

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order for King Coconuts', time: '2 hours ago', type: 'order' },
    { id: 2, message: 'Product approved by admin', time: '1 day ago', type: 'approval' },
    { id: 3, message: 'Low stock alert for Cinnamon', time: '2 days ago', type: 'warning' }
  ]);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    unit: '',
    description: '',
    images: [],
    status: 'active'
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const categories = [
    'Fresh Produce', 'Spices', 'Grains', 'Fruits', 'Vegetables', 
    'Herbs', 'Dairy', 'Coconut Products', 'Tea', 'Other'
  ];

  const units = ['kg', 'g', 'pieces', 'liters', 'ml', 'bunches', 'bags'];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    fetchProducts();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line
  }, [currentUser.id]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products?farmer_id=' + currentUser.id);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      setProducts([]);
    }
  };

  const dashboardStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalSales: products.reduce((sum, p) => sum + (p.sales || 0), 0),
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.sales || 0)), 0)
  };

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
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
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
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Handle form submission (upload or update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setFormError('');

    // Validation
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock || !productForm.unit || !productForm.description) {
      setFormError('Please fill in all required fields');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('farmer_id', currentUser.id);
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('quantity', productForm.stock);
    formData.append('category', productForm.category);
    formData.append('address', currentUser.location || '');
    formData.append('unit', productForm.unit);
    formData.append('status', productForm.status);

    // Handle images
    if (productForm.images && productForm.images.length > 0) {
      productForm.images.forEach((img) => {
        formData.append('images', img);
      });
    }

    try {
      let response, data;
      if (editingProduct) {
        // If no new image is uploaded, send the existing image_url
        if (productForm.images.length === 0 && editingProduct.image_url) {
          formData.append('image_url', editingProduct.image_url);
        }
        
        console.log('Updating product with ID:', editingProduct.id);
        response = await fetch(`http://localhost:5001/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        console.log('Creating new product');
        response = await fetch('http://localhost:5001/api/products/upload', {
          method: 'POST',
          body: formData
        });
      }

      data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        setShowAddProduct(false);
        setEditingProduct(null);
        setProductForm({
          name: '', price: '', category: '', stock: '', unit: '', description: '', images: [], status: 'active'
        });
        setPreviewImages([]);
        await fetchProducts();
        setFormError('');
        showSuccessNotification(editingProduct ? 'Product updated successfully!' : 'Product uploaded successfully!');
      } else {
        setFormError(data.error || 'Unknown error occurred');
        console.error('Server error:', data.error);
      }
    } catch (err) {
      console.error('Network error:', err);
      setFormError('Network or server error: ' + err.message);
    }
    setIsUploading(false);
  };

  // Edit product (populate form)
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
      status: product.status || 'active'
    });
    setPreviewImages(product.image_url ? [product.image_url] : []);
    setShowAddProduct(true);
    setFormError(''); // Clear any previous errors
  };

  // Delete product with modal
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    const id = productToDelete.id;
    setDeletingProductId(id);
    setShowDeleteModal(false);
    
    try {
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showSuccessNotification(`Product "${productToDelete.name}" deleted successfully!`);
      } else {
        const errorMessage = data.error || 'Failed to delete product';
        alert(`Error: ${errorMessage}`);
        console.error('Delete error:', errorMessage);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error: Could not delete product. Please check your connection and try again.');
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    // Custom confirmation dialog with product details
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const confirmMessage = `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setDeletingProductId(id); // Set loading state
      try {
        // Show loading state (optional: you can add a loading state)
        const response = await fetch(`http://localhost:5001/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Remove from local state immediately for better UX
          setProducts(prev => prev.filter(p => p.id !== id));
          showSuccessNotification(`Product "${product.name}" deleted successfully!`);
          
          // Optionally refresh the products list to ensure sync with database
          // await fetchProducts();
        } else {
          // Show error message
          const errorMessage = data.error || 'Failed to delete product';
          alert(`Error: ${errorMessage}`);
          console.error('Delete error:', errorMessage);
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Network error: Could not delete product. Please check your connection and try again.');
      } finally {
        setDeletingProductId(null); // Clear loading state
      }
    }
  };

  const toggleProductStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    const formData = new FormData();
    formData.append('farmer_id', currentUser.id);
    formData.append('name', product.name || '');
    formData.append('description', product.description || '');
    formData.append('price', product.price || '0');
    formData.append('quantity', product.quantity || '0');
    formData.append('category', product.category || '');
    formData.append('address', product.address || '');
    formData.append('unit', product.unit || 'kg');
    formData.append('status', newStatus);
    formData.append('image_url', product.image_url || '');

    try {
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        showSuccessNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        console.error('Status toggle error:', data.error);
        alert('Error updating product status: ' + data.error);
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      alert('Network error while updating product status');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'products', label: 'My Products', icon: FaBox },
    { id: 'orders', label: 'Orders', icon: FaClipboardList },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'community', label: 'Community', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-green-500/20 py-2' 
          : 'bg-white shadow-lg py-3 border-gray-200'
      }`}>
        <div className="px-2 sm:px-4 lg:px-6 2xl:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle lg:hidden mr-2 p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors flex-shrink-0"
              >
                <FaBars className="text-green-600 text-lg" />
              </button>
              <FaTractor className="text-green-600 text-2xl mr-2 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                <span className="hidden sm:inline">Sri Lankan Farmer Portal</span>
                <span className="sm:hidden">Farmer Portal</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="relative">
                <button className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors relative">
                  <FaBell className="text-green-600 text-lg" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-32">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 truncate max-w-32">{currentUser.location}</p>
                </div>
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-green-500/30 flex-shrink-0" 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20 w-full min-h-screen">
        {/* Sidebar */}
        <aside className={`sidebar fixed lg:static inset-y-0 left-0 z-40 w-64 xl:w-80 2xl:w-96 bg-white border-r border-green-500/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 xl:p-6 2xl:p-8 pt-0 h-full overflow-y-auto">
            <nav className="space-y-1 xl:space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 xl:px-4 2xl:px-6 py-2.5 xl:py-3 2xl:py-4 text-left rounded-xl transition-all duration-200 text-sm xl:text-base 2xl:text-lg ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-500/10 hover:text-green-600'
                  }`}
                >
                  <item.icon className="mr-2 xl:mr-3 2xl:mr-4 text-lg xl:text-xl 2xl:text-2xl" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-4 xl:bottom-6 2xl:bottom-8 left-4 xl:left-6 2xl:left-8 right-4 xl:right-6 2xl:right-8">
              <button 
                onClick={() => {
                  onLogout();
                }}
                className="w-full flex items-center px-3 xl:px-4 2xl:px-6 py-2.5 xl:py-3 2xl:py-4 text-left rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm xl:text-base 2xl:text-lg"
              >
                <FaSignOutAlt className="mr-2 xl:mr-3 2xl:mr-4 text-lg xl:text-xl 2xl:text-2xl" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="px-2 sm:px-4 lg:px-6 2xl:px-8 py-4 lg:py-6 2xl:py-8 w-full">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="w-full space-y-6 2xl:space-y-8">
                <div className="mb-6 lg:mb-8 2xl:mb-12">
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-800 mb-2">
                    Welcome back, {currentUser.name}!
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-base xl:text-lg 2xl:text-xl">
                    Manage your farm products and track your sales
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 2xl:gap-8 mb-6 lg:mb-8 2xl:mb-12">
                  {[
                    { title: 'Total Products', value: dashboardStats.totalProducts, icon: FaBox, color: 'blue' },
                    { title: 'Active Products', value: dashboardStats.activeProducts, icon: FaCheck, color: 'green' },
                    { title: 'Total Sales', value: dashboardStats.totalSales, icon: FaShoppingCart, color: 'purple' },
                    { title: 'Revenue', value: `Rs.${dashboardStats.totalRevenue.toLocaleString()}`, icon: FaRupeeSign, color: 'orange' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white p-4 sm:p-6 lg:p-8 2xl:p-10 rounded-xl shadow-lg border border-green-500/10 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-600 text-xs sm:text-sm lg:text-base 2xl:text-lg font-medium truncate">{stat.title}</p>
                          <p className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-gray-800 mt-1 truncate">{stat.value}</p>
                        </div>
                        <div className={`p-3 sm:p-4 lg:p-5 2xl:p-6 rounded-xl bg-${stat.color}-500/20 flex-shrink-0`}>
                          <stat.icon className={`text-${stat.color}-600 text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 2xl:gap-8 mb-6 lg:mb-8 2xl:mb-12">
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 lg:p-8 2xl:p-10 rounded-xl hover:shadow-xl transition-all text-center group"
                  >
                    <FaPlus className="text-3xl lg:text-4xl 2xl:text-5xl mx-auto mb-3 lg:mb-4 2xl:mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg lg:text-xl 2xl:text-2xl">Add New Product</h3>
                    <p className="text-green-100 text-sm lg:text-base 2xl:text-lg">Upload and list your products</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="bg-white p-6 lg:p-8 2xl:p-10 rounded-xl shadow-lg hover:shadow-xl transition-all text-center border border-green-500/10 group"
                  >
                    <FaEye className="text-3xl lg:text-4xl 2xl:text-5xl text-blue-600 mx-auto mb-3 lg:mb-4 2xl:mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-gray-800 text-lg lg:text-xl 2xl:text-2xl">View Products</h3>
                    <p className="text-gray-600 text-sm lg:text-base 2xl:text-lg">Manage your product listings</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-white p-6 lg:p-8 2xl:p-10 rounded-xl shadow-lg hover:shadow-xl transition-all text-center border border-green-500/10 group"
                  >
                    <FaChartBar className="text-3xl lg:text-4xl 2xl:text-5xl text-orange-600 mx-auto mb-3 lg:mb-4 2xl:mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-gray-800 text-lg lg:text-xl 2xl:text-2xl">View Analytics</h3>
                    <p className="text-gray-600 text-sm lg:text-base 2xl:text-lg">Track your performance</p>
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 2xl:p-10 border border-green-500/10 w-full">
                  <div className="flex justify-between items-center mb-6 lg:mb-8 2xl:mb-10">
                    <h2 className="text-xl lg:text-2xl 2xl:text-3xl font-bold text-gray-800">Recent Products</h2>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm lg:text-base 2xl:text-lg"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6 2xl:gap-8">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 lg:p-6 2xl:p-8 hover:shadow-lg transition-all">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-32 lg:h-36 2xl:h-40 object-cover rounded mb-3 lg:mb-4" 
                        />
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base 2xl:text-lg truncate">{product.name}</h3>
                        <p className="text-green-600 font-bold mb-2 text-sm lg:text-base 2xl:text-lg">Rs.{product.price}</p>
                        <div className="flex justify-between text-xs lg:text-sm 2xl:text-base text-gray-600">
                          <span className="truncate">Stock: {product.quantity} {product.unit || 'kg'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs 2xl:text-sm ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="w-full space-y-6 2xl:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 2xl:mb-12 gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-800 mb-2">My Products</h1>
                    <p className="text-gray-600 text-sm lg:text-base xl:text-lg 2xl:text-xl">Manage and track your product listings</p>
                  </div>
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 lg:px-8 2xl:px-10 py-3 lg:py-4 2xl:py-5 rounded-xl flex items-center shadow-lg text-sm lg:text-base 2xl:text-lg"
                  >
                    <FaPlus className="mr-2 lg:mr-3" /> Add New Product
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 lg:gap-6 2xl:gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-lg border border-green-500/10 overflow-hidden hover:shadow-xl transition-all">
                      <div className="relative">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-40 lg:h-48 2xl:h-56 object-cover" 
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 lg:px-3 2xl:px-4 py-1 2xl:py-2 rounded-full text-xs 2xl:text-sm font-semibold ${
                            product.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 lg:p-6 2xl:p-8">
                        <h3 className="font-bold text-gray-800 text-base lg:text-lg 2xl:text-xl mb-2 truncate">{product.name}</h3>
                        <p className="text-gray-600 text-xs lg:text-sm 2xl:text-base mb-3 line-clamp-2">{product.description}</p>
                        <div className="space-y-1.5 lg:space-y-2 2xl:space-y-3 mb-4 lg:mb-6">
                          <div className="flex justify-between text-xs lg:text-sm 2xl:text-base">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold text-green-600">Rs.{product.price}</span>
                          </div>
                          <div className="flex justify-between text-xs lg:text-sm 2xl:text-base">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-semibold">{product.quantity} {product.unit || 'kg'}</span>
                          </div>
                          <div className="flex justify-between text-xs lg:text-sm 2xl:text-base">
                            <span className="text-gray-600">Sales:</span>
                            <span className="font-semibold">{product.sales || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs lg:text-sm 2xl:text-base">
                            <span className="text-gray-600">Views:</span>
                            <span className="font-semibold">{product.views || 0}</span>
                          </div>
                        </div>
                        <div className="flex space-x-1.5 lg:space-x-2 2xl:space-x-3">
                          <button 
                            onClick={() => editProduct(product)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 lg:py-3 2xl:py-4 px-2 lg:px-3 2xl:px-4 rounded-lg text-xs lg:text-sm 2xl:text-base flex items-center justify-center transition-colors"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => toggleProductStatus(product.id)}
                            className={`flex-1 py-2 lg:py-3 2xl:py-4 px-2 lg:px-3 2xl:px-4 rounded-lg text-xs lg:text-sm 2xl:text-base flex items-center justify-center transition-colors ${
                              product.status === 'active'
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {product.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            disabled={deletingProductId === product.id}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 lg:py-3 2xl:py-4 px-2 lg:px-3 2xl:px-4 rounded-lg text-xs lg:text-sm 2xl:text-base flex items-center justify-center transition-colors"
                            title="Delete Product"
                          >
                            {deletingProductId === product.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-16 2xl:py-24">
                    <FaBox className="text-6xl 2xl:text-8xl text-gray-300 mx-auto mb-4 2xl:mb-6" />
                    <h3 className="text-xl 2xl:text-2xl font-semibold text-gray-600 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6 2xl:mb-8 text-base 2xl:text-lg">Start by adding your first product to the marketplace</p>
                    <button 
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 2xl:px-8 py-3 2xl:py-4 rounded-xl text-base 2xl:text-lg"
                    >
                      Add Your First Product
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs content (orders, analytics, community, settings) can remain as in your original code */}
          </div>
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <div className="bg-white rounded-2xl w-full max-w-[98vw] 2xl:max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 2xl:p-8 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl lg:text-2xl 2xl:text-3xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({
                      name: '', price: '', category: '', stock: '', unit: '', description: '', images: [], status: 'active'
                    });
                    setPreviewImages([]);
                    setFormError('');
                  }}
                  className="p-2 lg:p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-600 text-xl 2xl:text-2xl" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-4 lg:p-6 2xl:p-8">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12">
                {/* Left Column - Product Details */}
                <div className="space-y-4 lg:space-y-6 2xl:space-y-8 xl:col-span-1 2xl:col-span-2">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                      placeholder="Enter product name"
                    />
                  </div>
                  {/* Category and Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 2xl:gap-8">
                    <div>
                      <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                        Category *
                      </label>
                      <select
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                        Price (Rs.) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {/* Stock and Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 2xl:gap-8">
                    <div>
                      <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                        Unit *
                      </label>
                      <select
                        required
                        value={productForm.unit}
                        onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                      >
                        <option value="">Select unit</option>
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm lg:text-base 2xl:text-lg"
                      placeholder="Describe your product, its quality, origin, and special features..."
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                      Status
                    </label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 lg:px-6 2xl:px-8 py-3 lg:py-4 2xl:py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base 2xl:text-lg"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                {/* Right Column - Image Upload and Preview */}
                <div className="space-y-4 lg:space-y-6 2xl:space-y-8">
                  <div>
                    <label className="block text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                      Product Images {editingProduct ? '(Leave empty to keep existing)' : '*'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 lg:p-8 2xl:p-12 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <FaCamera className="text-4xl lg:text-5xl 2xl:text-6xl text-gray-400 mx-auto mb-4 lg:mb-6" />
                        <p className="text-gray-600 font-semibold mb-2 text-sm lg:text-base 2xl:text-lg">
                          Click to upload images
                        </p>
                        <p className="text-gray-500 text-xs lg:text-sm 2xl:text-base">
                          Upload multiple images (JPG, PNG, WebP)
                        </p>
                        <p className="text-gray-500 text-xs lg:text-sm 2xl:text-base mt-1">
                          First image will be the main product image
                        </p>
                      </label>
                    </div>
                    {previewImages.length > 0 && (
                      <div className="mt-4 lg:mt-6 2xl:mt-8">
                        <h4 className="text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-3 lg:mb-4">
                          Uploaded Images ({previewImages.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-3 lg:gap-4 2xl:gap-6">
                          {previewImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 lg:h-24 2xl:h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 flex items-center justify-center text-xs lg:text-sm 2xl:text-base hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <FaTimes />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs lg:text-sm 2xl:text-base px-2 py-1 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 lg:p-6 2xl:p-8">
                    <h4 className="text-sm lg:text-base 2xl:text-lg font-semibold text-green-800 mb-2 lg:mb-3 flex items-center">
                      <FaLeaf className="mr-2 lg:mr-3" />
                      Tips for Better Sales
                    </h4>
                    <ul className="text-xs lg:text-sm 2xl:text-base text-green-700 space-y-1 lg:space-y-2">
                      <li>• Use high-quality, well-lit photos</li>
                      <li>• Write detailed, honest descriptions</li>
                      <li>• Set competitive but fair prices</li>
                      <li>• Keep stock quantities updated</li>
                      <li>• Respond quickly to customer inquiries</li>
                    </ul>
                  </div>
                  {productForm.name && productForm.price && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 lg:p-6 2xl:p-8">
                      <h4 className="text-sm lg:text-base 2xl:text-lg font-semibold text-gray-700 mb-3 lg:mb-4">Preview</h4>
                      <div className="bg-white rounded-lg border p-4 lg:p-6">
                        {previewImages.length > 0 && (
                          <img
                            src={previewImages[0]}
                            alt="Preview"
                            className="w-full h-32 lg:h-36 2xl:h-40 object-cover rounded mb-3 lg:mb-4"
                          />
                        )}
                        <h5 className="font-semibold text-gray-800 mb-1 lg:mb-2 text-sm lg:text-base 2xl:text-lg">{productForm.name}</h5>
                        <p className="text-green-600 font-bold mb-2 lg:mb-3 text-sm lg:text-base 2xl:text-lg">Rs.{productForm.price}</p>
                        {productForm.description && (
                          <p className="text-gray-600 text-xs lg:text-sm 2xl:text-base line-clamp-2">{productForm.description}</p>
                        )}
                        {productForm.stock && productForm.unit && (
                          <p className="text-gray-500 text-xs lg:text-sm 2xl:text-base mt-2 lg:mt-3">
                            Stock: {productForm.stock} {productForm.unit}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 2xl:gap-8 mt-6 lg:mt-8 2xl:mt-12 pt-6 lg:pt-8 2xl:pt-10 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({
                      name: '', price: '', category: '', stock: '', unit: '', description: '', images: [], status: 'active'
                    });
                    setPreviewImages([]);
                    setFormError('');
                  }}
                  className="flex-1 sm:flex-none px-6 lg:px-8 2xl:px-10 py-3 lg:py-4 2xl:py-5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm lg:text-base 2xl:text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !productForm.name || !productForm.price || !productForm.category || !productForm.stock || !productForm.unit || !productForm.description}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 lg:px-8 2xl:px-10 py-3 lg:py-4 2xl:py-5 rounded-xl transition-all flex items-center justify-center text-sm lg:text-base 2xl:text-lg"
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="mr-2 lg:mr-3 animate-spin" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2 lg:mr-3" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 lg:bottom-6 2xl:bottom-8 right-4 lg:right-6 2xl:right-8 z-40 animate-in slide-in-from-bottom-2">
          <div className="bg-green-500 text-white px-4 lg:px-6 2xl:px-8 py-2 lg:py-3 2xl:py-4 rounded-lg shadow-lg text-sm lg:text-base 2xl:text-lg flex items-center">
            <FaCheck className="mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 lg:p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTrash className="text-red-600 text-2xl lg:text-3xl" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-1">Are you sure you want to delete</p>
              <p className="text-lg font-semibold text-gray-800 mb-4">"{productToDelete.name}"?</p>
              {productToDelete.image_url && (
                <img 
                  src={productToDelete.image_url} 
                  alt={productToDelete.name}
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                />
              )}
              <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 lg:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerPortal;