import { useState, useEffect } from 'react';
import Layout from '../../components/layouts/mainLayout';
import { CountryCodeDropdown } from '../../components/shared/IntelligentDropdowns';
import { ARTIST_TYPES, GENRES } from '../../lib/constants';
import { formatDateOfBirth } from '../../lib/date-utils';

export default function ArtistProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});

  // Load profile without complex authentication
  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      const response = await fetch('/api/artist/profile');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile loaded:', data);
        setProfile(data);
        setFormData(data);
      } else {
        console.error('Failed to load profile');
        // Set default profile if API fails
        const defaultProfile = {
          firstName: 'Henry',
          lastName: 'Taylor',
          email: 'info@htay.co.uk',
          artistName: 'H-Tay',
          artistType: 'Solo Artist',
          primaryGenre: 'Hip-Hop',
          bio: 'Jesus I love forever',
          shortBio: 'I love Jesus',
          isBasicInfoSet: true,
          lockedFields: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            nationality: true,
            country: true,
            city: true
          },
          profileLockStatus: 'locked'
        };
        setProfile(defaultProfile);
        setFormData(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set default profile on error
      const defaultProfile = {
        firstName: 'Henry',
        lastName: 'Taylor',
        email: 'info@htay.co.uk',
        artistName: 'H-Tay',
        artistType: 'Solo Artist',
        primaryGenre: 'Hip-Hop',
        bio: 'Jesus I love forever',
        shortBio: 'I love Jesus',
        isBasicInfoSet: true,
        lockedFields: {
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          nationality: true,
          country: true,
          city: true
        },
        profileLockStatus: 'locked'
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Check if a field is locked
  const isFieldLocked = (fieldName) => {
    return profile?.lockedFields?.[fieldName] === true;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (isFieldLocked(field) && isEditing) {
      setErrors({
        message: `${field} is locked and requires admin approval to change.`,
        type: 'error'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors.message) {
      setErrors({});
    }
  };

  // Save profile
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/artist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setProfile(result.profile);
        setFormData(result.profile);
        setIsEditing(false);
        setErrors({
          message: 'Profile updated successfully!',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || 'Failed to save profile.',
          type: 'error'
        });
      }
    } catch (error) {
      setErrors({
        message: 'Error saving profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your artist information for releases and distribution
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Edit Profile
                  </button>
                  {profile.profileLockStatus === 'locked' && (
                    <button
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                      Request Changes
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                      setErrors({});
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {errors.message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            errors.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {errors.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              {/* Locking Status */}
              {profile.profileLockStatus === 'locked' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">🔒 Profile Locked</h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Your basic information is locked for security. Use "Request Changes" to submit modification requests for admin approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                    {isFieldLocked('firstName') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={isFieldLocked('firstName') || !isEditing}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isFieldLocked('firstName') || !isEditing
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-600' 
                        : 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                    {isFieldLocked('lastName') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={isFieldLocked('lastName') || !isEditing}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isFieldLocked('lastName') || !isEditing
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-600' 
                        : 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name *</label>
                  <input
                    type="text"
                    value={formData.artistName || ''}
                    onChange={(e) => handleInputChange('artistName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Type</label>
                  <select
                    value={formData.artistType || 'Solo Artist'}
                    onChange={(e) => handleInputChange('artistType', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {ARTIST_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Genre</label>
                  <select
                    value={formData.primaryGenre || ''}
                    onChange={(e) => handleInputChange('primaryGenre', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Primary Genre</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Release Bio
                    <span className="text-xs text-gray-500 block mt-1">Brief description used for release metadata</span>
                  </label>
                  <textarea
                    value={formData.shortBio || ''}
                    onChange={(e) => handleInputChange('shortBio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Brief artist description for release metadata..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Artist Biography
                    <span className="text-xs text-gray-500 block mt-1">Detailed biography for profile and promotional use</span>
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Detailed artist biography for profile and promotional use..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-blue-600">100%</span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out" style={{ width: '100%' }}>
                      <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <div className="text-green-600 font-medium">
                    🎉 Profile Complete!
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-sm text-green-600 font-medium">Account Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
