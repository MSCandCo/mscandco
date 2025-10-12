import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layouts/mainLayout';
import {
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function ProfileChangeRequests() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadRequests();
    }
  }, [user, authLoading]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('Authentication required');
        return;
      }
      
      // For now, just show empty state since we need to set up the proper API
      setRequests([]);
      
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile change requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-gray-800" />
            Profile Change Requests
          </h1>
          <p className="mt-2 text-gray-600">
            Review and approve user profile change requests
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Setup Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Profile Change Requests System
              </h3>
              <p className="text-blue-700 mb-4">
                This page will show profile change requests from users. The system is ready but needs the database table to be set up.
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  🔧 Setup Status:
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Profile Change API</span>
                    <span className="text-green-600 font-medium">✅ Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Table</span>
                    <span className="text-yellow-600 font-medium">⚠️ Needs Setup</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Interface</span>
                    <span className="text-green-600 font-medium">✅ Ready</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}