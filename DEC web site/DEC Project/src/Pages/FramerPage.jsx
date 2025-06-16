import React, { useState } from 'react';
import { 
  ChevronLeft, MapPin, Phone, Mail, Star, Wheat, Users, Award, 
  Calendar, ShoppingCart, Heart, Share2, Truck, Filter, Search,
  TrendingUp, Shield, Leaf, Clock, MessageCircle, Globe, X,
  Menu, ChevronRight, BarChart3, Package, Plus, Minus, Check,
  ArrowRight, ArrowLeft, Home, Info, Settings, LogOut, User
} from 'lucide-react';

const ModernFarmerMarketplace = () => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Enhanced farmer data with more products and details
  const farmers = [
    {
      id: 1,
      name: "John Martinez",
      location: "Valley Farm, California",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=400&fit=crop",
      rating: 4.8,
      specialties: ["Organic Vegetables", "Wheat", "Corn"],
      experience: "15 years",
      farmSize: "250 acres",
      phone: "+1 (555) 123-4567",
      email: "john.martinez@farm.com",
      bio: "Passionate organic farmer dedicated to sustainable agriculture and community-supported farming initiatives. Our farm uses regenerative practices to ensure the highest quality produce while protecting the environment.",
      achievements: ["Certified Organic", "Sustainable Farming Award 2023", "Community Leader"],
      followers: 1250,
      deliveryTime: "2-3 days",
      responseTime: "< 2 hours",
      sustainability: 95,
      totalProducts: 45,
      totalOrders: 3420,
      products: [
        {
          id: 101,
          name: "Organic Tomatoes",
          price: 4.99,
          unit: "per lb",
          image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop",
          description: "Fresh, vine-ripened organic tomatoes grown without synthetic pesticides. Perfect for salads, sauces, and fresh eating.",
          inStock: true,
          harvest: "Weekly",
          category: "Vegetables",
          rating: 4.9,
          reviews: 234,
          nutrients: "High in Vitamin C, Lycopene",
          farmingMethod: "Regenerative Agriculture"
        },
        {
          id: 102,
          name: "Sweet Corn",
          price: 3.50,
          unit: "per dozen",
          image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop",
          description: "Fresh sweet corn harvested daily at peak ripeness. Non-GMO variety with exceptional sweetness and crunch.",
          inStock: true,
          harvest: "Daily",
          category: "Vegetables",
          rating: 4.7,
          reviews: 156,
          nutrients: "Fiber, Vitamin B, Antioxidants",
          farmingMethod: "No-till Farming"
        },
        {
          id: 103,
          name: "Organic Kale",
          price: 2.99,
          unit: "per bunch",
          image: "https://images.unsplash.com/photo-1541013406131-3ca4c2a10c1a?w=300&h=200&fit=crop",
          description: "Nutrient-dense organic kale packed with vitamins. Grown in rich composted soil for optimal flavor.",
          inStock: true,
          harvest: "Twice Weekly",
          category: "Vegetables",
          rating: 4.6,
          reviews: 98,
          nutrients: "Vitamin K, Vitamin A, Calcium",
          farmingMethod: "Organic Certified"
        }
      ]
    },
    {
      id: 2,
      name: "Sarah Chen",
      location: "Green Meadows, Oregon",
      image: "https://images.unsplash.com/photo-1494790108755-2616b69e4b9c?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=400&fit=crop",
      rating: 4.9,
      specialties: ["Dairy Farming", "Cheese Production"],
      experience: "12 years",
      farmSize: "180 acres",
      phone: "+1 (555) 987-6543",
      email: "sarah.chen@meadowfarms.com",
      bio: "Award-winning dairy farmer specializing in artisanal cheese production and sustainable livestock management. Our animals are pasture-raised with the highest welfare standards.",
      achievements: ["Best Cheese Producer 2024", "Sustainable Dairy Award", "Organic Certified"],
      followers: 890,
      deliveryTime: "1-2 days",
      responseTime: "< 1 hour",
      sustainability: 98,
      totalProducts: 32,
      totalOrders: 2150,
      products: [
        {
          id: 201,
          name: "Aged Cheddar",
          price: 12.99,
          unit: "per lb",
          image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop",
          description: "12-month aged artisanal cheddar with complex flavors and smooth texture. Made from grass-fed cow's milk.",
          inStock: true,
          harvest: "Monthly",
          category: "Dairy",
          rating: 5.0,
          reviews: 342,
          nutrients: "Calcium, Protein, Vitamin B12",
          farmingMethod: "Grass-fed, Pasture-raised"
        },
        {
          id: 202,
          name: "Fresh Goat Cheese",
          price: 8.50,
          unit: "8 oz",
          image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=200&fit=crop",
          description: "Creamy fresh goat cheese with a mild, tangy flavor. Perfect for salads, spreads, and cooking.",
          inStock: true,
          harvest: "Weekly",
          category: "Dairy",
          rating: 4.8,
          reviews: 189,
          nutrients: "Probiotics, Calcium, Easily Digestible",
          farmingMethod: "Free-range Goats"
        }
      ]
    }
  ];

  // Filter and sort farmers
  const filteredFarmers = farmers
    .filter(farmer => 
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'followers': return b.followers - a.followers;
        case 'experience': return parseInt(b.experience) - parseInt(a.experience);
        default: return 0;
      }
    });

  const handleCardClick = (farmer) => {
    setSelectedFarmer(farmer);
  };

  const handleBackClick = () => {
    setSelectedFarmer(null);
  };

  const toggleLike = (productId) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
  };

  const toggleCart = (productId, product) => {
    const newCart = new Map(cartItems);
    if (newCart.has(productId)) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, { product, quantity: 1 });
    }
    setCartItems(newCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = new Map(cartItems);
    if (newCart.has(productId)) {
      newCart.set(productId, { 
        ...newCart.get(productId), 
        quantity: newQuantity 
      });
      setCartItems(newCart);
    }
  };

  const categories = ['all', 'Vegetables', 'Dairy', 'Grains', 'Meat'];

  // Theme colors
  const theme = {
    primary: darkMode ? '#10b981' : '#059669',
    background: darkMode ? '#1a1a1a' : '#f8fafc',
    card: darkMode ? '#2d2d2d' : '#ffffff',
    text: darkMode ? '#f3f4f6' : '#1f2937',
    textSecondary: darkMode ? '#d1d5db' : '#6b7280',
    border: darkMode ? '#3d3d3d' : '#e5e7eb',
  };

  // Individual Farmer Profile View
  if (selectedFarmer) {
    const filteredProducts = selectedCategory === 'all' 
      ? selectedFarmer.products 
      : selectedFarmer.products.filter(p => p.category === selectedCategory);

    return (
      <div className="fixed inset-0 flex flex-col" style={{ 
        backgroundColor: theme.background,
        color: theme.text
      }}>
        {/* Header */}
        <header className="sticky top-0 z-30 shadow-sm" style={{
          backgroundColor: theme.card,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 transition-colors"
              style={{ color: theme.primary }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Farmers</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button className="p-2 transition-colors" style={{ color: theme.text }}>
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 transition-colors relative" style={{ color: theme.text }}>
                <ShoppingCart className="w-5 h-5" />
                {cartItems.size > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}>
                    {cartItems.size}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="relative h-64 sm:h-80 lg:h-96 w-full">
            <img 
              src={selectedFarmer.coverImage} 
              alt="Farm landscape" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
              <div className="flex items-end gap-4">
                <img
                  src={selectedFarmer.image}
                  alt={selectedFarmer.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedFarmer.name}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedFarmer.location}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedFarmer.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="container mx-auto px-4 py-6">
            {/* About Section */}
            <section className="mb-8 rounded-xl shadow-sm p-6" style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <h2 className="text-xl font-bold mb-4">About the Farm</h2>
              <p className="leading-relaxed mb-6" style={{ color: theme.textSecondary }}>{selectedFarmer.bio}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: darkMode ? '#333' : '#f9fafb' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Wheat className="w-5 h-5" style={{ color: theme.primary }} />
                    <span className="font-medium">Farm Size</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.farmSize}</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: darkMode ? '#333' : '#f9fafb' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Calendar className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    <span className="font-medium">Experience</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.experience}</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: darkMode ? '#333' : '#f9fafb' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Leaf className="w-5 h-5" style={{ color: theme.primary }} />
                    <span className="font-medium">Sustainability</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.sustainability}%</div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: darkMode ? '#333' : '#f9fafb' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: theme.textSecondary }}>
                    <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                    <span className="font-medium">Followers</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.text }}>{selectedFarmer.followers}</div>
                </div>
              </div>
            </section>

            {/* Achievements */}
            {selectedFarmer.achievements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>Achievements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedFarmer.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg shadow-sm"
                      style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.border}`
                      }}>
                      <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: darkMode ? '#374151' : '#fef3c7' }}>
                        <Award className="w-5 h-5" style={{ color: darkMode ? '#f59e0b' : '#d97706' }} />
                      </div>
                      <div className="font-medium" style={{ color: theme.text }}>{achievement}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Products Section */}
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold" style={{ color: theme.text }}>Products</h2>
                
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? 'text-white'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category ? theme.primary : darkMode ? '#333' : '#f3f4f6'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-xl shadow-sm p-8 text-center" style={{
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`
                }}>
                  <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.textSecondary }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>No products found</h3>
                  <p style={{ color: theme.textSecondary }}>This farmer doesn't have any products in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const isInCart = cartItems.has(product.id);
                    const cartQuantity = isInCart ? cartItems.get(product.id).quantity : 1;
                    
                    return (
                      <div key={product.id} className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        style={{
                          backgroundColor: theme.card,
                          border: `1px solid ${theme.border}`,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                        {/* Product Image */}
                        <div className="relative h-48">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-1 text-white text-xs rounded-full font-medium"
                              style={{ backgroundColor: theme.primary }}>
                              {product.category}
                            </span>
                            {product.farmingMethod && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                                {product.farmingMethod}
                              </span>
                            )}
                          </div>
                          
                          {/* Like Button */}
                          <button 
                            onClick={() => toggleLike(product.id)}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                              likedProducts.has(product.id) 
                                ? 'bg-red-500 text-white' 
                                : darkMode ? 'bg-gray-700/90 text-gray-300' : 'bg-white/90 text-gray-600'
                            }`}
                          >
                            <Heart className="w-5 h-5" fill={likedProducts.has(product.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold" style={{ color: theme.text }}>{product.name}</h3>
                            <div className="text-right">
                              <span className="text-xl font-bold" style={{ color: theme.primary }}>${product.price}</span>
                              <div className="text-xs" style={{ color: theme.textSecondary }}>{product.unit}</div>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium" style={{ color: theme.text }}>{product.rating}</span>
                              <span className="text-xs ml-1" style={{ color: theme.textSecondary }}>({product.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: theme.textSecondary }}>
                              <Truck className="w-3 h-3" />
                              <span>{product.harvest}</span>
                            </div>
                          </div>
                          
                          {/* Quantity Selector */}
                          {isInCart ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-lg" style={{ border: `1px solid ${theme.border}` }}>
                                <button 
                                  onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                  style={{ color: theme.text, ...(darkMode && { backgroundColor: '#333' }) }}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-2 font-medium" style={{ color: theme.text }}>{cartQuantity}</span>
                                <button 
                                  onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                  style={{ color: theme.text, ...(darkMode && { backgroundColor: '#333' }) }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => toggleCart(product.id)}
                                className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white"
                                style={{ backgroundColor: theme.primary, hover: { backgroundColor: darkMode ? '#0ea5e9' : '#0284c7' } }}
                              >
                                <Check className="w-4 h-4" />
                                Added
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => toggleCart(product.id, product)}
                              disabled={!product.inStock}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                                product.inStock
                                  ? darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    );
  }

  // Farmers List View
  return (
    <div className="fixed inset-0 flex flex-col" style={{ 
      backgroundColor: theme.background,
      color: theme.text
    }}>
      {/* Header */}
      <header className="sticky top-0 z-20 shadow-sm" style={{
        backgroundColor: theme.card,
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              className="p-2 hover:text-gray-900 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ color: theme.text }}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-xl font-bold" style={{ color: theme.text }}>FarmConnect</h1>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 transition-colors"
                onClick={() => setDarkMode(!darkMode)}
                style={{ color: theme.text }}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button className="p-2 relative" style={{ color: theme.text }}>
                <ShoppingCart className="w-5 h-5" />
                {cartItems.size > 0 && (
                  <span className="absolute top-0 right-0 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}>
                    {cartItems.size}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
            <input
              type="text"
              placeholder="Search farmers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: darkMode ? '#333' : '#f3f4f6',
                border: `1px solid ${theme.border}`,
                color: theme.text,
                outline: 'none',
                boxShadow: 'none',
                focus: {
                  ringColor: theme.primary,
                  borderColor: 'transparent'
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden mb-8 h-48" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=400&fit=crop" 
              alt="Farm landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center p-6">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-white mb-2">Fresh From the Farm</h2>
                <p className="text-white/90 mb-4">Connect directly with local farmers for the freshest produce</p>
                <button className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  style={{ color: theme.primary }}>
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.filter(c => c !== 'all').map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-lg shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: darkMode ? '#333' : '#ecfdf5' }}>
                    {category === 'Vegetables' && <Leaf className="w-6 h-6" style={{ color: theme.primary }} />}
                    {category === 'Dairy' && <Wheat className="w-6 h-6" style={{ color: '#d97706' }} />}
                    {category === 'Grains' && <Package className="w-6 h-6" style={{ color: '#2563eb' }} />}
                    {category === 'Meat' && <TrendingUp className="w-6 h-6" style={{ color: '#dc2626' }} />}
                  </div>
                  <span className="font-medium" style={{ color: theme.text }}>{category}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Farmers List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>Local Farmers</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm rounded-lg px-3 py-1 focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: darkMode ? '#333' : '#f3f4f6',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  outline: 'none',
                  focus: {
                    ringColor: theme.primary
                  }
                }}
              >
                <option value="rating">Top Rated</option>
                <option value="followers">Most Popular</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            {filteredFarmers.length === 0 ? (
              <div className="rounded-xl shadow-sm p-8 text-center" style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`
              }}>
                <User className="w-12 h-12 mx-auto mb-4" style={{ color: theme.textSecondary }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>No farmers found</h3>
                <p style={{ color: theme.textSecondary }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    onClick={() => handleCardClick(farmer)}
                    className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    <div className="flex">
                      {/* Farmer Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                        <img
                          src={farmer.image}
                          alt={farmer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Farmer Info */}
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold" style={{ color: theme.text }}>{farmer.name}</h3>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                            style={{ backgroundColor: darkMode ? '#374151' : '#ecfdf5' }}>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium" style={{ color: darkMode ? '#f3f4f6' : theme.primary }}>{farmer.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{farmer.location}</span>
                        </div>
                        
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.textSecondary }}>
                          {farmer.bio.substring(0, 100)}...
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {farmer.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: darkMode ? '#333' : '#f3f4f6',
                                color: theme.text
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 flex justify-between items-center"
                      style={{
                        backgroundColor: darkMode ? '#333' : '#f9fafb',
                        borderTop: `1px solid ${theme.border}`
                      }}>
                      <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                        <Users className="w-4 h-4" />
                        <span>{farmer.followers} followers</span>
                      </div>
                      <button className="font-medium flex items-center gap-1"
                        style={{ color: theme.primary }}>
                        View Profile
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute right-0 top-0 h-full w-64 shadow-xl animate-in slide-in-from-right"
            style={{ 
              backgroundColor: theme.card,
              boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
            <div className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: theme.border }}>
              <h3 className="font-semibold" style={{ color: theme.text }}>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: theme.text,
                      hover: { backgroundColor: darkMode ? '#333' : '#f3f4f6' }
                    }}>
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: theme.text,
                      hover: { backgroundColor: darkMode ? '#333' : '#f3f4f6' }
                    }}>
                    <User className="w-5 h-5" />
                    <span>My Account</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: theme.text,
                      hover: { backgroundColor: darkMode ? '#333' : '#f3f4f6' }
                    }}>
                    <ShoppingCart className="w-5 h-5" />
                    <span>My Orders</span>
                    {cartItems.size > 0 && (
                      <span className="ml-auto text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ backgroundColor: theme.primary }}>
                        {cartItems.size}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: theme.text,
                      hover: { backgroundColor: darkMode ? '#333' : '#f3f4f6' }
                    }}>
                    <Info className="w-5 h-5" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ 
                      color: theme.text,
                      hover: { backgroundColor: darkMode ? '#333' : '#f3f4f6' }
                    }}>
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
              
              <div className="mt-8 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors"
                  style={{ 
                    color: '#ef4444',
                    hover: { backgroundColor: darkMode ? '#333' : '#fee2e2' }
                  }}>
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernFarmerMarketplace;