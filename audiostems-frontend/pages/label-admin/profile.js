import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { ARTISTS } from '../../lib/mockData';

export default function LabelAdminProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
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
    twoFactorEnabled: false,
    lastPasswordChange: '',
    
    // Metadata
    joinDate: '',
    lastLogin: '',
    profileCompletion: 0
  });

  const [formData, setFormData] = useState({ ...profile });

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Calculate label artists count
  const labelArtists = ARTISTS.filter(artist => 
    artist.status === 'active' && 
    (artist.label === userBrand?.displayName || artist.brand === userBrand?.displayName)
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load profile data - in real app this would be from API
      const mockProfile = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: user.email || 'sarah.johnson@mscandco.com',
        phone: '+44 20 7946 0958',
        
        labelName: userBrand?.displayName || 'MSC & Co',
        companyName: 'MSC & Co Entertainment Ltd',
        position: 'Label Manager',
        department: 'A&R and Artist Development',
        
        officeAddress: '123 Music House, Soho',
        city: 'London',
        country: 'United Kingdom',
        postalCode: 'W1F 8AB',
        timezone: 'GMT+0',
        
        businessType: 'Record Label',
        taxId: 'GB123456789',
        vatNumber: 'GB987654321',
        registrationNumber: 'RC12345678',
        foundedYear: '2018',
        
        bankInfo: {
          accountName: 'MSC & Co Entertainment Ltd',
          accountNumber: '12345678',
          routingNumber: '123456',
          bankName: 'Barclays Bank UK',
          swiftCode: 'BARCGB22',
          iban: 'GB29 BARC 1234 5612 3456 78'
        },
        
        yearsOfExperience: '8',
        specialization: ['A&R', 'Artist Development', 'Marketing', 'Rights Management'],
        primaryGenres: ['Hip Hop', 'R&B', 'Pop', 'Gospel'],
        languages: ['English', 'French'],
        
        website: 'https://mscandco.com',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        instagram: '@mscandco_official',
        facebook: 'MSCandCo',
        twitter: '@mscandco',
        
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
        
        isVerified: true,
        twoFactorEnabled: false,
        lastPasswordChange: '2024-01-01T00:00:00Z',
        
        joinDate: '2023-06-15T00:00:00Z',
        lastLogin: '2024-01-16T11:15:00Z',
        profileCompletion: 95
      };

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
      
      setProfile(formData);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
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
                  <p className="text-gray-600">{profile.position} at {profile.labelName}</p>
                  <p className="text-sm text-gray-500">Managing {labelArtists.length} active artists</p>
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
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      } border-gray-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        !isEditing ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified</span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.isVerified ? 'Verified' : 'Pending'}
                    </span>
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
    </Layout>
  );
}