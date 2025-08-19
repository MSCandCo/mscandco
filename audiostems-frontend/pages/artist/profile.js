import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { getUserRoleSync } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { NationalityDropdown, CountryDropdown, CityDropdown, CountryCodeDropdown } from '../../components/shared/IntelligentDropdowns';
import { GENRES, VOCAL_TYPES, ARTIST_TYPES, INSTRUMENTS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { formatDateOfBirth } from '../../lib/date-utils';

export default function ArtistProfile() {
  const { user, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading2, setIsLoading2] = useState(true);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});

  // Load profile with locking information
  const loadProfile = async () => {
    try {
      setIsLoading2(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/artist/profile', { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile loaded with locking data:', data);
        setProfile(data);
        setFormData(data);
      } else {
        console.error('Failed to load profile');
        setErrors({
          message: 'Failed to load profile. Please refresh the page.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrors({
        message: 'Error loading profile. Please refresh the page.',
        type: 'error'
      });
    } finally {
      setIsLoading2(false);
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

  // Handle input changes with lock validation
  const handleInputChange = (field, value) => {
    if (isFieldLocked(field) && isEditing) {
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
    
    // Clear errors when user types
    if (errors.message) {
      setErrors({});
    }
  };

  // Save profile (respects database locks)
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/artist/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Profile saved successfully:', result);
        setProfile(result.profile);
        setFormData(result.profile);
        setIsEditing(false);
        setErrors({
          message: 'Profile updated successfully!',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        setErrors({
          message: errorData.error || 'Failed to save profile. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      setErrors({
        message: 'Error saving profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle change request for locked fields
  const handleChangeRequest = async (requestData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/profile/change-request', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        setErrors({
          message: 'Change request submitted successfully! An admin will review your request.',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || 'Failed to submit change request.',
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

  // Loading state
  if (isLoading || isLoading2 || !profile) {
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

  // Role check - temporarily disabled for testing
  // const userRole = getUserRoleSync();
  // TODO: Re-enable role check after testing

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
                      onClick={() => handleChangeRequest({
                        requestType: 'profile_change',
                        reason: 'Need to update locked profile information',
                        currentData: {
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          dateOfBirth: profile.dateOfBirth,
                          nationality: profile.nationality,
                          country: profile.country,
                          city: profile.city
                        }
                      })}
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
                {/* First Name */}
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
                    placeholder={!isFieldLocked('firstName') && isEditing ? "Enter your first name" : ""}
                  />
                </div>

                {/* Last Name */}
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
                    placeholder={!isFieldLocked('lastName') && isEditing ? "Enter your last name" : ""}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                    {isFieldLocked('dateOfBirth') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                    )}
                  </label>
                  {isFieldLocked('dateOfBirth') || !isEditing ? (
                    <div className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-100 text-gray-600">
                      {formatDateOfBirth(formData.dateOfBirth, formData.country) || 'Not set'}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                    {isFieldLocked('nationality') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                    )}
                  </label>
                  <NationalityDropdown
                    value={formData.nationality || ''}
                    onChange={(value) => handleInputChange('nationality', value)}
                    disabled={isFieldLocked('nationality') || !isEditing}
                    className={isFieldLocked('nationality') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                    {isFieldLocked('country') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                    )}
                  </label>
                  <CountryDropdown
                    value={formData.country || ''}
                    onChange={(value) => handleInputChange('country', value)}
                    disabled={isFieldLocked('country') || !isEditing}
                    className={isFieldLocked('country') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                    {isFieldLocked('city') && (
                      <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex space-x-2">
                    <CountryCodeDropdown
                      value={formData.countryCode || '+44'}
                      onChange={(value) => handleInputChange('countryCode', value)}
                      disabled={!isEditing}
                      className="w-32"
                    />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="1234567890"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Music Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Genre *</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Genre</label>
                  <select
                    value={formData.secondaryGenre || ''}
                    onChange={(e) => handleInputChange('secondaryGenre', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Secondary Genre</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Active</label>
                  <input
                    type="text"
                    value={formData.yearsActive || ''}
                    onChange={(e) => handleInputChange('yearsActive', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record Label</label>
                  <input
                    type="text"
                    value={formData.recordLabel || ''}
                    onChange={(e) => handleInputChange('recordLabel', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Your record label"
                  />
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
              <div className="space-y-6">
                {/* Release Bio */}
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

                {/* Full Artist Bio */}
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

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                  <input
                    type="text"
                    value={formData.youtube || ''}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Channel URL or @handle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                  <input
                    type="text"
                    value={formData.tiktok || ''}
                    onChange={(e) => handleInputChange('tiktok', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <button
                  disabled={!isEditing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              
              {(() => {
                // Calculate completion percentage with proper sections
                const requiredFields = [
                  'firstName', 'lastName', 'dateOfBirth', 'nationality', 'country', 'city',
                  'artistName', 'primaryGenre', 'bio', 'shortBio'
                ];
                const completedFields = requiredFields.filter(field => formData[field] && formData[field].trim() !== '');
                const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
                
                // Section checks for display
                const basicInfoFields = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'country', 'city'];
                const artistInfoFields = ['artistName'];
                const musicInfoFields = ['primaryGenre'];
                const biographyFields = ['bio', 'shortBio'];
                const socialMediaFields = ['website', 'instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];
                
                // Check completion of each section
                const basicInfoComplete = basicInfoFields.every(field => formData[field] && formData[field].trim() !== '');
                const artistInfoComplete = artistInfoFields.every(field => formData[field] && formData[field].trim() !== '');
                const musicInfoComplete = musicInfoFields.every(field => formData[field] && formData[field].trim() !== '');
                const biographyComplete = biographyFields.every(field => formData[field] && formData[field].trim() !== '');
                const socialMediaComplete = socialMediaFields.some(field => formData[field] && formData[field].trim() !== '');
                

                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                    </div>
                    
                    {/* Creative Loading Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            percentage === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            percentage >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            percentage >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            percentage >= 40 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          {/* Animated shine effect */}
                          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        </div>
                      </div>
                      
                    </div>
                    
                    {/* Clean completion message */}
                    <div className="text-center mt-4">
                      {percentage === 100 ? (
                        <div className="text-green-600 font-medium">
                          🎉 Profile Complete!
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          {requiredFields.length - completedFields.length} fields remaining
                        </div>
                      )}
                    </div>
                    
                    {/* Account verification status */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <span className="text-sm text-green-600 font-medium">Account Verified</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}