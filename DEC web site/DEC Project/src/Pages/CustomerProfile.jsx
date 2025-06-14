import React, { useState, useRef } from 'react';
import { Camera, MapPin, Edit3, Save, X, User, Mail, Phone, Calendar, Globe, Sparkles, ArrowLeft } from 'lucide-react';

const CustomerProfile = ({ user, onBack, onLogout }) => {
  console.log('CustomerProfile component rendered with props:', { user, onBack, onLogout });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Helper function to parse name properly
  const parseName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const nameParts = fullName.trim().split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || ''
    };
  };

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || parseName(user?.name).firstName || 'John',
    lastName: user?.lastName || parseName(user?.name).lastName || '',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+94 71 234 5678',
    dateOfBirth: user?.dateOfBirth || '1990-05-15',
    address: user?.address || '123 Main Street',
    city: user?.city || 'Colombo',
    country: user?.country || 'Sri Lanka',
    bio: user?.bio || 'Passionate about agriculture and innovation. Love exploring sustainable farming practices and connecting with fellow farmers.',
    profileImage: user?.profileImage || null
  });
  
  const [location, setLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    address: 'New York, NY, USA'
  });
  
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (file && file.type.startsWith('image/')) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      console.log('Reading file as data URL...');
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read successfully');
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
        // Clear any previous errors
        setError('');
      };
      reader.onerror = () => {
        console.error('Failed to read file');
        setError('Failed to read image file');
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  // Load user profile data on component mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        console.log('Stored user:', storedUser ? JSON.parse(storedUser) : null);
        console.log('Props user:', user);
        
        if (!user?.id && !storedUser) {
          setError('Please login to view your profile');
          return;
        }

        const userData = storedUser ? JSON.parse(storedUser) : user;
        // Use 'id' from login system, not 'userId'
        const userId = userData?.id || user?.id;

        if (!userId) {
          console.error('User ID not found in:', { userData, user });
          setError('User ID not found. Please login again.');
          return;
        }

        console.log('Loading profile for userId:', userId);

        // Load profile data using the simple endpoint
        const profileResponse = await fetch(`http://localhost:3000/api/customer/profile/${userId}`);

        console.log('Profile response status:', profileResponse.status);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Profile loaded:', profileData);
          
          // Update profile state with database data
          setProfileData({
            firstName: profileData.first_name || 'John',
            lastName: profileData.last_name || '',
            email: profileData.email || 'john.doe@example.com',
            phone: profileData.phone || '+94 71 234 5678',
            dateOfBirth: profileData.date_of_birth || '1990-05-15',
            address: profileData.address || '123 Main Street',
            city: profileData.city || 'Colombo',
            country: profileData.country || 'Sri Lanka',
            bio: profileData.bio || 'Passionate about agriculture and innovation.',
            profileImage: profileData.profile_image || null
          });

          // Update location if available
          if (profileData.location_lat && profileData.location_lng) {
            const lat = parseFloat(profileData.location_lat);
            const lng = parseFloat(profileData.location_lng);
            setLocation({
              lat: lat,
              lng: lng,
              address: profileData.location_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            });
            setMapCenter({ lat: lat, lng: lng });
          }
        } else {
          console.error('Failed to load profile:', profileResponse.status);
          const errorText = await profileResponse.text();
          console.error('Error response:', errorText);
          // Profile might not exist yet, that's okay
        }
        
      } catch (error) {
        console.error('Profile load error:', error);
        if (error.message.includes('fetch')) {
          setError('Cannot connect to server. Please check if backend is running on port 3000.');
        } else {
          setError('Failed to load profile data');
        }
      }
    };

    loadProfile();
  }, [user]);

  const inputClasses = "w-full px-4 py-3.5 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 placeholder:text-gray-400 hover:bg-white/90 shadow-sm hover:shadow-md";
  const readOnlyClasses = "text-gray-800 py-3.5 px-4 font-medium bg-gradient-to-r from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-sm";

  // Helper function to get display name
  const getDisplayName = () => {
    const firstName = profileData.firstName;
    const lastName = profileData.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return 'User';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : user;
      const userId = userData?.id || user?.id;

      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      // Validate required fields
      if (!profileData.firstName.trim()) {
        setError('First name is required');
        return;
      }

      if (!profileData.email.trim()) {
        setError('Email is required');
        return;
      }

      // Prepare form data for API
      const formData = new FormData();
      formData.append('first_name', profileData.firstName.trim());
      formData.append('last_name', profileData.lastName ? profileData.lastName.trim() : '');
      formData.append('email', profileData.email.trim());
      formData.append('phone', profileData.phone ? profileData.phone.trim() : '');
      formData.append('date_of_birth', profileData.dateOfBirth || '');
      formData.append('address', profileData.address ? profileData.address.trim() : '');
      formData.append('city', profileData.city ? profileData.city.trim() : '');
      formData.append('country', profileData.country ? profileData.country.trim() : 'Sri Lanka');
      formData.append('bio', profileData.bio ? profileData.bio.trim() : '');
      formData.append('location_lat', location.lat || '');
      formData.append('location_lng', location.lng || '');
      formData.append('location_address', location.address || '');
      formData.append('existing_image', profileData.profileImage || '');

      // Add the actual file if one was selected
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        console.log('Adding file to form data:', fileInputRef.current.files[0].name);
        formData.append('profile_image', fileInputRef.current.files[0]);
      }

      console.log('Saving profile for user:', userId);

      const response = await fetch(`http://localhost:3000/api/customer/profile/${userId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Save failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save response:', result);

      if (result.success) {
        setSuccessMessage('Profile saved successfully!');
        setIsEditing(false);
        
        // Clear the file input after successful upload to allow new uploads
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          console.log('File input cleared');
        }
        
        // Update profile data with new image URL if provided
        if (result.profileImageUrl) {
          setProfileData(prev => ({
            ...prev,
            profileImage: result.profileImageUrl
          }));
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Save failed');
      }

    } catch (error) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    
    // Clear any pending file upload and reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      console.log('File input cleared on cancel');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 w-full">
      <div className="w-full h-full p-0">
        {/* Fixed Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-indigo-500/10">
          <div className="px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Back button clicked!');
                  if (onBack) {
                    onBack();
                  } else {
                    console.error('onBack function not provided!');
                  }
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                type="button"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-gray-700 font-medium">{getDisplayName()}</span>
                  <p className="text-gray-500 text-sm">{profileData.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Logout button clicked from profile!');
                    if (onLogout) {
                      onLogout();
                    } else {
                      console.error('onLogout function not provided!');
                    }
                  }}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add top padding to account for fixed navigation */}
        <div className="pt-16">
          {/* Floating Header with Glassmorphism */}
          <div className="relative bg-white/40 backdrop-blur-xl rounded-none shadow-xl border-none p-6 lg:p-8 mb-0 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                <p className="text-green-700 font-semibold text-center">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-red-700 font-semibold text-center">{error}</p>
              </div>
            )}

            {/* Header Content */}
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Sparkles className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Profile
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your personal information</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)
                    }
                    className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    <Edit3 size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="group-hover:scale-110 transition-transform duration-300" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="group flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
                    >
                      <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Section */}
              <div className="flex flex-col xl:flex-row gap-12">
                {/* Profile Image */}
                <div className="flex flex-col items-center xl:items-start">
                  <div className="relative group">
                    <div className="w-44 h-44 lg:w-52 lg:h-52 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-2xl backdrop-blur-sm">
                      {profileData.profileImage ? (
                        <img
                          src={profileData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={64} className="text-blue-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => {
                          console.log('Camera button clicked');
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-110 group-hover:animate-bounce"
                        type="button"
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
                      key={`image-upload-${Date.now()}`} // Force recreation on each render
                    />
                  </div>
                  <div className="mt-6 text-center xl:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                      {getDisplayName()}
                    </h2>
                    <p className="text-gray-600 mt-2 font-medium">{profileData.email}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">
                      FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={inputClasses}
                        placeholder="Enter your first name"
                        required
                      />
                    ) : (
                      <p className={readOnlyClasses}>{profileData.firstName || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">
                      LAST NAME <span className="text-gray-400 text-xs"></span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={inputClasses}
                        placeholder="Enter your last name (optional)"
                      />
                    ) : (
                      profileData.lastName && profileData.lastName.trim() ? (
                        <p className={readOnlyClasses}>{profileData.lastName}</p>
                      ) : (
                        <p className="text-gray-400 py-3.5 px-4 font-medium bg-gradient-to-r from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-sm">
                          Not provided
                        </p>
                      )
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">
                      EMAIL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={inputClasses + " pl-12"}
                          placeholder="your.email@example.com"
                          required
                        />
                      ) : (
                        <p className={readOnlyClasses + " pl-12"}>{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">PHONE</label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={inputClasses + " pl-12"}
                        />
                      ) : (
                        <p className={readOnlyClasses + " pl-12"}>{profileData.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">DATE OF BIRTH</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className={inputClasses + " pl-12"}
                        />
                      ) : (
                        <p className={readOnlyClasses + " pl-12"}>{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 tracking-wide">COUNTRY</label>
                    <div className="relative">
                      <Globe size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className={inputClasses + " pl-12"}
                        />
                      ) : (
                        <p className={readOnlyClasses + " pl-12"}>{profileData.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 tracking-wide">ADDRESS</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={inputClasses}
                    />
                  ) : (
                    <p className={readOnlyClasses}>{profileData.address}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 tracking-wide">CITY</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={inputClasses}
                    />
                  ) : (
                    <p className={readOnlyClasses}>{profileData.city}</p>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-8 space-y-3">
                <label className="block text-sm font-bold text-gray-700 tracking-wide">BIO</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className={inputClasses + " resize-none"}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className={readOnlyClasses + " leading-relaxed"}>{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="relative bg-white/40 backdrop-blur-xl rounded-none shadow-xl border-none p-6 lg:p-8 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                    <MapPin className="text-white" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-800 bg-clip-text text-transparent">
                      Location
                    </h2>
                    <p className="text-gray-600 mt-1">Your current position</p>
                  </div>
                </div>
                
                {isEditing && (
                  <button
                    onClick={getCurrentLocation}
                    className="group bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span className="group-hover:animate-pulse">📍 Use Current Location</span>
                  </button>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-700 font-semibold bg-gradient-to-r from-emerald-50 to-blue-50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-emerald-100/50 shadow-sm">
                  {location.address}
                </p>
              </div>

              {/* Enhanced Map */}
              <div
                onClick={handleLocationClick}
                className={`relative w-full h-80 lg:h-96 bg-gradient-to-br from-emerald-100 via-blue-100 to-cyan-100 rounded-3xl overflow-hidden ${
                  isEditing ? 'cursor-crosshair' : 'cursor-default'
                } shadow-inner border-2 border-white/50 transition-all duration-500 hover:shadow-2xl group`}
              >
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
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
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute top-0 left-0 w-10 h-10 lg:w-12 lg:h-12 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                {/* Instructions */}
                {isEditing && (
                  <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold shadow-2xl border border-white/20">
                    ✨ Click anywhere to set location
                  </div>
                )}
              </div>

              <div className="mt-6 text-gray-600 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-blue-100/50">
                {isEditing ? (
                  <p className="font-medium">🎯 Click on the map to set your location, or use the "Use Current Location" button to automatically detect your position.</p>
                ) : (
                  <p className="font-medium">📍 Your current location is marked on the map above.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;