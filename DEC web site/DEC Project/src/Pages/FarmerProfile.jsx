import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Edit3, Save, X, User, Mail, Phone, Hash, Globe, Sparkles, Award, Sprout } from 'lucide-react';

const FarmerProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    nicNumber: '',
    experience: '',
    farmingType: 'Mixed Farming',
    address: '',
    city: '',
    bio: '',
    profileImage: null,
    existingImage: null,
    imageFile: null
  });

  const [location, setLocation] = useState({
    lat: 6.9271,
    lng: 79.8612,
    address: 'Colombo, Sri Lanka'
  });

  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5002/api/farmer/profile/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          age: data.age || '',
          nicNumber: data.nic_number || '',
          experience: data.experience || '',
          farmingType: data.farming_type || 'Mixed Farming',
          address: data.address || '',
          city: data.city || '',
          bio: data.bio || '',
          profileImage: data.profile_image,
          existingImage: data.profile_image,
          imageFile: null
        });
        if (data.location_lat && data.location_lng) {
          setLocation({
            lat: parseFloat(data.location_lat),
            lng: parseFloat(data.location_lng),
            address: data.location_address || `Lat: ${data.location_lat}, Lng: ${data.location_lng}`
          });
          setMapCenter({
            lat: parseFloat(data.location_lat),
            lng: parseFloat(data.location_lng)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLocationClick = (e) => {
    if (isEditing) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('first_name', profileData.firstName);
    formData.append('last_name', profileData.lastName);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);
    formData.append('age', profileData.age);
    formData.append('nic_number', profileData.nicNumber);
    formData.append('experience', profileData.experience);
    formData.append('farming_type', profileData.farmingType);
    formData.append('address', profileData.address);
    formData.append('city', profileData.city);
    formData.append('bio', profileData.bio);
    formData.append('location_lat', location.lat);
    formData.append('location_lng', location.lng);
    formData.append('location_address', location.address);
    formData.append('existing_image', profileData.existingImage || '');
    if (profileData.imageFile) {
      formData.append('profile_image', profileData.imageFile);
    }
    try {
      const response = await fetch(`http://localhost:5002/api/farmer/profile/${user.id}`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        await response.json();
        alert('Profile updated successfully!');
        setIsEditing(false);
        fetchProfileData();
      } else {
        const err = await response.json();
        alert('Failed to update profile: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData();
  };


  const inputClasses = "w-full px-4 py-3.5 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-300 placeholder:text-gray-400 hover:bg-white/90 shadow-sm hover:shadow-md";
  const readOnlyClasses = "text-gray-800 py-3.5 px-4 font-medium bg-gradient-to-r from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-sm";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full min-h-screen">
        {/* Floating Header with Glassmorphism - Full Width */}
        <div className="relative bg-white/40 backdrop-blur-xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-10 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-96 xl:h-96 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 xl:w-[30rem] xl:h-[30rem] bg-gradient-to-tr from-lime-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Header Content */}
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 lg:mb-10 gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Farmer Profile
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your farming information</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 text-sm sm:text-base"
                >
                  <Edit3 size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
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
                    className="group flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base disabled:opacity-50"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
              {/* Profile Image */}
              <div className="flex flex-col items-center xl:items-start">
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white/50 shadow-2xl backdrop-blur-sm">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-green-400 sm:w-16 sm:h-16" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 group-hover:animate-bounce"
                    >
                      <Camera size={16} className="sm:w-5 sm:h-5" />
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
                <div className="mt-4 sm:mt-6 text-center xl:text-left">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1 sm:mt-2 font-medium text-sm sm:text-base">{profileData.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-2 sm:space-y-3">
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

                <div className="space-y-2 sm:space-y-3">
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

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">EMAIL</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={inputClasses + " pl-10 sm:pl-12"}
                      />
                    ) : (
                      <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">PHONE</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={inputClasses + " pl-10 sm:pl-12"}
                      />
                    ) : (
                      <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">AGE</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-400" />
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className={inputClasses + " pl-10 sm:pl-12"}
                        min="18"
                        max="100"
                      />
                    ) : (
                      <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.age ? `${profileData.age} years` : '-'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">NIC NUMBER</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.nicNumber}
                        onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                        className={inputClasses + " pl-10 sm:pl-12"}
                        placeholder="123456789V"
                      />
                    ) : (
                      <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.nicNumber || '-'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">EXPERIENCE</label>
                  <div className="relative">
                    <Award size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className={inputClasses + " pl-10 sm:pl-12"}
                        placeholder="e.g., 5 years"
                      />
                    ) : (
                      <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.experience || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address and Farming Section */}
            <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2 sm:space-y-3">
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

              <div className="space-y-2 sm:space-y-3">
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

              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">FARMING TYPE</label>
                <div className="relative">
                  <Sprout size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-500" />
                  {isEditing ? (
                    <select
                      value={profileData.farmingType}
                      onChange={(e) => handleInputChange('farmingType', e.target.value)}
                      className={inputClasses + " pl-10 sm:pl-12"}
                    >
                      <option value="Organic Vegetable Farming">Organic Vegetable Farming</option>
                      <option value="Rice Cultivation">Rice Cultivation</option>
                      <option value="Fruit Cultivation">Fruit Cultivation</option>
                      <option value="Livestock Farming">Livestock Farming</option>
                      <option value="Dairy Farming">Dairy Farming</option>
                      <option value="Poultry Farming">Poultry Farming</option>
                      <option value="Aquaculture">Aquaculture</option>
                      <option value="Mixed Farming">Mixed Farming</option>
                      <option value="Spice Cultivation">Spice Cultivation</option>
                      <option value="Tea Cultivation">Tea Cultivation</option>
                      <option value="Coconut Cultivation">Coconut Cultivation</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className={readOnlyClasses + " pl-10 sm:pl-12"}>{profileData.farmingType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 tracking-wide">BIO</label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={inputClasses + " resize-none"}
                  placeholder="Tell us about your farming experience..."
                />
              ) : (
                <p className={readOnlyClasses + " leading-relaxed"}>{profileData.bio || 'No bio added yet.'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Section - Full Width */}
        <div className="relative bg-white/40 backdrop-blur-xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-10 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-800 bg-clip-text text-transparent">
                    Farm Location
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Your farm's position</p>
                </div>
              </div>
              
              {isEditing && (
                <button
                  onClick={getCurrentLocation}
                  className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                >
                  <span className="group-hover:animate-pulse">📍 Use Current Location</span>
                </button>
              )}
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-gray-700 font-semibold bg-gradient-to-r from-emerald-50 to-green-50 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-emerald-100/50 shadow-sm text-sm sm:text-base">
                {location.address}
              </p>
            </div>

            {/* Enhanced Map - Full Width */}
            <div
              onClick={handleLocationClick}
              className={`relative w-full h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-emerald-100 via-green-100 to-lime-100 rounded-2xl sm:rounded-3xl overflow-hidden ${
                isEditing ? 'cursor-crosshair' : 'cursor-default'
              } shadow-inner border-2 border-white/50 transition-all duration-500 hover:shadow-2xl group`}
            >
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.3) 1px, transparent 0)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              
              {/* Location marker */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 group-hover:scale-110"
                style={{
                  left: `${50 + (location.lng - mapCenter.lng) * 500}%`,
                  top: `${50 - (location.lat - mapCenter.lat) * 500}%`
                }}
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 sm:border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>

              {/* Instructions */}
              {isEditing && (
                <div className="absolute top-3 sm:top-6 left-3 sm:left-6 bg-black/80 backdrop-blur-sm text-white px-3 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl border border-white/20 text-xs sm:text-sm">
                  ✨ Click anywhere to set farm location
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 text-gray-600 bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-green-100/50">
              {isEditing ? (
                <p className="font-medium text-sm sm:text-base">🎯 Click on the map to set your farm location, or use the "Use Current Location" button to automatically detect your position.</p>
              ) : (
                <p className="font-medium text-sm sm:text-base">📍 Your farm location is marked on the map above.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;