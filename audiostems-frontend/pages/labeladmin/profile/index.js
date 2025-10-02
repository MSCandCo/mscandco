import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Edit, Save, X, Upload, User, Mail, Phone, Globe, Calendar, MapPin, Building, Award, FileText } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';

export default function LabelProfile() {
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

      const response = await fetch('/api/labeladmin/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const profileData = await response.json();
        
        // Use the profile data directly (no mapping needed for label admin)
        setProfile(profileData);
        setEditedProfile(profileData);
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
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
      'first_name', 'last_name', 'email', 'label_name', 'company_name', 'date_of_birth', 'nationality', 
      'country', 'city', 'phone', 'website', 'instagram', 'facebook', 'twitter', 'bio'
    ];
    
    const completedFields = allFields.filter(field => {
      const value = currentData[field];
      const isCompleted = value && value.toString().trim() !== '';
      return isCompleted;
    });
    
    return Math.round((completedFields.length / allFields.length) * 100);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any existing error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      // Only send editable fields
      const editableFields = [
        'label_name', 'company_name', 'phone', 'country_code', 'website', 'instagram', 
        'facebook', 'twitter', 'youtube', 'tiktok', 'bio'
      ];
      
      const updateData = {};
      editableFields.forEach(field => {
        if (editedProfile.hasOwnProperty(field)) {
          updateData[field] = editedProfile[field];
        }
      });

      const response = await fetch('/api/labeladmin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        setEditMode(false);
        showBrandedNotification('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showBrandedNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
    setErrors({});
  };

  const handleChangeRequest = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fieldToChange = formData.get('fieldToChange');
    const requestedChange = formData.get('requestedChange');

    if (!fieldToChange || !requestedChange.trim()) {
      showBrandedNotification('Please select a field and enter your requested change', 'error');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentValue = profile[fieldToChange] || '';
      
      const { error } = await supabase
        .from('profile_change_requests')
        .insert({
          user_id: user.id,
          field_name: fieldToChange,
          current_value: currentValue,
          requested_value: requestedChange,
          status: 'pending'
        });

      if (error) throw error;

      showBrandedNotification('Change request submitted successfully! An admin will review it shortly.');
      setShowChangeRequestModal(false);
      e.target.reset();
    } catch (error) {
      console.error('Error submitting change request:', error);
      showBrandedNotification('Failed to submit request. Please try again.', 'error');
    }
  };

  const handleProfilePictureSuccess = (url) => {
    setProfile(prev => ({ ...prev, profile_picture_url: url }));
    setEditedProfile(prev => ({ ...prev, profile_picture_url: url }));
    showBrandedNotification('Profile picture updated successfully!');
  };

  const handleProfilePictureError = (error) => {
    showBrandedNotification(error, 'error');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">Failed to load profile</div>
        </div>
      </Layout>
    );
  }

  const currentData = editedProfile;
  const progress = calculateProgress();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Label Profile</h1>
              <p className="text-gray-600 mt-1">Manage your label information and settings</p>
            </div>
            
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - 30% */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture */}
            <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              <ProfilePictureUpload
                currentImage={currentData.profile_picture_url}
                onUploadSuccess={handleProfilePictureSuccess}
                onUploadError={handleProfilePictureError}
              />
            </div>

            {/* Profile Completion */}
            <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Complete your profile to improve your visibility and connect with more opportunities.
              </p>
            </div>
          </div>

          {/* Main Content - 70% */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information - LOCKED */}
            <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
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
                    value={currentData.first_name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={currentData.last_name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={currentData.date_of_birth || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <input
                    type="text"
                    value={currentData.nationality || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={currentData.country || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={currentData.city || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <button
                onClick={() => setShowChangeRequestModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Need to update personal information? Request a change
              </button>
            </section>

            {/* Label Information */}
            <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Label Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label Name *</label>
                  <input
                    type="text"
                    value={currentData.label_name || ''}
                    onChange={(e) => handleInputChange('label_name', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="Enter your label name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={currentData.company_name || ''}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={currentData.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="flex">
                    <select 
                      value={currentData.country_code || '+44'}
                      onChange={(e) => handleInputChange('country_code', e.target.value)}
                      disabled={!editMode}
                      className={`px-3 py-2 border border-gray-300 rounded-l-lg ${
                        editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {COUNTRY_CODES.map(({ code, country }) => (
                        <option key={code} value={code}>
                          {code} {country}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={currentData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editMode}
                      className={`flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg ${
                        editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      }`}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Social Media & Online Presence */}
            <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <div className="flex items-center mb-6">
                <Globe className="w-5 h-5 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Social Media & Online Presence</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={currentData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="https://your-label.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={currentData.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="@labelname"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="text"
                    value={currentData.facebook || ''}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="Facebook page URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={currentData.twitter || ''}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="@labelname"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="text"
                    value={currentData.youtube || ''}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="Channel URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="text"
                    value={currentData.tiktok || ''}
                    onChange={(e) => handleInputChange('tiktok', e.target.value)}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="@labelname"
                  />
                </div>
              </div>
            </section>

            {/* Label Description */}
            <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <div className="flex items-center mb-6">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Label Description</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={currentData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editMode}
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    editMode ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  }`}
                  placeholder="Tell us about your label, its history, and what makes it unique..."
                />
              </div>
            </section>
          </div>
        </div>

        {/* Change Request Modal */}
        {showChangeRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Request Profile Change</h3>
                <button
                  onClick={() => setShowChangeRequestModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleChangeRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Information to Change*</label>
                  <select
                    name="fieldToChange"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select field to change</option>
                    {LOCKED_FIELDS.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Change*</label>
                  <input
                    type="text"
                    name="requestedChange"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the new value you want"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChangeRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}