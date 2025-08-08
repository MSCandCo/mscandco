import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';


export default function ArtistProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({
    // Personal Information (Locked - Admin approval required)
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    city: '',
    address: '',
    postalCode: '',
    
    // Changeable Information
    artistName: '',
    artistType: '',
    email: '',
    phone: '',
    
    // Music Information
    primaryGenre: '',
    secondaryGenres: [],
    instruments: [],
    vocalType: '',
    yearsActive: '',
    recordLabel: '',
    publisher: '',
    
    // Social Media & Online Presence
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    threads: '',
    appleMusic: '',
    soundcloud: '',
    
    // Distribution Information
    isrcPrefix: '',
    upcPrefix: '',
    distributorId: '',
    royaltyRate: '',
    paymentMethod: '',
    taxId: '',
    bankInfo: {
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      swiftCode: ''
    },
    
    // Legal & Rights
    publishingRights: '',
    mechanicalRights: '',
    performanceRights: '',
    syncRights: '',
    
    // Bio & Media
    bio: '',
    shortBio: '',
    pressKit: '',
    profileImage: '',
    bannerImage: '',
    
    // Preferences
    distributionPreferences: {
      territories: [],
      platforms: [],
      releaseTypes: [],
      pricingTier: ''
    },
    
    // Metadata
    tags: [],
    influences: [],
    collaborations: [],
    
    // Verification
    isVerified: false,
    verificationDocuments: [],
    
    // Admin Approval Status
    pendingChanges: [],
    lastApprovedBy: '',
    lastApprovedDate: '',
    
    // Registration Status
    isBasicInfoSet: false, // Track if basic info has been set (non-editable after first set)
    registrationDate: null // Track when artist was first registered
  });

  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load profile data from API
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/artist/get-profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    // Special handling for email and phone to sync with Auth0
    if (field === 'email' && user?.email) {
      if (value !== user.email) {
        setSuccessMessage('Email must match your login credentials. Please contact support to change your login email.');
        setShowSuccessModal(true);
        return;
      }
    }
    
    if (field === 'phone' && user?.phone_number) {
      if (value !== user.phone_number) {
        setSuccessMessage('Phone number must match your login credentials. Please contact support to change your login phone.');
        setShowSuccessModal(true);
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    // Validation: If basic info is not set, require essential fields
    if (!profile.isBasicInfoSet) {
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'country', 'city'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      
      if (missingFields.length > 0) {
        setErrors({
          message: `Please complete your artist registration! Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      const updatedData = { ...formData };
      
      // Check if basic info is being set for the first time
      if (!profile.isBasicInfoSet && formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality && formData.country && formData.city) {
        updatedData.isBasicInfoSet = true;
        updatedData.registrationDate = new Date().toISOString();
        console.log('Artist basic info registered for the first time');
      }
      
      const response = await fetch('/api/artist/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        setProfile(updatedData);
        setIsEditing(false);
        
        // Show success message for first-time registration
        if (!profile.isBasicInfoSet && updatedData.isBasicInfoSet) {
          setErrors({
            message: 'Artist registration completed! Your basic information has been saved and cannot be changed.',
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({
        message: 'Error saving profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your profile.</div>;
  }

  const userRole = getUserRole(user);
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
    'Folk', 'Blues', 'Reggae', 'Latin', 'World', 'Alternative', 'Indie', 'Metal',
    'Punk', 'Soul', 'Funk', 'Gospel', 'EDM', 'House', 'Techno', 'Trap', 'Dubstep'
  ];

  const artistTypes = [
    'Solo Artist',
    'Band Group', 
    'DJ',
    'Duo',
    'Orchestra',
    'Ensemble',
    'Collective',
    'Producer',
    'Composer',
    'Singer-Songwriter',
    'Rapper',
    'Instrumentalist',
    'Choir',
    'Other'
  ];

  const instruments = [
    'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Synthesizer',
    'Saxophone', 'Trumpet', 'Violin', 'Cello', 'Flute', 'Clarinet', 'Harmonica',
    'Banjo', 'Mandolin', 'Ukulele', 'Accordion', 'Organ', 'Harp', 'Percussion'
  ];

  const vocalTypes = ['Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass', 'Mixed'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Profile</h1>
              <p className="text-gray-600">Manage your artist information for releases and distribution</p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setFormData(profile);
                      setIsEditing(false);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              {/* First-time Registration Warning */}
              {!profile.isBasicInfoSet && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Complete Your Artist Registration
                      </h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Please complete your basic information to finalize your artist profile. 
                        This information cannot be changed after registration and is used for all official documentation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error/Success Messages */}
              {errors.message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  errors.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {errors.message}
                </div>
              )}
              
              {/* Locked Personal Information */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <span className="text-yellow-600 mr-2">🔒</span>
                  <span className="text-sm font-medium text-yellow-800">Locked Information (Admin Approval Required)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                      placeholder={!profile.isBasicInfoSet ? "Enter your first name" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                      placeholder={!profile.isBasicInfoSet ? "Enter your last name" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                      placeholder={!profile.isBasicInfoSet ? "Enter your nationality" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                      placeholder={!profile.isBasicInfoSet ? "Enter your country" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                      {profile.isBasicInfoSet && (
                        <span className="ml-2 text-xs text-amber-600">(Cannot be changed after registration)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={profile.isBasicInfoSet || !isEditing}
                      className={`w-full px-3 py-2 border rounded-md ${
                        profile.isBasicInfoSet || !isEditing
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-amber-300 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                      placeholder={!profile.isBasicInfoSet ? "Enter your city" : ""}
                    />
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  Contact support to request changes to locked information. All modifications require admin approval.
                </div>
              </div>

              {/* Editable Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name *</label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => handleInputChange('artistName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Type</label>
                  <select
                    value={formData.artistType}
                    onChange={(e) => handleInputChange('artistType', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Artist Type</option>
                    {artistTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Music Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Genre *</label>
                  <select
                    value={formData.primaryGenre}
                    onChange={(e) => handleInputChange('primaryGenre', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vocal Type</label>
                  <select
                    value={formData.vocalType}
                    onChange={(e) => handleInputChange('vocalType', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Vocal Type</option>
                    {vocalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Active</label>
                  <input
                    type="text"
                    value={formData.yearsActive}
                    onChange={(e) => handleInputChange('yearsActive', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 5 years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record Label</label>
                  <input
                    type="text"
                    value={formData.recordLabel}
                    onChange={(e) => handleInputChange('recordLabel', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Distribution Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribution Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISRC Prefix</label>
                  <input
                    type="text"
                    value={formData.isrcPrefix}
                    onChange={(e) => handleInputChange('isrcPrefix', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., US-ABC-12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPC Prefix</label>
                  <input
                    type="text"
                    value={formData.upcPrefix}
                    onChange={(e) => handleInputChange('upcPrefix', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distributor ID</label>
                  <input
                    type="text"
                    value={formData.distributorId}
                    onChange={(e) => handleInputChange('distributorId', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Royalty Rate (%)</label>
                  <input
                    type="number"
                    value={formData.royaltyRate}
                    onChange={(e) => handleInputChange('royaltyRate', e.target.value)}
                    disabled={!isEditing}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio (for releases)</label>
                  <textarea
                    value={formData.shortBio}
                    onChange={(e) => handleInputChange('shortBio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Brief artist description for release metadata..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Biography</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Detailed artist biography..."
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                {isEditing && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded">
                    Upload Image
                  </button>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                  <input
                    type="text"
                    value={formData.tiktok}
                    onChange={(e) => handleInputChange('tiktok', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threads</label>
                  <input
                    type="text"
                    value={formData.threads}
                    onChange={(e) => handleInputChange('threads', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X (Twitter)</label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                  <input
                    type="text"
                    value={formData.youtube}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
              {!formData.isVerified && (
                <p className="text-sm text-gray-600 mt-2">
                  Complete your profile to get verified for distribution.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 