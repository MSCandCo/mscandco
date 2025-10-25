'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Lock, Edit, Save, X, Upload, User, Mail, Phone, Globe, Calendar, MapPin, Music, Award, FileText, Building2 } from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function LabelAdminProfileClient() {
  const { user, session, supabase } = useUser();
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [errors, setErrors] = useState({});

  // LOCKED FIELDS - require admin approval via consolidated modal
  const LOCKED_FIELDS = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' }
  ];

  // Dropdown options
  const GENRES = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Country',
    'Reggae', 'Blues', 'Folk', 'Indie', 'Alternative', 'Funk', 'Soul', 'Gospel',
    'Afrobeats', 'Dancehall', 'Reggaeton', 'Latin', 'World Music', 'Experimental'
  ];
  const COUNTRY_CODES = [
    { code: '+1', country: 'US/CA' }, { code: '+44', country: 'UK' }, { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' }, { code: '+34', country: 'ES' }, { code: '+39', country: 'IT' },
    { code: '+234', country: 'NG' }, { code: '+233', country: 'GH' }, { code: '+254', country: 'KE' },
    { code: '+27', country: 'ZA' }, { code: '+260', country: 'ZM' }
  ];

  useEffect(() => {
    if (user && session) {
      fetchProfile();
    }
  }, [user, session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (!session) {
        console.error('No session found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/labeladmin/profile', {
        credentials: 'include'
      });

      if (response.ok) {
        const profileData = await response.json();
        
        // Map API response to expected format
        const mappedProfile = {
          id: profileData.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          label_name: profileData.labelName,
          date_of_birth: profileData.dateOfBirth,
          nationality: profileData.nationality,
          country: profileData.country,
          city: profileData.city,
          phone: profileData.phone,
          country_code: profileData.countryCode,
          primary_genre: profileData.primaryGenre,
          secondary_genre: profileData.secondaryGenre,
          years_active: profileData.yearsActive,
          company_name: profileData.companyName,
          bio: profileData.bio,
          website: profileData.website,
          instagram: profileData.instagram,
          facebook: profileData.facebook,
          twitter: profileData.twitter,
          youtube: profileData.youtube,
          tiktok: profileData.tiktok,
          spotify: profileData.spotify,
          apple_music: profileData.apple_music,
          profile_picture_url: profileData.profile_picture_url
        };
        
        setProfile(mappedProfile);
        setEditedProfile(mappedProfile);
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset to original profile
      setEditedProfile({ ...profile });
      setErrors({});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    
    // Validate label name
    if (!editedProfile.label_name || editedProfile.label_name.trim() === '') {
      newErrors.label_name = 'Label name is required';
    }

    // Validate bio length
    if (editedProfile.bio && editedProfile.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    // Validate URL formats
    const urlFields = ['website', 'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'spotify', 'apple_music'];
    urlFields.forEach(field => {
      if (editedProfile[field] && editedProfile[field].trim() !== '') {
        try {
          new URL(editedProfile[field]);
        } catch {
          newErrors[field] = 'Please enter a valid URL';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API (convert snake_case to camelCase)
      const dataToSave = {
        labelName: editedProfile.label_name,
        primaryGenre: editedProfile.primary_genre,
        secondaryGenre: editedProfile.secondary_genre,
        yearsActive: editedProfile.years_active,
        companyName: editedProfile.company_name,
        bio: editedProfile.bio,
        website: editedProfile.website,
        instagram: editedProfile.instagram,
        facebook: editedProfile.facebook,
        twitter: editedProfile.twitter,
        youtube: editedProfile.youtube,
        tiktok: editedProfile.tiktok,
        spotify: editedProfile.spotify,
        apple_music: editedProfile.apple_music
      };

      const response = await fetch('/api/labeladmin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update local state with saved data
        setProfile({ ...editedProfile });
        setEditMode(false);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpdate = (newUrl) => {
    setProfile(prev => ({ ...prev, profile_picture_url: newUrl }));
    setEditedProfile(prev => ({ ...prev, profile_picture_url: newUrl }));
  };

  const showBrandedNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2';
    const borderColor = type === 'success' ? '#065f46' : '#991b1b';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      border-left: 4px solid ${borderColor};
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; color: ${textColor};">
        <svg style="width: 20px; height: 20px; margin-right: 12px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 4000);
  };

  const handleRequestChange = async (field, newValue) => {
    try {
      const response = await fetch('/api/artist/request-profile-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          field,
          currentValue: profile[field],
          requestedValue: newValue,
          reason: `Request to change ${LOCKED_FIELDS.find(f => f.key === field)?.label || field}`
        })
      });

      if (response.ok) {
        alert('Change request submitted successfully! An admin will review it.');
        setShowChangeRequestModal(false);
      } else {
        alert('Failed to submit change request');
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      alert('An error occurred while submitting your request');
    }
  };

  if (loading) {
    return <PageLoading message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfilePictureUpload
                currentPictureUrl={profile.profile_picture_url}
                onUploadComplete={handleProfilePictureUpdate}
                userId={user?.id}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Label Admin Profile
                </h1>
                <p className="text-gray-600 mt-1">{profile.label_name}</p>
                <p className="text-gray-600 mt-1">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <div>
              {!editMode ? (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Personal Information - LOCKED */}
          <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-300 p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
                <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 relative -top-1 scale-75 origin-left">
                  LOCKED
                </span>
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">These fields require admin approval to change</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.first_name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.last_name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.date_of_birth || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input
                  type="text"
                  value={profile.nationality || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={profile.country || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={profile.city || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={`${profile.country_code || '+44'} ${profile.phone || ''}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            {/* Consolidated Change Request Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowChangeRequestModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Need to update personal information? Request a change
              </button>
            </div>
          </div>

          {/* Label Information - EDITABLE */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Label Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Label Name (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label Name *
                </label>
                <input
                  type="text"
                  value={editMode ? editedProfile.label_name || '' : profile.label_name || ''}
                  onChange={(e) => handleInputChange('label_name', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.label_name ? 'border-red-500' : ''}`}
                />
                {errors.label_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.label_name}</p>
                )}
              </div>

              {/* Company Name (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editMode ? editedProfile.company_name || '' : profile.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Label Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Label Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Genre
                </label>
                <select
                  value={editMode ? editedProfile.primary_genre || '' : profile.primary_genre || ''}
                  onChange={(e) => handleInputChange('primary_genre', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Secondary Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Genre
                </label>
                <select
                  value={editMode ? editedProfile.secondary_genre || '' : profile.secondary_genre || ''}
                  onChange={(e) => handleInputChange('secondary_genre', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Years Active */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years Active
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2015-Present"
                  value={editMode ? editedProfile.years_active || '' : profile.years_active || ''}
                  onChange={(e) => handleInputChange('years_active', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={editMode ? editedProfile.bio || '' : profile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editMode}
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg ${
                  editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                } ${errors.bio ? 'border-red-500' : ''}`}
                placeholder="Tell us about your label..."
              />
              {editMode && (
                <p className="text-xs text-gray-500 mt-1">
                  {(editedProfile.bio || '').length}/500 characters
                </p>
              )}
              {errors.bio && (
                <p className="text-xs text-red-600 mt-1">{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Social Media & Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Social Media & Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://www.yourlabel.com"
                  value={editMode ? editedProfile.website || '' : profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.website ? 'border-red-500' : ''}`}
                />
                {errors.website && (
                  <p className="text-xs text-red-600 mt-1">{errors.website}</p>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourlabel"
                  value={editMode ? editedProfile.instagram || '' : profile.instagram || ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.instagram ? 'border-red-500' : ''}`}
                />
                {errors.instagram && (
                  <p className="text-xs text-red-600 mt-1">{errors.instagram}</p>
                )}
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourlabel"
                  value={editMode ? editedProfile.facebook || '' : profile.facebook || ''}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.facebook ? 'border-red-500' : ''}`}
                />
                {errors.facebook && (
                  <p className="text-xs text-red-600 mt-1">{errors.facebook}</p>
                )}
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourlabel"
                  value={editMode ? editedProfile.twitter || '' : profile.twitter || ''}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.twitter ? 'border-red-500' : ''}`}
                />
                {errors.twitter && (
                  <p className="text-xs text-red-600 mt-1">{errors.twitter}</p>
                )}
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@yourlabel"
                  value={editMode ? editedProfile.youtube || '' : profile.youtube || ''}
                  onChange={(e) => handleInputChange('youtube', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.youtube ? 'border-red-500' : ''}`}
                />
                {errors.youtube && (
                  <p className="text-xs text-red-600 mt-1">{errors.youtube}</p>
                )}
              </div>

              {/* TikTok */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@yourlabel"
                  value={editMode ? editedProfile.tiktok || '' : profile.tiktok || ''}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.tiktok ? 'border-red-500' : ''}`}
                />
                {errors.tiktok && (
                  <p className="text-xs text-red-600 mt-1">{errors.tiktok}</p>
                )}
              </div>

              {/* Spotify */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spotify
                </label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/user/yourlabel"
                  value={editMode ? editedProfile.spotify || '' : profile.spotify || ''}
                  onChange={(e) => handleInputChange('spotify', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.spotify ? 'border-red-500' : ''}`}
                />
                {errors.spotify && (
                  <p className="text-xs text-red-600 mt-1">{errors.spotify}</p>
                )}
              </div>

              {/* Apple Music */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apple Music
                </label>
                <input
                  type="url"
                  placeholder="https://music.apple.com/profile/yourlabel"
                  value={editMode ? editedProfile.apple_music || '' : profile.apple_music || ''}
                  onChange={(e) => handleInputChange('apple_music', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 bg-gray-50'
                  } ${errors.apple_music ? 'border-red-500' : ''}`}
                />
                {errors.apple_music && (
                  <p className="text-xs text-red-600 mt-1">{errors.apple_music}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Change Request Modal */}
      {showChangeRequestModal && (
        <ChangeRequestModal
          lockedFields={LOCKED_FIELDS}
          currentProfile={profile}
          onClose={() => setShowChangeRequestModal(false)}
          onSubmit={() => setShowChangeRequestModal(false)}
          supabase={supabase}
          showBrandedNotification={showBrandedNotification}
        />
      )}
    </div>
  );
}

function ChangeRequestModal({ lockedFields, currentProfile, onClose, onSubmit, supabase, showBrandedNotification }) {
  const [selectedField, setSelectedField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFieldSelect = (fieldKey) => {
    setSelectedField(fieldKey);
    setNewValue('');
  };

  const getCurrentValue = () => {
    if (!selectedField || !currentProfile) return '';
    return currentProfile[selectedField] || 'Not set';
  };

  const handleSubmit = async () => {
    if (!selectedField || !newValue || !reason) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profile_change_requests')
        .insert({
          user_id: user.id,
          field_name: selectedField,
          current_value: getCurrentValue(),
          requested_value: newValue,
          reason: reason,
          status: 'pending'
        });
      
      if (!error) {
        showBrandedNotification('Change request submitted for approval');
        onSubmit();
      } else {
        console.error('Error submitting request:', error);
        showBrandedNotification('Failed to submit request', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showBrandedNotification('Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Profile Change</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Change to Personal Information</label>
            <select
              value={selectedField}
              onChange={(e) => handleFieldSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select field to change</option>
              {lockedFields.map(field => (
                <option key={field.key} value={field.key}>{field.label}</option>
              ))}
            </select>
          </div>
          
          {selectedField && (
            <>
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Current: <span className="font-medium text-gray-900">{getCurrentValue()}</span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Change *</label>
                <input
                  type={selectedField === 'date_of_birth' ? 'date' : 'text'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter the new value"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Explain why you need to change this information"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedField || !newValue || !reason || submitting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

