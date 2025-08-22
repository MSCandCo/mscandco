import { useState, useEffect } from 'react';
import Layout from '../../components/layouts/mainLayout';
import { CountryDropdown, CountryCodeDropdown } from '../../components/shared/IntelligentDropdowns';

export default function LabelAdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestField, setChangeRequestField] = useState('');
  const [changeRequestValue, setChangeRequestValue] = useState('');
  const [changeRequestReason, setChangeRequestReason] = useState('');

  // Load profile
  const loadProfile = async () => {
    try {
      console.log('Loading label admin profile...');
      const response = await fetch('/api/labeladmin/profile');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Label admin profile loaded:', data);
        setProfile(data);
        setFormData(data);
      } else {
        console.error('Failed to load profile');
        // Set default label admin profile
        const defaultProfile = {
          firstName: 'Label',
          lastName: 'Admin',
          email: 'labeladmin@mscandco.com',
          labelName: 'MSC & Co',
          companyName: 'MSC & Co',
          country: 'United Kingdom',
          bio: 'Music distribution and publishing company',
          shortBio: 'MSC & Co Label',
          isBasicInfoSet: true,
          profileCompleted: true,
          lockedFields: {
            firstName: true,
            lastName: true,
            email: true
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
        firstName: 'Label',
        lastName: 'Admin',
        email: 'labeladmin@mscandco.com',
        labelName: 'MSC & Co',
        companyName: 'MSC & Co',
        country: 'United Kingdom',
        bio: 'Music distribution and publishing company',
        shortBio: 'MSC & Co Label',
        isBasicInfoSet: true,
        profileCompleted: true,
        lockedFields: {
          firstName: true,
          lastName: true,
          email: true
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

  // Handle change request submission
  const handleChangeRequest = async () => {
    if (!changeRequestField || !changeRequestValue) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/profile/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName: changeRequestField,
          currentValue: formData[changeRequestField] || '',
          requestedValue: changeRequestValue,
          reason: changeRequestReason
        })
      });
      
      if (response.ok) {
        setErrors({
          message: 'Change request submitted successfully! An admin will review your request.',
          type: 'success'
        });
        setShowChangeRequestModal(false);
        setChangeRequestField('');
        setChangeRequestValue('');
        setChangeRequestReason('');
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || 'Failed to submit change request',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      setErrors({
        message: 'Error submitting change request. Please try again.',
        type: 'error'
      });
    }
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
    
    // Clear errors when user types
    if (errors.message) {
      setErrors({});
    }
  };

  // Save profile
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    
    try {
      // Check if this is the first save (no locked fields yet)
      const isFirstSave = !profile?.lockedFields || Object.keys(profile.lockedFields).length === 0;
      
      // If first save, add locking for label information fields
      const saveData = {
        ...formData,
        ...(isFirstSave && {
          lockedFields: {
            firstName: true,
            lastName: true,
            labelName: true,
            companyName: true,
            email: true,
            country: true
          },
          profileLockStatus: 'locked'
        })
      };
      
      const response = await fetch('/api/labeladmin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Label admin profile saved:', result);
        setProfile(result.profile);
        setFormData(result.profile);
        setIsEditing(false);
        
        if (isFirstSave) {
          setErrors({
            message: 'Profile saved and locked successfully! Label information is now secured.',
            type: 'success'
          });
        } else {
          setErrors({
            message: 'Profile updated successfully!',
            type: 'success'
          });
        }
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

  // Loading state
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Label Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your label information and settings
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
                  {profile?.profileLockStatus === 'locked' && (
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
            
            {/* Label Information */}
            <div className="bg-gray-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Label Information</h2>
              
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
                        Your basic label information (name, company, email, country) is locked for security. Use "Request Changes" to submit modification requests for admin approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
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
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
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
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label Name *</label>
                  <input
                    type="text"
                    value={formData.labelName || ''}
                    onChange={(e) => handleInputChange('labelName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter your label name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter your company name"
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <CountryDropdown
                    value={formData.country || ''}
                    onChange={(value) => handleInputChange('country', value)}
                    disabled={isFieldLocked('country') || !isEditing}
                    className={isFieldLocked('country') || !isEditing ? 'opacity-60' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media & Online Presence</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="https://your-label.com"
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
                    placeholder="@labelname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="text"
                    value={formData.facebook || ''}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Facebook page URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                  <input
                    type="text"
                    value={formData.twitter || ''}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="@labelname"
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
                    placeholder="Channel URL"
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
                    placeholder="@labelname"
                  />
                </div>
              </div>
            </div>

            {/* Label Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Label Description</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                    <span className="text-xs text-gray-500 block mt-1">Brief description for listings and directories</span>
                  </label>
                  <textarea
                    value={formData.shortBio || ''}
                    onChange={(e) => handleInputChange('shortBio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Brief label description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Label Bio
                    <span className="text-xs text-gray-500 block mt-1">Detailed description for promotional use</span>
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Detailed label biography and history..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Label Logo</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <button
                  disabled={!isEditing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Upload Logo
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              
              {(() => {
                // Calculate completion percentage
                const requiredFields = [
                  'firstName', 'lastName', 'labelName', 'country', 'bio', 'shortBio'
                ];
                const completedFields = requiredFields.filter(field => formData[field] && formData[field].trim() !== '');
                const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                    </div>
                    
                    {/* Progress Bar */}
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
                          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Completion message */}
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

            {/* Label Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Label Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Artists:</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Releases:</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue:</span>
                  <span className="text-sm font-medium text-gray-900">£0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Request Modal */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Request Profile Change</h3>
                  <p className="text-sm text-gray-600 mt-1">Submit a request to modify locked label information</p>
                </div>
                <button
                  onClick={() => {
                    setShowChangeRequestModal(false);
                    setChangeRequestField('');
                    setChangeRequestValue('');
                    setChangeRequestReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Form Content */}
              <div className="space-y-5">
                {/* Field Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Field to Change</label>
                  <select
                    value={changeRequestField}
                    onChange={(e) => setChangeRequestField(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  >
                    <option value="">Select field...</option>
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="labelName">Label Name</option>
                    <option value="companyName">Company Name</option>
                    <option value="email">Email</option>
                    <option value="country">Country</option>
                  </select>
                </div>

                {/* Current Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Existing Information</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={changeRequestField ? (formData[changeRequestField] || 'Not set') : ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Requested Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Proposed Update</label>
                  <input
                    type="text"
                    value={changeRequestValue}
                    onChange={(e) => setChangeRequestValue(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter proposed update..."
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Reason for Change</label>
                  <textarea
                    value={changeRequestReason}
                    onChange={(e) => setChangeRequestReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Explain why this change is needed..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowChangeRequestModal(false);
                    setChangeRequestField('');
                    setChangeRequestValue('');
                    setChangeRequestReason('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeRequest}
                  disabled={!changeRequestField || !changeRequestValue || !changeRequestReason}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}