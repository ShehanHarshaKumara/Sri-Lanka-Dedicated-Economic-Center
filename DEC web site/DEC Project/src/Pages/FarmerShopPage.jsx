import { useState } from 'react';
import {
  FaArrowRight,
  FaBoxOpen,
  FaBoxes,
  FaCheckCircle,
  FaClipboardList,
  FaEye,
  FaFilter,
  FaLeaf,
  FaMapMarkerAlt,
  FaMinus,
  FaPlus,
  FaRupeeSign,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaStar,
  FaStore,
  FaTimes,
  FaTruck
} from 'react-icons/fa';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=600&fit=crop';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatNumber = (value) => new Intl.NumberFormat('en-LK').format(Number(value || 0));

const getAvailabilityLabel = (quantity) => {
  if (quantity <= 0) return 'Out of stock';
  if (quantity < 15) return 'Limited stock';
  if (quantity < 50) return 'Ready today';
  return 'Fresh stock';
};

const getRatingValue = (rating) => (rating > 0 ? rating.toFixed(1) : '4.8');

const FarmerShopPage = ({
  farmer,
  products = [],
  isLoading = false,
  onAddProduct,
  onManageProducts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [shopNotice, setShopNotice] = useState('');

  const normalizedProducts = products.map((product) => ({
    ...product,
    price: Number(product.price || 0),
    quantity: Number(product.quantity || 0),
    sales: Number(product.sales || 0),
    views: Number(product.views || 0),
    rating: Number(product.rating || 0),
    image_url: product.image_url || DEFAULT_IMAGE,
    status: product.status || 'active',
    unit: product.unit || 'kg'
  }));

  const categories = [
    'all',
    ...new Set(
      normalizedProducts
        .map((product) => product.category)
        .filter(Boolean)
    )
  ];

  const visibleProducts = normalizedProducts.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [product.name, product.category, product.description, product.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeProducts = normalizedProducts.filter((product) => product.status === 'active');
  const totalStock = normalizedProducts.reduce((sum, product) => sum + product.quantity, 0);
  const estimatedValue = activeProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const featuredProduct = activeProducts[0] || normalizedProducts[0] || null;

  const maxPurchaseQuantity = checkoutProduct
    ? Math.max(1, Math.min(checkoutProduct.quantity || 1, 99))
    : 1;

  const openViewModal = (product) => {
    setSelectedProduct(product);
  };

  const openBuyModal = (product) => {
    setCheckoutProduct(product);
    setPurchaseQuantity(1);
  };

  const closeViewModal = () => setSelectedProduct(null);

  const closeBuyModal = () => {
    setCheckoutProduct(null);
    setPurchaseQuantity(1);
  };

  const changePurchaseQuantity = (nextQuantity) => {
    if (!checkoutProduct) return;
    const normalizedQuantity = Math.max(1, Math.min(maxPurchaseQuantity, nextQuantity));
    setPurchaseQuantity(normalizedQuantity);
  };

  const handleCheckoutPreview = () => {
    if (!checkoutProduct) return;
    setShopNotice(
      `${checkoutProduct.name} prepared with ${purchaseQuantity} ${checkoutProduct.unit} for checkout preview.`
    );
    closeBuyModal();
  };

  const checkoutTotal = checkoutProduct
    ? Number(checkoutProduct.price || 0) * purchaseQuantity
    : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(236,253,245,0.98)_55%,_rgba(240,253,250,0.96)_100%)] p-6 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.45)] lg:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-amber-100/70 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <FaStore className="text-xs" />
              Modern Farmer Shop
            </div>

            <div className="mt-5 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Clean, responsive shop page for your farmer panel
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
                A simpler storefront that keeps the focus on product images, price, stock, and
                fast actions. It is optimized for mobile cards, tablet grids, and wide desktop
                browsing.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Listings
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{activeProducts.length}</p>
                <p className="mt-2 text-sm text-slate-500">Active products ready for the storefront.</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Total Stock
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{formatNumber(totalStock)}</p>
                <p className="mt-2 text-sm text-slate-500">Available units across all listings.</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Inventory Value
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(estimatedValue)}</p>
                <p className="mt-2 text-sm text-slate-500">Estimated value of active stock.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onAddProduct}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <FaPlus className="text-xs" />
                Add Product
              </button>
              <button
                type="button"
                onClick={onManageProducts}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Products
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_70px_-36px_rgba(15,23,42,0.45)]">
          {featuredProduct ? (
            <div className="flex h-full flex-col">
              <div className="relative h-60 overflow-hidden sm:h-72 xl:h-64">
                <img
                  src={featuredProduct.image_url}
                  alt={featuredProduct.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.06)_0%,_rgba(15,23,42,0.18)_45%,_rgba(15,23,42,0.78)_100%)]" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                    Featured
                  </span>
                  {featuredProduct.category && (
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      {featuredProduct.category}
                    </span>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
                    Best Product Preview
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{featuredProduct.name}</h2>
                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-100/90">
                    <span className="inline-flex items-center gap-2">
                      <FaStar className="text-amber-300" />
                      {getRatingValue(featuredProduct.rating)}
                    </span>
                    <span>{getAvailabilityLabel(featuredProduct.quantity)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">From {farmer?.name || 'your farm'}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">
                      {featuredProduct.description || 'Fresh produce listed in your modern storefront.'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">Price</p>
                    <div className="mt-1 flex items-center justify-end text-xl font-bold text-emerald-700">
                      <FaRupeeSign className="mr-1 text-xs" />
                      {formatNumber(featuredProduct.price)}
                    </div>
                    <p className="text-xs text-emerald-600">per {featuredProduct.unit}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {formatNumber(featuredProduct.quantity)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Sold</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {formatNumber(featuredProduct.sales)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Views</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {formatNumber(featuredProduct.views)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openViewModal(featuredProduct)}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View Product
                  </button>
                  <button
                    type="button"
                    onClick={() => openBuyModal(featuredProduct)}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                  <FaShoppingBag className="text-2xl" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-900">Start your modern shop</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Add your first farmer product to populate this responsive storefront.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {shopNotice && (
        <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-500 p-3 text-white">
                <FaCheckCircle />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Checkout preview created</p>
                <p className="mt-1 text-sm text-emerald-700">{shopNotice}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShopNotice('')}
              className="rounded-xl p-2 text-emerald-700 transition hover:bg-emerald-100"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.5)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search product name, category, or address"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <FaFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:bg-white lg:min-w-[200px]"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((category) => category !== 'all')
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white lg:min-w-[160px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
            {visibleProducts.length} products
          </span>
          <span className="rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
            {categories.length - 1} categories
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2">
            {farmer?.location || 'Sri Lanka'}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Shop Listings</p>
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <FaShoppingBag />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{normalizedProducts.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Live Products</p>
            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-600">
              <FaStore />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeProducts.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Available Stock</p>
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <FaBoxes />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{formatNumber(totalStock)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Inventory Value</p>
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <FaClipboardList />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-slate-900">{formatCurrency(estimatedValue)}</p>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-md">
          <p className="text-lg font-semibold text-emerald-600">Loading farmer shop products...</p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-md">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
              <FaBoxOpen className="text-2xl" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">No products to display</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Add products or change the filters to fill this modern responsive shop page.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onAddProduct}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={onManageProducts}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open My Products
              </button>
            </div>
          </div>
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-30px_rgba(15,23,42,0.5)]"
            >
              <div className="relative h-44 overflow-hidden sm:h-48">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
                    product.status === 'inactive' ? 'opacity-80' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.03)_0%,_rgba(15,23,42,0.12)_45%,_rgba(15,23,42,0.76)_100%)]" />

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {product.category && (
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {product.category}
                    </span>
                  )}
                  {product.organic && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                      <FaLeaf className="text-[10px]" />
                      Organic
                    </span>
                  )}
                </div>

                <div className="absolute right-3 top-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      product.status === 'active'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white/95 text-slate-700'
                    }`}
                  >
                    {product.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/80">
                        {getAvailabilityLabel(product.quantity)}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold leading-tight sm:text-xl">{product.name}</h3>
                    </div>
                    <div className="rounded-xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-wide text-emerald-100/85">Price</p>
                      <div className="mt-1 flex items-center justify-end text-base font-bold sm:text-lg">
                        <FaRupeeSign className="mr-1 text-xs" />
                        {formatNumber(product.price)}
                      </div>
                      <p className="text-[11px] text-emerald-50/80">per {product.unit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <FaStar className="text-amber-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {getRatingValue(product.rating)}
                    </span>
                    <span className="text-xs text-slate-400">farmer quality</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {formatNumber(product.sales)} sold
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {product.description || 'Fresh farmer product displayed in a modern clean product card.'}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                    <p className="mt-1.5 text-base font-bold text-slate-900">
                      {formatNumber(product.quantity)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Views</p>
                    <p className="mt-1.5 text-base font-bold text-slate-900">
                      {formatNumber(product.views)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Unit</p>
                    <p className="mt-1.5 text-base font-bold text-slate-900">{product.unit}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-emerald-500" />
                  <span>
                    {product.address || farmer?.location || 'Farm pickup and delivery area not added yet.'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => openViewModal(product)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FaEye className="text-xs" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openBuyModal(product)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <FaShoppingCart className="text-xs" />
                    Buy Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeViewModal}
              className="absolute right-5 top-5 z-10 rounded-full bg-white p-3 text-slate-600 shadow-lg transition hover:bg-slate-50"
            >
              <FaTimes />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr]">
              <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.03)_0%,_rgba(15,23,42,0.2)_50%,_rgba(15,23,42,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                    Product Preview
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">{selectedProduct.name}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/90">
                    {selectedProduct.description || 'Fresh farmer product details for this listing.'}
                  </p>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.category && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {selectedProduct.category}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {selectedProduct.status === 'active' ? 'Active listing' : 'Inactive listing'}
                  </span>
                  {selectedProduct.organic && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Organic
                    </span>
                  )}
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Current price</p>
                      <div className="mt-3 flex items-center text-3xl font-bold text-slate-900">
                        <FaRupeeSign className="mr-1 text-base" />
                        {formatNumber(selectedProduct.price)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Unit</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatNumber(selectedProduct.quantity)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Sold</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatNumber(selectedProduct.sales)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Rating</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {getRatingValue(selectedProduct.rating)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 rounded-[1.5rem] bg-emerald-50 p-4">
                    <div className="rounded-2xl bg-emerald-500 p-3 text-white">
                      <FaLeaf />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">{getAvailabilityLabel(selectedProduct.quantity)}</p>
                      <p className="mt-1 text-sm text-emerald-700">
                        Clean product presentation with easy details for customers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[1.5rem] bg-sky-50 p-4">
                    <div className="rounded-2xl bg-sky-500 p-3 text-white">
                      <FaTruck />
                    </div>
                    <div>
                      <p className="font-semibold text-sky-900">Pickup and delivery area</p>
                      <p className="mt-1 text-sm text-sky-700">
                        {selectedProduct.address || farmer?.location || 'Delivery region can be added from the farmer panel.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      closeViewModal();
                      openBuyModal(selectedProduct);
                    }}
                    className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={onManageProducts}
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage Listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeBuyModal}
              className="absolute right-5 top-5 z-10 rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
            >
              <FaTimes />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[300px] overflow-hidden bg-slate-900">
                <img
                  src={checkoutProduct.image_url}
                  alt={checkoutProduct.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.04)_0%,_rgba(15,23,42,0.2)_45%,_rgba(15,23,42,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                    <FaShoppingCart className="text-[10px]" />
                    Buy Flow
                  </div>
                  <h2 className="mt-4 text-3xl font-bold">{checkoutProduct.name}</h2>
                  <p className="mt-2 text-sm text-slate-100/85">
                    Review quantity and order total before moving to checkout.
                  </p>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="rounded-[1.75rem] bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Unit price</p>
                      <div className="mt-3 flex items-center text-3xl font-bold text-slate-900">
                        <FaRupeeSign className="mr-1 text-base" />
                        {formatNumber(checkoutProduct.price)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Available</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatNumber(checkoutProduct.quantity)} {checkoutProduct.unit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-700">Select quantity</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => changePurchaseQuantity(purchaseQuantity - 1)}
                      className="rounded-2xl border border-slate-200 p-3 text-slate-700 transition hover:bg-slate-50"
                    >
                      <FaMinus />
                    </button>
                    <div className="min-w-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-bold text-slate-900">
                      {purchaseQuantity} {checkoutProduct.unit}
                    </div>
                    <button
                      type="button"
                      onClick={() => changePurchaseQuantity(purchaseQuantity + 1)}
                      className="rounded-2xl border border-slate-200 p-3 text-slate-700 transition hover:bg-slate-50"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Maximum preview quantity: {formatNumber(maxPurchaseQuantity)} {checkoutProduct.unit}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] border border-slate-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Subtotal</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(checkoutTotal)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Delivery zone</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {checkoutProduct.address || farmer?.location || 'Location not added yet'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 rounded-[1.5rem] bg-emerald-50 p-4">
                    <div className="rounded-2xl bg-emerald-500 p-3 text-white">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">Smart summary</p>
                      <p className="mt-1 text-sm text-emerald-700">
                        {checkoutProduct.name} x {purchaseQuantity} {checkoutProduct.unit} at{' '}
                        {formatCurrency(checkoutTotal)}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[1.5rem] bg-sky-50 p-4">
                    <div className="rounded-2xl bg-sky-500 p-3 text-white">
                      <FaTruck />
                    </div>
                    <div>
                      <p className="font-semibold text-sky-900">Delivery note</p>
                      <p className="mt-1 text-sm text-sky-700">
                        Final delivery and payment details can be connected in the next step.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCheckoutPreview}
                    className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeBuyModal();
                      openViewModal(checkoutProduct);
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerShopPage;
