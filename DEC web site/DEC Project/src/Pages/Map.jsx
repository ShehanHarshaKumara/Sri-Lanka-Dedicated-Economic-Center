import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import {
  Activity,
  Apple,
  ArrowRight,
  Carrot,
  Clock,
  Filter,
  Flame,
  Layers,
  Leaf,
  MapPin,
  Maximize,
  Minimize,
  Package,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wheat,
  X
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CustomerNavbar from '../components/CustomerNavbar';

const SRI_LANKA_CENTER = [7.8731, 80.7718];

const DISTRICT_DATA = [
  {
    name: 'Nuwara Eliya',
    latitude: 6.97078,
    longitude: 80.78286,
    crops: ['Carrots', 'Leeks', 'Beetroot', 'Cabbage', 'Cauliflower'],
    fruits: ['Strawberry'],
    nuts: [],
    chili: [],
    other: ['Potatoes', 'Tea'],
    region: 'Upcountry',
    elevation: '1868m',
    climate: 'Temperate',
    economicValue: 'High',
    exportPotential: 'Premium'
  },
  {
    name: 'Badulla',
    latitude: 6.9895,
    longitude: 81.0557,
    crops: ['Carrots', 'Leeks', 'Potatoes'],
    fruits: [],
    nuts: [],
    chili: [],
    other: ['Tea'],
    region: 'Upcountry',
    elevation: '680m',
    climate: 'Sub-tropical',
    economicValue: 'Medium',
    exportPotential: 'Moderate'
  },
  {
    name: 'Anuradhapura',
    latitude: 8.31135,
    longitude: 80.40365,
    crops: ['Onion', 'Pumpkins'],
    fruits: ['Banana', 'Mango', 'Wood Apple'],
    nuts: ['Cashew'],
    chili: ['Chilli'],
    other: ['Rice'],
    region: 'Dry Zone',
    elevation: '81m',
    climate: 'Tropical Dry',
    economicValue: 'High',
    exportPotential: 'High'
  },
  {
    name: 'Monaragala',
    latitude: 6.8726,
    longitude: 81.3507,
    crops: ['Onion'],
    fruits: ['Banana', 'Mango', 'Papaya', 'Guava'],
    nuts: [],
    chili: ['Chilli'],
    other: [],
    region: 'Dry Zone',
    elevation: '200m',
    climate: 'Tropical Dry',
    economicValue: 'Medium',
    exportPotential: 'Moderate'
  },
  {
    name: 'Polonnaruwa',
    latitude: 7.932857,
    longitude: 81.008087,
    crops: ['Onion'],
    fruits: [],
    nuts: [],
    chili: ['Chilli'],
    other: ['Rice'],
    region: 'Dry Zone',
    elevation: '58m',
    climate: 'Tropical Dry',
    economicValue: 'Medium',
    exportPotential: 'Low'
  },
  {
    name: 'Kurunegala',
    latitude: 7.4863,
    longitude: 80.3623,
    crops: [],
    fruits: ['Banana', 'Mango', 'Pineapple'],
    nuts: ['Cashew'],
    chili: [],
    other: ['Coconut'],
    region: 'Intermediate Zone',
    elevation: '116m',
    climate: 'Tropical Intermediate',
    economicValue: 'High',
    exportPotential: 'High'
  },
  {
    name: 'Gampaha',
    latitude: 7.0846,
    longitude: 80.0091,
    crops: [],
    fruits: ['Pineapple'],
    nuts: [],
    chili: [],
    other: ['Rubber'],
    region: 'Low Country Wet Zone',
    elevation: '12m',
    climate: 'Tropical Wet',
    economicValue: 'High',
    exportPotential: 'Very High'
  },
  {
    name: 'Hambantota',
    latitude: 6.1249,
    longitude: 81.1188,
    crops: ['Pumpkins', 'Gourds'],
    fruits: ['Guava', 'Papaya', 'Watermelon'],
    nuts: [],
    chili: [],
    other: ['Salt'],
    region: 'Dry Zone',
    elevation: '18m',
    climate: 'Tropical Dry',
    economicValue: 'Medium',
    exportPotential: 'Moderate'
  },
  {
    name: 'Ampara',
    latitude: 7.3019,
    longitude: 81.682,
    crops: [],
    fruits: ['Guava', 'Papaya'],
    nuts: [],
    chili: [],
    other: ['Rice'],
    region: 'Dry Zone',
    elevation: '27m',
    climate: 'Tropical Dry',
    economicValue: 'Low',
    exportPotential: 'Low'
  },
  {
    name: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    crops: ['Beans', 'Cabbage'],
    fruits: ['Avocado', 'Passion Fruit', 'Oranges'],
    nuts: [],
    chili: [],
    other: ['Tea', 'Spices'],
    region: 'Hill Country',
    elevation: '465m',
    climate: 'Tropical Highland',
    economicValue: 'Very High',
    exportPotential: 'Premium'
  },
  {
    name: 'Galle',
    latitude: 6.0535,
    longitude: 80.221,
    crops: ['Brinjal', 'Okra'],
    fruits: ['Pineapple', 'Avocado'],
    nuts: [],
    chili: [],
    other: ['Cinnamon', 'Fishing'],
    region: 'Low Country Wet Zone',
    elevation: '13m',
    climate: 'Tropical Wet',
    economicValue: 'High',
    exportPotential: 'Very High'
  },
  {
    name: 'Jaffna',
    latitude: 9.6615,
    longitude: 80.0255,
    crops: [],
    fruits: ['Palmyrah', 'Watermelon', 'Banana'],
    nuts: ['Cashew'],
    chili: [],
    other: ['Fishing'],
    region: 'Coastal Areas',
    elevation: '3m',
    climate: 'Tropical Dry Coastal',
    economicValue: 'Medium',
    exportPotential: 'Moderate'
  },
  {
    name: 'Matale',
    latitude: 7.4675,
    longitude: 80.6234,
    crops: ['Brinjal', 'Tomato'],
    fruits: ['Banana', 'Papaya'],
    nuts: [],
    chili: ['Chilli'],
    other: ['Spices'],
    region: 'Hill Country',
    elevation: '364m',
    climate: 'Tropical Highland',
    economicValue: 'High',
    exportPotential: 'High'
  },
  {
    name: 'Ratnapura',
    latitude: 6.6844,
    longitude: 80.3996,
    crops: [],
    fruits: ['Mango', 'Jackfruit'],
    nuts: [],
    chili: [],
    other: ['Rubber', 'Gems'],
    region: 'Low Country Wet Zone',
    elevation: '34m',
    climate: 'Tropical Wet',
    economicValue: 'Very High',
    exportPotential: 'Premium'
  }
];

const CATEGORY_META = {
  vegetables: {
    label: 'Vegetables',
    key: 'crops',
    icon: Carrot,
    marker: '#10b981',
    softClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    strongClass: 'bg-emerald-600 text-white'
  },
  fruits: {
    label: 'Fruits',
    key: 'fruits',
    icon: Apple,
    marker: '#f59e0b',
    softClass: 'border-amber-200 bg-amber-50 text-amber-700',
    strongClass: 'bg-amber-500 text-slate-950'
  },
  nuts: {
    label: 'Nuts',
    key: 'nuts',
    icon: Package,
    marker: '#64748b',
    softClass: 'border-slate-200 bg-slate-50 text-slate-700',
    strongClass: 'bg-slate-700 text-white'
  },
  chili: {
    label: 'Chili',
    key: 'chili',
    icon: Flame,
    marker: '#ef4444',
    softClass: 'border-rose-200 bg-rose-50 text-rose-700',
    strongClass: 'bg-rose-600 text-white'
  },
  other: {
    label: 'Other Goods',
    key: 'other',
    icon: Layers,
    marker: '#0ea5e9',
    softClass: 'border-sky-200 bg-sky-50 text-sky-700',
    strongClass: 'bg-sky-600 text-white'
  }
};

const MARKER_GLYPHS = {
  vegetables: '🥕',
  fruits: '🍎',
  nuts: '🥜',
  chili: '🌶️',
  other: '📦'
};

const ECONOMIC_VALUE_SCORE = {
  Low: 1,
  Medium: 2,
  High: 3,
  'Very High': 4
};

const EXPORT_SCORE = {
  Low: 1,
  Moderate: 2,
  High: 3,
  'Very High': 4,
  Premium: 5
};

const REGION_GRADIENTS = {
  Upcountry: 'from-emerald-500/18 via-white to-lime-200/18',
  'Dry Zone': 'from-amber-500/18 via-white to-orange-200/18',
  'Intermediate Zone': 'from-sky-500/18 via-white to-cyan-200/18',
  'Low Country Wet Zone': 'from-teal-500/18 via-white to-emerald-200/18',
  'Hill Country': 'from-indigo-500/16 via-white to-sky-200/18',
  'Coastal Areas': 'from-cyan-500/18 via-white to-blue-200/18'
};

const toId = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildShortLabel = (name) => {
  const parts = String(name || '')
    .split(' ')
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }

  return String(name || 'EC')
    .slice(0, 2)
    .toUpperCase();
};

const normalizeDistrict = (district) => {
  const productGroups = {
    vegetables: district.crops || [],
    fruits: district.fruits || [],
    nuts: district.nuts || [],
    chili: district.chili || [],
    other: district.other || []
  };

  const activeCategories = Object.keys(productGroups).filter(
    (category) => productGroups[category].length > 0
  );
  const totalProducts = Object.values(productGroups).reduce((sum, items) => sum + items.length, 0);
  const primaryCategory =
    [...activeCategories].sort(
      (first, second) => productGroups[second].length - productGroups[first].length
    )[0] || 'other';
  const primaryProducts = [
    ...productGroups.vegetables,
    ...productGroups.fruits,
    ...productGroups.other
  ].slice(0, 4);
  const marketScore =
    totalProducts * 7 +
    (ECONOMIC_VALUE_SCORE[district.economicValue] || 1) * 18 +
    (EXPORT_SCORE[district.exportPotential] || 1) * 14 +
    activeCategories.length * 6;
  const readinessScore = Math.min(
    98,
    36 +
      totalProducts * 4 +
      (ECONOMIC_VALUE_SCORE[district.economicValue] || 1) * 8 +
      (EXPORT_SCORE[district.exportPotential] || 1) * 7
  );

  return {
    ...district,
    id: toId(district.name),
    shortLabel: buildShortLabel(district.name),
    productGroups,
    activeCategories,
    totalProducts,
    primaryCategory,
    primaryProducts,
    marketScore,
    readinessScore
  };
};

const DISTRICTS = DISTRICT_DATA.map(normalizeDistrict);

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const buildDistrictNarrative = (district) => {
  const products = district.primaryProducts.slice(0, 2).join(' and ');
  return `${district.name} combines ${district.climate.toLowerCase()} conditions with ${products || 'diverse produce'} for a ${district.exportPotential.toLowerCase()} outward trade profile.`;
};

const buildDistrictSignals = (district) => [
  {
    label: 'Trade strength',
    value: district.exportPotential,
    detail: `${district.economicValue} value production lane`
  },
  {
    label: 'Production spread',
    value: `${district.totalProducts} lines`,
    detail: `${district.activeCategories.length} active product clusters`
  },
  {
    label: 'Readiness score',
    value: `${district.readinessScore}%`,
    detail: `Derived from export, value, and supply breadth`
  }
];

const buildMarkerIcon = (district, isActive = false) => {
  const category = CATEGORY_META[district.primaryCategory] || CATEGORY_META.other;
  const size = isActive ? 58 : district.totalProducts >= 8 ? 52 : district.totalProducts >= 5 ? 48 : 44;
  const scale = isActive ? 1.05 : 1;
  const glyph = MARKER_GLYPHS[district.primaryCategory] || '📍';

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 18}px;
        transform: scale(${scale});
        transition: transform 180ms ease;
      ">
        ${
          isActive
            ? `<span style="
                position:absolute;
                inset:-6px;
                border-radius:999px;
                border:2px solid rgba(255,255,255,0.7);
                box-shadow:0 0 0 10px rgba(16,185,129,0.18);
              "></span>`
            : ''
        }
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 999px;
          background: linear-gradient(145deg, ${category.marker}, #0f172a);
          border: 3px solid rgba(255,255,255,0.98);
          box-shadow: 0 18px 40px -20px rgba(15,23,42,0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${Math.max(18, size * 0.44)}px;
          font-weight: 800;
        ">
          ${glyph}
        </div>
        <span style="
          position: absolute;
          right: -4px;
          top: -4px;
          min-width: ${Math.max(18, size * 0.38)}px;
          height: ${Math.max(18, size * 0.38)}px;
          padding: 0 5px;
          border-radius: 999px;
          background: ${isActive ? '#f8fafc' : '#ffffff'};
          color: #0f172a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          box-shadow: 0 10px 24px -14px rgba(15,23,42,0.72);
        ">
          ${district.totalProducts}
        </span>
        <span style="
          position:absolute;
          left:50%;
          bottom:0;
          transform:translateX(-50%);
          min-width:${Math.max(38, size - 4)}px;
          height:18px;
          padding:0 8px;
          border-radius:999px;
          background:rgba(15,23,42,0.92);
          color:#ffffff;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          font-size:10px;
          font-weight:800;
          letter-spacing:0.08em;
          box-shadow:0 10px 24px -16px rgba(15,23,42,0.72);
        ">
          ${district.shortLabel}
        </span>
      </div>
    `,
    className: 'market-marker',
    iconSize: [size, size + 18],
    iconAnchor: [size / 2, size / 2 + 4],
    popupAnchor: [0, -size / 2]
  });
};

const MetricCard = ({ icon, label, value, detail, accentClass }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-[1.7rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur-sm">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClass}`}
      >
        <IconComponent className="h-5 w-5 text-slate-950" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p>
    </div>
  );
};

const FilterPill = ({ active, children, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-4 ${compact ? 'py-2.5' : 'py-3'} text-sm font-bold transition ${
      active
        ? 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.6)]'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

const ProductGroupCard = ({ categoryId, items }) => {
  const category = CATEGORY_META[categoryId];
  const IconComponent = category.icon;

  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.32)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${category.softClass}`}
        >
          <IconComponent className="h-4 w-4" />
          {category.label}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {items.length} lines
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const MapViewportController = ({ districts, selectedDistrict, expandedMap }) => {
  const map = useMap();
  const previousSelection = useRef(null);

  useEffect(() => {
    if (selectedDistrict) {
      const isSameDistrict = previousSelection.current === selectedDistrict.id;
      map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], expandedMap ? 9 : 8, {
        animate: true,
        duration: isSameDistrict ? 0.45 : 0.9
      });
      previousSelection.current = selectedDistrict.id;
      return;
    }

    if (!districts.length) {
      map.setView(SRI_LANKA_CENTER, 7);
      previousSelection.current = null;
      return;
    }

    const bounds = L.latLngBounds(districts.map((district) => [district.latitude, district.longitude]));
    map.fitBounds(bounds.pad(0.18), {
      maxZoom: expandedMap ? 8 : 7,
      animate: true,
      duration: 0.85
    });
    previousSelection.current = null;
  }, [districts, expandedMap, map, selectedDistrict]);

  return null;
};

const MarketMap = ({
  districts,
  selectedDistrict,
  onDistrictSelect,
  expandedMap
}) => (
  <div className="market-map relative w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)]">
    <div
      className={`w-full transition-[height] duration-300 ${
        expandedMap
          ? 'h-[calc(100vh-8.5rem)] min-h-[42rem]'
          : 'h-[68vh] min-h-[34rem]'
      }`}
    >
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={7}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapViewportController
          districts={districts}
          selectedDistrict={selectedDistrict}
          expandedMap={expandedMap}
        />

        {districts.map((district) => (
          <Marker
            key={district.id}
            position={[district.latitude, district.longitude]}
            icon={buildMarkerIcon(district, selectedDistrict?.id === district.id)}
            eventHandlers={{
              click: () => onDistrictSelect(district)
            }}
          >
            <Tooltip direction="top" opacity={1} offset={[0, -10]} className="market-tooltip">
              <div className="rounded-[1.3rem] border border-slate-200 bg-white/96 px-4 py-3 shadow-[0_22px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                <p className="text-sm font-black text-slate-950">{district.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {district.region}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {district.primaryProducts.slice(0, 3).join(', ')}
                </p>
              </div>
            </Tooltip>

            <Popup closeButton={false} offset={[0, -12]}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                      Smart district view
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{district.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {district.region} / {district.climate}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                    {district.totalProducts} lines
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Economic value
                    </p>
                    <p className="mt-2 text-base font-black text-slate-950">{district.economicValue}</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Export outlook
                    </p>
                    <p className="mt-2 text-base font-black text-slate-950">{district.exportPotential}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">{buildDistrictNarrative(district)}</p>

                <button
                  type="button"
                  onClick={() => onDistrictSelect(district)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Open district intelligence
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  </div>
);

function MapPage({
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages
}) {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [expandedMap, setExpandedMap] = useState(true);

  const regions = ['all', ...new Set(DISTRICTS.map((district) => district.region))];

  const regionScopedDistricts =
    selectedRegion === 'all'
      ? DISTRICTS
      : DISTRICTS.filter((district) => district.region === selectedRegion);

  const visibleDistricts = regionScopedDistricts.filter((district) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      district.name.toLowerCase().includes(normalizedQuery) ||
      district.region.toLowerCase().includes(normalizedQuery) ||
      district.climate.toLowerCase().includes(normalizedQuery) ||
      district.primaryProducts.some((product) => product.toLowerCase().includes(normalizedQuery)) ||
      district.activeCategories.some((categoryId) =>
        CATEGORY_META[categoryId].label.toLowerCase().includes(normalizedQuery)
      );

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((categoryId) => district.productGroups[categoryId].length > 0);

    return matchesQuery && matchesCategory;
  });

  const rankedVisibleDistricts = [...visibleDistricts].sort(
    (firstDistrict, secondDistrict) => secondDistrict.marketScore - firstDistrict.marketScore
  );

  useEffect(() => {
    if (!rankedVisibleDistricts.length) {
      if (selectedDistrictId !== null) {
        setSelectedDistrictId(null);
      }
      return;
    }

    const stillVisible = rankedVisibleDistricts.some((district) => district.id === selectedDistrictId);

    if (!stillVisible) {
      setSelectedDistrictId(rankedVisibleDistricts[0].id);
    }
  }, [rankedVisibleDistricts, selectedDistrictId]);

  useEffect(() => {
    if (!selectedDistrictId || window.innerWidth >= 1024) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById('smart-district-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 140);

    return () => window.clearTimeout(timer);
  }, [selectedDistrictId]);

  const selectedDistrict =
    DISTRICTS.find((district) => district.id === selectedDistrictId) || null;

  const visibleProductLines = visibleDistricts.reduce(
    (sum, district) => sum + district.totalProducts,
    0
  );
  const exportReadyCount = visibleDistricts.filter(
    (district) => (EXPORT_SCORE[district.exportPotential] || 0) >= 3
  ).length;
  const highValueCount = visibleDistricts.filter(
    (district) => (ECONOMIC_VALUE_SCORE[district.economicValue] || 0) >= 3
  ).length;
  const averageReadiness = visibleDistricts.length
    ? Math.round(
        visibleDistricts.reduce((sum, district) => sum + district.readinessScore, 0) /
          visibleDistricts.length
      )
    : 0;

  const regionBreakdown = regions
    .filter((region) => region !== 'all')
    .map((region) => ({
      region,
      count: DISTRICTS.filter((district) => district.region === region).length
    }))
    .sort((firstRegion, secondRegion) => secondRegion.count - firstRegion.count);

  const leadingRegion = (() => {
    const counts = {};
    visibleDistricts.forEach((district) => {
      counts[district.region] = (counts[district.region] || 0) + 1;
    });

    return Object.entries(counts).sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])[0]?.[0];
  })();

  const categoryTotals = Object.keys(CATEGORY_META).map((categoryId) => ({
    id: categoryId,
    totalProducts: visibleDistricts.reduce(
      (sum, district) => sum + district.productGroups[categoryId].length,
      0
    ),
    activeDistricts: visibleDistricts.filter(
      (district) => district.productGroups[categoryId].length > 0
    ).length
  }));

  const leadingCategory = [...categoryTotals].sort(
    (firstCategory, secondCategory) => secondCategory.totalProducts - firstCategory.totalProducts
  )[0];

  const searchResults =
    searchQuery.trim().length > 0 ? rankedVisibleDistricts.slice(0, 6) : [];

  const clearFilters = () => {
    setSelectedRegion('all');
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(categoryId)
        ? currentCategories.filter((currentCategoryId) => currentCategoryId !== categoryId)
        : [...currentCategories, categoryId]
    );
  };

  const heroMetrics = [
    {
      icon: MapPin,
      label: 'Visible centers',
      value: visibleDistricts.length,
      detail: 'District-level production hubs inside the current smart view.',
      accentClass: 'from-emerald-300 to-lime-200'
    },
    {
      icon: Package,
      label: 'Product lines',
      value: visibleProductLines,
      detail: 'Combined agricultural lines surfaced by the active filters.',
      accentClass: 'from-amber-300 to-orange-200'
    },
    {
      icon: TrendingUp,
      label: 'Export ready',
      value: exportReadyCount,
      detail: 'Centers with high, very high, or premium outward trade strength.',
      accentClass: 'from-sky-300 to-cyan-200'
    },
    {
      icon: Shield,
      label: 'Readiness',
      value: `${averageReadiness}%`,
      detail: 'A blended readiness signal built from value, export, and supply spread.',
      accentClass: 'from-rose-300 to-orange-200'
    }
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#f3efe5] text-slate-950"
      style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
    >
      <CustomerNavbar
        isScrolled
        onNavigateToHome={onNavigateToHome}
        onNavigateToProducts={onNavigateToProducts}
        onNavigateToSellers={onNavigateToSellers}
        onNavigateToMap={onNavigateToMap || onNavigateToHome}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToAbout={onNavigateToHome}
      />

      <main className="relative pt-24">
        <div className="pointer-events-none absolute left-[-6rem] top-16 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5rem] top-8 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[95rem] overflow-hidden rounded-[2.8rem] bg-slate-950 text-white shadow-[0_34px_90px_-34px_rgba(15,23,42,0.72)]">
            <div className="absolute" />
            <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_28%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.92),rgba(6,78,59,0.82))] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                      <Sparkles className="h-4 w-4" />
                      Smart market map
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-sm">
                      <Activity className="h-4 w-4" />
                      Advanced district intelligence
                    </span>
                  </div>

                  <div>
                    <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-[3.9rem]">
                      A modern, smarter Sri Lanka economic center map for customer discovery.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm leading-8 text-white/76 sm:text-base">
                      The old map page showed centers, but it did not help customers quickly understand
                      value, export strength, product focus, or priority regions. This redesigned page
                      turns the map into a cleaner decision surface with search, filter logic, market
                      scores, and district intelligence.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <FilterPill active={selectedRegion === 'all'} onClick={() => setSelectedRegion('all')}>
                      Nationwide view
                    </FilterPill>
                    {leadingRegion && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-3 text-sm font-semibold text-white/88 backdrop-blur-sm">
                        <MapPin className="h-4 w-4 text-emerald-200" />
                        Leading visible region: {leadingRegion}
                      </span>
                    )}
                    {leadingCategory && leadingCategory.totalProducts > 0 && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-3 text-sm font-semibold text-white/88 backdrop-blur-sm">
                        <Wheat className="h-4 w-4 text-amber-200" />
                        Strongest visible lane: {CATEGORY_META[leadingCategory.id].label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-white/14 bg-white/10 p-6 shadow-[0_28px_70px_-30px_rgba(15,23,42,0.62)] backdrop-blur-md">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/62">
                    Smart overview
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        Market focus
                      </p>
                      <p className="mt-3 text-2xl font-black text-white">
                        {leadingCategory && leadingCategory.totalProducts > 0
                          ? CATEGORY_META[leadingCategory.id].label
                          : 'No active lane'}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        Based on visible filtered product depth across the network.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        High-value hubs
                      </p>
                      <p className="mt-3 text-2xl font-black text-white">{highValueCount}</p>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        Production centers flagged as high or very high economic value.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        Why this redesign is stronger
                      </p>
                      <p className="mt-3 text-sm leading-8 text-white/76">
                        Customers can now move from map exploration to meaningful district decisions
                        much faster: the page highlights visible centers, filtered product lanes,
                        export-ready clusters, and selected district intelligence in one coherent flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[95rem]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[95rem]">
            <div className="grid gap-6">
              <div className="space-y-6">
                <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                        Interactive map
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-slate-950">
                        Full-screen customer-first district intelligence
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
                        Search a center, narrow the view by region or product lane, and click any
                        market marker to open a smarter district profile. The map now fills the page
                        much more strongly, so customers can explore Sri Lanka centers like a modern
                        live marketplace surface instead of a small embedded locator.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedMap((currentValue) => !currentValue)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                      >
                        {expandedMap ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        {expandedMap ? 'Compact map' : 'Full-screen map'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search districts, climates, or top products..."
                          className="w-full rounded-[1.5rem] border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        {searchQuery.trim().length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-[500] mt-3 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.42)]">
                            {searchResults.length > 0 ? (
                              searchResults.map((district) => (
                                <button
                                  key={district.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDistrictId(district.id);
                                    setSearchQuery('');
                                  }}
                                  className="flex w-full items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 last:border-b-0"
                                >
                                  <div>
                                    <p className="font-black text-slate-950">{district.name}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {district.region} / {district.climate}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                                    {district.totalProducts} lines
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-5 py-5 text-sm text-slate-500">
                                No visible districts match the current search and filters.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          {visibleDistricts.length} visible hubs
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                          <TrendingUp className="h-4 w-4 text-sky-600" />
                          {visibleProductLines} product lines
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <MarketMap
                      districts={visibleDistricts}
                      selectedDistrict={selectedDistrict}
                      onDistrictSelect={(district) => setSelectedDistrictId(district.id)}
                      expandedMap={expandedMap}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {Object.entries(CATEGORY_META).map(([categoryId, category]) => {
                      const IconComponent = category.icon;

                      return (
                        <span
                          key={categoryId}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] ${category.softClass}`}
                        >
                          <IconComponent className="h-4 w-4" />
                          {category.label}
                        </span>
                      );
                    })}
                  </div>
                </section>

                <section
                  id="smart-district-panel"
                  className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm"
                >
                  {selectedDistrict ? (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Selected district
                          </p>
                          <h2 className="mt-2 text-3xl font-black text-slate-950">
                            {selectedDistrict.name}
                          </h2>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
                              {selectedDistrict.region}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
                              {selectedDistrict.climate}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
                              {selectedDistrict.elevation}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`rounded-[1.7rem] border border-slate-200 bg-gradient-to-br p-5 text-right shadow-[0_14px_30px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm ${
                            REGION_GRADIENTS[selectedDistrict.region] ||
                            'from-slate-100 via-white to-emerald-100/20'
                          }`}
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Market score
                          </p>
                          <p className="mt-2 text-4xl font-black text-slate-950">
                            {formatCompactNumber(selectedDistrict.marketScore)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Smart score built from export, value, and supply breadth.
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-8 text-slate-600">
                        {buildDistrictNarrative(selectedDistrict)}
                      </p>

                      <div className="grid gap-4 md:grid-cols-3">
                        {buildDistrictSignals(selectedDistrict).map((signal) => (
                          <div
                            key={signal.label}
                            className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {signal.label}
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-950">{signal.value}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{signal.detail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {selectedDistrict.activeCategories.map((categoryId) => (
                          <ProductGroupCard
                            key={categoryId}
                            categoryId={categoryId}
                            items={selectedDistrict.productGroups[categoryId]}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <MapPin className="mx-auto h-10 w-10 text-slate-400" />
                      <p className="mt-4 text-xl font-black text-slate-950">No district selected</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Click any visible map marker to open the smarter district intelligence panel.
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <aside className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                        Region filters
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-slate-950">
                        Explore by operational zone
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-100"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {regions.map((region) => (
                      <FilterPill
                        key={region}
                        active={selectedRegion === region}
                        onClick={() => setSelectedRegion(region)}
                        compact
                      >
                        {region === 'all' ? 'All regions' : region}
                      </FilterPill>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {regionBreakdown.slice(0, 5).map((regionItem) => (
                      <div
                        key={regionItem.region}
                        className="flex items-center justify-between rounded-[1.4rem] bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-bold text-slate-800">{regionItem.region}</span>
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          {regionItem.count} hubs
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Product lanes
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Turn on the categories you want
                  </h3>

                  <div className="mt-5 space-y-3">
                    {Object.entries(CATEGORY_META).map(([categoryId, category]) => {
                      const categoryTotal = categoryTotals.find((item) => item.id === categoryId);
                      const IconComponent = category.icon;

                      return (
                        <button
                          key={categoryId}
                          type="button"
                          onClick={() => toggleCategory(categoryId)}
                          className={`w-full rounded-[1.6rem] border px-4 py-4 text-left transition ${
                            selectedCategories.includes(categoryId)
                              ? `${category.softClass} shadow-[0_18px_35px_-24px_rgba(15,23,42,0.32)]`
                              : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                                selectedCategories.includes(categoryId)
                                  ? category.strongClass
                                  : 'bg-white text-slate-700'
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-black">{category.label}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {categoryTotal?.activeDistricts || 0} active districts
                              </p>
                            </div>
                            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
                              {categoryTotal?.totalProducts || 0}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] md:col-span-2 2xl:col-span-1">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">
                    Smart insights
                  </p>
                  <h3 className="mt-3 text-2xl font-black">
                    What this filtered map is telling you now
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Visible lead region
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {leadingRegion || 'No active region'}
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Strongest lane
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {leadingCategory && leadingCategory.totalProducts > 0
                          ? CATEGORY_META[leadingCategory.id].label
                          : 'No active lane'}
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                        Export-ready share
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {visibleDistricts.length
                          ? `${Math.round((exportReadyCount / visibleDistricts.length) * 100)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm md:col-span-2 2xl:col-span-2">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Priority districts
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Best signals in the current view
                  </h3>

                  <div className="mt-5 space-y-3">
                    {rankedVisibleDistricts.slice(0, 5).map((district, index) => (
                      <button
                        key={district.id}
                        type="button"
                        onClick={() => setSelectedDistrictId(district.id)}
                        className={`flex w-full items-start gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition ${
                          selectedDistrictId === district.id
                            ? 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.58)]'
                            : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                            selectedDistrictId === district.id
                              ? 'bg-white/12 text-white'
                              : 'bg-white text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-black">{district.name}</span>
                          <span
                            className={`mt-1 block text-xs font-semibold uppercase tracking-[0.16em] ${
                              selectedDistrictId === district.id ? 'text-white/70' : 'text-slate-500'
                            }`}
                          >
                            {district.region} / {district.exportPotential}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            selectedDistrictId === district.id
                              ? 'bg-white/12 text-white'
                              : 'bg-white text-slate-700'
                          }`}
                        >
                          {formatCompactNumber(district.marketScore)}
                        </span>
                      </button>
                    ))}

                    {rankedVisibleDistricts.length === 0 && (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm leading-7 text-slate-600">
                        No districts match the current region, category, and search filters.
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>

            <section className="mt-8 overflow-hidden rounded-[2.4rem] border border-slate-200 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-[0_30px_90px_-34px_rgba(15,23,42,0.62)] sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">
                    Map page analysis
                  </p>
                  <h3 className="mt-3 text-3xl font-black">
                    What changed from the old page
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-white/76">
                    The previous map experience depended on a simple center list, an FPS toggle, and
                    light district details. This redesign replaces that with stronger visual hierarchy,
                    better search and filtering, local map expansion, computed district intelligence,
                    and a cleaner customer-facing layout that feels more like a modern marketplace tool.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-emerald-200" />
                    <p className="mt-4 text-lg font-black">Cleaner signals</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      Economic value, export outlook, and product spread surface faster.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-amber-200" />
                    <p className="mt-4 text-lg font-black">Smarter flow</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      Search, filter, map focus, and district analysis now connect cleanly.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <Users className="h-6 w-6 text-sky-200" />
                    <p className="mt-4 text-lg font-black">Customer ready</p>
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      The page is more modern, responsive, and easier to understand quickly.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <style>{`
          .market-map .leaflet-container {
            background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 48%, #ecfdf5 100%);
            font-family: "Space Grotesk", "Segoe UI", sans-serif;
          }

          .market-map .leaflet-popup-content-wrapper {
            border-radius: 24px;
            padding: 0;
            box-shadow: 0 28px 70px -35px rgba(15, 23, 42, 0.42);
          }

          .market-map .leaflet-popup-content {
            margin: 0;
            min-width: 280px;
          }

          .market-map .leaflet-popup-tip {
            box-shadow: none;
          }

          .market-map .leaflet-tooltip {
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
          }

          .market-map .leaflet-tooltip-top::before {
            border-top-color: rgba(15, 23, 42, 0.92);
          }

          .market-map .leaflet-control-zoom {
            border: none;
            box-shadow: 0 20px 40px -26px rgba(15, 23, 42, 0.38);
          }

          .market-map .leaflet-control-zoom a {
            border: none;
            color: #0f172a;
            border-radius: 14px !important;
          }

          .market-map .leaflet-control-attribution {
            margin: 0 14px 14px 0 !important;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.86);
            padding: 4px 10px;
            font-size: 10px;
          }

          @media (max-width: 768px) {
            .market-map .leaflet-control-zoom,
            .market-map .leaflet-control-attribution {
              display: none;
            }
          }
        `}</style>
      </main>
    </div>
  );
}

export default MapPage;
