import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
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
  FaSort,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import CustomerProfile from './CustomerProfile';

// Memoized components for better performance
const StatCard = memo(({ stat }) => (
  <div className="text-center p-3 sm:p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all duration-300 border border-green-500/10 hover:border-green-500/25 hover:shadow-xl hover:shadow-green-500/10 group">
    <stat.icon className="text-xl sm:text-2xl lg:text-3xl text-green-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
    <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
      {stat.value}
    </div>
    <div className="text-xs sm:text-sm text-gray-600">
      {stat.label}
    </div>
  </div>
));

const ProductCard = memo(({ product, onAddToCart, onToggleWishlist, isInWishlist }) => (
  <div className={`bg-gradient-to-br from-green-50/90 to-white/90 backdrop-blur-sm rounded-lg overflow-hidden border border-green-500/15 hover:border-green-500/30 shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.02] group ${!product.inStock ? 'opacity-75' : ''}`}>
    <div className="relative">
      {product.discount > 0 && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          -{product.discount}%
        </div>
      )}

      {!product.inStock && (
        <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          Out of Stock
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => onToggleWishlist(product)}
          className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
            isInWishlist
              ? 'bg-green-500 text-white'
              : 'bg-white/20 text-gray-700 hover:bg-green-500/50'
          }`}
        >
          <FaHeart size={14} />
        </button>
        <button className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-gray-700 hover:bg-white/30 transition-colors">
          <FaEye size={14} />
        </button>
      </div>

      <div className="h-40 sm:h-44 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
      </div>
    </div>

    <div className="p-3 sm:p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">
          {product.name}
        </h3>
        <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 px-2 py-0.5 rounded border border-green-500/25 text-xs">
          {product.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-xs sm:text-sm mb-2">
        {product.description}
      </p>
      
      <p className="text-gray-600 text-xs mb-1 flex items-center">
        <FaMapMarkerAlt className="mr-1 text-green-600" /> {product.location}
      </p>
      
      <p className="text-gray-600 text-xs mb-3">
        Seller: <span className="font-medium">{product.seller}</span>
      </p>
      
      <div className="flex items-center mb-3">
        <div className="flex text-yellow-400 mr-2">
          {[...Array(5)].map((_, i) => (
            <FaStar 
              key={i} 
              className={i < Math.floor(product.rating) ? '' : 'text-gray-300'} 
              size={12}
            />
          ))}
        </div>
        <span className="text-gray-500 text-xs">
          ({product.rating.toFixed(1)})
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Rs.{product.price.toFixed(2)}
          </span>
          {product.discount > 0 && (
            <span className="block text-gray-500 line-through text-xs">
              Rs.{(product.price / (1 - product.discount/100)).toFixed(2)}
            </span>
          )}
        </div>
        <button 
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-sm ${
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
));

const EconomicCenter = ({ user, onLogout, onNavigateToProducts, onNavigateToSellers, onNavigateToMap }) => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  
  // Video player states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Video controls
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      const transformedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        seller: product.seller,
        sellerId: product.seller_id,
        location: product.address || 'Sri Lanka',
        rating: 4.5 + Math.random() * 0.5,
        image: product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        category: product.category || 'General',
        discount: Math.floor(Math.random() * 25),
        inStock: product.quantity > 0,
        description: product.description || 'Quality product from Sri Lanka',
        quantity: product.quantity
      }));
      
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Setup viewport and event listeners
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
      window.removeEventListener('resize', setFullViewport);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Cart functions
  const addToCart = useCallback((product) => {
    if (!product.inStock) return;
    
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  // Computed values
  const getCartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products
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
  }, [products, searchTerm, filterCategory, sortBy]);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const currentUser = {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    role: user?.role || 'customer',
    avatar: userProfileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=100&h=100&fit=crop&crop=face'
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setProfileImageLoading(true);
        const userId = user.id || localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3000/api/customer/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          if (profileData.profile_image) {
            setUserProfileImage(profileData.profile_image);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileImageLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleProfileClick = useCallback(() => {
    setShowProfile(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const handleBackToHome = useCallback(() => {
    setShowProfile(false);
  }, []);

  // Render CustomerProfile if needed
  if (showProfile) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <CustomerProfile 
          user={{
            id: user?.id || user?.userId || localStorage.getItem('userId'),
            name: user?.name || currentUser.name,
            email: user?.email || currentUser.email,
            role: user?.role || currentUser.role
          }}
          onBack={handleBackToHome}
          onLogout={onLogout}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-gray-800 m-0 p-0 box-border" style={{ 
      margin: 0, 
      padding: 0,
      width: '100vw',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        
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
        
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .slide-up {
          animation: slideUp 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }
      `}</style>

      {/* Fixed Navigation */}
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-green-500/10 py-2' 
          : 'bg-transparent py-3'
      }`}>
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <FaLeaf className="text-green-600 text-xl sm:text-2xl mr-2" />
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Sri Lanka Economic Center</span>
                <span className="sm:hidden">SLEC</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8">
              {['Home', 'Products', 'Sellers', 'Services', 'About'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === 'Products' && onNavigateToProducts) {
                      onNavigateToProducts();
                    } else if (item === 'Sellers' && onNavigateToSellers) {
                      onNavigateToSellers();
                    } else if (item === 'Services' && onNavigateToMap) {
                      onNavigateToMap();
                    } else {
                      const element = document.getElementById(item.toLowerCase());
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 text-base"
                >
                  {item}
                </button>
              ))}
            </div>
            
            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="profile-btn p-1 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors relative"
                >
                  {profileImageLoading ? (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : userProfileImage ? (
                    <img 
                      src={userProfileImage} 
                      alt="Profile" 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-green-500/30"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 flex items-center justify-center ${userProfileImage ? 'hidden' : 'flex'}`}
                  >
                    <FaUser className="text-green-600 text-sm sm:text-base" />
                  </div>
                </button>
                
                {profileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-md rounded-lg border border-green-500/10 shadow-xl z-50">
                    <div className="p-3 border-b border-green-500/10 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {userProfileImage ? (
                          <img 
                            src={userProfileImage} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-green-500/30"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ${userProfileImage ? 'hidden' : 'flex'}`}
                        >
                          <FaUser className="text-green-600 text-sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold text-sm truncate">{currentUser.name}</p>
                        <p className="text-gray-600 text-xs truncate">{currentUser.email}</p>
                        <p className="text-green-600 text-xs">ID: {user?.id || 'No ID'}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleProfileClick();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                        type="button"
                      >
                        Profile
                      </button>
                      {['Orders', 'Wishlist', 'Settings'].map((item) => (
                        <button
                          key={item}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                          type="button"
                        >
                          {item}
                        </button>
                      ))}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        type="button"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setCartOpen(!cartOpen)}
                  className="cart-btn relative p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
                >
                  <FaShoppingCart className="text-green-600 text-base sm:text-lg" />
                  {getCartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-lg animate-pulse">
                      {getCartItemCount}
                    </span>
                  )}
                </button>
                
                {cartOpen && (
                  <div className="cart-dropdown absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-lg border border-green-500/10 shadow-xl max-h-[80vh] overflow-y-auto">
                    <div className="p-3 border-b border-green-500/10 sticky top-0 bg-white/95">
                      <h3 className="text-gray-800 font-semibold text-sm">Shopping Cart ({getCartItemCount})</h3>
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="p-6 text-center text-gray-600 text-sm">
                        Your cart is empty
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[50vh] overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="p-3 border-b border-green-500/5 flex items-center space-x-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium text-sm">{item.name}</p>
                                <p className="text-gray-600 text-xs">Rs.{item.price} x {item.quantity}</p>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-green-600 hover:text-green-500 text-xl"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-3 border-t border-green-500/10 sticky bottom-0 bg-white/95">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-800 font-semibold text-base">Total:</span>
                            <span className="text-green-600 font-bold text-lg">Rs.{getCartTotal.toFixed(2)}</span>
                          </div>
                          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg transition-all duration-300 font-semibold text-sm">
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
                className="mobile-menu-btn lg:hidden p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
              >
                {mobileMenuOpen ? <FaTimes className="text-green-600 text-lg" /> : <FaBars className="text-green-600 text-lg" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu lg:hidden bg-white/95 backdrop-blur-md border-t border-green-500/10">
            <div className="px-3 py-3">
              {['Home', 'Products', 'Sellers', 'Services', 'About'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item === 'Products' && onNavigateToProducts) {
                      onNavigateToProducts();
                    } else if (item === 'Sellers' && onNavigateToSellers) {
                      onNavigateToSellers();
                    } else if (item === 'Services' && onNavigateToMap) {
                      onNavigateToMap();
                    } else {
                      const element = document.getElementById(item.toLowerCase());
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-green-600 font-medium transition-colors text-base"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Video Hero Section with Modern UI */}
      <section className="relative w-full h-screen overflow-hidden">
        <div ref={videoContainerRef} className="relative w-full h-full">
          {/* Background Video */}
                <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                >
                <source src="https://cdn.pixabay.com/video/2022/11/11/138553-769988105_large.mp4" type="video/mp4" />
                {/* Fallback for unsupported browsers */}
                Your browser does not support the video tag.
                </video>

                {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block">Welcome to the Dedicated Economic Center</span>
                <span className="block text-green-400 mt-2">In Sri Lanka </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Connecting farmers, vendors, and consumers through technology. 
                Experience the digital transformation of traditional markets.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  onClick={() => {
                    const element = document.getElementById('products');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Explore Products
                </button>
                <button className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  Learn More
                </button>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto slide-up">
                <div className="relative flex bg-white/10 backdrop-blur-md rounded-full overflow-hidden border border-white/20 shadow-2xl">
                  <input 
                    type="text" 
                    placeholder="Search products, sellers, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-6 py-4 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-base sm:text-lg"
                  />
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 transition-all duration-300 transform hover:scale-105">
                    <FaSearch className="text-xl text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
            <button
              onClick={togglePlayPause}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group"
            >
              {isPlaying ? (
                <FaPause className="text-white text-lg group-hover:scale-110 transition-transform" />
              ) : (
                <FaPlay className="text-white text-lg group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group"
            >
              {isMuted ? (
                <FaVolumeMute className="text-white text-lg group-hover:scale-110 transition-transform" />
              ) : (
                <FaVolumeUp className="text-white text-lg group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group"
            >
              {isFullscreen ? (
                <FaCompress className="text-white text-lg group-hover:scale-110 transition-transform" />
              ) : (
                <FaExpand className="text-white text-lg group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 right-8 text-white animate-bounce">
            <div className="flex flex-col items-center">
              <span className="text-sm mb-2">Scroll Down</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Our Impact in Numbers
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Building a sustainable ecosystem for Sri Lankan agriculture
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { value: '500+', label: 'Local Products', icon: FaLeaf },
              { value: '200+', label: 'Verified Sellers', icon: FaUsers },
              { value: '10,000+', label: 'Happy Customers', icon: FaShieldAlt },
              { value: 'Islandwide', label: 'Delivery', icon: FaTruck }
            ].map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full py-16 sm:py-20 bg-white" id="products">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Featured Products
                </span>
              </h2>
              <p className="text-gray-600 text-lg">Fresh from our farmers to your table</p>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View All Products
            </button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 rounded-full transition-all duration-300 w-full sm:w-auto text-sm font-medium text-green-700 border border-green-500/20"
              >
                <FaFilter /> Filters
              </button>
              
              {showFilters && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-white border border-green-500/20 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full sm:w-auto text-sm font-medium"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <FaSort className="text-green-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-green-500/20 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/50 flex-1 sm:flex-initial text-sm font-medium"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="discount">Discount</option>
              </select>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-gray-600 mt-4 text-lg">Loading amazing products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchProducts}
                  className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.some(item => item.id === product.id)}
                />
              ))}
            </div>
          )}

          {/* Show More Button */}
          {!loading && !error && filteredProducts.length > 8 && (
            <div className="text-center mt-12">
              <button
                onClick={onNavigateToProducts}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                View All {filteredProducts.length} Products
              </button>
            </div>
          )}

          {/* No Products State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setSearchTerm('');
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modern Services Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-br from-green-50 to-emerald-50" id="services">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive solutions for modern agricultural commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: 'Farmers Marketplace', 
                description: 'Direct platform for farmers to sell their fresh produce without middlemen',
                icon: '🌱',
                color: 'from-green-400 to-emerald-500'
              },
              { 
                title: 'Wholesale Distribution', 
                description: 'Bulk purchasing options for retailers and restaurants at competitive prices',
                icon: '📦',
                color: 'from-blue-400 to-cyan-500'
              },
              { 
                title: 'Quality Assurance', 
                description: 'Rigorous quality checks to ensure only the best products reach our customers',
                icon: '✅',
                color: 'from-purple-400 to-pink-500'
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real stories from our growing community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                className="p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-green-500/20 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-green-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
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
                
                <p className="text-gray-600 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Join Sri Lanka's Premier Economic Marketplace
          </h2>
          <p className="mb-10 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl">
            Whether you're a farmer, vendor, or consumer, we provide the platform to connect and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-green-700 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg">
              Register as Seller
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-lg">
              Explore Products
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white" id="about">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 max-w-6xl mx-auto">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <FaLeaf className="text-green-600 text-2xl mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Sri Lanka Economic Center
                </span>
              </div>
              <p className="mb-4 text-gray-600 text-sm leading-relaxed">
                Connecting Sri Lanka's agricultural producers with markets nationwide. Building a sustainable future for our farming communities.
              </p>
              <div className="flex flex-col space-y-2">
                <a href="tel:+94112345678" className="text-green-600 hover:text-green-700 transition-colors flex items-center text-sm">
                  <FaPhone size={14} className="mr-2" /> +94 11 234 5678
                </a>
                <a href="mailto:info@slec.lk" className="text-green-600 hover:text-green-700 transition-colors flex items-center text-sm">
                  <FaEnvelope size={14} className="mr-2" /> info@slec.lk
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
                <h3 className="font-semibold mb-4 text-gray-800 text-lg">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-gray-600 hover:text-green-600 transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 sm:mb-0 text-sm">
                &copy; {new Date().getFullYear()} Sri Lanka Dedicated Economic Center. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-6">
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40">
        <button 
          onClick={() => setCartOpen(!cartOpen)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-xl hover:shadow-green-500/30 transition-all duration-300 relative"
        >
          <FaShoppingCart size={24} />
          {getCartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-green-600 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
              {getCartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Back to Top Button */}
      {isScrolled && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 left-4 z-40 bg-green-500/20 backdrop-blur-sm text-green-600 p-3 rounded-full hover:bg-green-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EconomicCenter;