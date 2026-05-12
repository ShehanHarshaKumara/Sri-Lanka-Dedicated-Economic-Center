import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star, Leaf, Truck, Shield, Plus, Minus, Menu, X, User, Search, Award, Clock, Users, ArrowLeft } from 'lucide-react';
import { API_BASES } from '../config/api';

const FarmingFoodsPage = ({ onBack, onBuyNow }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notification, setNotification] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // NEW: Products state for fetched products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ===== VIEWPORT SETUP & EVENT LISTENERS =====
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

    return () => {
      window.removeEventListener('resize', setFullViewport);
    };
  }, []);

  // Fetch products from backend API
  useEffect(() => {
    setLoadingProducts(true);
    fetch(`${API_BASES.products}/products`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoadingProducts(false);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('Could not load products.');
        setLoadingProducts(false);
      });
  }, []);

  // Hardcoded products with enhanced data
  const featureCards = [
    {
      id: 1,
      title: "Farm to Table Fresh",
      subtitle: "Delivered within 24 hours of harvest",
      description: "Experience the difference of produce that travels from farm to your table in under 24 hours. Our network of local farmers ensures maximum freshness and nutrition.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80",
      icon: <Leaf className="w-8 h-8" />,
      color: "green",
      stats: "24hrs delivery"
    },
    {
      id: 2,
      title: "100% Organic Certified",
      subtitle: "No pesticides, just pure goodness",
      description: "All our products are certified organic by trusted agencies. We work only with farms that meet the highest standards of sustainable and chemical-free agriculture.",
      image: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600&q=80",
      icon: <Award className="w-8 h-8" />,
      color: "amber",
      stats: "100% organic"
    },
    {
      id: 3,
      title: "Support Local Farmers",
      subtitle: "Every purchase helps our community thrive",
      description: "When you shop with us, you're directly supporting over 50 local farming families. Together, we're building a stronger, more sustainable food community.",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80",
      icon: <Users className="w-8 h-8" />,
      color: "blue",
      stats: "50+ farmers"
    },
    {
      id: 4,
      title: "Fresh Daily Harvest",
      subtitle: "From sunrise harvest to your doorstep",
      description: "Our farmers harvest at dawn when produce is at peak freshness. Advanced cold-chain logistics ensure that freshness is preserved until delivery.",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
      icon: <Clock className="w-8 h-8" />,
      color: "purple",
      stats: "Daily harvest"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureCards.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featureCards.length]);

  // Initialize quantities when products are loaded
  useEffect(() => {
    const initialQuantities = {};
    products.forEach(p => {
      initialQuantities[p.id] = 1;
    });
    setQuantities(initialQuantities);
  }, [products]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    
    showNotification(`Added ${quantity} ${product.name} to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Item removed from cart');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
      showNotification('Removed from favorites');
    } else {
      setFavorites([...favorites, productId]);
      showNotification('Added to favorites!');
    }
  };

  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        light: 'bg-green-50'
      },
      amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        border: 'border-amber-200',
        light: 'bg-amber-50'
      },
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        light: 'bg-blue-50'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        light: 'bg-purple-50'
      }
    };
    return colors[color] || colors.green;
  };

  // Container styles for full viewport
  const containerStyles = {
    margin: 0, 
    padding: 0,
    width: '100%',
    minHeight: '100dvh',
    overflowX: 'hidden'
  };

  return (
    <div style={containerStyles} className="min-h-screen mobile-safe-shell bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="notification bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{notification}</span>
          </div>
        </div>
      )}

      {/* Header - Fully Responsive */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Back Button and Logo */}
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                  title="Back to Home"
                >
                  <ArrowLeft className="text-base sm:text-lg text-gray-700" />
                </button>
              )}
              <Leaf className="text-xl sm:text-2xl mr-2 text-green-600" />
              <div>
                <span className="hidden sm:inline text-base sm:text-lg lg:text-xl font-bold text-gray-900">FarmFresh Market</span>
                <span className="sm:hidden text-base font-bold text-gray-900">FarmFresh</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button 
                onClick={() => setCartOpen(!cartOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="text-base sm:text-lg text-gray-700" />
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="text-base sm:text-lg text-gray-700" />
                ) : (
                  <Menu className="text-base sm:text-lg text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Cart Dropdown */}
          {cartOpen && (
            <div className="absolute right-0 top-full w-72 sm:w-80 bg-white shadow-lg rounded-b-lg border-t z-50">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Shopping Cart ({getTotalCartItems()} items)</h3>
                {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto cart-scroll">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b pb-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-gray-500 text-xs">${item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Total: ${getTotalCartValue().toFixed(2)}</span>
                </div>
                <button className="w-full btn-primary text-white py-2 rounded-lg transition-colors">
                  Checkout
                </button>
              </div>
            </>
                )}
              </div>
            </div>
          )}
              </header>

              {/* Hero Section with Background Video */}
              <div className="relative text-white py-16 sm:py-20 lg:py-24 xl:py-28 overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          >
          <source src="https://cdn.pixabay.com/video/2018/01/06/13704-250154065_large.mp4" type="video/mp4" />
          {/* Fallback for unsupported browsers */}
          Your browser does not support the video tag.
            </video>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content over video */}
          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Fresh from Farm to Your Table
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto drop-shadow-md">
            Discover the finest organic produce from local farmers, delivered fresh to your doorstep
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Shop Now
            </button>
            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors text-base sm:text-lg backdrop-blur-sm bg-white/10 hover:bg-white">
              Learn More
            </button>
          </div>
            </div>
          </div>
              </div>

              {/* Features Carousel with Cards */}
      <div className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose FarmFresh?</h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Discover what makes us the preferred choice for fresh, organic produce
        </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featureCards.map((card) => {
                  const colorClasses = getColorClasses(card.color);
                  return (
                    <div key={card.id} className="w-full flex-shrink-0 px-2">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                          {/* Image Section */}
                          <div className="relative h-64 lg:h-80">
                            <img 
                              src={card.image} 
                              alt={card.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
                              }}
                            />
                            <div className={`absolute top-4 left-4 ${colorClasses.light} ${colorClasses.text} p-3 rounded-full`}>
                              {card.icon}
                            </div>
                            <div className={`absolute bottom-4 right-4 ${colorClasses.bg} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                              {card.stats}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                              {card.title}
                            </h3>
                            <p className={`text-base sm:text-lg ${colorClasses.text} font-medium mb-4`}>
                              {card.subtitle}
                            </p>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                              {card.description}
                            </p>
                            <button className={`${colorClasses.bg} text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity self-start`}>
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Controls */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + featureCards.length) % featureCards.length)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 sm:p-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % featureCards.length)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 sm:p-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 sm:mt-8 gap-2">
              {featureCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-green-600 w-8' : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Responsive Grid */}
      <div className="bg-green-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm sm:text-base text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">50+</div>
              <div className="text-sm sm:text-base text-gray-600">Local Farms</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm sm:text-base text-gray-600">Organic Products</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">24hr</div>
              <div className="text-sm sm:text-base text-gray-600">Fresh Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center group p-4 sm:p-6 lg:p-8">
            <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">100% Organic</h3>
            <p className="text-sm sm:text-base text-gray-600">Certified organic produce from trusted local farms</p>
          </div>
          <div className="text-center group p-4 sm:p-6 lg:p-8">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm sm:text-base text-gray-600">Same-day delivery on orders placed before noon</p>
          </div>
          <div className="text-center group p-4 sm:p-6 lg:p-8">
            <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">Quality Guarantee</h3>
            <p className="text-sm sm:text-base text-gray-600">100% satisfaction or your money back</p>
          </div>
        </div>

        {/* Products Section - Responsive */}
        <div id="products">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Featured Products</h2>
          
          {/* Products Grid - Responsive */}
          {loadingProducts ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : fetchError ? (
            <div className="text-center py-8 text-red-500">{fetchError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => (
                <div key={product.id} className="product-card bg-white rounded-2xl shadow-lg overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative h-40 sm:h-44 lg:h-48 overflow-hidden">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {product.category}
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                          favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="mb-2">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{product.seller || 'Local Farmer'}</p>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
                    
                    {/* Rating - placeholder since DB doesn't have rating */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        <span className="font-medium ml-1">4.8</span>
                      </div>
                      <span className="text-gray-400">(N/A)</span>
                      <span className="text-gray-400">• {product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">${product.price}</span>
                        <span className="text-gray-500 text-xs sm:text-sm ml-1">/unit</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(product.id, -1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="px-3 sm:px-4 font-medium text-sm sm:text-base">{quantities[product.id] || 1}</span>
                        <button 
                          onClick={() => updateQuantity(product.id, 1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart and Buy Now Buttons */}
                    <button 
                      onClick={() => onBuyNow ? onBuyNow(product) : addToCart(product)}
                      className="w-full btn-primary text-white font-medium py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section - Responsive */}
      <div className="bg-green-600 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Stay Fresh with Our Newsletter</h2>
          <p className="text-base sm:text-lg lg:text-xl text-green-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get the latest updates on seasonal produce, exclusive offers, and farming stories delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-3 sm:py-4 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Section - Responsive */}
      <div className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm sm:text-base">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Jane Doe</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">"The freshest vegetables I've ever tasted! The tomatoes are so flavorful, and I love supporting local farmers."</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">MS</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Mark Smith</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">"Excellent quality and fast delivery. The organic honey is absolutely amazing - pure and natural taste!"</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm sm:text-base">LB</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Lisa Brown</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">"Love the farm-to-table concept! Everything is so fresh and the packaging is eco-friendly. Highly recommended!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Responsive */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                <h3 className="text-base sm:text-lg lg:text-xl font-bold">FarmFresh Market</h3>
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-400 mb-4">
                Connecting communities with fresh, organic produce directly from local farms. 
                Supporting sustainable agriculture since 2020.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">i</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Our Farmers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Delivery Info</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Vegetables</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fruits</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Dairy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bakery</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pantry</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>📧 hello@farmfreshmarket.com</li>
                <li>📞 (555) 123-4567</li>
                <li>📍 123 Farm Street, Green Valley</li>
                <li>🕒 Mon-Sat: 8AM-8PM</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                © 2025 FarmFresh Market. All rights reserved. Supporting local farmers since 2020.
              </p>
              <div className="flex gap-4 text-xs sm:text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Cart Button */}
      <button 
        onClick={() => setCartOpen(!cartOpen)}
        className="sm:hidden fixed bottom-4 right-4 z-40 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {getTotalCartItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {getTotalCartItems()}
          </span>
        )}
      </button>

      {/* Custom CSS Styles */}
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
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        /* Mobile specific styles */
        @media (max-width: 640px) {
          .mobile-menu {
            backdrop-filter: blur(10px);
          }
        }
        
        /* Tablet specific styles */
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-content {
            padding: 2rem;
          }
        }
        
        /* Desktop specific styles */
        @media (min-width: 1025px) {
          .hero-content {
            padding: 3rem;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced focus states for accessibility */
        button:focus,
        input:focus {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
        
        /* Hover effects for better interactivity */
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        
        /* Custom scrollbar for cart dropdown */
        .cart-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .cart-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        
        .cart-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        
        .cart-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Enhanced carousel transitions */
        .carousel-slide {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mobile-first responsive typography */
        .responsive-text-xs { font-size: 0.75rem; }
        .responsive-text-sm { font-size: 0.875rem; }
        .responsive-text-base { font-size: 1rem; }
        .responsive-text-lg { font-size: 1.125rem; }
        .responsive-text-xl { font-size: 1.25rem; }
        
        @media (min-width: 640px) {
          .responsive-text-xs { font-size: 0.875rem; }
          .responsive-text-sm { font-size: 1rem; }
          .responsive-text-base { font-size: 1.125rem; }
          .responsive-text-lg { font-size: 1.25rem; }
          .responsive-text-xl { font-size: 1.5rem; }
        }
        
        @media (min-width: 1024px) {
          .responsive-text-xs { font-size: 1rem; }
          .responsive-text-sm { font-size: 1.125rem; }
          .responsive-text-base { font-size: 1.25rem; }
          .responsive-text-lg { font-size: 1.5rem; }
          .responsive-text-xl { font-size: 1.875rem; }
        }
        
        /* Loading states for images */
        .image-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Enhanced card hover effects */
        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Improved button interactions */
        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
        
        /* Mobile navigation improvements */
        .mobile-nav-slide {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Notification improvements */
        .notification {
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Enhanced accessibility for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in,
          .animate-fade-in,
          .animate-slide-up,
          .carousel-slide {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmingFoodsPage;
