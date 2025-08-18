import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { getUserRole } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import ComprehensiveReleaseForm from '../../components/releases/ComprehensiveReleaseForm';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CreateRelease() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  // Authentication handled by useUser hook
  const [userRole, setUserRole] = useState('');
  
  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [currentRelease, setCurrentRelease] = useState(null);

  // Check authentication and role
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const role = getUserRole(user);
    setUserRole(role);
    setIsAuthenticated(true);

    // Check if user can create releases
    if (!['artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin'].includes(role)) {
      router.push('/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  // Load existing release if editing
  useEffect(() => {
    const { edit, releaseId } = router.query;
    
    if (edit === 'true' && releaseId && user) {
      loadRelease(releaseId);
    }
  }, [router.query, user]);

  const loadRelease = async (releaseId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/releases/${releaseId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const releaseData = await response.json();
        setCurrentRelease(releaseData);
      } else {
        console.error('Failed to load release');
        setErrors({ general: 'Failed to load release data' });
      }
    } catch (error) {
      console.error('Error loading release:', error);
      setErrors({ general: 'Error loading release data' });
    }
  };

  const handleSave = async (releaseData) => {
    setIsSaving(true);
    setErrors({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const method = currentRelease ? 'PUT' : 'POST';
      const payload = currentRelease ? 
        { ...releaseData, releaseId: currentRelease.id } : 
        releaseData;

      const response = await fetch('/api/releases/comprehensive', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentRelease(result.release);
        setSuccessMessage('Release saved successfully!');
        
        // Update URL if this was a new release
        if (!currentRelease && result.release) {
          router.replace(`/releases/create?edit=true&releaseId=${result.release.id}`, undefined, { shallow: true });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save release');
      }
    } catch (error) {
      console.error('Error saving release:', error);
      setErrors({ general: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (releaseData) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Validate required fields
      const requiredFields = ['projectName', 'artistName', 'releaseTitle', 'releaseType', 'primaryGenre', 'releaseDate'];
      const missingFields = requiredFields.filter(field => !releaseData[field]);
      
      if (missingFields.length > 0) {
        setErrors({ 
          general: `Please fill in all required fields: ${missingFields.join(', ')}` 
        });
        setIsSubmitting(false);
        return;
      }

      const method = currentRelease ? 'PUT' : 'POST';
      const payload = currentRelease ? 
        { ...releaseData, releaseId: currentRelease.id } : 
        releaseData;

      const response = await fetch('/api/releases/comprehensive', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message based on role and action
        if (userRole === 'artist' || userRole === 'label_admin') {
          setSuccessMessage('Release submitted for review! You will be notified when it\'s processed.');
        } else {
          setSuccessMessage('Release updated successfully!');
        }

        // Redirect to releases list after a delay
        setTimeout(() => {
          router.push('/artist/releases');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit release');
      }
    } catch (error) {
      console.error('Error submitting release:', error);
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissSuccess = () => {
    setSuccessMessage('');
  };

  const dismissError = () => {
    setErrors({});
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {currentRelease ? 'Edit Release' : 'Create New Release'}
                  </h1>
                  <p className="mt-1 text-gray-600">
                    {currentRelease ? 
                      `Editing: ${currentRelease.project_name || currentRelease.release_title}` : 
                      'Fill in the comprehensive release information below'
                    }
                  </p>
                </div>
              </div>
              
              {/* Release Status Indicator */}
              {currentRelease && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentRelease.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    currentRelease.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    currentRelease.status === 'in_review' ? 'bg-orange-100 text-orange-800' :
                    currentRelease.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    currentRelease.status === 'live' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentRelease.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700">{successMessage}</span>
                </div>
                <button
                  onClick={dismissSuccess}
                  className="text-green-500 hover:text-green-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{errors.general}</span>
                </div>
                <button
                  onClick={dismissError}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ComprehensiveReleaseForm
            release={currentRelease}
            onSave={handleSave}
            onSubmit={handleSubmit}
            isEditing={true}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            errors={errors}
            userRole={userRole}
            autoSaveEnabled={userRole === 'artist' || userRole === 'label_admin'}
          />
        </div>
      </div>
    </Layout>
  );
}
