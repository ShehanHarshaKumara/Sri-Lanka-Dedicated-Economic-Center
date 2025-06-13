import { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import 'leaflet/dist/leaflet.css';

// District data with agricultural information
const districts = [
  // ... (keep your existing districts data unchanged)
];

// Color coding for different crop types
const getColorByType = (type) => {
  switch(type) {
    case 'vegetable': return '#10b981'; // emerald
    case 'fruit': return '#22c55e'; // green
    case 'nut': return '#16a34a'; // green-600
    case 'chili': return '#15803d'; // green-700
    case 'other': return '#14532d'; // green-900
    case 'both': return '#059669'; // emerald-600
    default: return '#22c55e'; // green-500
  }
};

// Starfield background animation
const StarfieldBackground = () => {
  // ... (keep your existing StarfieldBackground component unchanged)
};

// Google Maps container style - will fill available space
const containerStyle = {
  width: '100%',
  height: '100%' // Changed to 100% to fill container
};

// Sri Lanka center coordinates
const center = {
  lat: 7.8731,
  lng: 80.7718
};

// Strict bounds for Sri Lanka to prevent panning outside
const sriLankaBounds = {
  north: 9.831,   // Northernmost point
  south: 5.919,   // Southernmost point
  west: 79.521,   // Westernmost point
  east: 81.879    // Easternmost point
};

// Custom map styles to remove clutter and focus on Sri Lanka
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  }
];

const CropMap = ({ districtData, onDistrictSelect, selectedCategories }) => {
  const mapRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter districts based on selected categories
  const filteredDistricts = districtData.filter(district => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(district.type);
  });

  const onLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
    
    // Set bounds and viewport to Sri Lanka
    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(sriLankaBounds.south, sriLankaBounds.west),
      new window.google.maps.LatLng(sriLankaBounds.north, sriLankaBounds.east)
    );
    
    // Add padding to ensure all of Sri Lanka is visible
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    
    // Set minimum zoom level to prevent zooming out too far
    map.addListener('bounds_changed', () => {
      if (map.getZoom() > 15) map.setZoom(15);
      if (map.getZoom() < 7) map.setZoom(7);
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* Google Maps API LoadScript with your API key */}
      <LoadScript 
        googleMapsApiKey="https://maps.googleapis.com/maps/api/js?key=AIzaSyDZennffc4I2wa2NDZeSi233YpTRl6P18g&libraries=places"
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={7}
          onLoad={onLoad}
          options={{
            restriction: {
              latLngBounds: sriLankaBounds,
              strictBounds: true // Strictly prevent panning outside Sri Lanka
            },
            minZoom: 7,          // Minimum zoom level
            maxZoom: 15,         // Maximum zoom level
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: mapStyles,
            gestureHandling: 'greedy',
            disableDefaultUI: true, // Cleaner look
            clickableIcons: false
          }}
          className="rounded-lg shadow-2xl border-2 border-green-300"
        >
          {mapLoaded && filteredDistricts.map((district, index) => (
            <Marker
              key={index}
              position={{ lat: district.latitude, lng: district.longitude }}
              onClick={() => {
                onDistrictSelect(district);
                setActiveMarker(index);
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: getColorByType(district.type),
                fillOpacity: 0.9,
                strokeColor: '#fff',
                strokeWeight: 2,
                scale: 8,
                anchor: new window.google.maps.Point(0, 0)
              }}
            >
              {activeMarker === index && (
                <InfoWindow 
                  onCloseClick={() => setActiveMarker(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -30)
                  }}
                >
                  <div className="p-2 max-w-xs bg-white rounded-lg">
                    <h3 className="font-bold text-lg text-green-800">{district.name}</h3>
                    <p className="text-sm text-green-600">{district.region}</p>
                    {district.crops.length > 0 && (
                      <p className="mt-1 text-sm"><strong>Crops:</strong> {district.crops.join(', ')}</p>
                    )}
                    {district.fruits.length > 0 && (
                      <p className="mt-1 text-sm"><strong>Fruits:</strong> {district.fruits.join(', ')}</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

// Search control component
const SearchControlComponent = ({ districts, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredDistricts = districts.filter(district => 
    district.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-2">
      <input 
        type="text"
        placeholder="Search district..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {searchTerm && (
        <div className="bg-white max-h-48 overflow-auto rounded-md shadow-md">
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((district, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-green-100 text-sm"
                onClick={() => {
                  onSelect(district);
                  setSearchTerm('');
                }}
              >
                {district.name} ({district.region})
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No districts found</div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const regions = ['all', ...new Set(districts.map(d => d.region))];
  const categories = [
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'fruit', name: 'Fruits' },
    { id: 'nut', name: 'Nuts' },
    { id: 'chili', name: 'Chili' },
    { id: 'other', name: 'Other' },
    { id: 'both', name: 'Mixed' }
  ];

  const filteredDistricts = selectedRegion === 'all' 
    ? districts 
    : districts.filter(d => d.region === selectedRegion);

  // Handle window resize for responsive design
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

  // Fullscreen toggle handler
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Auto fullscreen on mobile devices
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !document.fullscreenElement) {
      toggleFullscreen();
    }
  }, []);

  return (
    <div className={`
      fixed inset-0 
      bg-gradient-to-b from-green-900 via-green-800 to-green-900 
      overflow-auto
      ${isFullscreen ? 'fixed' : 'relative'}
    `}>
      <StarfieldBackground />
      
      {/* Main container with dynamic sizing */}
      <div className={`
        relative z-10 
        ${isFullscreen ? 'h-screen w-screen' : 'min-h-screen'}
        mx-auto px-4 py-6
        overflow-hidden
      `}>
        {/* Header section */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-wider animate-pulse">
            SRI LANKA DEDICATED ECONOMIC CENTER
          </h1>
          <p className="text-lg md:text-xl text-green-100">
            Agricultural Production & Distribution Network
          </p>
          
          <button 
            onClick={toggleFullscreen}
            className={`
              mt-4 px-4 py-2 bg-green-600 text-white rounded-lg 
              hover:bg-green-700 transition-colors
              ${windowSize.width < 640 ? 'text-sm' : ''}
            `}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>
        
        {/* Main content grid */}
        <div className={`
          grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6
          ${isFullscreen ? 'h-[calc(100%-150px)]' : ''}
        `}>
          {/* Map container - takes 3/4 width on large screens */}
          <div className="lg:col-span-3 h-[50vh] md:h-[65vh] lg:h-[70vh]">
            <div className="
              bg-white/10 backdrop-blur-md 
              rounded-lg shadow-2xl p-2 md:p-4 
              border border-green-300
              h-full
            ">
              <CropMap 
                districtData={filteredDistricts} 
                onDistrictSelect={setSelectedDistrict}
                selectedCategories={selectedCategories}
              />
            </div>
          </div>
          
          {/* Sidebar controls - takes 1/4 width on large screens */}
          <div className="space-y-3 md:space-y-4 overflow-y-auto">
            <div className="bg-white/90 backdrop-blur p-3 md:p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-green-800">
                Search Districts
              </h2>
              <SearchControlComponent 
                districts={districts} 
                onSelect={setSelectedDistrict} 
              />
            </div>
            
            <div className="bg-white/90 backdrop-blur p-3 md:p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-green-800">
                Filter by Region
              </h2>
              <div className="space-y-1 md:space-y-2">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`
                      w-full text-left px-2 py-1 md:px-3 md:py-2 
                      rounded-md text-xs md:text-sm font-medium 
                      transition-all
                      ${selectedRegion === region 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }
                    `}
                  >
                    {region === 'all' ? 'All Regions' : region}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur p-3 md:p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-green-800">
                Filter by Category
              </h2>
              <div className="space-y-1 md:space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`
                      w-full text-left px-2 py-1 md:px-3 md:py-2 
                      rounded-md text-xs md:text-sm font-medium 
                      transition-all flex items-center
                      ${selectedCategories.includes(category.id)
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }
                    `}
                  >
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2 border-2 border-white" 
                      style={{ backgroundColor: getColorByType(category.id) }}
                    ></div>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected district details panel */}
        {selectedDistrict && (
          <div className={`
            bg-white/95 backdrop-blur p-4 md:p-6 
            rounded-lg shadow-2xl my-4 md:my-6 
            border-2 border-green-300
            transition-all duration-300
            ${isFullscreen ? 'max-w-4xl mx-auto' : ''}
          `}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-800">
                  {selectedDistrict.name}
                </h2>
                <p className="text-green-600 text-base md:text-lg">
                  {selectedDistrict.region}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDistrict(null)} 
                className="text-green-500 hover:text-green-700 text-xl md:text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
              {selectedDistrict.crops.length > 0 && (
                <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-300">
                  <h3 className="font-bold text-green-800 mb-1 md:mb-2">Vegetables</h3>
                  <ul className="space-y-1">
                    {selectedDistrict.crops.map((crop, i) => (
                      <li key={i} className="flex items-center text-sm md:text-base">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {crop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedDistrict.fruits.length > 0 && (
                <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-300">
                  <h3 className="font-bold text-green-800 mb-1 md:mb-2">Fruits</h3>
                  <ul className="space-y-1">
                    {selectedDistrict.fruits.map((fruit, i) => (
                      <li key={i} className="flex items-center text-sm md:text-base">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        {fruit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Economic centers info section */}
        <div className={`
          bg-white/90 backdrop-blur p-4 md:p-6 
          rounded-lg shadow-xl my-4 md:my-8 
          border border-green-300
          ${isFullscreen ? 'max-w-4xl mx-auto' : ''}
        `}>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-green-800">
            Economic Centers Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-1 md:mb-2">Highland Economic Zone</h3>
              <p className="text-xs md:text-sm text-green-600">
                Specialized in temperate vegetables and premium produce
              </p>
            </div>
            <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-1 md:mb-2">Dry Zone Agricultural Hub</h3>
              <p className="text-xs md:text-sm text-green-600">
                Major supplier of onions, chili, and tropical fruits
              </p>
            </div>
            <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-1 md:mb-2">Coastal Trade Centers</h3>
              <p className="text-xs md:text-sm text-green-600">
                Export processing and maritime agricultural trade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;