import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, CreditCard, Truck, Lock, Package, 
  ChevronLeft, ChevronRight, Heart, Share2, Star, 
  Minus, Plus, Check, X, Loader2, ShieldCheck,
  Calendar, MapPin, Mail, User, Home, AlertCircle,
  Star as StarIcon
} from 'lucide-react';
import { API_BASES } from '../config/api';

const EnhancedEcommercePage = ({ product: propProduct, onBack }) => {
  // Viewport setup
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

  // Product State
  const [product] = useState(
    propProduct
      ? {
          ...propProduct,
          images: propProduct.images || [propProduct.image_url || propProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'],
          price: propProduct.price || 0,
          name: propProduct.name || '',
          description: propProduct.description || '',
          rating: propProduct.rating || 4.8,
          reviews: propProduct.reviews || 124,
          inStock: propProduct.inStock !== undefined ? propProduct.inStock : true,
          category: propProduct.category || '',
          tags: propProduct.tags || [],
        }
      : {
          id: 1,
          name: "Premium Organic Bell Pepper",
          description: "Our organic bell peppers are grown without synthetic pesticides or fertilizers. Rich in vitamins A and C, antioxidants, and fiber, these crisp and colorful peppers are perfect for salads, stir-fries, or as a healthy snack.",
          price: 350.00,
          rating: 4.8,
          reviews: 124,
          inStock: true,
          images: [
            'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1572796799729-f988c73b36a4?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'
          ],
          category: "Vegetables, Organic",
          tags: ["Fresh", "Healthy", "Vitamin C", "Antioxidants"]
        }
  );

  // UI State
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  
  // Order State
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: ''
  });

  // Review State
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      rating: 5,
      review: 'Absolutely love this product! Exceeded all my expectations.',
      date: '2023-10-15'
    },
    {
      id: 2,
      name: 'Sarah Miller',
      rating: 4,
      review: 'Great quality and fast delivery. Would recommend to friends.',
      date: '2023-09-28'
    }
  ]);

  // Shipping Options
  const shippingOptions = {
    standard: { name: 'Standard Delivery', price: 50.00, days: '3-5 business days' },
    express: { name: 'Express Delivery', price: 100.00, days: '1-2 business days' },
    free: { name: 'Free Delivery', price: 0.00, days: '5-7 business days' }
  };

  // Price Calculations
  const subtotal = product.price * quantity;
  const shippingCost = shippingOptions[shippingMethod].price;
  const codFee = paymentMethod === 'cod' ? 25.00 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal + shippingCost + codFee + tax - discount;

  // Handlers
  const handleImageChange = (direction) => {
    if (direction === 'next') {
      setActiveImage((prev) => (prev + 1) % product.images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 3) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleDiscountApply = () => {
    const codes = {
      'SAVE10': 0.1,
      'WELCOME20': 0.2,
      'FRESH15': 0.15
    };
    
    const discountRate = codes[discountCode.toUpperCase()];
    if (discountRate) {
      setDiscount(subtotal * discountRate);
    } else {
      setDiscount(0);
      alert('Invalid discount code');
    }
  };

  // Fetch reviews from backend when showReviews is true
  useEffect(() => {
    if (showReviews && product.id) {
      fetch(`${API_BASES.payments}/reviews/${product.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setReviews(data.map(r => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              review: r.review,
              date: r.created_at ? r.created_at.split('T')[0] : ''
            })));
          }
        })
        .catch(() => {});
    }
  }, [showReviews, product.id]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Validate form
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'zipCode'];
    if (paymentMethod === 'card') {
      requiredFields.push('cardNumber', 'cardName', 'cardExpiry', 'cardCVV');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Prepare order data for backend
    const orderData = {
      // userId: null, // If you have user auth, pass userId
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode
      },
      items: [
        {
          productId: product.id,
          quantity,
          price: product.price
        }
      ],
      shippingMethod,
      paymentMethod,
      paymentDetails: paymentMethod === 'card'
        ? {
            cardNumber: formData.cardNumber,
            cardName: formData.cardName,
            cardExpiry: formData.cardExpiry,
            cardCVV: formData.cardCVV
          }
        : undefined,
      discountCode,
      discount,
      subtotal,
      shippingCost,
      tax,
      total
    };

    try {
      const res = await fetch(`${API_BASES.payments}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrderNumber('ORD' + data.orderId);
        setPaymentSuccess(true);
      } else {
        alert(data.error || 'Order creation failed');
      }
    } catch (err) {
      alert('Order creation failed');
    }
    setIsProcessing(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewName || !reviewText) return;

    try {
      const res = await fetch(`${API_BASES.payments}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name: reviewName,
          email: reviewEmail,
          rating: reviewRating,
          review: reviewText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Fetch updated reviews
        fetch(`${API_BASES.payments}/reviews/${product.id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setReviews(data.map(r => ({
                id: r.id,
                name: r.name,
                rating: r.rating,
                review: r.review,
                date: r.created_at ? r.created_at.split('T')[0] : ''
              })));
            }
          });
        setReviewSubmitted(true);
        resetReviewForm();
      } else {
        alert(data.error || 'Review submission failed');
      }
    } catch (err) {
      alert('Review submission failed');
    }
  };

  const resetOrder = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVV: ''
    });
    setQuantity(1);
    setDiscount(0);
    setDiscountCode('');
    setPaymentSuccess(false);
    setShowCheckout(false);
  };

  const resetReviewForm = () => {
    setReviewRating(0);
    setReviewName('');
    setReviewEmail('');
    setReviewText('');
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / reviews.length;
  };

  // Container styles for full viewport
  const containerStyles = {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100dvh',
    overflowX: 'hidden'
  };

  // Success Modal
  if (paymentSuccess) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-black flex items-center justify-center p-3 sm:p-4 lg:p-6"
        style={containerStyles}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Thank you for your purchase. Your order <span className="font-semibold text-white">{orderNumber}</span> has been confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetOrder}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  resetOrder();
                  setShowReviews(true);
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 text-sm sm:text-base"
              >
                Leave a Review
              </button>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 flex items-center gap-2 text-white hover:text-green-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Products
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Reviews View
  if (showReviews) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-black flex items-start justify-center p-3 sm:p-4 lg:p-6"
        style={containerStyles}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-white/20 shadow-2xl mt-8">
          <button
            onClick={() => setShowReviews(false)}
            className="flex items-center gap-2 text-white mb-6 hover:text-green-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Product
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
          
          {/* Average Rating */}
          <div className="flex items-center mb-8">
            <div className="flex items-center mr-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-6 h-6 ${star <= calculateAverageRating() ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-white font-medium">
              {calculateAverageRating().toFixed(1)} out of 5 ({reviews.length} reviews)
            </span>
          </div>

          {/* Review Form */}
          {!reviewSubmitted ? (
            <form onSubmit={handleSubmitReview} className="mb-10 p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Share your experience</h3>
              
              <div className="mb-4">
                <label className="block text-white mb-2">Your Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= (reviewHover || reviewRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white mb-2">Name</label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Your Review</label>
                <textarea
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="mb-10 p-6 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Thank you for your review!</h3>
              <p className="text-green-300">Your feedback has been submitted successfully.</p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((item) => (
              <div key={item.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-300">{item.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Product View
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-black"
      style={containerStyles}
    >
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white mb-4 sm:mb-6 hover:text-green-400 transition-colors text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Products
          </button>
        )}
        {!showCheckout ? (
          // Product View
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">
              Premium Organic Store
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Product Images */}
              <div className="space-y-3 sm:space-y-4">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/20">
                  <img
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop';
                    }}
                  />
                  <button
                    onClick={() => handleImageChange('prev')}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => handleImageChange('next')}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-1 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-green-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={product.images[idx]}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{product.name}</h2>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white text-sm sm:text-base">{product.rating}</span>
                    <span className="text-gray-400 text-sm">({product.reviews} reviews)</span>
                    <button 
                      onClick={() => setShowReviews(true)}
                      className="ml-auto text-sm text-green-400 hover:text-green-300"
                    >
                      View all reviews
                    </button>
                  </div>

                  <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{product.description}</p>

                  <div className="flex items-baseline gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-white">₹{product.price}</span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      product.inStock
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                      <label className="text-white font-medium mb-2 block text-sm sm:text-base">Quantity</label>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => handleQuantityChange('decrease')}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="text-white font-semibold text-base sm:text-lg w-8 sm:w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange('increase')}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      Buy Now
                    </button>
                    <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 text-sm sm:text-base">
                      Add to Cart
                    </button>
                    <div className="flex gap-3 sm:gap-0 sm:block">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all duration-300 sm:hidden">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <button className="hidden sm:block w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl items-center justify-center transition-all duration-300">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-3 sm:pt-4 space-y-2">
                    <div className="flex gap-2 text-xs sm:text-sm">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{product.category}</span>
                    </div>
                    <div className="flex gap-2 text-xs sm:text-sm">
                      <span className="text-gray-400">Tags:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {product.tags.map((tag, idx) => (
                          <span key={idx} className="text-white bg-white/10 px-2 py-1 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Checkout View
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex items-center gap-2 text-white mb-4 sm:mb-6 hover:text-green-400 transition-colors text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Product
            </button>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Checkout</h1>

            <form onSubmit={handleSubmitOrder}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column - Customer & Payment Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Customer Information */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Customer Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-white mb-2 text-sm sm:text-base">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 text-sm sm:text-base">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-white mb-2 text-sm sm:text-base">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Shipping Address
                    </h2>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-white mb-2 text-sm sm:text-base">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                          placeholder="123 Main Street, Apt 4B"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-white mb-2 text-sm sm:text-base">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                            placeholder="Mumbai"
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 text-sm sm:text-base">Zip Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                            placeholder="400001"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Shipping Method
                    </h2>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {Object.entries(shippingOptions).map(([key, option]) => (
                        <label
                          key={key}
                          className={`block p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            shippingMethod === key
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={key}
                            checked={shippingMethod === key}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-white font-medium text-sm sm:text-base">{option.name}</div>
                              <div className="text-gray-400 text-xs sm:text-sm">{option.days}</div>
                            </div>
                            <div className="text-white font-semibold text-sm sm:text-base">
                              {option.price === 0 ? 'FREE' : `₹${option.price}`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Payment Method
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-2" />
                        <div className="text-white font-medium text-sm sm:text-base">Credit/Debit Card</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-2" />
                        <div className="text-white font-medium text-sm sm:text-base">Cash on Delivery</div>
                      </button>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-white mb-2 text-sm sm:text-base">Card Number</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({
                              ...formData,
                              cardNumber: formatCardNumber(e.target.value)
                            })}
                            maxLength="19"
                            required
                            className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 text-sm sm:text-base">Cardholder Name</label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                            placeholder="JOHN DOE"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-white mb-2 text-sm sm:text-base">Expiry Date</label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={(e) => setFormData({
                                ...formData,
                                cardExpiry: formatExpiry(e.target.value)
                              })}
                              maxLength="5"
                              required
                              className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="block text-white mb-2 text-sm sm:text-base">CVV</label>
                            <input
                              type="text"
                              name="cardCVV"
                              value={formData.cardCVV}
                              onChange={(e) => setFormData({
                                ...formData,
                                cardCVV: e.target.value.replace(/\D/g, '')
                              })}
                              maxLength="4"
                              required
                              className="w-full p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-yellow-300 font-medium text-sm sm:text-base">Cash on Delivery</p>
                            <p className="text-yellow-200 text-xs sm:text-sm mt-1">
                              Additional fee of ₹25 will be charged for COD orders. 
                              Please keep exact change ready for delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 sticky top-4 sm:top-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Order Summary</h2>
                    
                    {/* Product Details */}
                    <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm sm:text-base truncate">{product.name}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Quantity: {quantity}</p>
                        <p className="text-white font-semibold text-sm sm:text-base">₹{product.price} each</p>
                      </div>
                    </div>

                    {/* Discount Code */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-white mb-2 text-sm sm:text-base">Discount Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-1 p-2 sm:p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                          placeholder="Enter code"
                        />
                        <button
                          type="button"
                          onClick={handleDiscountApply}
                          className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors text-xs sm:text-sm"
                        >
                          Apply
                        </button>
                      </div>
                      {discount > 0 && (
                        <p className="text-green-400 text-xs sm:text-sm mt-2">
                          Discount applied! You saved ₹{discount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                        <span>Subtotal ({quantity} items)</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                        <span>Shipping</span>
                        <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                        <span>Tax (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-400 text-sm sm:text-base">
                          <span>Discount</span>
                          <span>-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      {paymentMethod === 'cod' && (
                        <div className="flex justify-between text-yellow-400 text-sm sm:text-base">
                          <span>COD Fee</span>
                          <span>₹{codFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-white/20 pt-3 sm:pt-4 mb-4 sm:mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-bold text-white">Total</span>
                        <span className="text-xl sm:text-2xl font-bold text-white">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${
                        isProcessing
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                      } text-white`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          {paymentMethod === 'card' ? 'Pay Now' : 'Place Order'}
                        </>
                      )}
                    </button>

                    {/* Security Notice */}
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Secure 256-bit SSL encryption
                      </p>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3 text-green-400">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">100% Secure Checkout</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-green-400">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">Money Back Guarantee</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-green-400">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">Free Returns within 7 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedEcommercePage;
