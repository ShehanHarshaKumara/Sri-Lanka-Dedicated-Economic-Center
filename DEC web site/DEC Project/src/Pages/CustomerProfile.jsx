import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Edit3, Save, X, User, Mail, Phone, Hash, Globe, ShoppingBag, ArrowLeft } from 'lucide-react';
import { API_BASES } from '../config/api';

const CustomerProfile = ({ user, onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+94771234567',
    age: '28',
    nicNumber: '987654321V',
    address: '456 Green Avenue, Colombo',
    city: 'Colombo',
    bio: 'Health-conscious customer passionate about organic and locally sourced produce. Regular buyer of fresh vegetables and fruits. Prefers sustainable farming practices.',
    profileImage: null,
    existingImage: null,
    imageFile: null
  });

  const [location, setLocation] = useState({
    lat: 6.9271,
    lng: 79.8612,
    address: 'Colombo, Western Province, Sri Lanka'
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBlnL8xcC0cYhUHCHJdQDXSwWR7X7j9sWo';

  // API configuration - Updated to use the correct port
  const API_BASE_URL = API_BASES.customer;

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        alert('Failed to load Google Maps. Please check your internet connection.');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 15,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#e8f5e9' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8e6c9' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#4db6ac' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#666666' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        }
      });

      const googleGeocoder = new window.google.maps.Geocoder();
      
      const mapMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMap,
        title: 'Delivery Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.16 0 0 7.16 0 16C0 24 16 40 16 40C16 40 32 24 32 16C32 7.16 24.84 0 16 0ZM16 22C12.69 22 10 19.31 10 16C10 12.69 12.69 10 16 10C19.31 10 22 12.69 22 16C22 19.31 19.31 22 16 22Z" fill="#388e3c"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 30),
          anchor: new window.google.maps.Point(12, 30)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Add click listener for editing mode
      googleMap.addListener('click', (event) => {
        if (isEditing) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          
          setLocation({
            lat: newLat,
            lng: newLng,
            address: `Getting address...`
          });

          mapMarker.setPosition({ lat: newLat, lng: newLng });
          
          // Reverse geocoding to get address
          googleGeocoder.geocode(
            { location: { lat: newLat, lng: newLng } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                setLocation(prev => ({
                  ...prev,
                  address: results[0].formatted_address
                }));
              } else {
                setLocation(prev => ({
                  ...prev,
                  address: `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`
                }));
              }
            }
          );
        }
      });

      setMap(googleMap);
      setMarker(mapMarker);
      setGeocoder(googleGeocoder);
    }
  }, [mapLoaded, isEditing, location.lat, location.lng, map]);

  // Update marker position when location changes
  useEffect(() => {
    if (marker && map) {
      marker.setPosition({ lat: location.lat, lng: location.lng });
      map.setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location.lat, location.lng, marker, map]);

  // Add useEffect to load profile data from backend using the passed user ID
  useEffect(() => {
    const loadProfileFromAPI = async () => {
      try {
        // Use the user ID from props, fallback to localStorage, then default
        const userId = user?.id || localStorage.getItem('userId') || '1';
        
        console.log('Loading profile for user ID:', userId);
        console.log('User prop received:', user);
        
        // Get token for authenticated requests
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data loaded:', data);
          
          // Update profileData with backend data
          setProfileData(prev => ({
            ...prev,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || user?.email || '',
            phone: data.phone || '',
            age: data.age?.toString() || '',
            nicNumber: data.nic_number || '',
            address: data.address || '',
            city: data.city || '',
            bio: data.bio || '',
            profileImage: data.profile_image || null
          }));

          // Update location if available
          if (data.location_lat && data.location_lng) {
            setLocation({
              lat: parseFloat(data.location_lat),
              lng: parseFloat(data.location_lng),
              address: data.location_address || 'Unknown location'
            });
          }
        } else {
          console.error('Failed to load profile:', response.status, response.statusText);
          // If profile doesn't exist, initialize with user data
          if (user) {
            const names = user.name ? user.name.split(' ') : ['', ''];
            setProfileData(prev => ({
              ...prev,
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              email: user.email || ''
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Initialize with user data if API fails
        if (user) {
          const names = user.name ? user.name.split(' ') : ['', ''];
          setProfileData(prev => ({
            ...prev,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: user.email || ''
          }));
        }
      }
    };

    // Only load if user prop is available
    if (user?.id) {
      loadProfileFromAPI();
    }
  }, [user, API_BASE_URL]);

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
          profileImage: e.target.result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
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
            address: `Getting address...`
          });

          // Reverse geocoding to get readable address
          if (geocoder) {
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results[0]) {
                  setLocation(prev => ({
                    ...prev,
                    address: results[0].formatted_address
                  }));
                } else {
                  setLocation(prev => ({
                    ...prev,
                    address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
                  }));
                }
              }
            );
          }
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Use the user ID from props
      const userId = user?.id || localStorage.getItem('userId') || '1';
      const token = localStorage.getItem('token');
      
      console.log('Saving profile for user ID:', userId);
      
      // Prepare form data
      const formData = new FormData();
      
      // Add text fields
      formData.append('first_name', profileData.firstName);
      formData.append('last_name', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('age', profileData.age);
      formData.append('nic_number', profileData.nicNumber);
      formData.append('address', profileData.address);
      formData.append('city', profileData.city);
      formData.append('country', 'Sri Lanka');
      formData.append('bio', profileData.bio);
      
      // Add location data
      formData.append('location_lat', location.lat.toString());
      formData.append('location_lng', location.lng.toString());
      formData.append('location_address', location.address);
      
      // Add existing image URL if no new image
      if (profileData.profileImage && !profileData.imageFile) {
        formData.append('existing_image', profileData.profileImage);
      }
      
      // Add new image file if selected
      if (profileData.imageFile) {
        formData.append('profile_image', profileData.imageFile);
      }
      
      console.log('Sending data to backend for user:', userId);
      
      // Send to backend with authentication
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Profile updated successfully!');
        
        // Update profile image URL if new image was uploaded
        if (result.profileImageUrl) {
          setProfileData(prev => ({
            ...prev,
            profileImage: result.profileImageUrl,
            imageFile: null
          }));
        }
        
        setIsEditing(false);
        console.log('Profile saved successfully:', result);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const inputClasses = "w-full px-3 py-2.5 sm:px-4 sm:py-3.5 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-300 placeholder:text-gray-400 hover:bg-white/90 shadow-sm hover:shadow-md text-sm sm:text-base";
  const readOnlyClasses = "text-gray-800 py-2.5 px-3 sm:py-3.5 sm:px-4 font-medium bg-gradient-to-r from-gray-50/80 to-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100/50 shadow-sm text-sm sm:text-base";

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 mobile-safe-shell flex flex-col md:flex-row bg-gray-100 text-gray-800 overflow-hidden font-sans">
      
      {/* Left Section - Hidden on Mobile, 50% on Desktop */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 lg:w-[30rem] lg:h-[30rem] bg-gradient-to-tr from-emerald-400/30 to-green-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 2px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-8 lg:p-12">
          <div className="mb-8">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <ShoppingBag className="text-white w-10 h-10 lg:w-12 lg:h-12" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Customer
              <br />
              <span className="text-green-200">Profile</span>
            </h1>
            <p className="text-green-100 text-lg lg:text-xl font-medium mb-8 max-w-md mx-auto leading-relaxed">
              Manage your preferences and delivery information for the best shopping experience
            </p>
          </div>
          
          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-6 lg:gap-8 text-white/80">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <User className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="text-sm lg:text-base font-medium">Profile</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <MapPin className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="text-sm lg:text-base font-medium">Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="text-sm lg:text-base font-medium">Shopping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Full Width on Mobile, 50% on Desktop */}
      <div className="w-full md:w-1/2 mobile-safe-scroll overflow-y-auto bg-white relative">
        
        {/* Mobile Header with Back Button */}
        <div className="md:hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="text-white w-5 h-5" />
              </button>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Customer Profile</h1>
                <p className="text-green-100 text-sm truncate">
                  {user?.name || 'Manage your shopping preferences'}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-colors text-sm font-medium flex-shrink-0"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header with Back Button */}
        <div className="hidden md:block p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors"
              >
                <ArrowLeft className="text-green-600 w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Customer Profile
                </h1>
                <p className="text-gray-600">
                  Welcome, {user?.name || 'Customer'}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded-xl transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          

          {/* Action Buttons */}
          <div className="flex justify-end">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Edit3 size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                Edit Profile
              </button>
            ) : (
              <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="group-hover:scale-110 transition-transform duration-300" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="group flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50"
                >
                  <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Image and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-green-400 sm:w-10 sm:h-10" />
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 sm:p-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <Camera size={14} className="sm:w-4 sm:h-4" />
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

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent mb-1">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600 font-medium text-sm sm:text-base mb-2">{profileData.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">FIRST NAME</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>{profileData.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">LAST NAME</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>{profileData.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">EMAIL</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={inputClasses + " pl-9 sm:pl-10"}
                  />
                ) : (
                  <p className={readOnlyClasses + " pl-9 sm:pl-10"}>{profileData.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">PHONE</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={inputClasses + " pl-9 sm:pl-10"}
                  />
                ) : (
                  <p className={readOnlyClasses + " pl-9 sm:pl-10"}>{profileData.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">AGE</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={inputClasses + " pl-9 sm:pl-10"}
                    min="18"
                    max="100"
                  />
                ) : (
                  <p className={readOnlyClasses + " pl-9 sm:pl-10"}>{profileData.age ? `${profileData.age} years` : '-'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">NIC NUMBER</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.nicNumber}
                    onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                    className={inputClasses + " pl-9 sm:pl-10"}
                    placeholder="123456789V"
                  />
                ) : (
                  <p className={readOnlyClasses + " pl-9 sm:pl-10"}>{profileData.nicNumber || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">ADDRESS</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>{profileData.address || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">CITY</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>{profileData.city || '-'}</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">BIO & PREFERENCES</label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className={inputClasses + " resize-none"}
                placeholder="Tell us about your shopping preferences..."
              />
            ) : (
              <p className={readOnlyClasses + " leading-relaxed"}>{profileData.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
                    Delivery Location
                  </h3>
                  <p className="text-gray-600 text-sm">Your preferred delivery address</p>
                </div>
              </div>
              
              {isEditing && (
                <button
                  onClick={getCurrentLocation}
                  disabled={!mapLoaded}
                  className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="group-hover:animate-pulse">📍 Use Current Location</span>
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700 font-medium bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-4 py-3 border border-emerald-100 text-sm sm:text-base">
                {location.address}
              </p>
            </div>

            {/* Google Map */}
            <div className="relative w-full h-48 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50 transition-all duration-500 hover:shadow-xl">
              {!mapLoaded ? (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-green-600 font-medium">Loading Google Maps...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapRef} 
                  className="w-full h-full"
                  style={{ minHeight: '100%' }}
                />
              )}
              
              {/* Edit mode overlay */}
              {isEditing && mapLoaded && (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium shadow-xl border border-white/20 text-xs sm:text-sm z-10">
                  ✨ Click on map to set delivery location
                </div>
              )}

              {/* Map controls */}
              {mapLoaded && (
                <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-600 shadow-lg">
                    Lat: {location.lat.toFixed(4)}
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-600 shadow-lg">
                    Lng: {location.lng.toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            <div className="text-gray-600 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl px-4 py-3 border border-green-100">
              {isEditing ? (
                <div className="space-y-2">
                  <p className="font-medium text-sm sm:text-base">🎯 Click on the map to set your delivery location, or use the "Use Current Location" button.</p>
                  <p className="text-xs sm:text-sm text-gray-500">The map will automatically get the address for the selected location.</p>
                </div>
              ) : (
                <p className="font-medium text-sm sm:text-base">📍 Your delivery location is marked on the map above with precise coordinates.</p>
              )}
            </div>

            {/* Location accuracy info */}
            {mapLoaded && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm">Location Accuracy</p>
                    <p className="text-blue-600 text-xs mt-1">
                      This location is determined using GPS coordinates and Google Maps geocoding for accurate deliveries.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Location Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="text-green-500 w-4 h-4" />
                  <span className="font-medium text-green-800 text-sm">Coordinates</span>
                </div>
                <p className="text-green-700 text-xs">
                  Latitude: {location.lat.toFixed(6)}<br />
                  Longitude: {location.lng.toFixed(6)}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-500 w-4 h-4" />
                  <span className="font-medium text-blue-800 text-sm">Delivery Info</span>
                </div>
                <p className="text-blue-700 text-xs">
                  Standard Delivery Zone<br />
                  Same-day delivery available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
