import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Globe,
  Hash,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Route,
  Save,
  Shield,
  ShoppingBag,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { API_BASES } from '../config/api';

const DEFAULT_LOCATION = {
  lat: 6.9271,
  lng: 79.8612,
  address: 'Colombo, Western Province, Sri Lanka'
};

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBlnL8xcC0cYhUHCHJdQDXSwWR7X7j9sWo';

const QUICK_PREFERENCE_PROMPTS = [
  'I prefer fresh produce with consistent quality each week.',
  'Morning delivery windows work better for my household.',
  'I usually buy vegetables, fruits, and weekly essentials together.',
  'Careful packaging and arrival updates matter to me.'
];

const createDefaultProfileState = (user) => {
  const parts = String(user?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: user?.firstName || parts[0] || '',
    lastName: user?.lastName || parts.slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    age: '',
    nicNumber: '',
    address: '',
    city: '',
    bio: '',
    profileImage: user?.avatar || null,
    existingImage: user?.avatar || null,
    imageFile: null
  };
};

const mapProfileFromResponse = (data, user) => {
  const fallback = createDefaultProfileState(user);

  return {
    firstName: data.first_name || fallback.firstName,
    lastName: data.last_name || fallback.lastName,
    email: data.email || fallback.email,
    phone: data.phone || '',
    age: data.age ? String(data.age) : '',
    nicNumber: data.nic_number || '',
    address: data.address || '',
    city: data.city || '',
    bio: data.bio || '',
    profileImage: data.profile_image || fallback.profileImage || null,
    existingImage: data.profile_image || fallback.profileImage || null,
    imageFile: null
  };
};

const mapLocationFromResponse = (data) => ({
  lat: data.location_lat ? Number.parseFloat(data.location_lat) : DEFAULT_LOCATION.lat,
  lng: data.location_lng ? Number.parseFloat(data.location_lng) : DEFAULT_LOCATION.lng,
  address: data.location_address || DEFAULT_LOCATION.address
});

const safeValue = (value, fallback = 'Not added yet') =>
  String(value || '').trim() ? value : fallback;

const hasCompletedValue = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return Boolean(String(value || '').trim());
};

const getInitials = (firstName, lastName) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'CU';

const clampNumber = (value, min, max) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return '';
  }

  return String(Math.min(max, Math.max(min, parsed)));
};

const getMarkerIcon = () => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C8.954 0 0 8.954 0 20c0 9.6 12 27 20 27 8 0 20-17.4 20-27 0-11.046-8.954-20-20-20z" fill="#16a34a"/>
      <circle cx="20" cy="20" r="7" fill="white"/>
      <path d="M20 4.5c-8.284 0-15 6.716-15 15 0 7.5 9 21 15 21 6 0 15-13.5 15-21 0-8.284-6.716-15-15-15z" fill="none" stroke="#15803d" stroke-width="1.5"/>
    </svg>
  `)}`,
  scaledSize: new window.google.maps.Size(40, 48),
  anchor: new window.google.maps.Point(20, 48)
});

const FieldCard = ({
  label,
  icon: Icon,
  isEditing,
  value,
  fallback,
  children,
  className = ''
}) => (
  <div className={`rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4 shadow-sm ${className}`}>
    <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-slate-500">
      {createElement(Icon, { className: 'h-4 w-4 text-emerald-500' })}
      <span>{label}</span>
    </div>
    {isEditing ? (
      children
    ) : (
      <p className="text-sm font-semibold leading-7 text-slate-800">{safeValue(value, fallback)}</p>
    )}
  </div>
);

const InsightCard = ({ label, value, helper, tone = 'default' }) => {
  const toneClasses =
    tone === 'accent'
      ? 'border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-white'
      : tone === 'success'
        ? 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50'
        : tone === 'warning'
          ? 'border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50'
          : 'border-slate-200 bg-gradient-to-br from-white to-slate-50';

  const valueClasses = tone === 'accent' ? 'text-white' : 'text-slate-950';
  const helperClasses =
    tone === 'accent' ? 'text-emerald-100/85' : tone === 'warning' ? 'text-amber-700/90' : 'text-slate-500';

  return (
    <div className={`rounded-[1.7rem] border p-5 shadow-sm ${toneClasses}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${helperClasses}`}>{label}</p>
      <p className={`mt-3 text-2xl font-black ${valueClasses}`}>{value}</p>
      <p className={`mt-2 text-sm leading-7 ${helperClasses}`}>{helper}</p>
    </div>
  );
};

const StatusBanner = ({ message }) => {
  if (!message) {
    return null;
  }

  const wrapperClasses =
    message.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <div className={`flex items-start gap-3 rounded-[1.3rem] border px-4 py-3 text-sm font-medium shadow-sm ${wrapperClasses}`}>
      {message.type === 'success' ? (
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
};

const CustomerProfile = ({ user, onBack, onLogout, onProfileSaved }) => {
  const userId = user?.id || localStorage.getItem('userId');
  const defaultProfile = useMemo(() => createDefaultProfileState(user), [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [profileData, setProfileData] = useState(defaultProfile);
  const [savedProfileData, setSavedProfileData] = useState(defaultProfile);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [savedLocation, setSavedLocation] = useState(DEFAULT_LOCATION);

  const pageScrollRef = useRef(null);
  const mapContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  const fullName = useMemo(
    () => `${profileData.firstName} ${profileData.lastName}`.trim() || 'Customer Profile',
    [profileData.firstName, profileData.lastName]
  );
  const profileInitials = useMemo(
    () => getInitials(profileData.firstName, profileData.lastName),
    [profileData.firstName, profileData.lastName]
  );

  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const syncProfileState = useCallback(
    (data) => {
      const nextProfile = mapProfileFromResponse(data, user);
      const nextLocation = mapLocationFromResponse(data);

      setProfileData(nextProfile);
      setSavedProfileData(nextProfile);
      setLocation(nextLocation);
      setSavedLocation(nextLocation);
    },
    [user]
  );

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfileData(defaultProfile);
      setSavedProfileData(defaultProfile);
      setLocation(DEFAULT_LOCATION);
      setSavedLocation(DEFAULT_LOCATION);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASES.customer}/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Unable to load customer profile.');
      }

      const data = await response.json();
      syncProfileState(data);
      return data;
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfileData(defaultProfile);
      setSavedProfileData(defaultProfile);
      setLocation(DEFAULT_LOCATION);
      setSavedLocation(DEFAULT_LOCATION);
      setStatusMessage({
        type: 'error',
        text: 'We could not load the latest profile details. Showing the fallback profile instead.'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [defaultProfile, syncProfileState, userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!statusMessage || statusMessage.type !== 'success') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3600);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return undefined;
    }

    const existingScript = document.getElementById('customer-profile-google-maps');
    const handleLoad = () => setMapLoaded(true);
    const handleError = () =>
      setStatusMessage({
        type: 'error',
        text: 'Google Maps could not be loaded. You can still update the rest of the profile.'
      });

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.id = 'customer-profile-google-maps';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const updateLocationFromCoords = useCallback((lat, lng, customAddress) => {
    setLocation((currentLocation) => ({
      ...currentLocation,
      lat,
      lng,
      address: customAddress || 'Resolving address...'
    }));

    if (customAddress) {
      return;
    }

    const geocoder = geocoderRef.current;
    if (!geocoder) {
      setLocation((currentLocation) => ({
        ...currentLocation,
        lat,
        lng,
        address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      }));
      return;
    }

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setLocation((currentLocation) => ({
          ...currentLocation,
          lat,
          lng,
          address: results[0].formatted_address
        }));
      } else {
        setLocation((currentLocation) => ({
          ...currentLocation,
          lat,
          lng,
          address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google || mapInstanceRef.current) {
      return;
    }

    const googleMap = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: location.lat, lng: location.lng },
      zoom: 15,
      styles: [
        { featureType: 'all', elementType: 'geometry.fill', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#e8f5e9' }] },
        { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#c8e6c9' }] },
        { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#4db6ac' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });

    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: googleMap,
      title: 'Delivery Location',
      draggable: isEditing,
      icon: getMarkerIcon()
    });

    geocoderRef.current = new window.google.maps.Geocoder();
    mapInstanceRef.current = googleMap;
    markerRef.current = marker;

    googleMap.addListener('click', (event) => {
      if (!isEditing || !event.latLng) {
        return;
      }

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      updateLocationFromCoords(lat, lng);
    });

    marker.addListener('dragend', () => {
      if (!isEditing) {
        return;
      }

      const position = marker.getPosition();
      if (!position) {
        return;
      }

      updateLocationFromCoords(position.lat(), position.lng());
    });
  }, [isEditing, location.lat, location.lng, mapLoaded, updateLocationFromCoords]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) {
      return;
    }

    markerRef.current.setDraggable(isEditing);
    markerRef.current.setPosition({ lat: location.lat, lng: location.lng });
    mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
  }, [isEditing, location.lat, location.lng]);

  const handleInputChange = useCallback((field, value) => {
    setProfileData((currentProfile) => ({
      ...currentProfile,
      [field]: value
    }));
  }, []);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please choose a valid image file for the profile photo.'
      });
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (loadEvent) => {
      setProfileData((currentProfile) => ({
        ...currentProfile,
        profileImage: loadEvent.target?.result || null,
        imageFile: file
      }));
    };
    fileReader.readAsDataURL(file);
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        markerRef.current?.setPosition({ lat, lng });
        mapInstanceRef.current?.setCenter({ lat, lng });
        updateLocationFromCoords(lat, lng);
      },
      (error) => {
        let message = 'Unable to retrieve your location.';

        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission was denied. Please allow location access and try again.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }

        setStatusMessage({
          type: 'error',
          text: message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [updateLocationFromCoords]);

  const handleAppendPrompt = useCallback((prompt) => {
    setProfileData((currentProfile) => {
      const currentBio = currentProfile.bio.trim();

      if (currentBio.includes(prompt)) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        bio: currentBio ? `${currentBio}\n- ${prompt}` : prompt
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setProfileData(savedProfileData);
    setLocation(savedLocation);
    setIsEditing(false);
    setStatusMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [savedLocation, savedProfileData]);

  const handleSave = useCallback(async () => {
    if (!userId) {
      setStatusMessage({
        type: 'error',
        text: 'Customer account ID is missing. Please sign in again.'
      });
      return;
    }

    if (!profileData.firstName.trim() || !profileData.email.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'First name and email are required before saving the profile.'
      });
      return;
    }

    try {
      setSaving(true);
      setStatusMessage(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('first_name', profileData.firstName.trim());
      formData.append('last_name', profileData.lastName.trim());
      formData.append('email', profileData.email.trim());
      formData.append('phone', profileData.phone.trim());
      formData.append('age', profileData.age);
      formData.append('nic_number', profileData.nicNumber.trim());
      formData.append('address', profileData.address.trim());
      formData.append('city', profileData.city.trim());
      formData.append('country', 'Sri Lanka');
      formData.append('bio', profileData.bio.trim());
      formData.append('location_lat', String(location.lat));
      formData.append('location_lng', String(location.lng));
      formData.append('location_address', location.address);
      formData.append('existing_image', profileData.existingImage || '');

      if (profileData.imageFile) {
        formData.append('profile_image', profileData.imageFile);
      }

      const response = await fetch(`${API_BASES.customer}/profile/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save customer profile.');
      }

      const refreshedProfile = await fetchProfile();

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser) {
          storedUser.name = `${profileData.firstName} ${profileData.lastName}`.trim() || storedUser.name;
          storedUser.email = profileData.email || storedUser.email;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      } catch (error) {
        console.error('Failed to sync local user data:', error);
      }

      if (refreshedProfile && onProfileSaved) {
        onProfileSaved(refreshedProfile);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: 'Customer profile updated successfully.'
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      setStatusMessage({
        type: 'error',
        text: error.message || 'Failed to save customer profile.'
      });
    } finally {
      setSaving(false);
    }
  }, [
    fetchProfile,
    location.address,
    location.lat,
    location.lng,
    onProfileSaved,
    profileData.address,
    profileData.age,
    profileData.bio,
    profileData.city,
    profileData.email,
    profileData.existingImage,
    profileData.firstName,
    profileData.imageFile,
    profileData.lastName,
    profileData.nicNumber,
    profileData.phone,
    userId
  ]);

  const scrollToSection = useCallback((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  const hasDeliveryCoordinates =
    location.address !== DEFAULT_LOCATION.address ||
    location.lat !== DEFAULT_LOCATION.lat ||
    location.lng !== DEFAULT_LOCATION.lng;

  const profileChecks = useMemo(
    () => [
      { label: 'First name', value: profileData.firstName },
      { label: 'Last name', value: profileData.lastName },
      { label: 'Email', value: profileData.email },
      { label: 'Phone', value: profileData.phone },
      { label: 'Age', value: profileData.age },
      { label: 'NIC', value: profileData.nicNumber },
      { label: 'Address', value: profileData.address },
      { label: 'City', value: profileData.city },
      { label: 'Preferences', value: profileData.bio },
      { label: 'Delivery pin', value: hasDeliveryCoordinates }
    ],
    [
      hasDeliveryCoordinates,
      profileData.address,
      profileData.age,
      profileData.bio,
      profileData.city,
      profileData.email,
      profileData.firstName,
      profileData.lastName,
      profileData.nicNumber,
      profileData.phone
    ]
  );

  const completionPercentage = useMemo(
    () =>
      Math.round(
        (profileChecks.filter((item) => hasCompletedValue(item.value)).length / profileChecks.length) * 100
      ),
    [profileChecks]
  );

  const deliveryReadinessChecks = [
    Boolean(profileData.phone),
    Boolean(profileData.address),
    Boolean(profileData.city),
    hasDeliveryCoordinates
  ];

  const deliveryReadiness = Math.round(
    (deliveryReadinessChecks.filter(Boolean).length / deliveryReadinessChecks.length) * 100
  );

  const profileTier =
    completionPercentage >= 90
      ? 'Signature ready'
      : completionPercentage >= 72
        ? 'Premium in progress'
        : 'Foundation mode';

  const responseReadiness =
    profileData.phone && profileData.email ? 'Support-ready' : 'Basic contact only';

  const preferenceDepth = profileData.bio.trim()
    ? profileData.bio.trim().length >= 120
      ? 'Detailed shopping brief'
      : 'Preference snapshot'
    : 'Preferences pending';

  const missingItems = profileChecks.filter((item) => !hasCompletedValue(item.value)).map((item) => item.label);

  const insightCards = [
    {
      label: 'Profile completion',
      value: `${completionPercentage}%`,
      helper: 'Complete details help the marketplace personalise support and delivery better.',
      tone: completionPercentage >= 80 ? 'success' : 'default'
    },
    {
      label: 'Delivery readiness',
      value: `${deliveryReadiness}%`,
      helper: 'Phone, address, city, and map location shape this delivery confidence score.',
      tone: deliveryReadiness >= 75 ? 'accent' : 'warning'
    },
    {
      label: 'Buyer profile',
      value: profileData.bio ? 'Preference-led' : 'General buyer',
      helper: 'Shopping notes help the platform understand your habits more clearly.',
      tone: 'default'
    },
    {
      label: 'Response mode',
      value: responseReadiness,
      helper: 'Stronger contact details make order updates and issue resolution much easier.',
      tone: profileData.phone ? 'success' : 'default'
    }
  ];

  const nextSteps = [
    !profileData.phone
      ? {
          title: 'Add a reachable phone number',
          helper: 'Delivery calls and urgent order updates work better with a direct contact number.'
        }
      : null,
    !profileData.address
      ? {
          title: 'Set your delivery street address',
          helper: 'A stronger street address makes seller coordination and drop-off planning easier.'
        }
      : null,
    !profileData.city
      ? {
          title: 'Choose your city',
          helper: 'City data improves delivery context and helps define your active service area.'
        }
      : null,
    !hasDeliveryCoordinates
      ? {
          title: 'Pin your location on the map',
          helper: 'A saved map point helps prevent confusion and gives the profile a premium finish.'
        }
      : null,
    profileData.bio.trim().length < 50
      ? {
          title: 'Describe shopping preferences',
          helper: 'Mention product types, quality expectations, or delivery style to make the account smarter.'
        }
      : null
  ].filter(Boolean);

  const sectionCards = [
    {
      id: 'identity-section',
      icon: User,
      label: 'Identity',
      value: `${profileData.firstName && profileData.email ? 'Ready' : 'Needs care'}`,
      helper: 'Name, email, phone, and trust details.'
    },
    {
      id: 'delivery-section',
      icon: MapPin,
      label: 'Delivery',
      value: `${deliveryReadiness}% ready`,
      helper: 'Address quality and order reachability.'
    },
    {
      id: 'preferences-section',
      icon: ShoppingBag,
      label: 'Preferences',
      value: preferenceDepth,
      helper: 'Shopping habits, product expectations, and delivery style.'
    },
    {
      id: 'map-section',
      icon: Route,
      label: 'Map pin',
      value: hasDeliveryCoordinates ? 'Connected' : 'Pending',
      helper: 'Precise delivery point for future orders.'
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-500 sm:h-16 sm:w-16" />
          <p className="mt-4 text-base font-medium text-gray-600 sm:text-lg">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageScrollRef}
      className="h-full max-h-full w-full overflow-x-hidden overflow-y-auto bg-[#f4efe6] text-slate-950"
    >
      <div className="relative min-h-full pb-28 pt-4 lg:pb-12">
        <div className="pointer-events-none absolute left-[-4rem] top-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-4rem] top-0 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl" />

        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <section className="overflow-hidden rounded-[2.7rem] bg-slate-950 text-white shadow-[0_34px_90px_-34px_rgba(15,23,42,0.72)]">
            <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.92),rgba(6,95,70,0.84))] px-6 py-7 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to customer panel
                </button>

                {onLogout ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 sm:w-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : null}
              </div>

              <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                      <Sparkles className="h-4 w-4" />
                      Updated customer workspace
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                      <Shield className="h-4 w-4" />
                      Responsive profile command center
                    </span>
                  </div>

                  <div>
                    <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl xl:text-[3.85rem]">
                      A redesigned customer page that feels modern, clear, and easy to use.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm leading-8 text-white/75 sm:text-base">
                      This refreshed profile brings identity, delivery setup, shopping preferences, and
                      status signals into one smarter layout so customers can update everything faster on
                      both desktop and mobile.
                    </p>
                  </div>

                  <StatusBanner message={statusMessage} />

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setStatusMessage(null);
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-50 sm:w-auto"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit customer profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {saving ? 'Saving profile' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: 'Profile tier',
                        value: profileTier,
                        helper: 'How complete and premium the customer profile feels right now.'
                      },
                      {
                        label: 'Delivery state',
                        value: hasDeliveryCoordinates ? 'Pin verified' : 'Map pin needed',
                        helper: 'Coordinates and address work together for cleaner order handoffs.'
                      },
                      {
                        label: 'Preference depth',
                        value: preferenceDepth,
                        helper: 'Richer shopping notes improve support and future relevance.'
                      }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-4"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-black text-white">{item.value}</p>
                        <p className="mt-2 text-xs leading-6 text-white/70">{item.helper}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.62)] backdrop-blur-md xl:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/62">
                    Customer identity
                  </p>

                  <div className="mt-5 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                    <div className="relative mx-auto lg:mx-0">
                      <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),rgba(255,255,255,0.08)_55%,rgba(15,23,42,0.35))] p-2 text-4xl font-black text-white shadow-[0_22px_48px_-20px_rgba(15,23,42,0.72)] sm:h-48 sm:w-48 lg:h-[220px] lg:w-[220px]">
                        {profileData.profileImage ? (
                          <img
                            src={profileData.profileImage}
                            alt={fullName}
                            className="h-full w-full rounded-[1.6rem] object-cover"
                          />
                        ) : (
                          profileInitials
                        )}
                      </div>

                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg transition hover:bg-emerald-50"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      ) : null}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-3xl font-black text-white sm:text-[2.2rem] xl:text-[2.5rem]">
                        {fullName}
                      </h2>
                      <p className="mt-2 text-sm text-white/75">
                        {safeValue(profileData.email, 'Email not added yet')}
                      </p>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                        A cleaner, friendlier profile surface for managing contact details, delivery
                        readiness, and customer preferences without the page feeling heavy or confusing.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                          {safeValue(profileData.city, 'Sri Lanka shopper')}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                          {profileData.bio ? 'Preference-led account' : 'Profile still growing'}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                          {hasDeliveryCoordinates ? 'Delivery pin locked' : 'Delivery pin pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                          Completion score
                        </p>
                        <p className="mt-2 text-3xl font-black text-white">{completionPercentage}%</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        {profileChecks.filter((item) => hasCompletedValue(item.value)).length} of{' '}
                        {profileChecks.length} ready
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                          Delivery readiness
                        </p>
                        <p className="mt-2 text-lg font-black text-white">{deliveryReadiness}%</p>
                        <p className="mt-2 text-xs leading-6 text-white/70">
                          Powered by phone, address, city, and a saved map point.
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                          Contact mode
                        </p>
                        <p className="mt-2 text-lg font-black text-white">{responseReadiness}</p>
                        <p className="mt-2 text-xs leading-6 text-white/70">
                          Stronger contact details make support and order updates smoother.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {insightCards.map((item) => (
              <InsightCard key={item.label} {...item} />
            ))}
          </section>

          <section className="mt-8 rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Smart profile navigation
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  Jump straight to the part that needs attention
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
                  These cards make the customer page feel more guided, especially on smaller screens,
                  so you can move straight to identity, delivery, preferences, or the map workspace.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-4 xl:max-w-[360px]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700/85">
                  Recommended next move
                </p>
                <p className="mt-2 text-base font-black text-slate-950">
                  {nextSteps[0] ? nextSteps[0].title : 'Everything important is already in strong shape.'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {nextSteps[0]
                    ? nextSteps[0].helper
                    : 'You can still refresh your profile photo, shopping notes, or delivery pin any time.'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sectionCards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => scrollToSection(card.id)}
                    className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Open
                      </span>
                    </div>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">{card.value}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.helper}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <section
                id="identity-section"
                className="scroll-mt-24 rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                      Profile edit details
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      Edit personal and contact details with clearer labels
                    </h3>
                    <p className="mt-3 text-sm leading-8 text-slate-600">
                      Every field keeps its label visible so the edit form is easier to understand on
                      desktop and mobile.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {profileTier}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <FieldCard
                    label="First Name"
                    icon={User}
                    isEditing={isEditing}
                    value={profileData.firstName}
                    fallback="Add your first name"
                  >
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(event) => handleInputChange('firstName', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <FieldCard
                    label="Last Name"
                    icon={User}
                    isEditing={isEditing}
                    value={profileData.lastName}
                    fallback="Add your last name"
                  >
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(event) => handleInputChange('lastName', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <FieldCard
                    label="Email"
                    icon={Mail}
                    isEditing={isEditing}
                    value={profileData.email}
                    fallback="Add a primary email"
                  >
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(event) => handleInputChange('email', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <FieldCard
                    label="Phone"
                    icon={Phone}
                    isEditing={isEditing}
                    value={profileData.phone}
                    fallback="Add a reachable phone number"
                  >
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(event) => handleInputChange('phone', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <FieldCard
                    label="Age"
                    icon={Hash}
                    isEditing={isEditing}
                    value={profileData.age ? `${profileData.age} years` : ''}
                    fallback="Add your age"
                  >
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={profileData.age}
                      onChange={(event) => handleInputChange('age', clampNumber(event.target.value, 18, 100))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <FieldCard
                    label="NIC Number"
                    icon={Hash}
                    isEditing={isEditing}
                    value={profileData.nicNumber}
                    fallback="Add your NIC number"
                  >
                    <input
                      type="text"
                      value={profileData.nicNumber}
                      onChange={(event) => handleInputChange('nicNumber', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>
                </div>
              </section>

              <section
                id="delivery-section"
                className="scroll-mt-24 rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                      Delivery identity
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      Build a stronger address and fulfilment profile
                    </h3>
                    <p className="mt-3 text-sm leading-8 text-slate-600">
                      Address details and city context help coordinate smoother delivery, clearer routing,
                      and a more premium customer experience.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    {deliveryReadiness}% delivery ready
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <FieldCard
                    label="Street Address"
                    icon={MapPin}
                    isEditing={isEditing}
                    value={profileData.address}
                    fallback="Add your main delivery address"
                    className="md:col-span-2"
                  >
                    <textarea
                      rows={3}
                      value={profileData.address}
                      onChange={(event) => handleInputChange('address', event.target.value)}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Add your delivery street address"
                    />
                  </FieldCard>

                  <FieldCard
                    label="City"
                    icon={Globe}
                    isEditing={isEditing}
                    value={profileData.city}
                    fallback="Add your city"
                  >
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(event) => handleInputChange('city', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <span>Country</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Sri Lanka</p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      Delivery records are currently aligned to Sri Lanka for routing consistency.
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="preferences-section"
                className="scroll-mt-24 rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                      Shopping story
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      Add more customer context and buying preferences
                    </h3>
                    <p className="mt-3 text-sm leading-8 text-slate-600">
                      Share buying habits, freshness expectations, and delivery preferences so the
                      customer profile feels more intelligent and more useful.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    {preferenceDepth}
                  </span>
                </div>

                <div className="mt-6">
                  <FieldCard
                    label="Bio and Preferences"
                    icon={ShoppingBag}
                    isEditing={isEditing}
                    value={profileData.bio}
                    fallback="No shopping preferences added yet."
                    className="bg-white"
                  >
                    <textarea
                      rows={6}
                      value={profileData.bio}
                      onChange={(event) => handleInputChange('bio', event.target.value)}
                      placeholder="Tell us about preferred products, freshness expectations, delivery style, or what matters most in your orders."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </FieldCard>
                </div>

                {isEditing ? (
                  <div className="mt-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Quick prompt chips
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {QUICK_PREFERENCE_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleAppendPrompt(prompt)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          Add prompt
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <aside className="self-start space-y-6 xl:sticky xl:top-6">
              <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Profile strength
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  See what still needs attention
                </h3>

                <div className="mt-5 rounded-[1.6rem] bg-slate-950 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/58">
                    Completion score
                  </p>
                  <p className="mt-2 text-3xl font-black">{completionPercentage}%</p>
                  <p className="mt-3 text-sm text-white/74">
                    More complete customer details create a profile that feels more polished and more useful.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {missingItems.length > 0 ? (
                    missingItems.slice(0, 6).map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Add {item.toLowerCase()} for a stronger customer profile.
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
                      Your customer profile is in strong shape. Keep it updated as your routine changes.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Customer snapshot
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  A quick view of the account
                </h3>

                <div className="mt-5 grid gap-4">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Primary email
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {safeValue(profileData.email)}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Delivery city
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {safeValue(profileData.city || location.address)}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Account mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {profileData.bio ? 'Preference-led buyer' : 'Basic buyer account'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Smart signals
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  Guidance and next-best actions
                </h3>

                <div className="mt-5 space-y-4">
                  {[
                    {
                      icon: Shield,
                      label: 'Account posture',
                      value: profileTier,
                      helper: 'A summary of how complete and polished the customer identity feels.'
                    },
                    {
                      icon: ShoppingBag,
                      label: 'Buyer mode',
                      value: profileData.bio ? 'Preference-led buyer' : 'General marketplace buyer',
                      helper: 'Shopping notes help support and future recommendations understand your priorities.'
                    },
                    {
                      icon: Route,
                      label: 'Delivery precision',
                      value: hasDeliveryCoordinates ? 'Verified delivery point' : 'Pending delivery point',
                      helper: 'Precise coordinates make premium fulfilment and routing much easier.'
                    },
                    {
                      icon: Clock3,
                      label: 'Response readiness',
                      value: responseReadiness,
                      helper: 'Email and phone availability shape how fast the platform can reach you.'
                    }
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-900">{item.value}</p>
                            <p className="mt-2 text-xs leading-6 text-slate-500">{item.helper}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-emerald-100 bg-emerald-50/80 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700/85">
                    Recommended next steps
                  </p>
                  <div className="mt-4 space-y-3">
                    {nextSteps.length > 0 ? (
                      nextSteps.slice(0, 4).map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[1.3rem] bg-white/90 px-4 py-3 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs leading-6 text-slate-500">{item.helper}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.3rem] bg-white/90 px-4 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        Your customer profile is already prepared for a stronger marketplace experience.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </aside>
          </section>

          <section
            id="map-section"
            className="scroll-mt-24 mt-6 rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Delivery location workspace
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  Manage the full updated delivery map experience
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
                  Save a precise location, keep your delivery address aligned, and make future orders
                  easier to fulfil with a clear map workspace.
                </p>
              </div>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={!mapLoaded}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Navigation className="h-4 w-4" />
                  Use current location
                </button>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                1. choose the delivery point
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                2. review the address text
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                3. save for future orders
              </span>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Delivery address
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={location.address}
                        onChange={(event) =>
                          setLocation((currentLocation) => ({
                            ...currentLocation,
                            address: event.target.value
                          }))
                        }
                        placeholder="Type the delivery location or use the map below"
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        {safeValue(location.address)}
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      This saved location stays connected to its coordinates when the profile is updated.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Saved area</p>
                    <p className="mt-2">{safeValue(profileData.city, 'Sri Lanka')}</p>
                  </div>
                </div>

                <div className="mb-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {location.address}
                </div>

                <div className="relative h-64 overflow-hidden rounded-[1.75rem] border border-slate-200 sm:h-80 xl:h-[540px]">
                  {!mapLoaded ? (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
                        <p className="mt-3 text-sm font-medium text-green-700">Loading Google Maps...</p>
                      </div>
                    </div>
                  ) : (
                    <div ref={mapContainerRef} className="h-full w-full" />
                  )}

                  {isEditing && mapLoaded ? (
                    <div className="absolute left-4 top-4 rounded-2xl bg-slate-900/85 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                      Click the map or drag the pin to update the delivery location
                    </div>
                  ) : null}

                  {mapLoaded ? (
                    <div className="absolute bottom-4 right-4 rounded-lg bg-white/92 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-lg">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Coordinates
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-800">
                    <p>Latitude: {location.lat.toFixed(6)}</p>
                    <p>Longitude: {location.lng.toFixed(6)}</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Delivery sync
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    The address text and map coordinates are stored together when you save the page.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Smart tip
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    A more precise saved location reduces confusion and makes the customer journey feel more premium.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Location confidence
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    {hasDeliveryCoordinates
                      ? 'Connected to a precise delivery point'
                      : 'Waiting for a stronger delivery location'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {isEditing ? (
            <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
              <div className="rounded-[1.8rem] border border-slate-200 bg-white/96 p-3 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Editing live
                    </p>
                    <p className="mt-1 truncate text-sm font-black text-slate-950">
                      {completionPercentage}% complete and {deliveryReadiness}% delivery ready
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {nextSteps[0] ? nextSteps[0].title : 'Ready to save whenever you are.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? 'Saving' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
