import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { ARTISTS } from '../../lib/emptyData';

export default function LabelAdminProfile() {
  const { user, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 🎯 FRESH START - No automatic success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    labelName: '',
    companyName: '',
    position: '',
    department: '',
    officeAddress: '',
    city: '',
    country: '',
    postalCode: '',
    timezone: '',
    businessType: '',
    taxId: '',
    vatNumber: '',
    registrationNumber: '',
    foundedYear: '',
    bankInfo: {
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      swiftCode: '',
      iban: ''
    },
    profileCompletion: 0,
    isVerified: false,
    
    // Registration Status
    isCompanyInfoSet: false, // Track if company info has been set (non-editable after first set)
    registrationDate: null // Track when label was first registered
  });

  const [formData, setFormData] = useState({ ...profile });

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Calculate approved label artists count
  const labelArtists = ARTISTS.filter(artist => 
    artist.approvalStatus === 'approved' && 
    artist.label === (userBrand?.displayName || 'YHWH MSC')
  );

  // 🎯 CLEAN PROFILE LOADING - No auto-triggers
  useEffect(() => {
    console.log('📝 FRESH Profile useEffect running...');
    if (user && user) {
      console.log('✅ Loading profile data - NO AUTO SUCCESS');
      
      const mockProfile = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: user.email || 'sarah.johnson@mscandco.com',
        phone: '+44 20 7946 0958',
        
        labelName: userBrand?.displayName || 'YHWH MSC',
        companyName: 'YHWH MSC Ltd',
        position: 'Label Manager',
        department: 'A&R',
        
        officeAddress: '123 Music Street, London',
        city: 'London',
        country: 'United Kingdom',
        postalCode: 'SW1A 1AA',
        timezone: 'GMT+0',
        
        businessType: 'Music Label',
        taxId: 'TAX123456789',
        vatNumber: 'GB123456789',
        registrationNumber: 'REG987654321',
        foundedYear: '2015',
        
        bankInfo: {
          accountName: 'YHWH MSC Ltd',
          accountNumber: '12345678',
          routingNumber: '123456',
          bankName: 'Barclays Bank',
          swiftCode: 'BARCGB22',
          iban: 'GB29BARC20031512345678'
        },
        
        profileCompletion: 100,
        isVerified: true,
        isCompanyInfoSet: true,
        registrationDate: '2023-06-15T00:00:00Z'
      };

      console.log('📝 Setting profile data - NO SUCCESS MODAL TRIGGER');
      setProfile(mockProfile);
      setFormData(mockProfile);
    }
  }, [user, user, userBrand]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.labelName?.trim()) {
      newErrors.labelName = 'Label name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 EXPLICIT SAVE HANDLER - Only triggers on button click
  const handleSave = async () => {
    console.log('🚨 EXPLICIT handleSave called by user action!');
    
    // Validation: If company info is not set, require essential fields
    if (!profile.isCompanyInfoSet) {
      const requiredFields = ['companyName', 'labelName', 'businessType', 'country'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      
      if (missingFields.length > 0) {
        setErrors({
          message: `Please complete your label registration! Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = { ...formData };
      updatedProfile.profileCompletion = 100;
      updatedProfile.isVerified = true;
      
      // Check if company info is being set for the first time
      if (!profile.isCompanyInfoSet && formData.companyName && formData.labelName && formData.businessType && formData.country) {
        updatedProfile.isCompanyInfoSet = true;
        updatedProfile.registrationDate = new Date().toISOString();
        console.log('Label company info registered for the first time');
      }
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message for first-time registration or regular update
      if (!profile.isCompanyInfoSet && updatedProfile.isCompanyInfoSet) {
        setSuccessTitle('Label Registration Complete!');
        setSuccessMessage('Your label company information has been saved and cannot be changed.');
      } else {
        setSuccessTitle('Profile Updated!');
        setSuccessMessage('Your profile has been updated successfully.');
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSuccessTitle('Error');
      setSuccessMessage('Error saving profile. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-gray-600">
                    {profile.position ? `${profile.position} at ` : 'Label Admin at '}{profile.labelName}
                  </p>
                  <p className="text-sm text-gray-500">Managing {labelArtists.length} approved artists</p>
                  <div className="flex items-center mt-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{width: `${profile.profileCompletion}%`}}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{profile.profileCompletion}% complete</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.firstName}</p>
                    )}
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.lastName}</p>
                    )}
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                
                {/* First-time Registration Warning */}
                {!profile.isCompanyInfoSet && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Complete Your Label Registration
                        </h3>
                        <p className="mt-1 text-sm text-amber-700">
                          Please complete your company information to finalize your label admin profile. 
                          This information cannot be changed after registration and is used for all official documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error/Success Messages */}
                {errors.message && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    {errors.message}
                  </div>
                )}
                
                {/* Company Info Locked Message (after registration) */}
                {profile.isCompanyInfoSet && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="text-yellow-600 mr-2">🔒</div>
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Company Information Locked</h3>
                        <p className="text-sm text-yellow-700">
                          Company information was registered on {profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : '15/06/2023'} and cannot be modified. Please contact support if you need to update this information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label Name
                      {profile.isCompanyInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    {isEditing && !profile.isCompanyInfoSet ? (
                      <input
                        type="text"
                        value={formData.labelName}
                        onChange={(e) => handleInputChange('labelName', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter your label name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.labelName || 'Not set - Please set your label name'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                      {profile.isCompanyInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    {isEditing && !profile.isCompanyInfoSet ? (
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter your company name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.companyName || 'Not set - Please set your company name'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                      {profile.isCompanyInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    {isEditing && !profile.isCompanyInfoSet ? (
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">Select business type</option>
                        <option value="Independent Label">Independent Label</option>
                        <option value="Major Label">Major Label</option>
                        <option value="Distribution Company">Distribution Company</option>
                        <option value="Music Publisher">Music Publisher</option>
                        <option value="Entertainment Company">Entertainment Company</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.businessType || 'Not set - Please select business type'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                      {profile.isCompanyInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    {isEditing && !profile.isCompanyInfoSet ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter your country"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.country || 'Not set - Please set your country'}</p>
                    )}
                  </div>
                </div>
                
                {!profile.isCompanyInfoSet && (
                  <p className="text-xs text-amber-600 mt-4">
                    ⚠️ Important: Company information cannot be changed after initial registration
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Artists</span>
                    <span className="font-medium">{labelArtists.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Years Experience</span>
                    <span className="font-medium">8 years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-medium">2015</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className="font-medium text-green-600">Fully Verified</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Profile updated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 CLEAN SUCCESS MODAL - Only shows when explicitly set */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{successTitle}</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}