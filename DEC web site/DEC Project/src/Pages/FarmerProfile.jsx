import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Wheat, Tractor, Award, Edit2, Save, X } from 'lucide-react';

export default function FarmerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Anderson",
    location: "Green Valley, Iowa",
    phone: "+1 (555) 123-4567",
    email: "john.anderson@farmmail.com",
    joinDate: "March 2020",
    farmSize: "250 acres",
    primaryCrops: "Corn, Soybeans, Wheat",
    experience: "15 years",
    certifications: "Organic Certified, Sustainable Farming",
    bio: "Passionate organic farmer dedicated to sustainable agriculture practices. Specializing in crop rotation and soil health management with over 15 years of experience in modern farming techniques."
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-r from-green-800 to-blue-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User size={64} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <Wheat size={20} className="text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-3xl font-bold bg-transparent border-b-2 border-white/50 text-white placeholder-white/70 focus:outline-none focus:border-white mb-2 w-full"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{profile.name}</h1>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-transparent border-b border-white/50 focus:outline-none focus:border-white"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Joined {profile.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
              <Phone size={20} />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-green-500 flex-1"
                  />
                ) : (
                  <span className="text-gray-300">{profile.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-green-500 flex-1"
                  />
                ) : (
                  <span className="text-gray-300">{profile.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
              <Tractor size={20} />
              Farm Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Farm Size</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.farmSize}
                    onChange={(e) => handleInputChange('farmSize', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-green-500 w-full mt-1"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.farmSize}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Primary Crops</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.primaryCrops}
                    onChange={(e) => handleInputChange('primaryCrops', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-green-500 w-full mt-1"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.primaryCrops}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-green-500 w-full mt-1"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.experience}</p>
                )}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
              <Award size={20} />
              Certifications
            </h2>
            {isEditing ? (
              <textarea
                value={editedProfile.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 w-full h-24 resize-none"
              />
            ) : (
              <div className="space-y-2">
                {profile.certifications.split(', ').map((cert, index) => (
                  <div key={index} className="bg-green-900/30 border border-green-600 rounded-lg px-3 py-2">
                    <span className="text-green-300 font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bio Section - Full Width */}
          <div className="lg:col-span-3 bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
              <User size={20} />
              About
            </h2>
            {isEditing ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-green-500 w-full h-32 resize-none"
                placeholder="Tell us about your farming journey..."
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 text-center border border-green-600">
            <div className="text-2xl font-bold text-green-300">250</div>
            <div className="text-green-200 text-sm">Acres Farmed</div>
          </div>
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 text-center border border-blue-600">
            <div className="text-2xl font-bold text-blue-300">15</div>
            <div className="text-blue-200 text-sm">Years Experience</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-xl p-4 text-center border border-yellow-600">
            <div className="text-2xl font-bold text-yellow-300">3</div>
            <div className="text-yellow-200 text-sm">Crop Types</div>
          </div>
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-4 text-center border border-purple-600">
            <div className="text-2xl font-bold text-purple-300">2</div>
            <div className="text-purple-200 text-sm">Certifications</div>
          </div>
        </div>
      </div>
    </div>
  );
}