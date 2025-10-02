import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit, Save, X, Building } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';

export default function CompanyAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // No locked fields - all Company Information is editable

  // Dropdown options
  const COUNTRY_CODES = [
    { code: '+1', country: 'US/CA' }, { code: '+44', country: 'UK' }, { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' }, { code: '+34', country: 'ES' }, { code: '+39', country: 'IT' }
  ];

  const DEPARTMENTS = ['Business Operations', 'Marketing', 'Finance', 'Legal', 'Technology', 'Human Resources'];

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

      const response = await fetch('/api/companyadmin/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const profileData = await response.json();
        
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

  const handleFieldChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = ['company_name', 'department'];
    
    requiredFields.forEach(field => {
      if (!editedProfile[field] || editedProfile[field].trim() === '') {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

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
      
      const response = await fetch('/api/companyadmin/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
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
      'first_name', 'last_name', 'email', 'phone', 'company_name', 'department', 'position', 'employee_id'
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
              <h1 className="text-3xl font-bold text-gray-900">Company Admin Profile</h1>
              <p className="text-gray-600 mt-1">Manage your administrator profile and permissions</p>
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
              

              {/* Company Information - EDITABLE */}
              <section className="bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center mb-6">
                  <Building className="w-5 h-5 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      First Name
                      {changedFields.includes('first_name') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.first_name || ''}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Last Name
                      {changedFields.includes('last_name') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.last_name || ''}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Email
                      {changedFields.includes('email') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
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

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                      {changedFields.includes('company_name') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.company_name || ''}
                      onChange={(e) => handleFieldChange('company_name', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } ${errors.company_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.company_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Department *
                      {changedFields.includes('department') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <select
                      value={editedProfile.department || ''}
                      onChange={(e) => handleFieldChange('department', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Position
                      {changedFields.includes('position') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.position || ''}
                      onChange={(e) => handleFieldChange('position', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                      {changedFields.includes('employee_id') && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editedProfile.employee_id || ''}
                      onChange={(e) => handleFieldChange('employee_id', e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar - 30% */}
            <div className="space-y-6">
              
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
                  Complete your profile to access all company admin features.
                </p>
              </section>

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
