import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Camera,
  Edit3,
  Globe,
  Hash,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Sprout,
  User,
  X
} from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASES } from '../config/api';

const DEFAULT_LOCATION = {
  lat: 6.9271,
  lng: 79.8612,
  address: 'Sri Lanka'
};

const FARMING_TYPE_OPTIONS = [
  'Organic Vegetable Farming',
  'Rice Cultivation',
  'Fruit Cultivation',
  'Livestock Farming',
  'Dairy Farming',
  'Poultry Farming',
  'Aquaculture',
  'Mixed Farming',
  'Spice Cultivation',
  'Tea Cultivation',
  'Coconut Cultivation',
  'Other'
];

const splitUserName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || 'Farmer',
    lastName: parts.slice(1).join(' ') || ''
  };
};

const createDefaultProfileState = (user) => {
  const { firstName, lastName } = splitUserName(user?.name);

  return {
    firstName: user?.firstName || firstName,
    lastName: user?.lastName || lastName,
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    nicNumber: user?.nicNumber || '',
    experience: user?.experience || '',
    farmingType: user?.farmingType || 'Mixed Farming',
    address: user?.address || '',
    city: user?.city || '',
    bio: user?.bio || '',
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
    age: data.age || '',
    nicNumber: data.nic_number || '',
    experience: data.experience || '',
    farmingType: data.farming_type || fallback.farmingType,
    address: data.address || '',
    city: data.city || '',
    bio: data.bio || '',
    profileImage: data.profile_image || null,
    existingImage: data.profile_image || null,
    imageFile: null
  };
};

const mapLocationFromResponse = (data) => ({
  lat: data.location_lat ? Number.parseFloat(data.location_lat) : DEFAULT_LOCATION.lat,
  lng: data.location_lng ? Number.parseFloat(data.location_lng) : DEFAULT_LOCATION.lng,
  address: data.location_address || DEFAULT_LOCATION.address
});

const getInitials = (firstName, lastName) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((namePart) => namePart[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'F';

const safeValue = (value, fallback = 'Not added yet') =>
  String(value || '').trim() ? value : fallback;

const clampNumber = (value, min, max) => {
  const numberValue = Number.parseInt(value, 10);
  if (Number.isNaN(numberValue)) return '';
  return String(Math.min(max, Math.max(min, numberValue)));
};

const formatCoordinatesAddress = (latitude, longitude) =>
  `Selected coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

const farmerLocationIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: linear-gradient(135deg, #10b981 0%, #15803d 100%);
      border: 3px solid #ffffff;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 700;
    ">
      F
    </div>
  `,
  className: 'farmer-location-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const LocationMapSync = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], Math.max(map.getZoom(), 14), {
      animate: true
    });
  }, [location.lat, location.lng, map]);

  return null;
};

const LocationPicker = ({ isEditing, onSelect }) => {
  useMapEvents({
    click(event) {
      if (!isEditing) return;
      onSelect(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
};

const ProfileField = ({
  label,
  icon: Icon,
  isEditing,
  value,
  fallback,
  children,
  className = ''
}) => (
  <div className={`rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm ${className}`}>
    <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      <Icon className="h-4 w-4 text-emerald-500" />
      <span>{label}</span>
    </div>
    {isEditing ? children : <p className="text-sm font-semibold text-slate-800">{safeValue(value, fallback)}</p>}
  </div>
);

const InsightCard = ({ label, value, helper, tone = 'default' }) => {
  const toneClasses =
    tone === 'success'
      ? 'from-emerald-50 to-green-50 border-emerald-100'
      : tone === 'accent'
        ? 'from-slate-900 to-emerald-900 border-slate-800 text-white'
        : 'from-white to-slate-50 border-slate-200';

  const valueClasses = tone === 'accent' ? 'text-white' : 'text-slate-900';
  const helperClasses = tone === 'accent' ? 'text-emerald-100/90' : 'text-slate-500';

  return (
    <div className={`rounded-[1.5rem] border bg-gradient-to-br p-4 shadow-sm ${toneClasses}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${helperClasses}`}>{label}</p>
      <p className={`mt-3 text-2xl font-bold ${valueClasses}`}>{value}</p>
      <p className={`mt-2 text-sm leading-6 ${helperClasses}`}>{helper}</p>
    </div>
  );
};

const FarmerProfile = ({ user, goBack, onLogout, embedded = false, onProfileSaved }) => {
  const userId = user?.id;
  const fileInputRef = useRef(null);

  const defaultProfile = useMemo(() => createDefaultProfileState(user), [user]);
  const [profileData, setProfileData] = useState(defaultProfile);
  const [savedProfileData, setSavedProfileData] = useState(defaultProfile);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [savedLocation, setSavedLocation] = useState(DEFAULT_LOCATION);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const mapLoaded = true;

  useEffect(() => {
    if (!statusMessage || statusMessage.type !== 'success') return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

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

  const updateMapLocation = useCallback(
    (latitude, longitude) => {
      setLocation({
        lat: latitude,
        lng: longitude,
        address: formatCoordinatesAddress(latitude, longitude)
      });
    },
    []
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${API_BASES.farmerProfile}/profile/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        syncProfileState(data);
      } catch {
        setProfileData(defaultProfile);
        setSavedProfileData(defaultProfile);
        setLocation(DEFAULT_LOCATION);
        setSavedLocation(DEFAULT_LOCATION);
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [defaultProfile, syncProfileState, userId]);

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Farmer Profile';
  const profileInitials = getInitials(profileData.firstName, profileData.lastName);

  const profileChecks = useMemo(
    () => [
      { label: 'Name', value: profileData.firstName && profileData.lastName },
      { label: 'Phone', value: profileData.phone },
      { label: 'Age', value: profileData.age },
      { label: 'NIC', value: profileData.nicNumber },
      { label: 'Experience', value: profileData.experience },
      { label: 'Farming Type', value: profileData.farmingType },
      { label: 'Address', value: profileData.address },
      { label: 'City', value: profileData.city },
      { label: 'Bio', value: profileData.bio },
      { label: 'Map Address', value: location.address && location.address !== DEFAULT_LOCATION.address }
    ],
    [
      location.address,
      profileData.address,
      profileData.age,
      profileData.bio,
      profileData.city,
      profileData.experience,
      profileData.farmingType,
      profileData.firstName,
      profileData.lastName,
      profileData.nicNumber,
      profileData.phone
    ]
  );

  const completionPercentage = Math.round(
    (profileChecks.filter((item) => Boolean(item.value)).length / profileChecks.length) * 100
  );

  const missingItems = profileChecks
    .filter((item) => !item.value)
    .map((item) => item.label)
    .slice(0, 4);

  const heroBadgeText = profileData.farmingType || 'Mixed Farming';
  const pageShellClasses = embedded
    ? 'space-y-6'
    : 'min-h-screen w-full bg-[linear-gradient(180deg,_#ecfdf5_0%,_#f8fafc_32%,_#ffffff_100%)] px-4 py-4 sm:px-6 lg:px-10 lg:py-8 xl:px-12';
  const pageInnerClasses = embedded ? 'space-y-6' : 'mx-auto w-full max-w-[1800px] space-y-6';

  const handleInputChange = (field, value) => {
    if (field === 'age') {
      setProfileData((current) => ({
        ...current,
        age: clampNumber(value, 18, 100)
      }));
      return;
    }

    setProfileData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please upload a valid image file for the profile photo.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProfileData((current) => ({
        ...current,
        profileImage: loadEvent.target?.result || null,
        imageFile: file,
        existingImage: null
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported in this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void updateMapLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        let errorText = 'Unable to retrieve your location.';

        if (error.code === error.PERMISSION_DENIED) {
          errorText = 'Location access was denied. Please allow location permission and try again.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorText = 'Location information is unavailable right now.';
        } else if (error.code === error.TIMEOUT) {
          errorText = 'Location request timed out. Please try again.';
        }

        setStatusMessage({
          type: 'error',
          text: errorText
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleUseProfileAddress = () => {
    const combinedAddress = [profileData.address, profileData.city]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(', ');

    if (!combinedAddress) {
      setStatusMessage({
        type: 'error',
        text: 'Add the address and city first, then use them as the farm location.'
      });
      return;
    }

    setLocation((current) => ({
      ...current,
      address: combinedAddress
    }));
  };

  const handleEditStart = () => {
    setStatusMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData(savedProfileData);
    setLocation(savedLocation);
    setStatusMessage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('first_name', profileData.firstName.trim());
      formData.append('last_name', profileData.lastName.trim());
      formData.append('email', profileData.email.trim());
      formData.append('phone', profileData.phone.trim());
      formData.append('age', profileData.age);
      formData.append('nic_number', profileData.nicNumber.trim());
      formData.append('experience', profileData.experience.trim());
      formData.append('farming_type', profileData.farmingType);
      formData.append('address', profileData.address.trim());
      formData.append('city', profileData.city.trim());
      formData.append('bio', profileData.bio.trim());
      formData.append('location_lat', String(location.lat));
      formData.append('location_lng', String(location.lng));
      formData.append('location_address', location.address);
      formData.append('existing_image', profileData.existingImage || '');

      if (profileData.imageFile) {
        formData.append('profile_image', profileData.imageFile);
      }

      const saveResponse = await fetch(`${API_BASES.farmerProfile}/profile/${userId}`, {
        method: 'POST',
        body: formData
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save profile');
      }

      const refreshResponse = await fetch(`${API_BASES.farmerProfile}/profile/${userId}`);
      if (!refreshResponse.ok) {
        throw new Error('Profile was saved, but the latest profile data could not be loaded.');
      }

      const refreshedProfile = await refreshResponse.json();
      syncProfileState(refreshedProfile);

      if (onProfileSaved) {
        onProfileSaved(refreshedProfile);
      }

      setStatusMessage({
        type: 'success',
        text: 'Farmer profile updated successfully.'
      });
      setIsEditing(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'Failed to save profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={
          embedded
            ? 'flex min-h-[420px] items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-50 to-white'
            : 'flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white'
        }
      >
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-base font-medium text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClasses}>
      <div className={pageInnerClasses}>
        {!embedded ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {goBack ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}
              <p className="text-sm text-slate-500">Farmer profile workspace</p>
            </div>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,250,0.98)_55%,_rgba(220,252,231,0.92)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8 xl:min-h-[calc(100vh-8rem)] xl:p-10">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-teal-200/40 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Smart Farmer Profile
                </div>
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                  Modern Profile Center
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
                  Keep your farmer identity, farm details, contact information, and live location up
                  to date in one clean modern workspace.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEditStart}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {saving ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {statusMessage ? (
              <div
                className={`mt-5 rounded-[1.35rem] border px-4 py-3 text-sm font-medium shadow-sm ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {statusMessage.text}
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-center">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm lg:p-6">
                <div className="relative mx-auto w-fit">
                  <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),rgba(255,255,255,1)_62%)] p-2 text-4xl font-bold text-emerald-800 shadow-[0_24px_52px_-24px_rgba(5,150,105,0.4)] sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt={fullName}
                        className="h-full w-full rounded-[1.7rem] bg-emerald-50 object-contain object-center"
                      />
                    ) : (
                      profileInitials
                    )}
                  </div>

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition hover:bg-slate-800"
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

                <div className="mt-5 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-[2rem]">{fullName}</h2>
                  <p className="mt-2 text-sm text-slate-500">{profileData.email || 'Email not added yet'}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    The profile photo area is larger now, so your image stays clearer and easier to recognize.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <Sprout className="h-4 w-4" />
                    {heroBadgeText}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InsightCard
                  label="Profile completion"
                  value={`${completionPercentage}%`}
                  helper="A stronger profile helps build more trust across the platform."
                  tone="accent"
                />
                <InsightCard
                  label="Primary city"
                  value={profileData.city || 'Sri Lanka'}
                  helper="This helps buyers and delivery teams identify your farm area quickly."
                />
                <InsightCard
                  label="Map status"
                  value="OpenStreetMap"
                  helper="Your farm coordinates and address stay visible without requiring a Google Maps key."
                  tone="success"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] lg:p-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep your identity and contact details updated for a stronger professional profile.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="First name"
                  icon={User}
                  isEditing={isEditing}
                  value={profileData.firstName}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(event) => handleInputChange('firstName', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="Last name"
                  icon={User}
                  isEditing={isEditing}
                  value={profileData.lastName}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(event) => handleInputChange('lastName', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="Email"
                  icon={Mail}
                  isEditing={isEditing}
                  value={profileData.email}
                  fallback="Not added"
                >
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="Phone"
                  icon={Phone}
                  isEditing={isEditing}
                  value={profileData.phone}
                  fallback="Not added"
                >
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(event) => handleInputChange('phone', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="Age"
                  icon={Hash}
                  isEditing={isEditing}
                  value={profileData.age ? `${profileData.age} years` : ''}
                  fallback="Not added"
                >
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={profileData.age}
                    onChange={(event) => handleInputChange('age', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="NIC number"
                  icon={Hash}
                  isEditing={isEditing}
                  value={profileData.nicNumber}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.nicNumber}
                    onChange={(event) => handleInputChange('nicNumber', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] lg:p-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">Farm Identity</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Describe your farming experience, category, and farm base so the profile feels complete and trustworthy.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Experience"
                  icon={Award}
                  isEditing={isEditing}
                  value={profileData.experience}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(event) => handleInputChange('experience', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="e.g. 8 years"
                  />
                </ProfileField>

                <ProfileField
                  label="Farming type"
                  icon={Sprout}
                  isEditing={isEditing}
                  value={profileData.farmingType}
                  fallback="Not added"
                >
                  <select
                    value={profileData.farmingType}
                    onChange={(event) => handleInputChange('farmingType', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  >
                    {FARMING_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </ProfileField>

                <ProfileField
                  label="Address"
                  icon={MapPin}
                  isEditing={isEditing}
                  value={profileData.address}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(event) => handleInputChange('address', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>

                <ProfileField
                  label="City"
                  icon={Globe}
                  isEditing={isEditing}
                  value={profileData.city}
                  fallback="Not added"
                >
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(event) => handleInputChange('city', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </ProfileField>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] lg:p-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">Farmer Story</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use the bio to share your farming background, strengths, and the style of farming you practice.
                </p>
              </div>

              <ProfileField
                label="Bio"
                icon={Sparkles}
                isEditing={isEditing}
                value={profileData.bio}
                fallback="No farmer bio added yet."
              >
                <textarea
                  rows="6"
                  value={profileData.bio}
                  onChange={(event) => handleInputChange('bio', event.target.value)}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                  placeholder="Tell customers and partners about your farming journey..."
                />
              </ProfileField>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
              <h3 className="text-lg font-bold text-slate-900">Profile Snapshot</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A quick overview of your current profile status and important details.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-[1.35rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Full name
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{fullName}</p>
                </div>
                <div className="rounded-[1.35rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Specialization
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {safeValue(profileData.farmingType)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Location
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {safeValue(profileData.city || location.address)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Farm location
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {safeValue(location.address)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
              <h3 className="text-lg font-bold text-slate-900">Profile Strength</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete more fields to make your profile feel more reliable and professional.
              </p>

              <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">Completion score</span>
                  <span className="text-sm font-bold text-emerald-600">{completionPercentage}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Next improvements</p>
                {missingItems.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-500">
                    {missingItems.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-emerald-600">
                    Your profile is in strong shape. Keep details updated as your farm grows.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Farm Location</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep your farm location accurate so buyers, transport teams, and the platform can understand where your products come from.
                </p>
              </div>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={!mapLoaded}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <MapPin className="h-4 w-4" />
                Use Current Location
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Farm location address
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={location.address}
                      onChange={(event) =>
                        setLocation((current) => ({
                          ...current,
                          address: event.target.value
                        }))
                      }
                      placeholder="Type the farm location or use the map below"
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                    />
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      {safeValue(location.address)}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    This farm location is saved together with the latitude and longitude when you save the profile.
                  </p>
                </div>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleUseProfileAddress}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Use Address Above
                  </button>
                ) : null}
              </div>

              <div className="mb-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {location.address}
              </div>

              <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200">
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={14}
                  scrollWheelZoom={true}
                  className="h-[320px] w-full lg:h-[380px]"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.lat, location.lng]} icon={farmerLocationIcon} />
                  <LocationMapSync location={location} />
                  <LocationPicker isEditing={isEditing} onSelect={updateMapLocation} />
                </MapContainer>

                {isEditing ? (
                  <div className="absolute left-4 top-4 rounded-2xl bg-slate-900/85 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                    Click on the map to update the farm location
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
                  Address Sync
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The address above is automatically updated from the selected map coordinates.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Smart Tip
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Accurate location details help delivery planning, route visibility, and better trust in your farmer profile.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FarmerProfile;
