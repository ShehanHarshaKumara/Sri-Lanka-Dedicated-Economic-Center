import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wheat,
  X
} from 'lucide-react';
import CustomerNavbar from '../components/CustomerNavbar';
import { API_BASES } from '../config/api';

const FARMER_DIRECTORY_BASE = API_BASES.farmerDirectory;
const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=900&fit=crop';
const PRODUCT_FALLBACK =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=700&fit=crop';
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1600&h=900&fit=crop'
];

const RESPONSE_SORT_ORDER = {
  'Within 30 min': 0,
  'Under 1 hour': 1,
  'Under 2 hours': 2,
  'Same day': 3
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatMessageTime = (value) => {
  const messageTime = new Date(value);

  if (Number.isNaN(messageTime.getTime())) {
    return 'Now';
  }

  return messageTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const createSeed = (value) => {
  const source = String(value ?? 'seller');
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const buildInitials = (name) =>
  String(name || 'Seller')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() || '')
    .join('');

const truncateText = (value, maxLength = 140) => {
  const text = String(value || '').trim();

  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
};

const normalizeExperience = (value, seed) => {
  if (value === null || value === undefined || value === '') {
    return `${4 + (seed % 16)} years`;
  }

  const text = String(value).trim();

  if (!text) {
    return `${4 + (seed % 16)} years`;
  }

  if (/\d/.test(text) && !/year/i.test(text)) {
    return `${text} years`;
  }

  return text;
};

const buildResponseLabel = (seed) =>
  ['Within 30 min', 'Under 1 hour', 'Under 2 hours', 'Same day'][seed % 4];

const buildDeliveryLabel = (seed) =>
  ['Next-day dispatch', '1-2 day delivery', '2-3 day delivery'][seed % 3];

const buildFarmSize = (seed) => `${8 + (seed % 48)} acres`;

const buildFollowers = (totalProducts, seed) => 120 + totalProducts * 37 + (seed % 180);

const buildOrders = (totalProducts, seed) => 45 + totalProducts * 24 + (seed % 120);

const buildSustainability = (seed) => 82 + (seed % 15);

const buildCategoryUnit = (category) => {
  switch (String(category || '').toLowerCase()) {
    case 'vegetables':
    case 'fruits':
    case 'grains':
    case 'meat':
      return 'per kg';
    case 'dairy':
      return 'per pack';
    default:
      return 'per item';
  }
};

const buildProductTone = (category) => {
  switch (String(category || '').toLowerCase()) {
    case 'vegetables':
      return 'from-emerald-500/20 to-lime-300/20 text-emerald-700';
    case 'fruits':
      return 'from-orange-400/20 to-amber-300/20 text-orange-700';
    case 'grains':
      return 'from-amber-400/20 to-yellow-300/20 text-amber-800';
    case 'dairy':
      return 'from-sky-400/20 to-cyan-300/20 text-sky-700';
    case 'meat':
      return 'from-rose-400/20 to-red-300/20 text-rose-700';
    default:
      return 'from-slate-300/30 to-slate-100/40 text-slate-700';
  }
};

const transformProduct = (product, seed) => {
  const quantity = Number(product?.quantity) || 0;
  const category = product?.category || 'Produce';

  return {
    id: product?.id ?? `${seed}-${product?.name || 'product'}`,
    name: product?.name || 'Farm product',
    price: Number(product?.price) || 0,
    unit: buildCategoryUnit(category),
    image: product?.image_url || PRODUCT_FALLBACK,
    description: product?.description || 'Fresh product available directly from the seller.',
    category,
    inStock: quantity > 0,
    quantity,
    rating: Number((4.3 + ((seed % 6) * 0.1)).toFixed(1)),
    reviews: 18 + (seed % 55),
    harvestLabel: ['Freshly harvested', 'Seasonal pick', 'Packed this week'][seed % 3],
    farmingMethod: ['Clean-grown', 'Field selected', 'Direct from farm'][seed % 3],
    address: product?.address || product?.product_address || 'Seller delivery area not added yet.'
  };
};

const transformFarmer = (farmer) => {
  const identifier = farmer?.user_id ?? farmer?.id ?? farmer?.full_name ?? farmer?.name;
  const seed = createSeed(identifier);
  const specialty = farmer?.farming_type || 'Mixed Farming';
  const city = farmer?.city || 'Sri Lanka';
  const totalProducts = Number(farmer?.total_products) || farmer?.products?.length || 0;

  return {
    id: identifier,
    name: farmer?.full_name || farmer?.name || 'Local seller',
    city,
    specialty,
    location: [city, specialty].filter(Boolean).join(' / '),
    image: farmer?.profile_image || AVATAR_FALLBACK,
    coverImage: COVER_IMAGES[seed % COVER_IMAGES.length],
    rating: Number((4.4 + ((seed % 5) * 0.1)).toFixed(1)),
    experience: normalizeExperience(farmer?.experience, seed),
    farmSize: buildFarmSize(seed),
    phone: farmer?.phone || '+94 70 000 0000',
    email: farmer?.email || 'seller@market.lk',
    bio:
      farmer?.bio ||
      'Passionate grower focused on fresher produce, cleaner fulfilment, and more direct customer relationships.',
    followers: buildFollowers(totalProducts, seed),
    totalOrders: buildOrders(totalProducts, seed),
    deliveryTime: buildDeliveryLabel(seed),
    responseTime: buildResponseLabel(seed),
    sustainability: buildSustainability(seed),
    totalProducts,
    isOnline: seed % 4 !== 0,
    lastSeen: seed % 3 === 0 ? 'today' : 'recently',
    verified: true,
    address: farmer?.location_address || farmer?.address || `${city}, Sri Lanka`,
    averagePrice: Number(farmer?.avg_price) || 0,
    products: Array.isArray(farmer?.products)
      ? farmer.products.map((product, index) => transformProduct(product, seed + index))
      : [],
    stats: farmer?.stats
      ? {
          totalProducts: Number(farmer.stats.total_products) || totalProducts,
          totalInventory: Number(farmer.stats.total_inventory) || 0,
          totalCategories: Number(farmer.stats.total_categories) || 0,
          averagePrice: Number(farmer.stats.avg_price) || 0
        }
      : null
  };
};

const StatCard = ({ icon, label, value, detail, accentClass }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-[1.6rem] border border-white/60 bg-white/88 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.42)] backdrop-blur-sm">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClass}`}
      >
        <IconComponent className="h-5 w-5 text-slate-900" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
};

const FarmerCard = ({ farmer, onOpen, onMessage }) => {
  const seed = createSeed(farmer.id);
  const spotlightProducts = farmer.products.slice(0, 3);
  const sellerThemes = [
    {
      shell: 'from-[#fff9ee] via-[#ffffff] to-[#e7f8f0]',
      hero: 'from-[#020617]/96 via-[#0f172a]/82 to-[#065f46]/72',
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      accentFill: 'bg-emerald-500',
      surface: 'from-emerald-500/12 to-lime-400/10'
    },
    {
      shell: 'from-[#fff6ef] via-[#ffffff] to-[#eef5ff]',
      hero: 'from-[#111827]/96 via-[#1f2937]/82 to-[#c2410c]/70',
      accent: 'border-orange-200 bg-orange-50 text-orange-700',
      accentFill: 'bg-orange-500',
      surface: 'from-orange-500/12 to-amber-400/10'
    },
    {
      shell: 'from-[#f7faff] via-[#ffffff] to-[#eefcf4]',
      hero: 'from-[#1e1b4b]/96 via-[#0f172a]/84 to-[#14532d]/72',
      accent: 'border-violet-200 bg-violet-50 text-violet-700',
      accentFill: 'bg-lime-500',
      surface: 'from-violet-500/12 to-lime-400/10'
    }
  ];
  const theme = sellerThemes[seed % sellerThemes.length];

  return (
    <article className="group relative mx-auto w-full max-w-[18rem]">
      <div
        className={`relative rounded-[2.65rem] border-[4px] border-slate-950 bg-gradient-to-br ${theme.shell} p-[0.34rem] transition duration-300 hover:-translate-y-2`}
        style={{
          boxShadow:
            '9px 9px 0 2px rgba(203,213,225,0.92), 0 30px 72px -36px rgba(15,23,42,0.55)'
        }}
      >
        <span className="absolute left-1/2 top-0 z-20 h-3.5 w-24 -translate-x-1/2 rounded-b-[1rem] bg-slate-950" />
        <span className="absolute -right-[0.45rem] top-16 h-8 w-[0.38rem] rounded-r-md bg-slate-950" />
        <span className="absolute -right-[0.45rem] top-28 h-12 w-[0.38rem] rounded-r-md bg-slate-950" />

        <div className="overflow-hidden rounded-[2.2rem] bg-white">
          <div className="relative h-[15rem] overflow-hidden">
            <img
              src={farmer.coverImage}
              alt={farmer.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.hero}`} />

            <div className="relative flex h-full flex-col justify-between p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <Shield className="h-3.5 w-3.5" />
                  Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950 shadow-lg">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {farmer.rating}
                </span>
              </div>

              <div className="rounded-[1.6rem] border border-white/15 bg-white/12 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-white/35 bg-white/12 text-base font-black text-white">
                    {farmer.image ? (
                      <img src={farmer.image} alt={farmer.name} className="h-full w-full object-cover" />
                    ) : (
                      buildInitials(farmer.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">{farmer.name}</h3>
                    <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
                      {farmer.specialty}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm text-white/82">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{farmer.city}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${theme.accent}`}
              >
                <Check className="h-3.5 w-3.5" />
                {farmer.isOnline ? 'Online now' : `Seen ${farmer.lastSeen}`}
              </span>
              <span className={`h-2.5 w-14 rounded-full ${theme.accentFill}`} />
            </div>

            <p className="text-sm leading-7 text-slate-600">{truncateText(farmer.bio, 92)}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-[1.35rem] border border-slate-200 bg-gradient-to-br ${theme.surface} px-3.5 py-3.5`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Products
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">{farmer.totalProducts}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{farmer.deliveryTime}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-950 px-3.5 py-3.5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/56">
                  Avg price
                </p>
                <p className="mt-2 text-lg font-black">{formatCurrency(farmer.averagePrice)}</p>
                <p className="mt-1 text-xs font-semibold text-white/64">{farmer.responseTime}</p>
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-slate-200 bg-slate-50/90 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Seller shelf
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Fast glance at live items
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
                  <Package className="h-3.5 w-3.5" />
                  {formatCompactNumber(farmer.totalOrders)} orders
                </span>
              </div>

              {spotlightProducts.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {spotlightProducts.map((product) => (
                    <span
                      key={product.id}
                      className={`inline-flex max-w-full items-center rounded-full border border-white/80 bg-gradient-to-r ${buildProductTone(
                        product.category
                      )} px-3 py-1.5 text-[11px] font-bold shadow-sm`}
                    >
                      <span className="truncate">{truncateText(product.name, 18)}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Fresh products will appear here as soon as this seller updates inventory.
                </p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <button
                type="button"
                onClick={() => onOpen(farmer)}
                className="inline-flex items-center justify-center gap-2 rounded-[1.35rem] bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Open seller
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMessage(farmer)}
                className="inline-flex h-[3.35rem] w-[3.35rem] items-center justify-center rounded-[1.35rem] border border-emerald-200 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                aria-label={`Message ${farmer.name}`}
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </button>
            </div>

            <span className="mx-auto block h-1.5 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </article>
  );
};

const HeroFarmerSlider = ({
  farmers,
  activeIndex,
  onSelect,
  onPrevious,
  onNext,
  onOpen,
  onMessage
}) => {
  if (!farmers.length) {
    return (
      <div className="rounded-[2rem] border border-white/12 bg-white/10 p-6 backdrop-blur-md">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/65">
          Featured farmers
        </p>
        <div className="mt-5 rounded-[1.8rem] border border-dashed border-white/12 bg-black/10 px-6 py-12 text-center">
          <p className="text-lg font-black text-white">Farmer cards will appear here</p>
          <p className="mt-2 text-sm leading-7 text-white/70">
            Once seller data loads, this first section will slide through featured farmers only.
          </p>
        </div>
      </div>
    );
  }

  const slideWidth = 100 / farmers.length;

  return (
    <div className="min-w-0 rounded-[2rem] border border-white/12 bg-white/10 p-4 shadow-[0_24px_70px_-32px_rgba(2,6,23,0.55)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/65">
            Featured farmers
          </p>
          <p className="mt-2 text-sm leading-7 text-white/72">
            Sliding cards in this section now display farmer profiles only.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/16"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/16"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.9rem]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            width: `${farmers.length * 100}%`,
            transform: `translateX(-${activeIndex * slideWidth}%)`
          }}
        >
          {farmers.map((farmer) => (
            <article
              key={farmer.id}
              className="flex-none"
              style={{ width: `${slideWidth}%` }}
            >
              <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-slate-950/30">
                <img
                  src={farmer.coverImage}
                  alt={farmer.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(2,6,23,0.92),rgba(15,23,42,0.74),rgba(6,95,70,0.66))]" />

                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                      <Shield className="h-3.5 w-3.5" />
                      Verified farmer
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-900 shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {farmer.rating}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.6rem] border-2 border-white/30 bg-white/12 text-xl font-black text-white backdrop-blur-sm">
                      {farmer.image ? (
                        <img
                          src={farmer.image}
                          alt={farmer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        buildInitials(farmer.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-2xl font-black text-white sm:text-[2rem]">
                        {farmer.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/78">
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {farmer.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {farmer.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 max-w-2xl text-sm leading-8 text-white/78">
                    {truncateText(farmer.bio, 150)}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/58">
                        Products
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">{farmer.totalProducts}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/58">
                        Avg price
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">
                        {formatCurrency(farmer.averagePrice)}
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/58">
                        Delivery
                      </p>
                      <p className="mt-2 text-base font-black text-white">{farmer.deliveryTime}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpen(farmer)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-50"
                    >
                      Open farmer profile
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMessage(farmer)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/10 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {farmers.map((farmer, index) => (
          <button
            key={farmer.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-left transition ${
              activeIndex === index
                ? 'border-white/28 bg-white/16 text-white'
                : 'border-white/10 bg-black/10 text-white/72 hover:bg-white/10'
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/12 text-xs font-black">
              {farmer.image ? (
                <img src={farmer.image} alt={farmer.name} className="h-full w-full object-cover" />
              ) : (
                buildInitials(farmer.name)
              )}
            </span>
            <span className="max-w-[8rem] truncate text-xs font-bold uppercase tracking-[0.14em]">
              {farmer.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({
  product,
  liked,
  inCart,
  quantity,
  onLike,
  onAddToCart,
  onIncrease,
  onDecrease
}) => (
  <article className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-35px_rgba(15,23,42,0.5)]">
    <div className="relative h-52 overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition duration-700 hover:scale-105"
      />
      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <span
          className={`rounded-full bg-gradient-to-r ${buildProductTone(
            product.category
          )} px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-sm`}
        >
          {product.category}
        </span>
        <button
          type="button"
          onClick={() => onLike(product.id)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            liked
              ? 'border-rose-200 bg-rose-500 text-white'
              : 'border-white/50 bg-white/80 text-slate-700 hover:bg-white'
          }`}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="absolute bottom-4 left-4">
        <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {product.harvestLabel}
        </span>
      </div>
    </div>

    <div className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-950">{product.name}</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">{product.farmingMethod}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-emerald-700">{formatCurrency(product.price)}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {product.unit}
          </p>
        </div>
      </div>

      <p className="text-sm leading-7 text-slate-600">{truncateText(product.description, 108)}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {product.rating} rating
        </span>
        <span>{product.reviews} reviews</span>
        <span>{product.inStock ? `${product.quantity} in stock` : 'Out of stock'}</span>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Delivery area: {product.address}
      </div>

      {inCart ? (
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => onDecrease(product.id)}
              className="px-3 py-3 text-slate-600 transition hover:text-slate-950"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 px-2 text-center text-sm font-black text-slate-950">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrease(product.id)}
              className="px-3 py-3 text-slate-600 transition hover:text-slate-950"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Remove from cart
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
            product.inStock
              ? 'bg-slate-950 text-white hover:bg-slate-800'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      )}
    </div>
  </article>
);

const MessagingPanel = ({
  farmer,
  messages,
  messageText,
  onChangeMessage,
  onClose,
  onSend
}) => (
  <div className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-sm">
    <div className="ml-auto flex h-full w-full max-w-xl flex-col bg-[#f8f6ef] shadow-[0_28px_80px_-24px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-sm font-black text-emerald-800">
            {farmer.image ? (
              <img src={farmer.image} alt={farmer.name} className="h-full w-full object-cover" />
            ) : (
              buildInitials(farmer.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-slate-950">{farmer.name}</p>
            <p className="text-sm text-slate-500">
              {farmer.isOnline ? 'Seller is online now' : `Seller was active ${farmer.lastSeen}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:text-slate-950"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <MessageCircle className="h-8 w-8" />
            </div>
            <p className="mt-5 text-xl font-black text-slate-950">Start the conversation</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-slate-600">
              Ask about freshness, stock updates, delivery windows, or product details before you
              place your order.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'rounded-br-md bg-slate-950 text-white'
                    : 'rounded-bl-md bg-white text-slate-900'
                }`}
              >
                <p className="text-sm leading-7">{message.text}</p>
                <p
                  className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    message.sender === 'user' ? 'text-white/65' : 'text-slate-400'
                  }`}
                >
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-[1.6rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <textarea
              rows={2}
              value={messageText}
              onChange={(event) => onChangeMessage(event.target.value)}
              placeholder={`Message ${farmer.name}...`}
              className="w-full resize-none border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SellerMarketplacePage = ({
  onBack,
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages
}) => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Map());
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFarmers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${FARMER_DIRECTORY_BASE}/farmers`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Unable to load sellers right now.');
        }

        const data = await response.json();
        const nextFarmers = Array.isArray(data) ? data.map(transformFarmer) : [];

        setFarmers(nextFarmers);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load sellers right now.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFarmers();

    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedFarmer?.id) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchSellerDetails = async () => {
      try {
        setDetailsLoading(true);

        const response = await fetch(`${FARMER_DIRECTORY_BASE}/farmers/${selectedFarmer.id}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Unable to refresh seller details.');
        }

        const data = await response.json();
        const transformed = transformFarmer(data);

        setSelectedFarmer((currentFarmer) =>
          currentFarmer?.id === transformed.id ? { ...currentFarmer, ...transformed } : currentFarmer
        );

        setFarmers((currentFarmers) =>
          currentFarmers.map((farmer) =>
            farmer.id === transformed.id ? { ...farmer, ...transformed } : farmer
          )
        );
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setDetailsLoading(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    };

    fetchSellerDetails();

    return () => controller.abort();
  }, [selectedFarmer?.id]);

  useEffect(() => {
    setMessageText('');
  }, [selectedFarmer?.id]);

  useEffect(() => {
    if (!selectedFarmer?.id) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [selectedFarmer?.id]);

  const totalProducts = farmers.reduce((sum, farmer) => sum + farmer.totalProducts, 0);
  const totalCities = new Set(farmers.map((farmer) => farmer.city).filter(Boolean)).size;
  const specialtyOptions = ['all', ...new Set(farmers.map((farmer) => farmer.specialty).filter(Boolean))];
  const cityOptions = ['all', ...new Set(farmers.map((farmer) => farmer.city).filter(Boolean))];

  const filteredFarmers = [...farmers]
    .filter((farmer) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        farmer.name.toLowerCase().includes(query) ||
        farmer.city.toLowerCase().includes(query) ||
        farmer.specialty.toLowerCase().includes(query) ||
        farmer.bio.toLowerCase().includes(query) ||
        farmer.products.some((product) => product.name.toLowerCase().includes(query));

      const matchesSpecialty =
        selectedSpecialty === 'all' || farmer.specialty === selectedSpecialty;
      const matchesCity = selectedCity === 'all' || farmer.city === selectedCity;

      return matchesQuery && matchesSpecialty && matchesCity;
    })
    .sort((firstFarmer, secondFarmer) => {
      switch (sortBy) {
        case 'rating':
          return secondFarmer.rating - firstFarmer.rating;
        case 'products':
          return secondFarmer.totalProducts - firstFarmer.totalProducts;
        case 'response':
          return (
            (RESPONSE_SORT_ORDER[firstFarmer.responseTime] ?? 99) -
            (RESPONSE_SORT_ORDER[secondFarmer.responseTime] ?? 99)
          );
        default:
          return (
            secondFarmer.rating +
            secondFarmer.totalProducts +
            (secondFarmer.isOnline ? 3 : 0) -
            (firstFarmer.rating + firstFarmer.totalProducts + (firstFarmer.isOnline ? 3 : 0))
          );
      }
    });

  const heroFarmers = filteredFarmers.slice(0, 4);
  const activeHeroFarmer = heroFarmers[heroSlideIndex] || filteredFarmers[0] || null;

  const totalCartItems = Array.from(cartItems.values()).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const cartTotal = Array.from(cartItems.values()).reduce(
    (sum, item) => sum + item.quantity * (Number(item.product.price) || 0),
    0
  );
  const sellerMessages = selectedFarmer
    ? messages.filter((message) => message.farmerId === selectedFarmer.id)
    : [];
  const productCategoryOptions = selectedFarmer
    ? ['all', ...new Set(selectedFarmer.products.map((product) => product.category).filter(Boolean))]
    : ['all'];
  const visibleProducts = selectedFarmer
    ? selectedFarmer.products.filter(
        (product) => selectedProductCategory === 'all' || product.category === selectedProductCategory
      )
    : [];

  const highlightCards = [
    {
      icon: Users,
      label: 'Active sellers',
      value: farmers.length || '0',
      detail: 'Curated customer-facing seller profiles.',
      accentClass: 'from-emerald-300 to-lime-200'
    },
    {
      icon: Package,
      label: 'Listed products',
      value: totalProducts || '0',
      detail: 'Live goods pulled directly from the marketplace backend.',
      accentClass: 'from-amber-300 to-yellow-200'
    },
    {
      icon: MapPin,
      label: 'Coverage',
      value: `${totalCities || 0} cities`,
      detail: 'Sellers surfaced across multiple Sri Lankan areas.',
      accentClass: 'from-sky-300 to-cyan-200'
    },
    {
      icon: TrendingUp,
      label: 'Fast replies',
      value: 'Under 2 hrs',
      detail: 'Profiles now surface response and fulfilment confidence clearly.',
      accentClass: 'from-rose-300 to-orange-200'
    }
  ];

  useEffect(() => {
    if (!heroFarmers.length) {
      setHeroSlideIndex(0);
      return;
    }

    setHeroSlideIndex((currentIndex) =>
      currentIndex >= heroFarmers.length ? 0 : currentIndex
    );
  }, [heroFarmers.length]);

  useEffect(() => {
    if (heroFarmers.length <= 1) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setHeroSlideIndex((currentIndex) => (currentIndex + 1) % heroFarmers.length);
    }, 4200);

    return () => window.clearInterval(slideTimer);
  }, [heroFarmers.length]);

  const toggleLike = (productId) => {
    setLikedProducts((currentLiked) => {
      const nextLiked = new Set(currentLiked);

      if (nextLiked.has(productId)) {
        nextLiked.delete(productId);
      } else {
        nextLiked.add(productId);
      }

      return nextLiked;
    });
  };

  const toggleCart = (product) => {
    setCartItems((currentCart) => {
      const nextCart = new Map(currentCart);

      if (nextCart.has(product.id)) {
        nextCart.delete(product.id);
      } else {
        nextCart.set(product.id, { product, quantity: 1 });
      }

      return nextCart;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((currentCart) => {
      const nextCart = new Map(currentCart);
      const currentItem = nextCart.get(productId);

      if (!currentItem) {
        return currentCart;
      }

      const nextQuantity = currentItem.quantity + delta;

      if (nextQuantity <= 0) {
        nextCart.delete(productId);
      } else {
        nextCart.set(productId, { ...currentItem, quantity: nextQuantity });
      }

      return nextCart;
    });
  };

  const openSeller = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedProductCategory('all');
    setShowMessaging(false);
  };

  const openMessaging = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedProductCategory('all');
    setShowMessaging(true);
  };

  const closeSellerView = () => {
    setSelectedFarmer(null);
    setShowMessaging(false);

    window.setTimeout(() => {
      document.getElementById('seller-directory')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 0);
  };

  const closeMessaging = () => setShowMessaging(false);

  const sendMessage = () => {
    if (!selectedFarmer || !messageText.trim()) {
      return;
    }

    const targetFarmer = selectedFarmer;
    const customerMessage = {
      id: `${targetFarmer.id}-${Date.now()}`,
      farmerId: targetFarmer.id,
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((currentMessages) => [...currentMessages, customerMessage]);
    setMessageText('');

    window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${targetFarmer.id}-${Date.now()}-reply`,
          farmerId: targetFarmer.id,
          sender: 'farmer',
          text: `Thanks for reaching out. ${targetFarmer.name} will share stock and delivery details shortly.`,
          timestamp: new Date().toISOString()
        }
      ]);
    }, 850);
  };

  const navbarActions = (
    <div className="hidden items-center gap-2 sm:flex">
      <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
        Cart {totalCartItems}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#f6f2e9] text-slate-950"
        style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
      >
        <CustomerNavbar
          isScrolled
          actions={navbarActions}
          onNavigateToHome={onNavigateToHome || onBack}
          onNavigateToProducts={onNavigateToProducts}
          onNavigateToSellers={onNavigateToSellers}
          onNavigateToMap={onNavigateToMap}
          onNavigateToMessages={onNavigateToMessages}
          onNavigateToAbout={onNavigateToHome || onBack}
        />

        <div className="flex min-h-screen items-center justify-center px-4 pt-24">
          <div className="w-full max-w-5xl rounded-[2.2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                <div className="h-14 animate-pulse rounded-[1.8rem] bg-slate-200" />
                <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-100" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((key) => (
                    <div key={key} className="h-40 animate-pulse rounded-[1.7rem] bg-slate-100" />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {[1, 2, 3].map((key) => (
                  <div key={key} className="h-32 animate-pulse rounded-[1.7rem] bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#f6f2e9] text-slate-950"
        style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
      >
        <CustomerNavbar
          isScrolled
          actions={navbarActions}
          onNavigateToHome={onNavigateToHome || onBack}
          onNavigateToProducts={onNavigateToProducts}
          onNavigateToSellers={onNavigateToSellers}
          onNavigateToMap={onNavigateToMap}
          onNavigateToMessages={onNavigateToMessages}
          onNavigateToAbout={onNavigateToHome || onBack}
        />

        <div className="flex min-h-screen items-center justify-center px-4 pt-24">
          <div className="w-full max-w-xl rounded-[2rem] border border-rose-200 bg-white/90 p-8 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <X className="h-8 w-8" />
            </div>
            <p className="mt-6 text-2xl font-black text-slate-950">Seller directory unavailable</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{error}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setRefreshKey((currentValue) => currentValue + 1)}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Retry loading
              </button>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  Back to customer panel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedFarmer) {
    return (
      <div
        className="min-h-screen overflow-x-hidden bg-[#f3eee2] text-slate-950"
        style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
      >
        <CustomerNavbar
          isScrolled
          actions={navbarActions}
          onNavigateToHome={onNavigateToHome || onBack}
          onNavigateToProducts={onNavigateToProducts}
          onNavigateToSellers={onNavigateToSellers}
          onNavigateToMap={onNavigateToMap}
          onNavigateToMessages={onNavigateToMessages}
          onNavigateToAbout={onNavigateToHome || onBack}
        />

        {showMessaging && (
          <MessagingPanel
            farmer={selectedFarmer}
            messages={sellerMessages}
            messageText={messageText}
            onChangeMessage={setMessageText}
            onClose={closeMessaging}
            onSend={sendMessage}
          />
        )}

        <main className="relative pt-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%)]" />
          <div className="pointer-events-none absolute -left-16 top-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-12 h-96 w-96 rounded-full bg-amber-300/24 blur-3xl" />

          <section className="relative isolate overflow-hidden border-b border-slate-200/60 bg-slate-950 text-white shadow-[0_36px_100px_-42px_rgba(15,23,42,0.72)]">
            <img
              src={selectedFarmer.coverImage}
              alt={selectedFarmer.name}
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_26%),linear-gradient(135deg,rgba(2,6,23,0.97),rgba(15,23,42,0.9),rgba(6,78,59,0.76))]" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />

            <div className="relative px-4 pb-10 pt-24 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={closeSellerView}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/16"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to sellers
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                    <Shield className="h-4 w-4" />
                    Full-screen customer seller view
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-sm">
                    <Check className="h-4 w-4" />
                    {selectedFarmer.isOnline ? 'Seller online now' : `Active ${selectedFarmer.lastSeen}`}
                  </span>
                  {detailsLoading && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/82 backdrop-blur-sm">
                      <Sparkles className="h-4 w-4" />
                      Refreshing live seller data
                    </span>
                  )}
                </div>
              </div>

              <div className="mx-auto mt-8 grid min-h-[calc(100vh-8rem)] max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div className="space-y-7 pb-2">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-white/30 bg-white/12 text-3xl font-black text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)] backdrop-blur-sm">
                      {selectedFarmer.image ? (
                        <img
                          src={selectedFarmer.image}
                          alt={selectedFarmer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        buildInitials(selectedFarmer.name)
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-200/92">
                        Seller identity
                      </p>
                      <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl xl:text-[4.35rem]">
                        {selectedFarmer.name}
                      </h1>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/82 sm:text-base">
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {selectedFarmer.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                          {selectedFarmer.rating} rating
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {selectedFarmer.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
                    {selectedFarmer.bio}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                      Specialty: {selectedFarmer.specialty}
                    </span>
                    <span className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                      Delivery: {selectedFarmer.deliveryTime}
                    </span>
                    <span className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                      Sustainability: {selectedFarmer.sustainability}%
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                        Products live
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">
                        {selectedFarmer.stats?.totalProducts || selectedFarmer.totalProducts}
                      </p>
                      <p className="mt-2 text-sm text-white/68">Available right now on this profile.</p>
                    </div>
                    <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                        Inventory
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">
                        {selectedFarmer.stats?.totalInventory || 0}
                      </p>
                      <p className="mt-2 text-sm text-white/68">Units prepared for customer orders.</p>
                    </div>
                    <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                        Average price
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">
                        {formatCurrency(selectedFarmer.stats?.averagePrice || selectedFarmer.averagePrice)}
                      </p>
                      <p className="mt-2 text-sm text-white/68">Clearer pricing visibility for buyers.</p>
                    </div>
                    <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                        Community reach
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">
                        {formatCompactNumber(selectedFarmer.followers)}
                      </p>
                      <p className="mt-2 text-sm text-white/68">Customers following this seller profile.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-white/14 bg-white/12 p-6 shadow-[0_28px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/64">
                        Quick connection
                      </p>
                      <h2 className="mt-3 text-2xl font-black text-white">
                        Message, call, or save this seller faster.
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {selectedFarmer.rating}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowMessaging(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-white px-4 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message seller
                    </button>
                    <a
                      href={`tel:${selectedFarmer.phone}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-white/18 bg-white/10 px-4 py-4 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      <Phone className="h-4 w-4" />
                      {selectedFarmer.phone}
                    </a>
                    <a
                      href={`mailto:${selectedFarmer.email}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-white/18 bg-white/10 px-4 py-4 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      <Mail className="h-4 w-4" />
                      Email seller
                    </a>
                  </div>

                  <div className="mt-6 rounded-[1.8rem] border border-white/12 bg-black/16 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Trust markers
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                          <Shield className="h-4 w-4 text-emerald-300" />
                          Verified profile
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          Approved for customer-facing marketplace display.
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                          <Clock className="h-4 w-4 text-amber-300" />
                          Reply speed
                        </p>
                        <p className="mt-2 text-sm text-white/70">{selectedFarmer.responseTime}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                          <TrendingUp className="h-4 w-4 text-sky-300" />
                          Dispatch speed
                        </p>
                        <p className="mt-2 text-sm text-white/70">{selectedFarmer.deliveryTime}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                          <Leaf className="h-4 w-4 text-lime-300" />
                          Sustainability
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          {selectedFarmer.sustainability}% profile score
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/10 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Base area
                    </p>
                    <p className="mt-3 text-base font-black text-white">{selectedFarmer.address}</p>
                    <p className="mt-2 text-sm leading-7 text-white/70">
                      Delivery and handoff planning can be discussed directly from this location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-8 grid max-w-7xl gap-4 lg:grid-cols-4">
                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <Wheat className="h-6 w-6 text-amber-200" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                    Specialty lane
                  </p>
                  <p className="mt-2 text-xl font-black text-white">{selectedFarmer.specialty}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    Clear produce focus for quicker customer trust.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-emerald-200" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                    Experience
                  </p>
                  <p className="mt-2 text-xl font-black text-white">{selectedFarmer.experience}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    A richer seller story on the customer page.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-sky-200" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                    Farm size
                  </p>
                  <p className="mt-2 text-xl font-black text-white">{selectedFarmer.farmSize}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    Added scale context helps buyers compare sellers quickly.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                    Orders served
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {formatCompactNumber(selectedFarmer.totalOrders)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    Marketplace momentum displayed in a stronger way.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                        Seller overview
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950">
                        A cleaner modern page for customer confidence
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      <Leaf className="h-4 w-4" />
                      {selectedFarmer.sustainability}% sustainability score
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-8 text-slate-600">{selectedFarmer.bio}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.6rem] bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Specialty
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">{selectedFarmer.specialty}</p>
                    </div>
                    <div className="rounded-[1.6rem] bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Experience
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        {selectedFarmer.experience}
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Farm size
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">{selectedFarmer.farmSize}</p>
                    </div>
                    <div className="rounded-[1.6rem] bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Orders served
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        {formatCompactNumber(selectedFarmer.totalOrders)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.8rem] bg-slate-950 p-5 text-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/58">
                          Customer trust pulse
                        </p>
                        <p className="mt-2 text-xl font-black">Stronger seller profile clarity</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/82">
                        <Shield className="h-4 w-4 text-emerald-300" />
                        Verified and visible
                      </span>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300"
                        style={{ width: `${selectedFarmer.sustainability}%` }}
                      />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                          Response
                        </p>
                        <p className="mt-2 text-base font-black text-white">{selectedFarmer.responseTime}</p>
                      </div>
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                          Delivery
                        </p>
                        <p className="mt-2 text-base font-black text-white">{selectedFarmer.deliveryTime}</p>
                      </div>
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                          Categories
                        </p>
                        <p className="mt-2 text-base font-black text-white">
                          {selectedFarmer.stats?.totalCategories || productCategoryOptions.length - 1 || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                        Live product shelf
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950">
                        Browse products from this seller
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategoryOptions.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedProductCategory(category)}
                          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                            selectedProductCategory === category
                              ? 'bg-slate-950 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleProducts.length === 0 ? (
                    <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <Package className="mx-auto h-10 w-10 text-slate-400" />
                      <p className="mt-4 text-lg font-black text-slate-950">No products in this filter</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Try another product category or come back after the seller updates inventory.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                      {visibleProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          liked={likedProducts.has(product.id)}
                          inCart={cartItems.has(product.id)}
                          quantity={cartItems.get(product.id)?.quantity || 0}
                          onLike={toggleLike}
                          onAddToCart={toggleCart}
                          onIncrease={(productId) => updateQuantity(productId, 1)}
                          onDecrease={(productId) => updateQuantity(productId, -1)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
                <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Contact details
                  </p>
                  <div className="mt-5 space-y-4">
                    <a
                      href={`tel:${selectedFarmer.phone}`}
                      className="block rounded-[1.4rem] bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Phone
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-950">{selectedFarmer.phone}</p>
                    </a>
                    <a
                      href={`mailto:${selectedFarmer.email}`}
                      className="block rounded-[1.4rem] bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Email
                      </p>
                      <p className="mt-2 break-all text-sm font-black text-slate-950">
                        {selectedFarmer.email}
                      </p>
                    </a>
                    <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Base area
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-950">{selectedFarmer.address}</p>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">
                    Customer confidence
                  </p>
                  <h3 className="mt-3 text-2xl font-black">Modern trust signals in one place.</h3>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Verified seller
                      </p>
                      <p className="mt-2 text-base font-black text-white">Marketplace approved</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Response window
                      </p>
                      <p className="mt-2 text-base font-black text-white">{selectedFarmer.responseTime}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Delivery promise
                      </p>
                      <p className="mt-2 text-base font-black text-white">{selectedFarmer.deliveryTime}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Cart summary
                  </p>
                  <div className="mt-5 rounded-[1.6rem] bg-slate-950 p-5 text-white">
                    <p className="text-sm font-semibold text-white/70">Items selected</p>
                    <p className="mt-2 text-3xl font-black">{totalCartItems}</p>
                    <p className="mt-3 text-sm text-white/75">
                      Estimated value {formatCurrency(cartTotal)}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {Array.from(cartItems.values()).slice(0, 3).map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between rounded-[1.4rem] bg-slate-50 px-4 py-3"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="truncate text-sm font-black text-slate-950">
                            {item.product.name}
                          </p>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-black text-emerald-700">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    {totalCartItems === 0 && (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm leading-7 text-slate-600">
                        Add products from any seller profile and the cart summary will appear here.
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#f6f2e9] text-slate-950"
      style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
    >
      <CustomerNavbar
        isScrolled
        actions={navbarActions}
        onNavigateToHome={onNavigateToHome || onBack}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={onNavigateToHome || onBack}
      />

      <main className="relative pt-24">
        <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />

        <div className="w-full px-4 pb-16 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2.6rem] bg-slate-950 text-white shadow-[0_32px_90px_-34px_rgba(15,23,42,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_38%),linear-gradient(130deg,rgba(2,6,23,0.98),rgba(15,23,42,0.92),rgba(6,95,70,0.78))]" />
            <div className="absolute right-[-8rem] top-[-5rem] h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl" />

            <div className="relative grid min-h-[calc(100vh-7.5rem)] items-center gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-12">
              <div className="min-w-0 space-y-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    Customer seller panel
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-emerald-400/18 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200 backdrop-blur-sm">
                    <Shield className="h-4 w-4" />
                    Modern trusted directory
                  </span>
                </div>

                <div>
                  <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-[3.7rem]">
                    Discover stronger seller profiles with a cleaner premium customer experience.
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-white/78 sm:text-base">
                    This seller page now opens with a full-screen farmer showcase, sliding profile
                    cards, better trust signals, and faster actions to move directly into a farmer
                    profile.
                  </p>
                  {activeHeroFarmer && (
                    <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-sm">
                      Now showing
                      <span className="text-white">{activeHeroFarmer.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('seller-filters')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-50"
                  >
                    Refine sellers
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {activeHeroFarmer && (
                    <button
                      type="button"
                      onClick={() => openSeller(activeHeroFarmer)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      View featured seller
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                      Verified sellers
                    </p>
                    <p className="mt-2 text-3xl font-black">{farmers.length}</p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                      Product coverage
                    </p>
                    <p className="mt-2 text-3xl font-black">{totalProducts}</p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/62">
                      Cities active
                    </p>
                    <p className="mt-2 text-3xl font-black">{totalCities}</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <HeroFarmerSlider
                  farmers={heroFarmers}
                  activeIndex={heroSlideIndex}
                  onSelect={setHeroSlideIndex}
                  onPrevious={() =>
                    setHeroSlideIndex((currentIndex) =>
                      heroFarmers.length
                        ? (currentIndex - 1 + heroFarmers.length) % heroFarmers.length
                        : 0
                    )
                  }
                  onNext={() =>
                    setHeroSlideIndex((currentIndex) =>
                      heroFarmers.length ? (currentIndex + 1) % heroFarmers.length : 0
                    )
                  }
                  onOpen={openSeller}
                  onMessage={openMessaging}
                />
              </div>
            </div>
          </section>

          <section
            id="seller-filters"
            className="mt-8 rounded-[2.2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Filter sellers
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Cleaner discovery controls
                </h2>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                {filteredFarmers.length} sellers matching the current filters.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search sellers, cities, specialties, or product names..."
                  className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              <label className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(event) => setSelectedSpecialty(event.target.value)}
                  className="w-full border-none bg-transparent py-4 text-sm font-semibold text-slate-900 outline-none"
                >
                  <option value="all">All specialties</option>
                  {specialtyOptions
                    .filter((option) => option !== 'all')
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4">
                <MapPin className="h-5 w-5 text-slate-400" />
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="w-full border-none bg-transparent py-4 text-sm font-semibold text-slate-900 outline-none"
                >
                  <option value="all">All cities</option>
                  {cityOptions
                    .filter((option) => option !== 'all')
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4">
                <TrendingUp className="h-5 w-5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full border-none bg-transparent py-4 text-sm font-semibold text-slate-900 outline-none"
                >
                  <option value="featured">Featured first</option>
                  <option value="rating">Highest rated</option>
                  <option value="products">Most products</option>
                  <option value="response">Fastest response</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {specialtyOptions.slice(1, 7).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedSpecialty(option)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                    selectedSpecialty === option
                      ? 'bg-slate-950 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {highlightCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          <section id="seller-directory" className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Seller list
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  Modern seller cards for customers
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600">
                Each seller now appears as a premium mobile-style preview with stronger identity,
                cleaner trust signals, and faster customer actions.
              </p>
            </div>

            {filteredFarmers.length === 0 ? (
              <div className="mt-6 rounded-[2.2rem] border border-dashed border-slate-300 bg-white/75 p-10 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.34)]">
                <Search className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-5 text-2xl font-black text-slate-950">No sellers found</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Try a broader search term, remove a location filter, or switch back to featured
                  sorting.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredFarmers.map((farmer) => (
                  <FarmerCard
                    key={farmer.id}
                    farmer={farmer}
                    onOpen={openSeller}
                    onMessage={openMessaging}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 overflow-hidden rounded-[2.4rem] border border-slate-200 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 text-white shadow-[0_30px_90px_-34px_rgba(15,23,42,0.62)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">
                  Customer experience upgrade
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  Sellers now feel like a premium marketplace, not a basic list.
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78">
                  The redesign brings clearer discovery, faster actions, and stronger confidence
                  signals so customers can move from seller browsing to product trust much more
                  smoothly.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-emerald-200" />
                  <p className="mt-4 text-lg font-black">Verified look</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">Trust-first visuals and clearer seller cues.</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <Wheat className="h-6 w-6 text-amber-200" />
                  <p className="mt-4 text-lg font-black">Better context</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">Specialty, location, response, and product depth surface faster.</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <ShoppingCart className="h-6 w-6 text-sky-200" />
                  <p className="mt-4 text-lg font-black">Action ready</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">Explore, message, and shop from a cleaner responsive flow.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SellerMarketplacePage;
