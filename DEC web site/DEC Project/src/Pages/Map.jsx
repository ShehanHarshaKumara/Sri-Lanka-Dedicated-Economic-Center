import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { 
  MapPin, 
  Search, 
  Filter, 
  Maximize, 
  Minimize, 
  X, 
  Activity,
  Carrot,
  Apple,
  Leaf,
  Flame,
  Package,
  Layers
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Enhanced district data with more categories and detailed information
const districts = [
  {
    name: 'Nuwara Eliya',
    latitude: 6.97078,
    longitude: 80.78286,
    crops: ['Carrots', 'Leeks', 'Beetroot', 'Cabbage', 'Cauliflower'],
    fruits: ['Strawberry'],
    nuts: [],
    chili: [],
    other: ['Potatoes', 'Tea'],
    type: 'both',
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
    type: 'vegetable',
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
    type: 'both',
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
    type: 'both',
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
    type: 'vegetable',
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
    type: 'fruit',
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
    type: 'fruit',
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
    type: 'both',
    region: 'Dry Zone',
    elevation: '18m',
    climate: 'Tropical Dry',
    economicValue: 'Medium',
    exportPotential: 'Moderate'
  },
  {
    name: 'Ampara',
    latitude: 7.3019,
    longitude: 81.6820,
    crops: [],
    fruits: ['Guava', 'Papaya'],
    nuts: [],
    chili: [],
    other: ['Rice'],
    type: 'fruit',
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
    type: 'both',
    region: 'Hill Country',
    elevation: '465m',
    climate: 'Tropical Highland',
    economicValue: 'Very High',
    exportPotential: 'Premium'
  },
  {
    name: 'Galle',
    latitude: 6.0535,
    longitude: 80.2210,
    crops: ['Brinjal', 'Okra'],
    fruits: ['Pineapple', 'Avocado'],
    nuts: [],
    chili: [],
    other: ['Cinnamon', 'Fishing'],
    type: 'both',
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
    type: 'fruit',
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
    type: 'both',
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
    type: 'fruit',
    region: 'Low Country Wet Zone',
    elevation: '34m',
    climate: 'Tropical Wet',
    economicValue: 'Very High',
    exportPotential: 'Premium'
  }
];

// Custom icons for different categories with better fruit identification
const createCustomIcon = (type, size = 'medium') => {
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 45
  };
  const iconSize = sizeMap[size];
  
  const getIconColor = (type) => {
    switch(type) {
      case 'vegetable': return '#10b981'; // emerald-500
      case 'fruit': return '#f59e0b'; // amber-500
      case 'nut': return '#8b5cf6'; // violet-500
      case 'chili': return '#ef4444'; // red-500
      case 'other': return '#6b7280'; // gray-500
      case 'both': return '#06b6d4'; // cyan-500
      default: return '#10b981';
    }
  };

  const getIconSymbol = (type) => {
    switch(type) {
      case 'vegetable': return '🥕';
      case 'fruit': return '🍎';
      case 'nut': return '🥜';
      case 'chili': return '🌶️';
      case 'other': return '📦';
      case 'both': return '🌱';
      default: return '📍';
    }
  };

  return L.divIcon({
    html: `
      <div style="
        width: ${iconSize}px;
        height: ${iconSize}px;
        background: ${getIconColor(type)};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${iconSize * 0.6}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform-origin: center;
        transition: transform 0.2s ease;
      ">
        ${getIconSymbol(type)}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize/2],
    popupAnchor: [0, -iconSize/2]
  });
};

// FPS Counter Component
const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    const animationId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[1000] bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2">
      <Activity size={16} />
      {fps} FPS
    </div>
  );
};

// Enhanced Map Component with better responsive behavior
const CropMap = ({ districtData, onDistrictSelect, selectedCategories }) => {
  const mapRef = useRef();
  const [mapHeight, setMapHeight] = useState('75vh');

  useEffect(() => {
    const updateMapHeight = () => {
      // Adjust map height based on viewport
      const height = window.innerHeight * 0.75;
      setMapHeight(`${height}px`);
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);

  const filteredDistricts = districtData.filter(district => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(district.type);
  });

  return (
    <div className="relative w-full" style={{ height: mapHeight }}>
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl shadow-2xl border border-gray-300"
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {filteredDistricts.map((district, index) => (
          <Marker
            key={index}
            position={[district.latitude, district.longitude]}
            icon={createCustomIcon(district.type, district.fruits.length > 0 ? 'large' : 'medium')}
            eventHandlers={{
              click: () => onDistrictSelect(district),
              mouseover: (e) => e.target.openPopup(),
              mouseout: (e) => e.target.closePopup()
            }}
          >
            <Tooltip
              direction="top"
              opacity={0.95}
              className="custom-tooltip"
              permanent={false}
            >
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-48">
                <div className="font-bold text-lg text-gray-800 mb-1">{district.name}</div>
                <div className="text-sm text-gray-600 mb-2">{district.region} • {district.elevation}</div>
                
                {district.fruits.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Apple size={14} className="text-orange-500" />
                      <span className="font-medium text-xs text-gray-700">Fruits:</span>
                    </div>
                    <div className="text-xs text-gray-600">{district.fruits.slice(0, 3).join(', ')}</div>
                  </div>
                )}
                
                {district.crops.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Carrot size={14} className="text-green-600" />
                      <span className="font-medium text-xs text-gray-700">Vegetables:</span>
                    </div>
                    <div className="text-xs text-gray-600">{district.crops.slice(0, 3).join(', ')}</div>
                  </div>
                )}

                <div className="text-xs text-blue-600 font-medium">
                  {district.economicValue} Economic Value
                </div>
              </div>
            </Tooltip>

            <Popup className="custom-popup" maxWidth={400}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xl text-gray-800">{district.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    district.economicValue === 'Very High' ? 'bg-green-100 text-green-800' :
                    district.economicValue === 'High' ? 'bg-blue-100 text-blue-800' :
                    district.economicValue === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {district.economicValue}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Region:</span>
                    <div className="text-gray-800">{district.region}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Climate:</span>
                    <div className="text-gray-800">{district.climate}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Elevation:</span>
                    <div className="text-gray-800">{district.elevation}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Export:</span>
                    <div className="text-gray-800">{district.exportPotential}</div>
                  </div>
                </div>

                {district.fruits.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Apple size={16} className="text-orange-500" />
                      <span className="font-medium text-sm">Fruits:</span>
                    </div>
                    <div className="text-sm text-gray-700">{district.fruits.join(', ')}</div>
                  </div>
                )}

                {district.crops.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Carrot size={16} className="text-green-600" />
                      <span className="font-medium text-sm">Vegetables:</span>
                    </div>
                    <div className="text-sm text-gray-700">{district.crops.join(', ')}</div>
                  </div>
                )}

                {district.other.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Package size={16} className="text-purple-600" />
                      <span className="font-medium text-sm">Other Products:</span>
                    </div>
                    <div className="text-sm text-gray-700">{district.other.join(', ')}</div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Enhanced Search Component
const SearchControlComponent = ({ districts, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = districts.filter(district =>
        district.name.toLowerCase().includes(query.toLowerCase()) ||
        district.region.toLowerCase().includes(query.toLowerCase()) ||
        district.crops.some(crop => crop.toLowerCase().includes(query.toLowerCase())) ||
        district.fruits.some(fruit => fruit.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, districts]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search districts, regions, or products..."
          className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-auto">
          {results.map((district) => (
            <div
              key={district.name}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onSelect(district);
                setQuery('');
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{district.name}</span>
                  <div className="text-sm text-gray-600">{district.region} • {district.climate}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  district.economicValue === 'Very High' ? 'bg-green-100 text-green-800' :
                  district.economicValue === 'High' ? 'bg-blue-100 text-blue-800' :
                  district.economicValue === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {district.economicValue}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Application Component with responsive improvements
function App() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFPS, setShowFPS] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const regions = ['all', ...new Set(districts.map(d => d.region))];
  const categories = [
    { id: 'vegetable', name: 'Vegetables', icon: Carrot, color: 'emerald' },
    { id: 'fruit', name: 'Fruits', icon: Apple, color: 'orange' },
    { id: 'nut', name: 'Nuts', icon: Package, color: 'purple' },
    { id: 'chili', name: 'Chili', icon: Flame, color: 'red' },
    { id: 'other', name: 'Other', icon: Layers, color: 'gray' },
    { id: 'both', name: 'Mixed', icon: Leaf, color: 'cyan' }
  ];

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredDistricts = selectedRegion === 'all' 
    ? districts 
    : districts.filter(d => d.region === selectedRegion);

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    // Scroll to district details if on mobile
    if (windowSize.width < 768) {
      setTimeout(() => {
        const element = document.getElementById('district-details');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: 'bg-emerald-500 text-white hover:bg-emerald-600',
      orange: 'bg-orange-500 text-white hover:bg-orange-600',
      purple: 'bg-purple-500 text-white hover:bg-purple-600',
      red: 'bg-red-500 text-white hover:bg-red-600',
      gray: 'bg-gray-500 text-white hover:bg-gray-600',
      cyan: 'bg-cyan-500 text-white hover:bg-cyan-600'
    };
    return colorMap[color] || 'bg-gray-500 text-white hover:bg-gray-600';
  };

  // ===== 1. VIEWPORT SETUP & EVENT LISTENERS =====
  React.useEffect(() => {
    // Set full viewport height and remove default margins/padding
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', setFullViewport);
    };
  }, []);

  // ===== 2. RESPONSIVE CONTAINER STYLES =====
  const containerStyles = {
    margin: 0,
    padding: 0,
    width: '100vw',
    minHeight: '100vh',
    overflowX: 'hidden'
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-900 ${isFullscreen ? 'fixed inset-0 overflow-auto' : ''}`}
      style={containerStyles}
    >
      {showFPS && <FPSCounter />}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Sri Lanka Dedicated Economic Centers
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Advanced Agricultural Production & Distribution Network</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFPS(!showFPS)}
              className="p-2 sm:p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
              title="Toggle FPS Counter"
            >
              <Activity size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Interactive Economic Centers Map</h2>
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">{filteredDistricts.length} Centers</span>
                </div>
              </div>
              {/* Add transform responsive classes to the map container */}
              <div className="w-full" style={{ height: 'calc(var(--vh, 1vh) * 75)' }}>
                <CropMap 
                  districtData={filteredDistricts} 
                  onDistrictSelect={handleDistrictSelect}
                  selectedCategories={selectedCategories}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Search className="text-blue-600" size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Search Centers</h2>
              </div>
              <SearchControlComponent districts={districts} onSelect={handleDistrictSelect} />
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Filter className="text-green-600" size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter by Region</h2>
              </div>
              <div className="space-y-2">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedRegion === region 
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {region === 'all' ? 'All Regions' : region}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Layers className="text-purple-600" size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter by Category</h2>
              </div>
              <div className="space-y-2">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedCategories.includes(category.id)
                          ? getColorClasses(category.color)
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent size={18} />
                      <span className="truncate">{category.name}</span>
                      <div className="ml-auto text-xs opacity-75">
                        {districts.filter(d => d.type === category.id).length}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2 sm:mb-3">Economic Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Centers:</span>
                  <span className="font-semibold text-blue-800">{districts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Value:</span>
                  <span className="font-semibold text-green-600">
                    {districts.filter(d => d.economicValue === 'High' || d.economicValue === 'Very High').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Export Ready:</span>
                  <span className="font-semibold text-orange-600">
                    {districts.filter(d => d.exportPotential === 'High' || d.exportPotential === 'Very High' || d.exportPotential === 'Premium').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedDistrict && (
          <div 
            id="district-details"
            className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl my-6 sm:my-8 border border-gray-200 transform transition-all duration-300 animate-in slide-in-from-bottom"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{selectedDistrict.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {selectedDistrict.region}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    {selectedDistrict.climate}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                    {selectedDistrict.elevation}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDistrict(null)} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-1 sm:mb-2">Economic Value</h4>
                <div className={`text-xl sm:text-2xl font-bold ${
                  selectedDistrict.economicValue === 'Very High' ? 'text-green-600' :
                  selectedDistrict.economicValue === 'High' ? 'text-blue-600' :
                  selectedDistrict.economicValue === 'Medium' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {selectedDistrict.economicValue}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-1 sm:mb-2">Export Potential</h4>
                <div className={`text-xl sm:text-2xl font-bold ${
                  selectedDistrict.exportPotential === 'Premium' ? 'text-purple-600' :
                  selectedDistrict.exportPotential === 'Very High' ? 'text-green-600' :
                  selectedDistrict.exportPotential === 'High' ? 'text-blue-600' :
                  selectedDistrict.exportPotential === 'Moderate' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {selectedDistrict.exportPotential}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-1 sm:mb-2">Total Products</h4>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {selectedDistrict.crops.length + selectedDistrict.fruits.length + selectedDistrict.nuts.length + selectedDistrict.chili.length + selectedDistrict.other.length}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {selectedDistrict.fruits.length > 0 && (
                <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Apple className="text-orange-600" size={18} />
                    <h3 className="font-bold text-orange-800">Fruits</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-2">
                    {selectedDistrict.fruits.map((fruit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs sm:text-sm">{fruit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedDistrict.crops.length > 0 && (
                <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Carrot className="text-green-600" size={18} />
                    <h3 className="font-bold text-green-800">Vegetables</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-2">
                    {selectedDistrict.crops.map((crop, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs sm:text-sm">{crop}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDistrict.nuts.length > 0 && (
                <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Package className="text-purple-600" size={18} />
                    <h3 className="font-bold text-purple-800">Nuts</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-2">
                    {selectedDistrict.nuts.map((nut, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs sm:text-sm">{nut}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDistrict.chili.length > 0 && (
                <div className="bg-red-50 p-3 sm:p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Flame className="text-red-600" size={18} />
                    <h3 className="font-bold text-red-800">Chili</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-2">
                    {selectedDistrict.chili.map((chili, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs sm:text-sm">{chili}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDistrict.other.length > 0 && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Layers className="text-gray-600" size={18} />
                    <h3 className="font-bold text-gray-800">Other Products</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-2">
                    {selectedDistrict.other.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs sm:text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Sri Lanka Dedicated Economic Centers Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-600 rounded-full">
                  <Carrot className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-green-800 text-lg sm:text-xl">Highland Economic Zone</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Specialized in temperate vegetables (carrots, leeks, potatoes) and premium produce (strawberries, tea). 
                Optimized for high-altitude cultivation with superior quality exports.
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="px-2 sm:px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs sm:text-sm font-medium">Premium Quality</span>
                <span className="px-2 sm:px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs sm:text-sm font-medium">Export Ready</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 sm:p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-600 rounded-full">
                  <Apple className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-orange-800 text-lg sm:text-xl">Dry Zone Agricultural Hub</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Major supplier of onions, chili, and tropical fruits (banana, mango, papaya). 
                Strategic location for bulk production and distribution networks.
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="px-2 sm:px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs sm:text-sm font-medium">High Volume</span>
                <span className="px-2 sm:px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs sm:text-sm font-medium">Spice Center</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 sm:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-600 rounded-full">
                  <Package className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-blue-800 text-lg sm:text-xl">Coastal Trade Centers</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Export processing of fruits (pineapple, palmyrah), spices (cinnamon), and maritime agricultural trade. 
                Gateway for international market access.
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="px-2 sm:px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs sm:text-sm font-medium">Export Hub</span>
                <span className="px-2 sm:px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs sm:text-sm font-medium">Value Added</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-green-600 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{districts.length}</div>
              <div className="text-blue-100 text-sm sm:text-base">Economic Centers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {districts.filter(d => d.economicValue === 'High' || d.economicValue === 'Very High').length}
              </div>
              <div className="text-blue-100 text-sm sm:text-base">High Value Centers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {districts.filter(d => d.exportPotential === 'High' || d.exportPotential === 'Very High' || d.exportPotential === 'Premium').length}
              </div>
              <div className="text-blue-100 text-sm sm:text-base">Export Ready</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {new Set([...districts.flatMap(d => d.crops), ...districts.flatMap(d => d.fruits), ...districts.flatMap(d => d.other)]).size}
              </div>
              <div className="text-blue-100 text-sm sm:text-base">Unique Products</div>
            </div>
          </div>
        </div>

        <footer className="mt-8 sm:mt-12 py-4 sm:py-6 border-t border-gray-200 text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="text-blue-600" size={18} />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sri Lanka Dedicated Economic Centers
            </span>
          </div>
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} - Advanced Agricultural Production & Distribution Network</p>
          <p className="text-xs mt-1 text-gray-500">
            Data sourced from Sri Lanka Department of Agriculture • Enhanced with real-time analytics
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .custom-tooltip {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
        
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.4s ease-out;
        }
        
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .leaflet-popup-content {
            width: 280px !important;
          }
        }
        
        @media (max-width: 768px) {
          .leaflet-control-container {
            display: none;
          }
        }
        /* ===== 15. CUSTOM CSS RESPONSIVE STYLES ===== */
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        @media (max-width: 640px) {
          /* Mobile specific styles */
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          /* Tablet specific styles */
        }
        @media (min-width: 1025px) {
          /* Desktop specific styles */
        }
      `}</style>
    </div>
  );
}

export default App;