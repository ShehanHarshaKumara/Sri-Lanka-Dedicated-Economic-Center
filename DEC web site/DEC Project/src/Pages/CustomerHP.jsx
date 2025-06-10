import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaLeaf, 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaEnvelope,
  FaUsers,
  FaTruck,
  FaShieldAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaHeart,
  FaEye,
  FaFilter,
  FaSort
} from 'react-icons/fa';

const EconomicCenter = () => {
  const [products] = useState([
    {
      id: 1,
      name: 'Ceylon Tea',
      price: 1200,
      seller: 'Dilmah Tea Estate',
      location: 'Nuwara Eliya',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1564894809616-9ee741318363?w=400&h=300&fit=crop',
      category: 'Beverages',
      discount: 10,
      inStock: true,
      description: 'Premium Ceylon tea from the highlands'
    },
    {
      id: 2,
      name: 'King Coconut',
      price: 180,
      seller: 'Sunil Rathnayake',
      location: 'Galle',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1598511757337-fe2caaa45407?w=400&h=300&fit=crop',
      category: 'Fresh Produce',
      discount: 5,
      inStock: true,
      description: 'Fresh king coconuts from coastal regions'
    },
    {
      id: 3,
      name: 'Ceylon Cinnamon',
      price: 950,
      seller: 'Spice Garden',
      location: 'Kandy',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=300&fit=crop',
      category: 'Spices',
      discount: 15,
      inStock: true,
      description: 'Authentic Ceylon cinnamon sticks'
    },
    {
      id: 4,
      name: 'Red Rice',
      price: 320,
      seller: 'Lanka Rice Mills',
      location: 'Polonnaruwa',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
      category: 'Grains',
      discount: 8,
      inStock: false,
      description: 'Nutritious red rice variety'
    },
    {
      id: 5,
      name: 'Dragon Fruit',
      price: 1500,
      seller: 'Saman Silva',
      location: 'Kandy',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=300&fit=crop',
      category: 'Exotic Fruits',
      discount: 20,
      inStock: true,
      description: 'Fresh exotic dragon fruits'
    },
    {
      id: 6,
      name: 'Fresh Strawberries',
      price: 880,
      seller: 'Hill Country Farms',
      location: 'Nuwara Eliya',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
      category: 'Premium Fruits',
      discount: 25,
      inStock: true,
      description: 'Premium hill country strawberries'
    }
  ]);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Set full viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
      if (!event.target.closest('.cart-dropdown') && !event.target.closest('.cart-btn')) {
        setCartOpen(false);
      }
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-btn')) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const addToCart = (product) => {
    if (!product.inStock) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'discount': return b.discount - a.discount;
        default: return a.name.localeCompare(b.name);
      }
    });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="w-screen min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: perspective(1000px) rotateY(15deg) rotateX(5deg) translateY(0px) scale(1);
          }
          50% { 
            transform: perspective(1000px) rotateY(15deg) rotateX(5deg) translateY(-15px) scale(1.05);
          }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>

      {/* Fixed Full-Width Navigation */}
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-2xl border-b border-green-500/20 py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <FaLeaf className="text-green-600 text-2xl sm:text-3xl mr-3" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Sri Lanka Economic Center</span>
                <span className="sm:hidden">SLEC</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8 xl:space-x-12">
              {['Home', 'Products', 'Sellers', 'Services', 'About'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 text-lg"
                >
                  {item}
                </a>
              ))}
            </div>
            
            {/* Right Side Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="profile-btn p-2 sm:p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
                >
                  <FaUser className="text-green-600 text-lg sm:text-xl" />
                </button>
                
                {profileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-green-500/20 shadow-2xl">
                    <div className="p-4 border-b border-green-500/20">
                      <p className="text-gray-800 font-semibold">Welcome!</p>
                      <p className="text-gray-600 text-sm">Guest User</p>
                    </div>
                    <div className="py-2">
                      {['Profile', 'Orders', 'Wishlist', 'Settings', 'Logout'].map((item) => (
                        <a
                          key={item}
                          href="#"
                          className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setCartOpen(!cartOpen)}
                  className="cart-btn relative p-2 sm:p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
                >
                  <FaShoppingCart className="text-green-600 text-lg sm:text-xl" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
                
                {cartOpen && (
                  <div className="cart-dropdown absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-xl border border-green-500/20 shadow-2xl max-h-[80vh] overflow-y-auto">
                    <div className="p-4 border-b border-green-500/20 sticky top-0 bg-white/95">
                      <h3 className="text-gray-800 font-semibold">Shopping Cart ({getCartItemCount()})</h3>
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="p-8 text-center text-gray-600">
                        Your cart is empty
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[50vh] overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="p-4 border-b border-green-500/10 flex items-center space-x-4">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium">{item.name}</p>
                                <p className="text-gray-600 text-sm">Rs.{item.price} x {item.quantity}</p>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-green-600 hover:text-green-500 text-2xl"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-4 border-t border-green-500/20 sticky bottom-0 bg-white/95">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-800 font-semibold text-lg">Total:</span>
                            <span className="text-green-600 font-bold text-xl">Rs.{getCartTotal()}</span>
                          </div>
                          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold">
                            Checkout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-btn lg:hidden p-2 sm:p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
              >
                {mobileMenuOpen ? <FaTimes className="text-green-600 text-xl" /> : <FaBars className="text-green-600 text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu lg:hidden bg-white/95 backdrop-blur-md border-t border-green-500/20">
            <div className="px-4 py-4">
              {['Home', 'Products', 'Sellers', 'Services', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-3 text-gray-700 hover:text-green-600 font-medium transition-colors text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Full Screen Hero Section */}
      <section 
        className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 overflow-hidden"
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[10%] right-[5%] w-[20vw] h-[20vw] max-w-[300px] max-h-[300px] bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] max-w-[400px] max-h-[400px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-r from-green-600/5 to-emerald-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <h1 className="font-black mb-6 leading-tight">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-gray-800 via-green-600 to-gray-800 bg-clip-text text-transparent">
                  Welcome to the
                </span>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mt-2 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent drop-shadow-2xl">
                  Dedicated Economic Center
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-4 text-gray-700">
                  in SRI LANKA
                </span>
              </h1>
            </div>
            
            <p className="max-w-3xl mx-auto lg:mx-0 mb-12 text-gray-600 leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl">
              A hub for fresh produce, wholesale goods, and a thriving marketplace. 
              Connecting farmers, vendors, and consumers, we ensure quality products at the best prices. 
              <span className="text-green-600 font-semibold"> Experience convenience, variety, and affordability all in one place!</span>
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto lg:mx-0 mb-8">
              <div className="relative flex bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-green-500/20 shadow-2xl">
                <input 
                  type="text" 
                  placeholder="Search products, sellers, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 sm:px-6 py-4 sm:py-5 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-base sm:text-lg"
                />
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 sm:px-10 transition-all duration-300 transform hover:scale-105">
                  <FaSearch className="text-xl sm:text-2xl text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - 3D Fruit Display */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px]">
              {/* 3D Fruit Container */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-2xl border-4 border-green-200 relative overflow-hidden">
                {/* Animated 3D Fruit */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[120px] lg:text-[150px] xl:text-[180px] float-animation" style={{
                    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))'
                  }}>
                    🧑‍🌾
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 text-4xl animate-pulse opacity-70 spin-slow">🌿</div>
                <div className="absolute bottom-6 left-6 text-3xl animate-pulse opacity-60 delay-1000">🌱</div>
                <div className="absolute top-1/3 left-4 text-2xl animate-pulse opacity-50 delay-500">✨</div>
                <div className="absolute bottom-1/3 right-6 text-2xl animate-pulse opacity-60 delay-1500">🍃</div>
                <div className="absolute top-1/2 right-2 text-xl animate-pulse opacity-40 delay-700">🌾</div>
                <div className="absolute bottom-1/4 left-2 text-xl animate-pulse opacity-50 delay-1200">🌟</div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-200/20 to-transparent rounded-full"></div>
                
                {/* Multiple Shine Effects */}
                <div className="absolute top-4 left-4 w-20 h-20 lg:w-24 lg:h-24 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 lg:w-20 lg:h-20 bg-emerald-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
                
                {/* Rotating Ring */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border-2 border-dashed border-green-300/30 rounded-full spin-slow"></div>
              </div>
              
              {/* Floating Text */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-green-600 font-bold text-lg lg:text-xl">Fresh & Natural</p>
                <p className="text-gray-600 text-sm">From Farm to Table</p>
              </div>
              
              {/* Side Decorative Elements */}
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-2xl animate-bounce delay-300">🌽</div>
              <div className="absolute -right-4 top-1/3 transform -translate-y-1/2 text-2xl animate-bounce delay-700">🍎</div>
              <div className="absolute -left-6 bottom-1/4 text-xl animate-bounce delay-1000">🥕</div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Stats Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-500/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { value: '500+', label: 'Local Products', icon: FaLeaf },
              { value: '200+', label: 'Verified Sellers', icon: FaUsers },
              { value: '10,000+', label: 'Happy Customers', icon: FaShieldAlt },
              { value: 'Islandwide', label: 'Delivery', icon: FaTruck }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition-all duration-300 border border-green-500/10 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10 group"
              >
                <stat.icon className="text-2xl sm:text-3xl lg:text-4xl text-green-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width Products Section */}
      <section className="w-full py-16 sm:py-20 bg-white" id="products">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>

          {/* Filter and Sort Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors w-full sm:w-auto"
              >
                <FaFilter /> Filters
              </button>
              
              {showFilters && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-white border border-green-500/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full sm:w-auto"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-white">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FaSort className="text-green-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-green-500/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/50 flex-1 sm:flex-initial"
              >
                <option value="name" className="bg-white">Name</option>
                <option value="price-low" className="bg-white">Price: Low to High</option>
                <option value="price-high" className="bg-white">Price: High to Low</option>
                <option value="rating" className="bg-white">Rating</option>
                <option value="discount" className="bg-white">Discount</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`bg-gradient-to-br from-green-50/90 to-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-green-500/20 hover:border-green-500/40 shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.02] group ${!product.inStock ? 'opacity-75' : ''}`}
              >
                <div className="relative">
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                      -{product.discount}%
                    </div>
                  )}

                  {!product.inStock && (
                    <div className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                      Out of Stock
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                        wishlist.some(item => item.id === product.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-gray-700 hover:bg-green-500/50'
                      }`}
                    >
                      <FaHeart size={16} />
                    </button>
                    <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-gray-700 hover:bg-white/30 transition-colors">
                      <FaEye size={16} />
                    </button>
                  </div>

                  <div className="h-48 sm:h-56 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      {product.name}
                    </h3>
                    <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 px-2 py-1 rounded-lg border border-green-500/30 text-xs">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {product.description}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-green-600" /> {product.location}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < Math.floor(product.rating) ? '' : 'text-gray-300'} 
                          size={14}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">
                      ({product.rating})
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Rs.{product.price}
                      </span>
                      {product.discount > 0 && (
                        <span className="block text-gray-500 line-through text-sm">
                          Rs.{Math.round(product.price / (1 - product.discount/100))}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className={`px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
                        product.inStock
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/30'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Full Width Services Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-br from-green-50 to-emerald-50 border-t border-green-500/20" id="services">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              { 
                title: 'Farmers Marketplace', 
                description: 'Direct platform for farmers to sell their fresh produce without middlemen',
                icon: '🌱'
              },
              { 
                title: 'Wholesale Distribution', 
                description: 'Bulk purchasing options for retailers and restaurants at competitive prices',
                icon: '📦'
              },
              { 
                title: 'Quality Assurance', 
                description: 'Rigorous quality checks to ensure only the best products reach our customers',
                icon: '✅'
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="p-6 sm:p-8 lg:p-10 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-500/20 hover:border-green-500/40 hover:bg-white/90 transition-all duration-300 text-center group hover:shadow-2xl hover:shadow-green-500/10"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width Testimonials */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              What Our Customers Say
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              { 
                name: 'Ranjith Perera', 
                role: 'Restaurant Owner',
                quote: 'The quality of produce is consistently excellent, and the prices are very competitive. This platform has transformed how we source ingredients.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
              },
              { 
                name: 'Nimali Fernando', 
                role: 'Small Business Owner',
                quote: 'This platform has helped me source fresh ingredients directly from farmers at great prices. The delivery is always on time.',
                rating: 4,
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=100&h=100&fit=crop&crop=face'
              },
              { 
                name: 'Sunil Rathnayake', 
                role: 'Farmer',
                quote: 'Finally a platform that connects us directly with buyers without middlemen taking most profits. My income has increased significantly.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="p-6 sm:p-8 bg-gradient-to-br from-green-50/90 to-white/90 backdrop-blur-sm rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 text-base sm:text-lg">{testimonial.name}</h4>
                    <p className="text-green-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} 
                      size={16}
                    />
                  ))}
                </div>
                
                <p className="text-gray-600 italic text-base sm:text-lg">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width CTA Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
            Join Sri Lanka's Premier Economic Marketplace
          </h2>
          <p className="mb-10 max-w-4xl mx-auto text-white/90 text-lg sm:text-xl lg:text-2xl">
            Whether you're a farmer, vendor, or consumer, we provide the platform to connect and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-700 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl text-base sm:text-lg">
              Register as Seller
            </button>
            <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-base sm:text-lg">
              Explore Products
            </button>
          </div>
        </div>
      </section>

      {/* Full Width Footer */}
      <footer className="w-full py-12 sm:py-16 bg-gradient-to-b from-green-50 to-white border-t border-green-500/20" id="about">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <FaLeaf className="text-green-600 text-2xl sm:text-3xl mr-3" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Sri Lanka Economic Center
                </span>
              </div>
              <p className="mb-4 text-gray-600 text-sm sm:text-base">
                Connecting Sri Lanka's agricultural producers with markets nationwide. Building a sustainable future for our farming communities.
              </p>
              <div className="flex flex-col space-y-2">
                <a href="tel:+94112345678" className="text-green-600 hover:text-green-500 transition-colors flex items-center text-sm sm:text-base">
                  <FaPhone size={16} className="mr-2" /> +94 11 234 5678
                </a>
                <a href="mailto:info@slec.lk" className="text-green-600 hover:text-green-500 transition-colors flex items-center text-sm sm:text-base">
                  <FaEnvelope size={16} className="mr-2" /> info@slec.lk
                </a>
              </div>
            </div>
            
            {[
              {
                title: 'Quick Links',
                links: ['Home', 'Products', 'Sellers', 'Services', 'About Us']
              },
              {
                title: 'Categories',
                links: ['Fresh Produce', 'Spices', 'Beverages', 'Grains', 'Exotic Fruits']
              },
              {
                title: 'Support',
                links: ['Contact Us', 'FAQs', 'Shipping Policy', 'Returns', 'Terms & Conditions']
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 text-green-600 text-lg sm:text-xl">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-gray-600 hover:text-green-600 transition-colors text-sm sm:text-base"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-green-500/20 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 sm:mb-0 text-sm sm:text-base text-center sm:text-left">
                &copy; {new Date().getFullYear()} Sri Lanka Dedicated Economic Center. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm sm:text-base">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm sm:text-base">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm sm:text-base">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setCartOpen(!cartOpen)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/30 transition-all duration-300 relative"
        >
          <FaShoppingCart size={24} />
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-green-600 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Back to Top Button */}
      {isScrolled && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 bg-green-500/20 backdrop-blur-sm text-green-600 p-3 sm:p-4 rounded-full hover:bg-green-500/30 transition-all duration-300"
        >
          <span className="text-xl sm:text-2xl">↑</span>
        </button>
      )}
    </div>
  );
};

export default EconomicCenter;