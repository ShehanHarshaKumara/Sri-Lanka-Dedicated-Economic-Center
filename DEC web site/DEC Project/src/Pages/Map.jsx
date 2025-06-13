import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Enhanced district data with more categories
const districts = [
  {
    name: 'Nuwara Eliya',
    latitude: 6.97078,
    longitude: 80.78286,
    crops: ['Carrots', 'Leeks', 'Beetroot', 'Cabbage', 'Cauliflower'],
    fruits: ['Strawberry'],
    nuts: [],
    chili: [],
    other: ['Potatoes'],
    type: 'both',
    region: 'Upcountry'
  },
  {
    name: 'Badulla',
    latitude: 6.9895,
    longitude: 81.0557,
    crops: ['Carrots', 'Leeks', 'Potatoes'],
    fruits: [],
    nuts: [],
    chili: [],
    other: [],
    type: 'vegetable',
    region: 'Upcountry'
  },
  {
    name: 'Anuradhapura',
    latitude: 8.31135,
    longitude: 80.40365,
    crops: ['Onion', 'Pumpkins'],
    fruits: ['Banana', 'Mango', 'Wood Apple'],
    nuts: ['Cashew'],
    chili: ['Chilli'],
    other: [],
    type: 'both',
    region: 'Dry Zone'
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
    region: 'Dry Zone'
  },
  {
    name: 'Polonnaruwa',
    latitude: 7.932857,
    longitude: 81.008087,
    crops: ['Onion'],
    fruits: [],
    nuts: [],
    chili: ['Chilli'],
    other: [],
    type: 'vegetable',
    region: 'Dry Zone'
  },
  {
    name: 'Kurunegala',
    latitude: 7.4863,
    longitude: 80.3623,
    crops: [],
    fruits: ['Banana', 'Mango', 'Pineapple'],
    nuts: ['Cashew'],
    chili: [],
    other: [],
    type: 'fruit',
    region: 'Intermediate Zone'
  },
  {
    name: 'Gampaha',
    latitude: 7.0846,
    longitude: 80.0091,
    crops: [],
    fruits: ['Pineapple'],
    nuts: [],
    chili: [],
    other: [],
    type: 'fruit',
    region: 'Low Country Wet Zone'
  },
  {
    name: 'Hambantota',
    latitude: 6.1249,
    longitude: 81.1188,
    crops: ['Pumpkins', 'Gourds'],
    fruits: ['Guava', 'Papaya', 'Watermelon'],
    nuts: [],
    chili: [],
    other: [],
    type: 'both',
    region: 'Dry Zone'
  },
  {
    name: 'Ampara',
    latitude: 7.3019,
    longitude: 81.6820,
    crops: [],
    fruits: ['Guava', 'Papaya'],
    nuts: [],
    chili: [],
    other: [],
    type: 'fruit',
    region: 'Dry Zone'
  },
  {
    name: 'Kandy',
    latitude: 7.2906,
    longitude: 80.6337,
    crops: ['Beans', 'Cabbage'],
    fruits: ['Avocado', 'Passion Fruit', 'Oranges'],
    nuts: [],
    chili: [],
    other: ['Tea'],
    type: 'both',
    region: 'Hill Country'
  },
  {
    name: 'Galle',
    latitude: 6.0535,
    longitude: 80.2210,
    crops: ['Brinjal', 'Okra'],
    fruits: ['Pineapple', 'Avocado'],
    nuts: [],
    chili: [],
    other: ['Cinnamon'],
    type: 'both',
    region: 'Low Country Wet Zone'
  },
  {
    name: 'Jaffna',
    latitude: 9.6615,
    longitude: 80.0255,
    crops: [],
    fruits: ['Palmyrah', 'Watermelon', 'Banana'],
    nuts: ['Cashew'],
    chili: [],
    other: [],
    type: 'fruit',
    region: 'Coastal Areas'
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
    region: 'Hill Country'
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
    region: 'Low Country Wet Zone'
  }
];

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

// Starfield background component
const StarfieldBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    const numStars = 200;
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        speed: Math.random() * 0.5
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.alpha += star.speed * 0.01;
        if (star.alpha > 1) star.alpha = 0;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(star.alpha))})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <canvas id="starfield" className="fixed inset-0 z-0" />;
};

const CropMap = ({ districtData, onDistrictSelect, selectedCategories }) => {
  const mapRef = useRef();

  // Filter districts based on selected categories
  const filteredDistricts = districtData.filter(district => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(district.type);
  });

  return (
    <div className="relative h-full">
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={7}
        style={{ height: '70vh', width: '100%' }}
        className="rounded-lg shadow-2xl border-2 border-green-300"
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {filteredDistricts.map((district, index) => (
          <GeoJSON
            key={index}
            data={{
              type: "Point",
              coordinates: [district.longitude, district.latitude]
            }}
            pointToLayer={(point, latlng) => {
              return L.circleMarker(latlng, {
                radius: 12,
                fillColor: getColorByType(district.type),
                color: '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.9
              });
            }}
            eventHandlers={{
              click: () => onDistrictSelect(district),
            }}
          >
            <Tooltip direction="top" opacity={1} className="font-sans text-sm">
              <div className="font-bold">{district.name}</div>
              {district.crops.length > 0 && (
                <div>Vegetables: {district.crops.join(', ')}</div>
              )}
              {district.fruits.length > 0 && (
                <div>Fruits: {district.fruits.join(', ')}</div>
              )}
            </Tooltip>

            <Popup>
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg text-green-800">{district.name}</h3>
                <p className="text-sm text-green-600">{district.region}</p>
                {district.crops.length > 0 && (
                  <p className="mt-1"><strong>Main Crops:</strong> {district.crops.join(', ')}</p>
                )}
                {district.fruits.length > 0 && (
                  <p className="mt-1"><strong>Main Fruits:</strong> {district.fruits.join(', ')}</p>
                )}
              </div>
            </Popup>
          </GeoJSON>
        ))}
      </MapContainer>
    </div>
  );
};

// Search control component
const SearchControlComponent = ({ districts, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = districts.filter(district =>
        district.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, districts]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search districts..."
        className="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90 backdrop-blur"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white/95 backdrop-blur border-2 border-green-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((district) => (
            <div
              key={district.name}
              className="p-3 hover:bg-green-100 cursor-pointer transition-colors"
              onClick={() => {
                onSelect(district);
                setQuery('');
                setIsOpen(false);
              }}
            >
              {district.name} - {district.region}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

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

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
  };

  // Auto fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen request failed:', err);
      }
    };
    
    // Small delay to ensure the component is mounted
    setTimeout(enterFullscreen, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 relative overflow-hidden">
      <StarfieldBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider animate-pulse">
            SRI LANKA DEDICATED ECONOMIC CENTER
          </h1>
          <p className="text-xl text-green-100">Agricultural Production & Distribution Network</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-4 border border-green-300">
              <CropMap 
                districtData={filteredDistricts} 
                onDistrictSelect={handleDistrictSelect}
                selectedCategories={selectedCategories}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-xl font-bold mb-3 text-green-800">Search Districts</h2>
              <SearchControlComponent districts={districts} onSelect={handleDistrictSelect} />
            </div>
            
            <div className="bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-xl font-bold mb-3 text-green-800">Filter by Region</h2>
              <div className="space-y-2">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedRegion === region 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {region === 'all' ? 'All Regions' : region}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-green-300">
              <h2 className="text-xl font-bold mb-3 text-green-800">Filter by Category</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
                      selectedCategories.includes(category.id)
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2 border-2 border-white" 
                      style={{ backgroundColor: getColorByType(category.id) }}
                    ></div>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedDistrict && (
          <div className="bg-white/95 backdrop-blur p-6 rounded-lg shadow-2xl mb-6 mt-6 border-2 border-green-300">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-green-800">{selectedDistrict.name}</h2>
                <p className="text-green-600 text-lg">{selectedDistrict.region}</p>
              </div>
              <button 
                onClick={() => setSelectedDistrict(null)} 
                className="text-green-500 hover:text-green-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {selectedDistrict.crops.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                  <h3 className="font-bold text-green-800 mb-2">Vegetables</h3>
                  <ul className="space-y-1">
                    {selectedDistrict.crops.map((crop, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {crop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedDistrict.fruits.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                  <h3 className="font-bold text-green-800 mb-2">Fruits</h3>
                  <ul className="space-y-1">
                    {selectedDistrict.fruits.map((fruit, i) => (
                      <li key={i} className="flex items-center">
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

        <div className="mt-8 bg-white/90 backdrop-blur p-6 rounded-lg shadow-xl border border-green-300">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Economic Centers Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-2">Highland Economic Zone</h3>
              <p className="text-sm text-green-600">Specialized in temperate vegetables and premium produce</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-2">Dry Zone Agricultural Hub</h3>
              <p className="text-sm text-green-600">Major supplier of onions, chili, and tropical fruits</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-700 mb-2">Coastal Trade Centers</h3>
              <p className="text-sm text-green-600">Export processing and maritime agricultural trade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;