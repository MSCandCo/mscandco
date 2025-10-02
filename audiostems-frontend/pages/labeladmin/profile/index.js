import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { Lock, Edit, Save, X, User, Building, Globe, Phone, Mail, MapPin, Calendar, Flag } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';
import ProfilePictureUpload from '../../../components/ProfilePictureUpload';

export default function LabelProfile() {
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [requestedChange, setRequestedChange] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // LOCKED: Core signup fields - require admin approval
  const LOCKED_FIELDS = ['first_name', 'last_name', 'email', 'date_of_birth', 'nationality', 'country', 'city'];
  
  // EDITABLE: Can change directly
  const EDITABLE_FIELDS = ['label_name', 'company_name', 'phone', 'website', 'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'bio'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/labeladmin/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
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
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Only save editable fields
      const editableChanges = {};
      EDITABLE_FIELDS.forEach(field => {
        if (editedProfile[field] !== profile[field]) {
          editableChanges[field] = editedProfile[field];
        }
      });

      if (Object.keys(editableChanges).length === 0) {
        showBrandedNotification('No changes to save', 'error');
        return;
      }

      const response = await fetch('/api/labeladmin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableChanges)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        setIsEditing(false);
        showBrandedNotification('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
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
    setIsEditing(false);
  };

  const handleChangeRequest = async () => {
    if (!selectedField || !requestedChange.trim()) {
      showBrandedNotification('Please select a field and enter your requested change', 'error');
      return;
    }

    try {
      setSubmittingRequest(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const currentValue = profile[selectedField] || '';
      
      const { error } = await supabase
        .from('profile_change_requests')
        .insert({
          user_id: user.id,
          field_name: selectedField,
          current_value: currentValue,
          requested_value: requestedChange,
          status: 'pending'
        });

      if (error) throw error;

      showBrandedNotification('Change request submitted successfully! An admin will review it shortly.');
      setShowChangeRequestModal(false);
      setSelectedField('');
      setRequestedChange('');
    } catch (error) {
      console.error('Error submitting change request:', error);
      showBrandedNotification('Failed to submit request. Please try again.', 'error');
    } finally {
      setSubmittingRequest(false);
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

  const currentData = editedProfile || profile;
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
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                      disabled={!isEditing}
                      className={`px-3 py-2 border border-gray-300 rounded-l-lg ${
                        isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    <input
                      type="tel"
                      value={currentData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg ${
                        isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    placeholder="@labelname"
                  />
                </div>
              </div>
            </section>

            {/* Label Description */}
            <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Label Description</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={currentData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Information to Change*</label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select field to change</option>
                    {LOCKED_FIELDS.map(field => (
                      <option key={field} value={field}>
                        {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                      {profile[selectedField] || 'Not set'}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Change*</label>
                  <input
                    type="text"
                    value={requestedChange}
                    onChange={(e) => setRequestedChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the new value you want"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowChangeRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangeRequest}
                    disabled={submittingRequest}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}