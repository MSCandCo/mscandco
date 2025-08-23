import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { getUserRole, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import ComprehensiveProfileForm from '../../components/profile/ComprehensiveProfileForm';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ArtistProfile() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      // Use user data directly from SupabaseProvider - no API call needed
      if (user) {
        const profileData = {
          // Personal Information
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone_number || '',
          countryCode: user.country_code || '',
          dateOfBirth: user.date_of_birth || '',
          nationality: user.nationality || '',
          country: user.country || '',
          city: user.city || '',
          location: user.address || '',
          postalCode: user.postal_code || '',
          displayName: user.display_name || '',
          role: user.role || 'artist'
        };
        
        setProfile(profileData);
        setFormData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async (updatedData) => {
    // Validation: If basic info is not set, require essential fields
    if (!profile.isBasicInfoSet) {
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'city'];
      const missingFields = requiredFields.filter(field => !updatedData[field] || updatedData[field].toString().trim() === '');
      
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
      const dataToSave = { ...updatedData };
      
      // Check if basic info is being set for the first time
      if (!profile.isBasicInfoSet && dataToSave.firstName && dataToSave.lastName && dataToSave.dateOfBirth && dataToSave.nationality && dataToSave.city) {
        dataToSave.isBasicInfoSet = true;
        dataToSave.registrationDate = new Date().toISOString();
        console.log('Artist basic info registered for the first time');
      }
      
      // Get access token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/artist/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (response.ok) {
        const savedProfile = await response.json();
        setProfile(savedProfile || dataToSave);
        setFormData(savedProfile || dataToSave);
        setIsEditing(false);
        
        // Show success message for first-time registration
        if (!profile.isBasicInfoSet && dataToSave.isBasicInfoSet) {
          setErrors({
            message: 'Artist registration completed! Your basic information has been saved and cannot be changed.',
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
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({
        message: error.message || 'Error saving profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userRole = getUserRole(user);
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Profile</h1>
              <p className="text-gray-600">Manage your comprehensive artist information for releases and distribution</p>
              
              {/* Profile Status Indicators */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  {profile.immutableDataLocked ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    Basic Info: {profile.immutableDataLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {profile.profileCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    Profile: {profile.profileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Wallet: ${(profile.walletBalance || 0).toFixed(2)}</span>
                </div>
              </div>
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
                <button
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                    setErrors({});
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {errors.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            errors.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {errors.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{errors.message}</span>
          </div>
        )}

        {/* Comprehensive Profile Form */}
        <ComprehensiveProfileForm 
          profile={profile}
          onSave={handleSave}
          isEditing={isEditing}
          isSaving={isSaving}
          errors={errors}
          userRole={userRole}
        />
      </div>
    </Layout>
  );
}