import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Edit, Save, X, Upload, User, Mail, Phone, Globe, Calendar, MapPin, Music, Award, FileText } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';

export default function ArtistProfile() {
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
    { key: 'city', label: 'City' }
  ];

  // Dropdown options
  const ARTIST_TYPES = ['Solo Artist', 'Band', 'Producer', 'DJ', 'Songwriter', 'Vocalist'];
  const GENRES = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Country',
    'Reggae', 'Blues', 'Folk', 'Indie', 'Alternative', 'Funk', 'Soul', 'Gospel',
    'Afrobeats', 'Dancehall', 'Reggaeton', 'Latin', 'World Music', 'Experimental'
  ];
  const COUNTRY_CODES = [
    { code: '+1', country: 'US/CA' }, { code: '+44', country: 'UK' }, { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' }, { code: '+34', country: 'ES' }, { code: '+39', country: 'IT' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/artist/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const profileData = await response.json();
        
        // Map API response to expected format
        const mappedProfile = {
          id: profileData.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          artist_name: profileData.artistName,
          date_of_birth: profileData.dateOfBirth,
          nationality: profileData.nationality,
          country: profileData.country,
          city: profileData.city,
          artist_type: profileData.artistType,
          phone: profileData.phone,
          country_code: profileData.countryCode,
          primary_genre: profileData.primaryGenre,
          secondary_genre: profileData.secondaryGenre,
          years_active: profileData.yearsActive,
          record_label: profileData.recordLabel,
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

  const handleFieldChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = ['artist_name', 'email', 'primary_genre'];
    
    requiredFields.forEach(field => {
      if (!editedProfile[field] || editedProfile[field].trim() === '') {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    if (editedProfile.email && !/\S+@\S+\.\S+/.test(editedProfile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateFields()) {
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        setSaving(false);
        return;
      }

      // Map field names to API format
      const apiData = {
        firstName: editedProfile.first_name,
        lastName: editedProfile.last_name,
        artistName: editedProfile.artist_name,
        dateOfBirth: editedProfile.date_of_birth,
        nationality: editedProfile.nationality,
        country: editedProfile.country,
        city: editedProfile.city,
        artistType: editedProfile.artist_type,
        email: editedProfile.email,
        phone: editedProfile.phone,
        countryCode: editedProfile.country_code,
        primaryGenre: editedProfile.primary_genre,
        secondaryGenre: editedProfile.secondary_genre,
        yearsActive: editedProfile.years_active,
        recordLabel: editedProfile.record_label,
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
      
      const response = await fetch('/api/artist/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        setProfile(editedProfile);
        setEditMode(false);
        setErrors({});
        showBrandedNotification('Profile updated successfully!');
      } else {
        console.error('Failed to save profile:', response.status);
        showBrandedNotification('Failed to save changes. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showBrandedNotification('Failed to save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setEditMode(false);
    setErrors({});
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


  const calculateProgress = () => {
    const currentData = editedProfile || profile;
    if (!currentData) return 0;
    
    const allFields = [
      'first_name', 'last_name', 'email', 'artist_name', 'date_of_birth', 'nationality', 
      'country', 'city', 'artist_type', 'phone', 'primary_genre', 'secondary_genre', 
      'years_active', 'record_label', 'bio', 'website', 'instagram', 'facebook', 'twitter'
    ];
    
    const completedFields = allFields.filter(field => {
      const value = currentData[field];
      const isCompleted = value && value.toString().trim() !== '';
      return isCompleted;
    });
    
    console.log('Profile completion debug:', {
      totalFields: allFields.length,
      completedFields: completedFields.length,
      completed: completedFields,
      percentage: Math.round((completedFields.length / allFields.length) * 100)
    });
    
    return Math.round((completedFields.length / allFields.length) * 100);
  };

  const getChangedFields = () => {
    if (!profile || !editedProfile) return [];
    const changed = [];
    Object.keys(editedProfile).forEach(key => {
      if (editedProfile[key] !== profile[key]) {
        changed.push(key);
      }
    });
    return changed;
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Unable to load profile data.</p>
            <button 
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress();
  const changedFields = getChangedFields();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Profile</h1>
              <p className="text-gray-600 mt-1">Manage your artist information and settings</p>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 70% */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Personal Information - LOCKED */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center mb-4">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    LOCKED
                  </span>
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
              </section>

              {/* Artist Information - EDITABLE */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center mb-6">
                  <Music className="w-5 h-5 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Artist Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Artist Name *
                      {changedFields.includes('artist_name') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.artist_name || ''}
                      onChange={(e) => handleFieldChange('artist_name', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } ${errors.artist_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.artist_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.artist_name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Artist Type
                      {changedFields.includes('artist_type') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <select
                      value={editedProfile.artist_type || ''}
                      onChange={(e) => handleFieldChange('artist_type', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    >
                      <option value="">Select Artist Type</option>
                      {ARTIST_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Email *
                      {changedFields.includes('email') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Phone
                      {changedFields.includes('phone') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={editedProfile.country_code || '+44'}
                        onChange={(e) => handleFieldChange('country_code', e.target.value)}
                        disabled={!editMode}
                        className={`w-20 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      >
                        {COUNTRY_CODES.map(({ code, country }) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={editedProfile.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        disabled={!editMode}
                        placeholder="Phone number"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Primary Genre *
                      {changedFields.includes('primary_genre') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <select
                      value={editedProfile.primary_genre || ''}
                      onChange={(e) => handleFieldChange('primary_genre', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } ${errors.primary_genre ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Primary Genre</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    {errors.primary_genre && (
                      <p className="text-red-500 text-sm mt-1">{errors.primary_genre}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Secondary Genre
                      {changedFields.includes('secondary_genre') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <select
                      value={editedProfile.secondary_genre || ''}
                      onChange={(e) => handleFieldChange('secondary_genre', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    >
                      <option value="">Select Secondary Genre</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Years Active
                      {changedFields.includes('years_active') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.years_active || ''}
                      onChange={(e) => handleFieldChange('years_active', e.target.value)}
                      disabled={!editMode}
                      placeholder="e.g., 5 years"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Record Label
                      {changedFields.includes('record_label') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.record_label || ''}
                      onChange={(e) => handleFieldChange('record_label', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>
                </div>
              </section>

              {/* Biography */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center mb-6">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Biography</h2>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Artist Bio
                    {changedFields.includes('bio') && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </label>
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    disabled={!editMode}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                    } border-gray-300`}
                    placeholder="Tell us about your musical journey..."
                  />
                </div>
              </section>

              {/* Social Media */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center mb-6">
                  <Globe className="w-5 h-5 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Social Media & Links</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'website', label: 'Website', type: 'url' },
                    { key: 'instagram', label: 'Instagram', type: 'url' },
                    { key: 'facebook', label: 'Facebook', type: 'url' },
                    { key: 'twitter', label: 'Twitter', type: 'url' },
                    { key: 'youtube', label: 'YouTube', type: 'url' },
                    { key: 'tiktok', label: 'TikTok', type: 'url' }
                  ].map(({ key, label, type }) => (
                    <div key={key} className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {changedFields.includes(key) && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </label>
                      <input
                        type={type}
                        value={editedProfile[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        disabled={!editMode}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Additional platforms in a separate row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[
                    { key: 'spotify', label: 'Spotify', type: 'url' },
                    { key: 'apple_music', label: 'Apple Music', type: 'url' }
                  ].map(({ key, label, type }) => (
                    <div key={key} className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {changedFields.includes(key) && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </label>
                      <input
                        type={type}
                        value={editedProfile[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        disabled={!editMode}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar - 30% */}
            <div className="space-y-6">
              
              {/* Profile Picture */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                
                <ProfilePictureUpload
                  currentImage={profile.profile_picture_url}
                  onUploadSuccess={(url) => {
                    setProfile({ ...profile, profile_picture_url: url });
                    setEditedProfile({ ...editedProfile, profile_picture_url: url });
                    showBrandedNotification('Profile picture updated successfully!');
                  }}
                  onUploadError={(error) => {
                    showBrandedNotification(error, 'error');
                  }}
                />
              </section>

              {/* Profile Completion */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Complete your profile to improve your visibility and connect with more opportunities.
                </p>
              </section>

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
          />
        )}
      </div>
    </Layout>
  );
}

function ChangeRequestModal({ lockedFields, currentProfile, onClose, onSubmit }) {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Change* to Personal Information</label>
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
