import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { getUserRoleSync, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { NationalityDropdown, CountryDropdown, CityDropdown, CountryCodeDropdown } from '../../components/shared/IntelligentDropdowns';
import { GENRES, VOCAL_TYPES, ARTIST_TYPES, INSTRUMENTS } from '../../lib/constants';
import ChangeRequestModal from '../../components/profile/ChangeRequestModal';
import { supabase } from '../../lib/supabase';
import { formatDateOfBirth } from '../../lib/date-utils';

export default function ArtistProfile() {
  const { user, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});

  // Load profile data
  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/artist/profile-new', { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile loaded:', data);
        setProfile(data);
        setFormData(data);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Check if a field is locked
  const isFieldLocked = (fieldName) => {
    return profile?.lockedFields?.[fieldName] === true;
  };

  // Handle input changes (only for non-locked fields)
  const handleInputChange = (field, value) => {
    if (isFieldLocked(field) && isEditing) {
      // Show error for locked fields
      setErrors({
        message: `${field} is locked and requires admin approval to change. Use "Request Changes" instead.`,
        type: 'error'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors
    if (errors.message) {
      setErrors({});
    }
  };

  // Save profile (only non-locked fields)
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/artist/profile-new', {
        method: 'PUT',
        headers,
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
          message: errorData.error || 'Failed to update profile',
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

  // Handle change request
  const handleChangeRequest = async (requestData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/profile/change-request-new', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        setShowChangeRequestModal(false);
        setErrors({
          message: 'Change request submitted successfully! An admin will review your request.',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || 'Failed to submit change request',
          type: 'error'
        });
      }
    } catch (error) {
      setErrors({
        message: 'Error submitting change request. Please try again.',
        type: 'error'
      });
    }
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const userRole = getUserRoleSync();
  const userBrand = getUserBrand();

  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      onClick={() => setShowChangeRequestModal(true)}
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
                      setFormData(profile); // Reset form data
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
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
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
              
              {/* Locked Fields Warning */}
              {profile.profileLockStatus === 'locked' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Locked Information (Admin Approval Required)</h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Please complete your basic information to finalize your artist profile. This information cannot be
                        changed after registration and is used for all official documentation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal fields with proper locking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                    {isFieldLocked('firstName') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={isFieldLocked('firstName') || !isEditing}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isFieldLocked('firstName') || !isEditing
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                        : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                    placeholder={!isFieldLocked('firstName') ? "Enter your first name" : ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                    {isFieldLocked('lastName') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={isFieldLocked('lastName') || !isEditing}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isFieldLocked('lastName') || !isEditing
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                        : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                    placeholder={!isFieldLocked('lastName') ? "Enter your last name" : ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                    {isFieldLocked('dateOfBirth') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  {isFieldLocked('dateOfBirth') || !isEditing ? (
                    <div className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-100 text-gray-700">
                      {formatDateOfBirth(formData.dateOfBirth, formData.country) || 'Not set'}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                    {isFieldLocked('nationality') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  <NationalityDropdown
                    value={formData.nationality || ''}
                    onChange={(value) => handleInputChange('nationality', value)}
                    disabled={isFieldLocked('nationality') || !isEditing}
                    className={isFieldLocked('nationality') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                    {isFieldLocked('country') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  <CountryDropdown
                    value={formData.country || ''}
                    onChange={(value) => handleInputChange('country', value)}
                    disabled={isFieldLocked('country') || !isEditing}
                    className={isFieldLocked('country') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                    {isFieldLocked('city') && (
                      <span className="ml-2 text-xs text-amber-600">(Locked - Admin approval required)</span>
                    )}
                  </label>
                  <CityDropdown
                    value={formData.city || ''}
                    onChange={(value) => handleInputChange('city', value)}
                    disabled={isFieldLocked('city') || !isEditing}
                    className={isFieldLocked('city') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>
              </div>

              {/* Request Changes Info */}
              {profile.profileLockStatus === 'locked' && (
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🔒 Contact support to request changes to locked information. All modifications require admin approval.
                  </p>
                </div>
              )}
            </div>

            {/* Artist Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artist Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name *</label>
                  <input
                    type="text"
                    value={formData.artistName || ''}
                    onChange={(e) => handleInputChange('artistName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Your artist/stage name"
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
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => {
                      // Update both bio and shortBio with the same value - simple and reliable!
                      handleInputChange('bio', e.target.value);
                      handleInputChange('shortBio', e.target.value);
                    }}
                    disabled={!isEditing}
                    rows={8}
                    placeholder={`Release Short Bio
Write a brief description for releases...

------

Artist Full Biography  
Write your detailed artist biography...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Request Modal */}
        <ChangeRequestModal
          isOpen={showChangeRequestModal}
          onClose={() => setShowChangeRequestModal(false)}
          currentProfile={profile}
          onSubmit={handleChangeRequest}
        />
      </div>
    </Layout>
  );
}
