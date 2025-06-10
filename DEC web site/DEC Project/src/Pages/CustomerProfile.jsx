import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Edit3, Save, X, User, Mail, Phone, Calendar, Globe } from 'lucide-react';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street',
    city: 'New York',
    country: 'United States',
    bio: 'Passionate about technology and innovation. Love exploring new places and meeting new people.',
    profileImage: null
  });
  
  const [location, setLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    address: 'New York, NY, USA'
  });
  
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const fileInputRef = useRef(null);

  // Initialize map
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationClick = (e) => {
    if (isEditing) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Simple coordinate conversion for demo
      const lat = mapCenter.lat + (rect.height / 2 - y) * 0.001;
      const lng = mapCenter.lng + (x - rect.width / 2) * 0.001;
      
      setLocation({
        lat: lat,
        lng: lng,
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        () => {
          alert('Unable to retrieve your location');
        }
      );
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-white">
      <div className="w-full h-full p-4 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-3xl shadow-2xl p-6 lg:p-8 mb-6 lg:mb-8 border-2 border-green-100 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 lg:mb-8 gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-green-800">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 text-base lg:text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Edit3 size={20} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-600 text-white px-5 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Image Section */}
          <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
            <div className="flex flex-col items-center xl:items-start">
              <div className="relative">
                <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-4 lg:border-6 border-white shadow-2xl">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={60} className="text-green-500" />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110"
                  >
                    <Camera size={20} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-green-800 mt-4 text-center xl:text-left">
                {profileData.firstName} {profileData.lastName}
              </h2>
            </div>

            {/* Basic Info */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                  />
                ) : (
                  <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4">{profileData.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                  />
                ) : (
                  <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4">{profileData.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">Email</label>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-green-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                    />
                  ) : (
                    <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4 flex-1">{profileData.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">Phone</label>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-green-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                    />
                  ) : (
                    <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4 flex-1">{profileData.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">Date of Birth</label>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-green-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                    />
                  ) : (
                    <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4 flex-1">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 mb-2">Country</label>
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-green-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                    />
                  ) : (
                    <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4 flex-1">{profileData.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-700 mb-2">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                />
              ) : (
                <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4">{profileData.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-green-700 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-md"
                />
              ) : (
                <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4">{profileData.city}</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 lg:mt-8 space-y-2">
            <label className="block text-sm font-semibold text-green-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-base border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-300 shadow-md"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-green-800 py-3 text-base font-medium bg-green-50 rounded-xl px-4 leading-relaxed">{profileData.bio}</p>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-gradient-to-r from-white to-green-50 rounded-3xl shadow-2xl p-6 lg:p-8 border-2 border-green-100 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-green-800 flex items-center gap-3">
              <MapPin className="text-green-600" size={28} />
              Location
            </h2>
            {isEditing && (
              <button
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-6 py-3 text-base rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Use Current Location
              </button>
            )}
          </div>

          <div className="mb-4 lg:mb-6">
            <p className="text-green-700 text-base lg:text-lg font-medium bg-green-100 rounded-xl px-4 py-3">{location.address}</p>
          </div>

          {/* Enhanced Map Visualization */}
          <div
            onClick={handleLocationClick}
            className={`relative w-full h-64 lg:h-80 xl:h-96 bg-gradient-to-br from-green-200 to-green-400 rounded-2xl overflow-hidden ${
              isEditing ? 'cursor-crosshair' : 'cursor-default'
            } shadow-inner border-2 border-green-300 transition-all duration-300 hover:shadow-2xl`}
          >
            {/* Enhanced grid pattern to simulate map */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex">
                  {[...Array(20)].map((_, j) => (
                    <div
                      key={j}
                      className="w-16 h-8 border border-green-600"
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Location marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
              style={{
                left: `${50 + (location.lng - mapCenter.lng) * 500}%`,
                top: `${50 - (location.lat - mapCenter.lat) * 500}%`
              }}
            >
              <div className="bg-red-500 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Instructions overlay */}
            {isEditing && (
              <div className="absolute top-6 left-6 bg-black bg-opacity-80 text-white px-4 py-3 rounded-xl text-base lg:text-lg font-medium shadow-2xl">
                Click anywhere to set your location
              </div>
            )}
          </div>

          <div className="mt-4 lg:mt-6 text-sm lg:text-base text-green-600 bg-green-50 rounded-xl px-4 py-3">
            {isEditing ? (
              <p className="font-medium">Click on the map to set your location, or use the "Use Current Location" button to automatically detect your position.</p>
            ) : (
              <p className="font-medium">Your current location is marked on the map above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;