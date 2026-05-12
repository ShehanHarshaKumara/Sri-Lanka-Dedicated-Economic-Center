import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tags,
  Truck,
  Users2
} from 'lucide-react';
import CustomerNavbar from '../components/CustomerNavbar';
import { API_BASES } from '../config/api';

const PRODUCT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=900&fit=crop';
const REVIEW_STORAGE_KEY = 'customerProductReviews';
const PRODUCTS_PER_PAGE = 8;
const LOW_STOCK_THRESHOLD = 5;

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);

const formatReviewDate = (value) => {
  const reviewDate = value ? new Date(value) : null;

  if (!reviewDate || Number.isNaN(reviewDate.getTime())) {
    return 'Recently added';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(reviewDate);
};

const getStoredCustomerName = () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return (
      savedUser?.name ||
      savedUser?.fullName ||
      savedUser?.username ||
      savedUser?.firstName ||
      ''
    );
  } catch {
    return '';
  }
};

const getStoredCustomerEmail = () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return savedUser?.email || '';
  } catch {
    return '';
  }
};

const buildDefaultReviews = (product) => {
  if (!product) {
    return [];
  }

  return [
    {
      id: `${product.id}-seed-1`,
      name: 'Nadeesha P.',
      rating: 5,
      comment: `Very fresh ${product.name.toLowerCase()} and the quality was excellent when it arrived.`,
      date: '05 May 2026'
    },
    {
      id: `${product.id}-seed-2`,
      name: 'Kasun M.',
      rating: 4,
      comment: `Good product and clean packaging. I would order again from ${product.seller}.`,
      date: '02 May 2026'
    }
  ];
};

const heroSlides = [
  {
    id: 1,
    label: '100% natural',
    title: 'Fresh groceries from Sri Lankan growers',
    description:
      'Browse market-fresh vegetables, fruits, grains, and pantry essentials through a cleaner shopping page inspired by the FoodMart style.',
    cta: 'Shop Products',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=1000&fit=crop',
    offer: '20% off vegetables'
  },
  {
    id: 2,
    label: 'Daily harvest',
    title: 'Modern grocery shopping with a smart premium feel',
    description:
      'Faster search, lighter layout, clearer product cards, and better mobile spacing help the whole marketplace feel more polished.',
    cta: 'Browse Categories',
    image:
      'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=1200&h=1000&fit=crop',
    offer: '15% off fresh arrivals'
  },
  {
    id: 3,
    label: 'Farmer direct',
    title: 'Better presentation for your live product listings',
    description:
      'Your real product data still powers the page, but the design now follows a brighter and more elegant grocery-market template direction.',
    cta: 'See Trending',
    image:
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=1200&h=1000&fit=crop',
    offer: 'Premium pantry deals'
  }
];

const promoCards = [
  {
    id: 1,
    discount: '20% off',
    title: 'Fruits & Vegetables',
    description: 'Fresh color, faster browsing, and cleaner product presentation.',
    image:
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=640&fit=crop',
    shellClass: 'from-[#e9f7d4] to-[#f7fbef]'
  },
  {
    id: 2,
    discount: '15% off',
    title: 'Pantry Essentials',
    description: 'A softer premium look for oils, grains, spices, and daily staples.',
    image:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?w=800&h=640&fit=crop',
    shellClass: 'from-[#fff0d7] to-[#fff7ec]'
  },
  {
    id: 3,
    discount: 'Daily picks',
    title: 'Farm Direct Selection',
    description: 'Products stay linked to your live farmers while the page feels upgraded.',
    image:
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&h=640&fit=crop',
    shellClass: 'from-[#d9f0f8] to-[#edf8fc]'
  }
];

const promiseCards = [
  {
    icon: Truck,
    title: 'Free delivery',
    description: 'A smoother shopping flow for faster local orders and easier checkout.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure payment',
    description: 'Cleaner actions and clearer order paths help customers feel safer.'
  },
  {
    icon: Sparkles,
    title: 'Quality guarantee',
    description: 'Product details are presented in a brighter, more premium grocery style.'
  },
  {
    icon: Users2,
    title: 'Trusted farmers',
    description: 'Live seller products still show through the redesign for real marketplace value.'
  }
];

const categoryShells = [
  'bg-[#e9f7d4] text-[#385b1d]',
  'bg-[#fff1d9] text-[#8b5a12]',
  'bg-[#e1f3fb] text-[#0f6179]',
  'bg-[#f3e8ff] text-[#6b21a8]',
  'bg-[#ffe5e5] text-[#9f1239]',
  'bg-[#e8f5e9] text-[#166534]'
];

const ProductPage = ({
  onBack,
  onBuyNow,
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notification, setNotification] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({ loading: false, error: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [productReviews, setProductReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [reviewForm, setReviewForm] = useState(() => ({
    name: getStoredCustomerName(),
    rating: 5,
    comment: ''
  }));
  const cartRef = useRef(null);
  const productsSectionRef = useRef(null);
  const categoriesSectionRef = useRef(null);

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoadingProducts(true);
      const response = await fetch(`${API_BASES.products}/products`, signal ? { signal } : {});

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const transformedProducts = data.map((product, index) => ({
        id: product.id,
        name: product.name,
        price: Number.parseFloat(product.price) || 0,
        seller: product.seller || 'Local Farmer',
        sellerId: product.seller_id,
        location: product.address || 'Sri Lanka',
        rating: 4.4 + ((index % 5) * 0.1),
        image: product.image_url || PRODUCT_FALLBACK_IMAGE,
        category: product.category || 'General',
        inStock: Number(product.quantity) > 0,
        description:
          product.description || 'Fresh product from the economic center marketplace.',
        quantity: Number(product.quantity) || 0,
        unit: product.unit || 'unit',
        createdAt: product.created_at
      }));

      setProducts(transformedProducts);
      setFetchError(null);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setFetchError('Failed to load products. Please try again later.');
      }
    } finally {
      if (!signal || !signal.aborted) {
        setLoadingProducts(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQuantities((prev) => {
      const next = {};
      products.forEach((product) => {
        next[product.id] = prev[product.id] || 1;
      });
      return next;
    });
  }, [products]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = setTimeout(() => setNotification(''), 2600);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category))],
    [products]
  );

  const categoryCards = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const key = product.category || 'General';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(counts).map(([name, total], index) => ({
      name,
      total,
      shellClass: categoryShells[index % categoryShells.length]
    }));

    if (entries.length > 0) {
      return entries.slice(0, 6);
    }

    return [
      { name: 'Vegetables', total: 0, shellClass: categoryShells[0] },
      { name: 'Fruits', total: 0, shellClass: categoryShells[1] },
      { name: 'Grains', total: 0, shellClass: categoryShells[2] },
      { name: 'Spices', total: 0, shellClass: categoryShells[3] }
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matches = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.seller.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.inStock) ||
        (stockFilter === 'low-stock' &&
          product.inStock &&
          product.quantity > 0 &&
          product.quantity <= LOW_STOCK_THRESHOLD) ||
        (stockFilter === 'sold-out' && !product.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy, stockFilter]);

  const bestSellingProducts = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [products]
  );

  const totalProductPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)),
    [filteredProducts.length]
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentProductPage, filteredProducts]);

  const visibleProductRange = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { start: 0, end: 0 };
    }

    const start = (currentProductPage - 1) * PRODUCTS_PER_PAGE + 1;
    const end = Math.min(currentProductPage * PRODUCTS_PER_PAGE, filteredProducts.length);
    return { start, end };
  }, [currentProductPage, filteredProducts.length]);

  const totalCartItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const totalCartValue = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const inStockCount = useMemo(
    () => filteredProducts.filter((product) => product.inStock).length,
    [filteredProducts]
  );

  const lowStockCount = useMemo(
    () =>
      filteredProducts.filter(
        (product) =>
          product.inStock && product.quantity > 0 && product.quantity <= LOW_STOCK_THRESHOLD
      ).length,
    [filteredProducts]
  );

  const freshArrivalCount = useMemo(() => {
    const freshnessWindow = 1000 * 60 * 60 * 24 * 14;

    return filteredProducts.filter((product) => {
      if (!product.createdAt) {
        return false;
      }

      const createdAt = new Date(product.createdAt);
      return !Number.isNaN(createdAt.getTime()) && Date.now() - createdAt.getTime() <= freshnessWindow;
    }).length;
  }, [filteredProducts]);

  const activeHero = heroSlides[currentSlide];
  const selectedProductReviews = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    const savedReviews = productReviews[selectedProduct.id];
    return savedReviews?.length ? savedReviews : buildDefaultReviews(selectedProduct);
  }, [productReviews, selectedProduct]);

  const selectedProductAverageRating = useMemo(() => {
    if (selectedProductReviews.length === 0) {
      return selectedProduct?.rating || 0;
    }

    const total = selectedProductReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / selectedProductReviews.length;
  }, [selectedProduct?.rating, selectedProductReviews]);

  const showNotification = useCallback((message) => {
    setNotification(message);
  }, []);

  useEffect(() => {
    setCurrentProductPage(1);
  }, [searchTerm, selectedCategory, sortBy, stockFilter]);

  useEffect(() => {
    if (currentProductPage > totalProductPages) {
      setCurrentProductPage(totalProductPages);
    }
  }, [currentProductPage, totalProductPages]);

  const persistReviewCache = useCallback((updater) => {
    setProductReviews((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setReviewStatus({ loading: false, error: '' });
      return undefined;
    }

    const controller = new AbortController();

    const fetchReviews = async () => {
      setReviewStatus({ loading: true, error: '' });

      try {
        const response = await fetch(`${API_BASES.payments}/reviews/${selectedProduct.id}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Unable to load reviews right now.');
        }

        const data = await response.json();
        const mappedReviews = Array.isArray(data)
          ? data.map((review) => ({
              id: review.id,
              name: review.name || 'Customer',
              rating: Number.parseInt(review.rating, 10) || 0,
              comment: review.review || '',
              date: formatReviewDate(review.created_at)
            }))
          : [];

        persistReviewCache((prev) => ({
          ...prev,
          [selectedProduct.id]:
            mappedReviews.length > 0
              ? mappedReviews
              : prev[selectedProduct.id]?.length
                ? prev[selectedProduct.id]
                : buildDefaultReviews(selectedProduct)
        }));
        setReviewStatus({ loading: false, error: '' });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        setReviewStatus({
          loading: false,
          error: 'Live reviews are unavailable, showing saved feedback instead.'
        });
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, [persistReviewCache, selectedProduct]);

  const addToCart = useCallback(
    (product) => {
      const requestedQuantity = quantities[product.id] || 1;
      const availableQuantity = Math.max(0, Number(product.quantity) || 0);

      if (!product.inStock || availableQuantity === 0) {
        showNotification('This product is currently out of stock');
        return;
      }

      setCart((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);

        if (existingItem) {
          const nextQuantity = Math.min(
            existingItem.quantity + requestedQuantity,
            existingItem.availableQuantity || availableQuantity
          );

          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: nextQuantity }
              : item
          );
        }

        return [
          ...prev,
          {
            ...product,
            availableQuantity,
            quantity: Math.min(requestedQuantity, availableQuantity)
          }
        ];
      });

      showNotification(
        requestedQuantity > availableQuantity
          ? `Only ${availableQuantity} ${product.unit || 'unit'} available right now`
          : `${product.name} added to cart`
      );
    },
    [quantities, showNotification]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      showNotification('Item removed from cart');
    },
    [showNotification]
  );

  const updateCartQuantity = useCallback(
    (productId, nextQuantity) => {
      setCart((prev) => {
        const currentItem = prev.find((item) => item.id === productId);

        if (!currentItem) {
          return prev;
        }

        if (nextQuantity <= 0) {
          return prev.filter((item) => item.id !== productId);
        }

        const cappedQuantity = Math.min(nextQuantity, currentItem.availableQuantity || nextQuantity);

        if (cappedQuantity !== nextQuantity) {
          showNotification(
            `Only ${currentItem.availableQuantity} ${currentItem.unit || 'unit'} available`
          );
        }

        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: cappedQuantity } : item
        );
      });
    },
    [showNotification]
  );

  const toggleFavorite = useCallback(
    (productId) => {
      setFavorites((prev) => {
        const exists = prev.includes(productId);
        showNotification(exists ? 'Removed from favorites' : 'Added to favorites');
        return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [showNotification]
  );

  const updateQuantity = useCallback(
    (productId, change) => {
      const sourceProduct =
        selectedProduct?.id === productId
          ? selectedProduct
          : products.find((product) => product.id === productId);
      const maxQuantity = Math.max(1, Number(sourceProduct?.quantity) || 1);

      setQuantities((prev) => {
        const nextValue = Math.max(1, (prev[productId] || 1) + change);
        const cappedValue = Math.min(nextValue, maxQuantity);

        if (cappedValue !== nextValue) {
          showNotification(`Only ${maxQuantity} ${sourceProduct?.unit || 'unit'} available`);
        }

        return {
          ...prev,
          [productId]: cappedValue
        };
      });
    },
    [products, selectedProduct, showNotification]
  );

  const handleBuyNow = useCallback(
    (product) => {
      if (!product.inStock || Number(product.quantity) <= 0) {
        showNotification('This product is currently out of stock');
        return;
      }

      const payload = {
        ...product,
        selectedQuantity: Math.min(quantities[product.id] || 1, Number(product.quantity) || 1),
        availableQuantity: Number(product.quantity) || 0
      };

      if (onBuyNow) {
        onBuyNow(payload);
        return;
      }

      addToCart(product);
    },
    [addToCart, onBuyNow, quantities, showNotification]
  );

  const openProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeProductDetails = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleDetailAddToCart = useCallback(() => {
    if (!selectedProduct) {
      return;
    }

    addToCart(selectedProduct);
  }, [addToCart, selectedProduct]);

  const handleDetailBuyNow = useCallback(() => {
    if (!selectedProduct) {
      return;
    }

    handleBuyNow(selectedProduct);
    closeProductDetails();
  }, [closeProductDetails, handleBuyNow, selectedProduct]);

  const handleReviewSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!selectedProduct) {
        return;
      }

      if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
        showNotification('Please enter your name and feedback');
        return;
      }

      setIsSubmittingReview(true);
      setReviewStatus((prev) => ({ ...prev, error: '' }));

      const newReview = {
        id: `${selectedProduct.id}-${Date.now()}`,
        name: reviewForm.name.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        date: formatReviewDate(new Date())
      };

      try {
        const response = await fetch(`${API_BASES.payments}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: selectedProduct.id,
            name: reviewForm.name.trim(),
            email: getStoredCustomerEmail(),
            rating: reviewForm.rating,
            review: reviewForm.comment.trim()
          })
        });

        if (!response.ok) {
          throw new Error('Review service unavailable');
        }

        persistReviewCache((prev) => {
          const currentReviews = prev[selectedProduct.id]?.length
            ? prev[selectedProduct.id]
            : buildDefaultReviews(selectedProduct);
          return {
            ...prev,
            [selectedProduct.id]: [newReview, ...currentReviews]
          };
        });
      } catch (error) {
        persistReviewCache((prev) => {
          const currentReviews = prev[selectedProduct.id]?.length
            ? prev[selectedProduct.id]
            : buildDefaultReviews(selectedProduct);
          return {
            ...prev,
            [selectedProduct.id]: [newReview, ...currentReviews]
          };
        });

        setReviewStatus({
          loading: false,
          error: 'Review service is busy. Your feedback was saved in this browser for now.'
        });
      }

      setReviewForm((prev) => ({
        ...prev,
        rating: 5,
        comment: ''
      }));
      showNotification('Feedback added successfully');
      setIsSubmittingReview(false);
    },
    [persistReviewCache, reviewForm, selectedProduct, showNotification]
  );

  const handleCartCheckout = useCallback(() => {
    if (cart.length === 0) {
      showNotification('Add a product before continuing to checkout');
      return;
    }

    if (!onBuyNow) {
      showNotification('Cart checkout is not available on this page yet');
      return;
    }

    const firstItem = cart[0];
    onBuyNow({
      ...firstItem,
      selectedQuantity: firstItem.quantity,
      availableQuantity: firstItem.availableQuantity || firstItem.quantity
    });

    if (cart.length > 1) {
      showNotification('Checkout opened with the first cart item. Multi-item checkout is coming next.');
    }

    setCartOpen(false);
  }, [cart, onBuyNow, showNotification]);

  const scrollToProducts = useCallback(() => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToCategories = useCallback(() => {
    categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f5ee] text-slate-900">
      {notification && (
        <div className="fixed right-4 top-24 z-[70] max-w-sm">
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/90 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl">
            {notification}
          </div>
        </div>
      )}

      <CustomerNavbar
        isScrolled
        onNavigateToHome={onNavigateToHome || onBack}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={onNavigateToHome || onBack}
        actions={
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-white/15 sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div ref={cartRef} className="relative">
              <button
                type="button"
                onClick={() => setCartOpen((prev) => !prev)}
                className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalCartItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {cartOpen && (
                <div className="absolute right-0 top-full z-[80] mt-3 w-[min(88vw,24rem)] rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
                        Your cart
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-white">
                        {totalCartItems} item{totalCartItems === 1 ? '' : 's'}
                      </h3>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {formatCurrency(totalCartValue)}
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/65">
                      Your cart is empty
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-xl object-cover"
                              onError={(event) => {
                                event.target.src = PRODUCT_FALLBACK_IMAGE;
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">
                                {item.name}
                              </p>
                              <p className="text-xs text-white/60">
                                Rs.{item.price.toFixed(2)} each
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCartQuantity(item.id, item.quantity - 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white/10"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCartQuantity(item.id, item.quantity + 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white/10"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs font-semibold text-red-300 transition-colors hover:text-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleCartCheckout}
                        className="mt-4 w-full rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-950 transition-transform duration-300 hover:scale-[1.01]"
                      >
                        {cart.length > 1 ? 'Checkout first item' : 'Continue to checkout'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />

      <main className="pt-20 sm:pt-24">
        {selectedProduct ? (
          <section className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(135deg,#f4f8ec_0%,#fff3df_34%,#e6f3f8_70%,#f6efe6_100%)] px-0 pb-12 pt-4 sm:px-4 sm:pb-16 sm:pt-6 lg:px-6 lg:pt-8">
            <div className="absolute left-[-4rem] top-32 h-40 w-40 rounded-full bg-[#d8efb6]/55 blur-3xl sm:h-56 sm:w-56"></div>
            <div className="absolute right-[-3rem] top-48 h-44 w-44 rounded-full bg-[#ffd79e]/45 blur-3xl sm:h-64 sm:w-64"></div>
            <div className="absolute bottom-10 left-[20%] h-40 w-40 rounded-full bg-[#d6ebf6]/55 blur-3xl sm:h-56 sm:w-56"></div>

            <div className="relative w-full">
              <div className="px-4 sm:px-0">
                <button
                  type="button"
                  onClick={closeProductDetails}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/90 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#7ca537] hover:text-[#7ca537]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </button>
              </div>

              <div className="mt-5 overflow-hidden bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(241,249,228,0.92),rgba(255,245,226,0.92),rgba(227,241,247,0.9))] px-4 py-4 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2.6rem] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="grid min-h-[calc(100vh-12rem)] gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                  <div className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8f6ef_100%)] p-4 shadow-sm">
                    <div className="relative h-full overflow-hidden rounded-[1.8rem]">
                      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
                        <span className="rounded-full bg-[#ebf5d8]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#5d7631] shadow-sm">
                          {selectedProduct.category}
                        </span>
                        <span className="rounded-full bg-white/92 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
                          {selectedProduct.inStock ? 'Ready to order' : 'Sold out'}
                        </span>
                      </div>
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="h-[42vh] w-full object-cover sm:h-[52vh] lg:h-[calc(100vh-17rem)]"
                        onError={(event) => {
                          event.target.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex h-full flex-col rounded-[2.2rem] bg-[linear-gradient(180deg,#ffffff_0%,#fdfbf7_100%)] p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7ca537]">
                      {selectedProduct.seller}
                    </p>
                    <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl xl:text-[3.6rem]">
                      {selectedProduct.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold text-slate-700">
                          {selectedProductAverageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#7ca537]" />
                        <span>{selectedProduct.location}</span>
                      </div>
                      <span>{selectedProduct.quantity} units available</span>
                      <span>{selectedProductReviews.length} reviews</span>
                    </div>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                      {selectedProduct.description}
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,#f9fbea_0%,#ffffff_100%)] p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Price
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-950">
                          {formatCurrency(selectedProduct.price)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Per {selectedProduct.unit || 'unit'}</p>
                      </div>
                      <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,#fff9ef_0%,#ffffff_100%)] p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Farmer
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          {selectedProduct.seller}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Direct marketplace listing</p>
                      </div>
                      <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,#eef6fb_0%,#ffffff_100%)] p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Stock
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          {selectedProduct.inStock
                            ? `${selectedProduct.quantity} ${selectedProduct.unit || 'unit'} ready`
                            : 'Unavailable'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedProduct.quantity > 0 && selectedProduct.quantity <= LOW_STOCK_THRESHOLD
                            ? 'Low stock, secure it soon'
                            : 'Fresh quantity synced from the market'}
                        </p>
                      </div>
                      <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,#f0f9f3_0%,#ffffff_100%)] p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Delivery
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-950">Fast local handoff</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Checkout keeps delivery and payment details clear.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 rounded-[2rem] border border-slate-900/8 bg-[linear-gradient(135deg,#f8f6ef_0%,#eef6fb_100%)] p-5">
                      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                        <div className="rounded-[1.8rem] bg-white p-5 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Purchase planner
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3 rounded-full border border-slate-900/8 bg-[#fbfaf5] px-3 py-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(selectedProduct.id, -1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition-all duration-300 hover:bg-slate-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="text-center">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Quantity
                              </p>
                              <span className="text-lg font-black text-slate-950">
                                {quantities[selectedProduct.id] || 1}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateQuantity(selectedProduct.id, 1)}
                              disabled={
                                !selectedProduct.inStock ||
                                (quantities[selectedProduct.id] || 1) >= selectedProduct.quantity
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition-all duration-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.3rem] bg-[#f8f6ef] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Selected total
                              </p>
                              <p className="mt-1 text-lg font-black text-slate-950">
                                {formatCurrency(
                                  selectedProduct.price * (quantities[selectedProduct.id] || 1)
                                )}
                              </p>
                            </div>
                            <div className="rounded-[1.3rem] bg-[#eef7de] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d7631]">
                                Order confidence
                              </p>
                              <p className="mt-1 text-sm font-bold text-[#35521c]">
                                Secure checkout and live stock verification
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.8rem] bg-[linear-gradient(140deg,#ffffff_0%,#fffdf8_100%)] p-5 shadow-sm">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[1.2rem] bg-[#fbfaf5] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Delivery
                              </p>
                              <p className="mt-2 text-sm font-bold text-slate-950">Local priority routing</p>
                            </div>
                            <div className="rounded-[1.2rem] bg-[#fbfaf5] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Payment
                              </p>
                              <p className="mt-2 text-sm font-bold text-slate-950">Card or cash on delivery</p>
                            </div>
                            <div className="rounded-[1.2rem] bg-[#fbfaf5] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Freshness
                              </p>
                              <p className="mt-2 text-sm font-bold text-slate-950">Farmer-direct product</p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={handleDetailAddToCart}
                              disabled={!selectedProduct.inStock}
                              className={`rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                                selectedProduct.inStock
                                  ? 'border border-slate-900/10 bg-white text-slate-900 hover:border-[#7ca537] hover:text-[#7ca537]'
                                  : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                              }`}
                            >
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              onClick={handleDetailBuyNow}
                              disabled={!selectedProduct.inStock}
                              className={`rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                                selectedProduct.inStock
                                  ? 'bg-[#7ca537] text-white hover:bg-[#6d9431]'
                                  : 'cursor-not-allowed bg-slate-200 text-slate-500'
                              }`}
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[2.2rem] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf6_100%)] p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7ca537]">
                      Rating & Reviews
                    </p>
                    <h2 className="mt-4 text-3xl font-black text-slate-950">
                      Customer feedback
                    </h2>

                    <div className="mt-6 rounded-[2rem] bg-[linear-gradient(135deg,#f8f6ef_0%,#eef6fb_100%)] p-5">
                      <div className="flex items-end gap-4">
                        <p className="text-5xl font-black text-slate-950">
                          {selectedProductAverageRating.toFixed(1)}
                        </p>
                        <div className="pb-1">
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-5 w-5 ${
                                  index < Math.round(selectedProductAverageRating)
                                    ? 'fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Based on {selectedProductReviews.length} customer review
                            {selectedProductReviews.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleReviewSubmit} className="mt-6 rounded-[2rem] bg-[linear-gradient(135deg,#f8f6ef_0%,#fff9ef_100%)] p-5">
                      <h3 className="text-lg font-black text-slate-950">
                        Give product feedback
                      </h3>

                      {reviewStatus.error && (
                        <div className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                          {reviewStatus.error}
                        </div>
                      )}

                      <div className="mt-5 grid gap-4">
                        <input
                          type="text"
                          value={reviewForm.name}
                          onChange={(event) =>
                            setReviewForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Your name"
                          className="rounded-full border border-slate-900/10 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#7ca537]"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-700">Your rating</p>
                          <div className="mt-3 flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((ratingValue) => (
                              <button
                                key={ratingValue}
                                type="button"
                                onClick={() =>
                                  setReviewForm((prev) => ({ ...prev, rating: ratingValue }))
                                }
                                className="transition-transform duration-300 hover:scale-110"
                              >
                                <Star
                                  className={`h-7 w-7 ${
                                    ratingValue <= reviewForm.rating
                                      ? 'fill-current text-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          value={reviewForm.comment}
                          onChange={(event) =>
                            setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
                          }
                          placeholder="Write your feedback about this product..."
                          rows={4}
                          className="rounded-[1.5rem] border border-slate-900/10 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#7ca537]"
                        />

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="rounded-full bg-[#7ca537] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#6d9431] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isSubmittingReview ? 'Saving Review...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="rounded-[2.2rem] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf6_100%)] p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7ca537]">
                          Reviews
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-slate-950">
                          What customers say
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#f8f6ef] px-4 py-2 text-sm font-semibold text-slate-600">
                        {selectedProductReviews.length} review
                        {selectedProductReviews.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {reviewStatus.loading && (
                      <div className="mt-6 rounded-[1.6rem] bg-[#f8f6ef] px-5 py-4 text-sm text-slate-500">
                        Loading latest reviews...
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      {selectedProductReviews.map((review) => (
                        <article
                          key={review.id}
                          className="rounded-[1.8rem] border border-slate-900/8 bg-[linear-gradient(135deg,#f8f6ef_0%,#fefbf4_100%)] p-5"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h4 className="text-lg font-black text-slate-950">
                                {review.name}
                              </h4>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                {review.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(5)].map((_, index) => (
                                <Star
                                  key={`${review.id}-${index}`}
                                  className={`h-4 w-4 ${
                                    index < review.rating ? 'fill-current' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-slate-600">
                            {review.comment}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
        <section className="relative flex min-h-[calc(100vh-5rem)] w-full items-center overflow-hidden bg-[linear-gradient(135deg,#f8f3e9_0%,#eef7de_30%,#fff3dc_64%,#f7efe4_100%)] px-3 py-6 sm:min-h-[calc(100vh-6rem)] sm:px-6 sm:py-8 lg:px-8">
          <div className="absolute left-[-6rem] top-[-4rem] h-40 w-40 rounded-full bg-[#d9efb8]/60 blur-3xl sm:h-56 sm:w-56"></div>
          <div className="absolute right-[8%] top-[12%] h-32 w-32 rounded-full bg-[#ffd89a]/45 blur-3xl sm:h-44 sm:w-44"></div>
          <div className="absolute bottom-[-3rem] right-[-3rem] h-44 w-44 rounded-full bg-[#dceef8]/70 blur-3xl sm:h-64 sm:w-64"></div>

          <div className="relative grid min-h-[calc(100vh-8rem)] w-full gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch xl:gap-6">
            <div className="flex h-full flex-col justify-center rounded-[1.8rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(244,251,231,0.92),rgba(255,244,222,0.92))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2.5rem] sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5d7631] shadow-sm">
                <Leaf className="h-4 w-4" />
                {activeHero.label}
              </span>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl xl:text-7xl">
                {activeHero.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg xl:text-xl xl:leading-8">
                {activeHero.description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7ca537] px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#6e9431]"
                >
                  {activeHero.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollToCategories}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-slate-900 transition-all duration-300 hover:border-[#7ca537] hover:text-[#7ca537]"
                >
                  Shop by category
                </button>
              </div>

              <div className="mt-7 flex flex-col gap-4 rounded-[1.8rem] border border-slate-900/8 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center">
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-900/8 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products, sellers, categories..."
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </label>

                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-slate-800"
                >
                  Search
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbec_100%)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Products
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{products.length}</p>
                </div>
                <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#fff7e8_100%)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Categories
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {Math.max(categories.length - 1, 0)}
                  </p>
                </div>
                <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,#ffffff_0%,#eef6fb_100%)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    In stock
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {products.filter((product) => product.inStock).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid h-full gap-5 sm:gap-6">
              <div className="relative flex min-h-[24rem] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(145deg,#e7f4d7_0%,#fff1d8_58%,#dff1f8_100%)] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:rounded-[2.5rem] sm:p-5 xl:min-h-0">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_58%)]"></div>
                <div className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#5d7631] shadow-sm">
                  {activeHero.offer}
                </div>
                <div className="relative z-10 grid w-full gap-5 md:grid-cols-[0.92fr_1.08fr] md:items-end">
                  <div className="pt-12 md:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#5d7631]">
                      Fresh collection
                    </p>
                    <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
                      Grocery-market style product browsing
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Bright layout, soft cards, rounded buttons, and product-focused
                      content inspired by the FoodMart design direction.
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setCurrentSlide(index)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'w-9 bg-[#7ca537]' : 'w-2.5 bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[2rem]">
                    <img
                      src={activeHero.image}
                      alt={activeHero.title}
                      className="h-64 w-full object-cover sm:h-72 xl:h-[42vh] 2xl:h-[50vh]"
                      onError={(event) => {
                        event.target.src = PRODUCT_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {promoCards.slice(0, 2).map((card) => (
                  <div
                    key={card.id}
                    className={`overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br ${card.shellClass} p-5 shadow-sm`}
                  >
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
                          {card.discount}
                        </span>
                        <h3 className="mt-4 text-2xl font-black text-slate-950">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {card.description}
                        </p>
                      </div>
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-32 w-full rounded-[1.5rem] object-cover"
                        onError={(event) => {
                          event.target.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {promoCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  scrollToProducts();
                }}
                className={`group overflow-hidden rounded-[2rem] bg-gradient-to-br ${card.shellClass} p-5 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
                      {card.discount}
                    </span>
                    <h3 className="mt-4 text-2xl font-black text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section ref={categoriesSectionRef} className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7ca537]">
                  Category
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                  Shop by departments
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:text-[#7ca537]"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {categoryCards.map((category, index) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    scrollToProducts();
                  }}
                  className="rounded-[2rem] bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                      categoryShells[index % categoryShells.length]
                    }`}
                  >
                    <Tags className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {category.total} product{category.total === 1 ? '' : 's'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section ref={productsSectionRef} className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7ca537]">
                  Trending Products
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                  Smart product shopping
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-[#7ca537] text-white'
                        : 'bg-[#f5f3eb] text-slate-700 hover:bg-[#ebf5d8]'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[2rem] bg-[#f8f6ef] p-4 shadow-sm lg:grid-cols-[1.1fr_0.75fr_0.72fr_0.72fr_0.68fr]">
              <label className="flex items-center gap-3 rounded-full border border-slate-900/8 bg-white px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search live products..."
                  className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-full border border-slate-900/8 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-full border border-slate-900/8 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="rounded-full border border-slate-900/8 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="sold-out">Sold Out</option>
              </select>

              <div className="flex items-center justify-center rounded-full bg-[#ebf5d8] px-4 py-3 text-sm font-semibold text-[#5d7631]">
                {visibleProductRange.start}-{visibleProductRange.end} of {filteredProducts.length}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.8rem] bg-[#f8f6ef] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Visible now
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{filteredProducts.length}</p>
                <p className="mt-1 text-sm text-slate-500">Products after current filters</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#eef7de] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5d7631]">
                  Available today
                </p>
                <p className="mt-2 text-2xl font-black text-[#2e4e16]">{inStockCount}</p>
                <p className="mt-1 text-sm text-[#4b6b2e]">Ready for immediate checkout</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#fff3dc] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5a12]">
                  Low stock
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{lowStockCount}</p>
                <p className="mt-1 text-sm text-slate-500">Good picks to secure quickly</p>
              </div>
              <div className="rounded-[1.8rem] bg-[#e8f3f8] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#16617d]">
                  Fresh arrivals
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{freshArrivalCount}</p>
                <p className="mt-1 text-sm text-slate-500">Listed in the last 14 days</p>
              </div>
            </div>

            {loadingProducts && (
              <div className="mt-10 rounded-[2rem] bg-[#f8f6ef] py-16 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#7ca537]"></div>
                <p className="mt-4 text-lg text-slate-600">Loading products...</p>
              </div>
            )}

            {fetchError && (
              <div className="mt-10 rounded-[2rem] border border-red-200 bg-[#fff7f7] p-8 text-center shadow-sm">
                <p className="text-red-600">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => fetchProducts()}
                  className="mt-4 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingProducts && !fetchError && filteredProducts.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[2.1rem] border border-[#e8e2d4] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
                  >
                    <div className="relative overflow-hidden bg-[#f7f3e8]">
                      <div className="absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-[#eef7de] to-transparent"></div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.target.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-all duration-300 hover:text-red-500"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(product.id) ? 'fill-current text-red-500' : ''
                          }`}
                        />
                      </button>
                      <div className="absolute left-4 top-4 rounded-full bg-[#7ca537] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                        {product.category}
                      </div>

                      <div className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 shadow-sm backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-semibold text-slate-800">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {product.inStock ? 'Ready now' : 'Sold out'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7ca537]">
                        {product.seller}
                      </p>
                      <h3 className="mt-2 text-xl font-black leading-snug text-slate-950">
                        {product.name}
                      </h3>

                      <p
                        className="mt-3 text-sm leading-6 text-slate-600"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-[#7ca537]" />
                        <span className="truncate">{product.location}</span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3 rounded-[1.5rem] bg-[#f7f3e8] px-4 py-3">
                        <div>
                          <span className="text-2xl font-black text-slate-950">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="ml-1 text-sm text-slate-500">/ {product.unit || 'unit'}</span>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                            product.inStock && product.quantity <= LOW_STOCK_THRESHOLD
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-white text-slate-600'
                          }`}
                        >
                          {product.inStock
                            ? `${product.quantity} available`
                            : 'Currently sold out'}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.4rem] border border-slate-900/8 bg-[#fcfbf7] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900">
                            {quantities[product.id] || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            disabled={!product.inStock || (quantities[product.id] || 1) >= product.quantity}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {product.inStock
                            ? product.quantity <= LOW_STOCK_THRESHOLD
                              ? 'Low stock'
                              : 'Ready today'
                            : 'Unavailable'}
                        </span>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          className={`w-full rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                            product.inStock
                              ? 'border border-slate-900/10 bg-white text-slate-900 hover:border-[#7ca537] hover:text-[#7ca537]'
                              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                        >
                          Add to Cart
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openProductDetails(product)}
                        className="mt-3 w-full rounded-full bg-[#f5f3eb] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 transition-all duration-300 hover:bg-[#ebf5d8] hover:text-[#5d7631]"
                      >
                        View Full Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loadingProducts && !fetchError && filteredProducts.length > 0 && totalProductPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-slate-500">
                  Showing {visibleProductRange.start} to {visibleProductRange.end} of {filteredProducts.length} products
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentProductPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentProductPage === 1}
                    className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                      currentProductPage === 1
                        ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                        : 'bg-white text-slate-800 shadow-sm hover:bg-[#ebf5d8] hover:text-[#5d7631]'
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentProductPage(page)}
                      className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded-full px-3 text-sm font-bold transition-all duration-300 ${
                        currentProductPage === page
                          ? 'bg-[#7ca537] text-white shadow-sm'
                          : 'bg-white text-slate-700 shadow-sm hover:bg-[#ebf5d8] hover:text-[#5d7631]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentProductPage((prev) => Math.min(prev + 1, totalProductPages))
                    }
                    disabled={currentProductPage === totalProductPages}
                    className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                      currentProductPage === totalProductPages
                        ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                        : 'bg-white text-slate-800 shadow-sm hover:bg-[#ebf5d8] hover:text-[#5d7631]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {!loadingProducts && !fetchError && filteredProducts.length === 0 && (
              <div className="mt-10 rounded-[2rem] bg-[#f8f6ef] py-16 text-center shadow-sm">
                <p className="text-lg text-slate-600">
                  No products match your current search or category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setStockFilter('all');
                    setSortBy('featured');
                  }}
                  className="mt-4 font-semibold text-[#7ca537] transition-colors hover:text-[#6d9431]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-[2.3rem] bg-[#fff3dc] p-6 shadow-sm sm:p-8">
                <span className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b5a12]">
                  Upto 25% Off
                </span>
                <h3 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">
                  Pantry deals with a brighter premium touch
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  The product page now balances offers, categories, and product cards
                  in a lighter grocery-store design inspired by the FoodMart layout.
                </p>
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-slate-800"
                >
                  Shop Collection
                </button>
              </div>

              <div className="overflow-hidden rounded-[2.3rem] bg-[#dff1db] p-6 shadow-sm sm:p-8">
                <span className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#4e6b26]">
                  Best Sellers
                </span>
                <h3 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">
                  Keep customers focused on the most wanted products
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  The cleaner cards, softer colors, and more structured product section
                  make it easier for users to notice the best items.
                </p>
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="mt-6 rounded-full bg-[#7ca537] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#6d9431]"
                >
                  View Trending
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7ca537]">
                  Best Selling Products
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                  Popular picks from your live marketplace
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:text-[#7ca537]"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {bestSellingProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] border border-slate-900/8 bg-[#f8f6ef] p-4 shadow-sm"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-44 w-full rounded-[1.6rem] object-cover"
                    onError={(event) => {
                      event.target.src = PRODUCT_FALLBACK_IMAGE;
                    }}
                  />
                  <h3 className="mt-4 text-lg font-black text-slate-950">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Star className="h-4 w-4 fill-current text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span>|</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-slate-950">
                      Rs.{product.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="rounded-full bg-[#7ca537] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#6d9431]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#7ca537] p-6 text-white shadow-[0_20px_60px_rgba(124,165,55,0.24)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
                  <Mail className="h-4 w-4" />
                  Get 25% discount on your first purchase
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  Subscribe for fresh offers and smart grocery updates
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                  This section follows the FoodMart-inspired discount banner style while
                  fitting your customer product page and mobile layout.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-5 text-slate-900 shadow-lg">
                <div className="grid gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="rounded-full border border-slate-900/10 px-4 py-3 text-sm font-medium outline-none focus:border-[#7ca537]"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="rounded-full border border-slate-900/10 px-4 py-3 text-sm font-medium outline-none focus:border-[#7ca537]"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300" />
                    Subscribe to the newsletter
                  </label>
                  <button
                    type="button"
                    className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-slate-800"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {promiseCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[2rem] bg-[#f8f6ef] p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7ca537] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="bg-[#1d2b10] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Leaf className="h-5 w-5 text-[#d6f3a2]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
                    Sri Lanka
                  </p>
                  <h3 className="text-xl font-black">Economic Center Market</h3>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                A brighter FoodMart-inspired customer product page with live marketplace
                products, cleaner shopping sections, and a fully responsive layout.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">
                  Explore
                </h4>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <button type="button" onClick={onNavigateToHome} className="block text-left transition-colors hover:text-white">
                    Home
                  </button>
                  <button type="button" onClick={onNavigateToProducts} className="block text-left transition-colors hover:text-white">
                    Products
                  </button>
                  <button type="button" onClick={onNavigateToSellers} className="block text-left transition-colors hover:text-white">
                    Sellers
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">
                  Marketplace
                </h4>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <button type="button" onClick={scrollToCategories} className="block text-left transition-colors hover:text-white">
                    Categories
                  </button>
                  <button type="button" onClick={scrollToProducts} className="block text-left transition-colors hover:text-white">
                    Trending Products
                  </button>
                  <button type="button" onClick={onNavigateToMap} className="block text-left transition-colors hover:text-white">
                    Centers
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">
                  Promise
                </h4>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <p>FoodMart-inspired design</p>
                  <p>Modern responsive layout</p>
                  <p>Live product integration</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductPage;
