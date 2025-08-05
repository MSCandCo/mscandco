import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { ARTISTS } from '../../lib/mockData';
import SuccessModal from '../../components/shared/SuccessModal';

export default function LabelAdminProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [profile, setProfile] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Company Information
    labelName: '',
    companyName: '',
    position: '',
    department: '',
    
    // Contact Information
    officeAddress: '',
    city: '',
    country: '',
    postalCode: '',
    timezone: '',
    
    // Business Information
    businessType: '',
    taxId: '',
    vatNumber: '',
    registrationNumber: '',
    foundedYear: '',
    
    // Banking Information
    bankInfo: {
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      swiftCode: '',
      iban: ''
    },
    
    // Professional Details
    yearsOfExperience: '',
    specialization: [],
    primaryGenres: [],
    languages: [],
    
    // Social Media & Online Presence
    website: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    
    // Label Operations
    distributionPartners: [],
    publishingAgreements: [],
    territories: [],
    averageRoyaltyRate: '',
    
    // Preferences
    communicationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      weeklyReports: true,
      monthlyStatements: true
    },
    
    // Verification & Security
    isVerified: false,
    emailVerified: false,
    phoneVerified: false,
    emailVerificationDate: null,
    phoneVerificationDate: null,
    twoFactorEnabled: false,
    lastPasswordChange: '',
    
    // Metadata
    joinDate: '',
    lastLogin: '',
    profileCompletion: 0,
    
    // Registration Tracking
    isCompanyInfoSet: false,
    registrationDate: null
  });

  const [formData, setFormData] = useState({ ...profile });

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Calculate approved label artists count
  const labelArtists = ARTISTS.filter(artist => 
    artist.approvalStatus === 'approved' && 
    artist.label === (userBrand?.displayName || 'YHWH MSC')
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load profile data - in real app this would be from API
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
        
        yearsOfExperience: '8',
        specialization: ['A&R', 'Artist Development', 'Marketing', 'Rights Management'],
        primaryGenres: ['Hip Hop', 'R&B', 'Pop', 'Gospel'],
        languages: ['English', 'French'],
        
        website: 'https://yhwhmsc.com',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        instagram: '@yhwhmsc_official',
        facebook: 'YHWHMSCLabel',
        twitter: '@yhwhmsc',
        
        distributionPartners: ['Code Group', 'TuneCore', 'DistroKid'],
        publishingAgreements: ['ASCAP', 'PRS for Music'],
        territories: ['UK', 'EU', 'US', 'Canada', 'Australia'],
        averageRoyaltyRate: '15%',
        
        communicationPreferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          weeklyReports: true,
          monthlyStatements: true
        },
        
        isVerified: false, // Will be calculated based on verification requirements
        emailVerified: true,
        phoneVerified: true,
        emailVerificationDate: '2023-06-15T10:30:00Z',
        phoneVerificationDate: '2023-06-15T10:45:00Z',
        twoFactorEnabled: false,
        lastPasswordChange: '2024-01-01T00:00:00Z',
        
        joinDate: '2023-06-15T00:00:00Z',
        lastLogin: '2024-01-16T11:15:00Z',
        profileCompletion: 0, // Will be calculated dynamically
        
        // Company info is already set - preventing the first-time setup modal
        isCompanyInfoSet: true,
        registrationDate: '2023-06-15T00:00:00Z'
      };

      // Calculate initial verification status and profile completion
      mockProfile.isVerified = calculateVerificationStatus(mockProfile);
      mockProfile.profileCompletion = calculateProfileCompletion(mockProfile);
      
      setProfile(mockProfile);
      setFormData(mockProfile);
    }
  }, [isAuthenticated, user, userBrand]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.labelName?.trim()) {
      newErrors.labelName = 'Label name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = { ...formData };
      
      // Recalculate verification status and profile completion
      updatedProfile.isVerified = calculateVerificationStatus(updatedProfile);
      updatedProfile.profileCompletion = calculateProfileCompletion(updatedProfile);
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message only when user actually saves
      setSuccessTitle('Profile Updated!');
      setSuccessMessage('Your profile has been updated successfully.');
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

  // Calculate verification status based on requirements
  const calculateVerificationStatus = (profileData) => {
    const hasEmailVerification = profileData.emailVerified;
    const hasPhoneVerification = profileData.phoneVerified;
    const hasCompanyInfoSet = profileData.isCompanyInfoSet;
    
    // Verified only if they have email OR phone verification AND company info is set
    return (hasEmailVerification || hasPhoneVerification) && hasCompanyInfoSet;
  };

  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = (profileData) => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'labelName',
      'companyName', 'position', 'department', 'officeAddress', 
      'city', 'country', 'postalCode', 'timezone', 'businessType',
      'yearsOfExperience', 'website'
    ];
    
    const arrayFields = [
      'specialization', 'primaryGenres', 'languages', 
      'distributionPartners', 'publishingAgreements', 'territories'
    ];
    
    const bankingFields = [
      'bankInfo.accountName', 'bankInfo.accountNumber', 
      'bankInfo.bankName', 'bankInfo.swiftCode'
    ];
    
    let filledCount = 0;
    let totalFields = requiredFields.length + arrayFields.length + bankingFields.length;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') {
        filledCount++;
      }
    });
    
    // Check array fields
    arrayFields.forEach(field => {
      if (profileData[field] && Array.isArray(profileData[field]) && profileData[field].length > 0) {
        filledCount++;
      }
    });
    
    // Check banking fields
    bankingFields.forEach(field => {
      const fieldPath = field.split('.');
      const value = fieldPath.reduce((obj, key) => obj?.[key], profileData);
      if (value && value.toString().trim() !== '') {
        filledCount++;
      }
    });
    
    return Math.round((filledCount / totalFields) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
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
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
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
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                
                {/* Company Info Set Notice */}
                {profile.isCompanyInfoSet && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Company Information Locked
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Company information was set on {new Date(profile.registrationDate).toLocaleDateString()} and cannot be modified. 
                            Please contact support if you need to update this information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label Name</label>
                    <input
                      type="text"
                      value={formData.labelName}
                      onChange={(e) => handleInputChange('labelName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.labelName ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                    />
                    {errors.labelName && <p className="text-red-500 text-sm mt-1">{errors.labelName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                    {!formData.companyName && !profile.isCompanyInfoSet && (
                      <p className="text-amber-600 text-sm mt-1">Required for first-time setup</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                    <input
                      type="text"
                      value={formData.officeAddress}
                      onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      disabled={!isEditing || profile.isCompanyInfoSet}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        (!isEditing || profile.isCompanyInfoSet) ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    >
                      <option value="GMT+0">GMT+0 (London)</option>
                      <option value="GMT+1">GMT+1 (Paris)</option>
                      <option value="GMT-5">GMT-5 (New York)</option>
                      <option value="GMT-8">GMT-8 (Los Angeles)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Artists</span>
                    <span className="font-semibold">{labelArtists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years Experience</span>
                    <span className="font-semibold">{profile.yearsOfExperience} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-semibold">{profile.foundedYear}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status</span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {profile.isVerified ? 'Fully Verified' : 'Verification Pending'}
                      </span>
                    </div>
                    
                    {/* Verification Requirements */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Email Verification</span>
                        <span className={`text-xs ${profile.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {profile.emailVerified ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone Verification</span>
                        <span className={`text-xs ${profile.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {profile.phoneVerified ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Company Registration</span>
                        <span className={`text-xs ${profile.isCompanyInfoSet ? 'text-green-600' : 'text-red-600'}`}>
                          {profile.isCompanyInfoSet ? '✓' : '✗'}
                        </span>
                      </div>
                      {!profile.isVerified && (
                        <p className="text-xs text-amber-600 mt-2">
                          Complete {profile.emailVerified || profile.phoneVerified ? 'company registration' : 'email/phone verification and company registration'} to become fully verified.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialization</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialization.map((spec, index) => (
                    <span key={index} className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Genres */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.primaryGenres.map((genre, index) => (
                    <span key={index} className="inline-flex px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Profile updated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📊</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Viewed analytics</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm">🎵</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">New release approved</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
        buttonText="Close"
      />
    </Layout>
  );
}