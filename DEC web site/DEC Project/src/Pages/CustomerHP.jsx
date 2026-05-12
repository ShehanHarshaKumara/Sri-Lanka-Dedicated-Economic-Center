import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaLeaf, 
  FaStar, 
  FaPhone, 
  FaEnvelope,
  FaUsers,
  FaTruck,
  FaShieldAlt,
  FaUser,
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
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerHomeSections from '../components/CustomerHomeSections';
import loginVideo from '../assets/videos/login-video.mp4';
import { API_BASES } from '../config/api';

const buildCustomerIdentity = (profile, fallbackName = 'Guest User', fallbackEmail = 'guest@example.com') => {
  const combinedName = [profile?.first_name, profile?.last_name]
    .map((segment) => String(segment || '').trim())
    .filter(Boolean)
    .join(' ');

  return {
    name: combinedName || profile?.name || fallbackName,
    email: profile?.email || fallbackEmail
  };
};

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

const ProductCard = memo(({ product, onAddToCart }) => (
  <div
    className={`group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-900/8 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/20 hover:shadow-[0_30px_90px_rgba(16,185,129,0.12)] ${!product.inStock ? 'opacity-80' : ''}`}
  >
    <div className="relative overflow-hidden">
      {!product.inStock && (
        <div className="absolute bottom-4 right-4 z-10 rounded-full bg-red-500/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lg">
          Sold Out
        </div>
      )}

      <div className="h-52 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent"></div>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-lg font-black leading-snug text-slate-900 sm:text-[1.25rem]">
        {product.name}
      </h3>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.floor(product.rating) ? '' : 'text-slate-300'}
                size={12}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {product.rating.toFixed(1)} trusted rating
          </span>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
          product.inStock
            ? 'bg-emerald-500/10 text-emerald-700'
            : 'bg-slate-200 text-slate-500'
        }`}>
          {product.inStock ? 'In stock' : 'Unavailable'}
        </span>
      </div>

      <div className="mt-4">
        <span className="bg-gradient-to-r from-emerald-700 to-green-500 bg-clip-text text-2xl font-black text-transparent sm:text-[1.9rem]">
          Rs.{product.price.toFixed(2)}
        </span>
      </div>

      <div className="mt-5">
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`w-full rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
            product.inStock
              ? 'bg-gradient-to-r from-slate-900 via-emerald-700 to-green-500 text-white shadow-[0_20px_40px_rgba(16,185,129,0.22)] hover:scale-[1.01]'
              : 'cursor-not-allowed bg-slate-300 text-slate-500'
          }`}
        >
          {product.inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </div>
  </div>
));

const EconomicCenter = ({
  user,
  onLogout,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages,
  onNavigateToHome
}) => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileIdentity, setProfileIdentity] = useState(() => ({
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com'
  }));
  
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

  useEffect(() => {
    const refreshProducts = () => {
      fetchProducts();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts();
      }
    };

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        fetchProducts();
      }
    }, 60000);

    window.addEventListener('focus', refreshProducts);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshProducts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  useEffect(() => {
    setProfileIdentity({
      name: user?.name || 'Guest User',
      email: user?.email || 'guest@example.com'
    });
  }, [user?.email, user?.name]);

  const currentUser = {
    name: profileIdentity.name,
    email: profileIdentity.email,
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
        
        const response = await fetch(`${API_BASES.customer}/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setUserProfileImage(profileData.profile_image || null);
          setProfileIdentity(
            buildCustomerIdentity(
              profileData,
              user?.name || 'Guest User',
              user?.email || 'guest@example.com'
            )
          );
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileImageLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.email, user?.id, user?.name]);

  const handleProfileSaved = useCallback(
    (profile) => {
      setProfileIdentity((currentIdentity) =>
        buildCustomerIdentity(
          profile,
          currentIdentity.name || user?.name || 'Guest User',
          currentIdentity.email || user?.email || 'guest@example.com'
        )
      );
      setUserProfileImage(profile?.profile_image || null);
    },
    [user?.email, user?.name]
  );

  const handleProfileClick = useCallback(() => {
    setShowProfile(true);
    setProfileOpen(false);
  }, []);

  const handleBackToHome = useCallback(() => {
    setShowProfile(false);
  }, []);

  const scrollToTop = useCallback(() => {
    if (onNavigateToHome) {
      onNavigateToHome();
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onNavigateToHome]);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const marketplaceMetrics = [
    {
      value: '500+',
      label: 'Fresh products live',
      detail: 'Daily-curated produce, staples, and seasonal picks from across Sri Lanka.',
      icon: FaLeaf
    },
    {
      value: '200+',
      label: 'Verified sellers',
      detail: 'Trusted farmers and suppliers presented with cleaner discovery and stronger confidence.',
      icon: FaUsers
    },
    {
      value: '10,000+',
      label: 'Confident buyers',
      detail: 'Households, retailers, and restaurants returning for a smoother buying experience.',
      icon: FaShieldAlt
    },
    {
      value: 'Islandwide',
      label: 'Reliable access',
      detail: 'Built to help customers browse, compare, and buy with more certainty everywhere.',
      icon: FaTruck
    }
  ];

  const servicePrograms = [
    {
      title: 'Curated product discovery',
      description: 'Find better produce faster with clearer search, live categories, and premium presentation.',
      icon: FaSearch,
      accent: 'from-emerald-400/20 via-green-400/10 to-transparent'
    },
    {
      title: 'Trusted seller connection',
      description: 'Move from browsing to buying with verified farmer and supplier visibility built into the journey.',
      icon: FaUsers,
      accent: 'from-cyan-400/20 via-sky-400/10 to-transparent'
    },
    {
      title: 'Quality-first marketplace',
      description: 'Shop with stronger confidence through quality assurance, transparent sourcing, and easier access to centers.',
      icon: FaShieldAlt,
      accent: 'from-amber-300/20 via-yellow-300/10 to-transparent'
    }
  ];

  const testimonials = [
    {
      name: 'Ranjith Perera',
      role: 'Restaurant Owner',
      quote: 'The produce quality feels consistently premium, and the platform makes sourcing much faster for my kitchen team.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Nimali Fernando',
      role: 'Small Business Owner',
      quote: 'I can compare options quickly and buy with more confidence. It feels more polished than a typical marketplace.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Sunil Rathnayake',
      role: 'Farmer',
      quote: 'Customers reach me more easily now, and the presentation gives my products a stronger premium feel online.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ];

  // Render CustomerProfile if needed
  if (showProfile) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <CustomerProfile 
          user={{
            id: user?.id || user?.userId || localStorage.getItem('userId'),
            name: currentUser.name,
            email: currentUser.email,
            role: user?.role || currentUser.role
          }}
          onBack={handleBackToHome}
          onLogout={onLogout}
          onNavigateToHome={handleBackToHome}
          onNavigateToProducts={onNavigateToProducts}
          onNavigateToSellers={onNavigateToSellers}
          onNavigateToMap={onNavigateToMap}
          onNavigateToMessages={onNavigateToMessages}
          onProfileSaved={handleProfileSaved}
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

      <CustomerNavbar
        transparentAtTop
        isScrolled={isScrolled}
        onNavigateToHome={scrollToTop}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={() => scrollToSection('about')}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }}
                className="profile-btn relative rounded-full border border-white/10 bg-white/10 p-1 transition-colors hover:bg-white/15"
              >
                {profileImageLoading ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 sm:h-9 sm:w-9">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  </div>
                ) : userProfileImage ? (
                  <img
                    src={userProfileImage}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-white/20 object-cover sm:h-9 sm:w-9"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`h-8 w-8 items-center justify-center rounded-full bg-white/10 sm:h-9 sm:w-9 ${userProfileImage ? 'hidden' : 'flex'}`}
                >
                  <FaUser className="text-sm text-white sm:text-base" />
                </div>
              </button>

              {profileOpen && (
                <div className="profile-dropdown absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 p-3">
                    <div className="flex-shrink-0">
                      {userProfileImage ? (
                        <img
                          src={userProfileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full border border-white/15 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-10 w-10 items-center justify-center rounded-full bg-white/10 ${userProfileImage ? 'hidden' : 'flex'}`}
                      >
                        <FaUser className="text-sm text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                      <p className="truncate text-xs text-white/70">{currentUser.email}</p>
                      <p className="text-xs text-green-300">ID: {user?.id || 'No ID'}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProfileClick();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
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
                        className="w-full px-3 py-2 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
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
                      className="w-full px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="cart-btn relative rounded-full border border-white/10 bg-white/10 p-2 transition-colors hover:bg-white/15"
              >
                <FaShoppingCart className="text-base text-white sm:text-lg" />
                {getCartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-xs text-white shadow-lg">
                    {getCartItemCount}
                  </span>
                )}
              </button>

              {cartOpen && (
                <div className="cart-dropdown absolute right-0 mt-2 max-h-[80vh] w-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl sm:w-80">
                  <div className="sticky top-0 border-b border-white/10 bg-slate-950/95 p-3">
                    <h3 className="text-sm font-semibold text-white">
                      Shopping Cart ({getCartItemCount})
                    </h3>
                  </div>

                  {cart.length === 0 ? (
                    <div className="p-6 text-center text-sm text-white/70">
                      Your cart is empty
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[50vh] overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 border-b border-white/5 p-3">
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-white/70">Rs.{item.price} x {item.quantity}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xl text-green-300 transition-colors hover:text-green-200"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-base font-semibold text-white">Total:</span>
                          <span className="text-lg font-bold text-green-300">Rs.{getCartTotal.toFixed(2)}</span>
                        </div>
                        <button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-emerald-700">
                          Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />
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
                  
                <source src={loginVideo} type="video/mp4" />
                {/* Fallback for unsupported browsers */}
                Your browser does not support the video tag.
                </video>

                {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex h-full items-center justify-start px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[1480px] lg:pl-6 xl:pl-12 2xl:pl-20">
              <div className="fade-in max-w-4xl text-left">
                <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]"></span>
                  Fresh products, trusted sellers, one smart marketplace
                </div>

                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-12 bg-gradient-to-r from-green-300/20 via-green-300 to-emerald-200"></span>
                  <span className="text-xs font-semibold uppercase tracking-[0.38em] text-white/70 sm:text-sm">
                    Premium customer experience
                  </span>
                </div>

                <h1 className="max-w-4xl text-[2.35rem] font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-[0_18px_35px_rgba(0,0,0,0.38)] sm:text-5xl lg:text-7xl xl:text-[5.4rem]">
                  <span className="block whitespace-nowrap">Sri Lanka's digital home</span>
                  <span className="mt-3 block bg-gradient-to-r from-white via-emerald-100 to-green-300 bg-clip-text text-transparent">
                    for fresh market shopping
                  </span>
                </h1>
                
                <p className="mb-8 mt-6 max-w-3xl text-lg leading-8 text-white/85 sm:text-xl lg:text-[1.45rem]">
                  Discover handpicked farm harvests, verified sellers, and a smarter way to shop fresh with elegance, speed, and confidence.
                </p>

                <div className="mb-8 flex flex-wrap justify-start gap-3">
                  {[
                    'Daily fresh arrivals',
                    'Verified farmers',
                    'Islandwide access'
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:justify-start">
                  <button 
                    onClick={() => scrollToSection('products')}
                    className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700"
                  >
                    Explore Products
                  </button>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="rounded-full border-2 border-white/70 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                  >
                    Learn More
                  </button>
                </div>

                {/* Search Bar */}
                <div className="slide-up max-w-2xl">
                  <div className="relative flex overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
                    <input 
                      type="text" 
                      placeholder="Search products, sellers, locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent px-6 py-4 text-base text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 sm:text-lg"
                    />
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 transition-all duration-300 hover:from-green-600 hover:to-emerald-700">
                      <FaSearch className="text-xl text-white" />
                    </button>
                  </div>
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

      <CustomerHomeSections
        marketplaceMetrics={marketplaceMetrics}
        servicePrograms={servicePrograms}
        testimonials={testimonials}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        scrollToTop={scrollToTop}
        scrollToSection={scrollToSection}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
        loading={loading}
        error={error}
        onRetryProducts={fetchProducts}
        filteredProducts={filteredProducts}
        onClearFilters={() => {
          setFilterCategory('all');
          setSearchTerm('');
        }}
        renderProductCard={(product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
          />
        )}
        wishlistCount={wishlist.length}
      />
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

