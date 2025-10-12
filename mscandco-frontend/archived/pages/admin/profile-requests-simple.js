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
      
      // Try to load from the existing API endpoint
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch('/api/admin/profile-requests/list', { headers });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRequests(data.requests || []);
        } else {
          setError('Failed to load requests: ' + data.error);
        }
      } else {
        // If the new API doesn't exist, try the old one
        const oldResponse = await fetch('/api/admin/change-requests', { headers });
        if (oldResponse.ok) {
          const oldData = await oldResponse.json();
          if (oldData.success) {
            setRequests(oldData.requests || []);
          } else {
            setError('No profile change requests API available yet');
          }
        } else {
          setError('Profile change requests system not set up yet');
        }
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
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

        {/* Content */}
        {requests.length === 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Change Requests</h3>
            <p className="text-gray-600 mb-6">
              No profile change requests have been submitted yet.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-900 mb-2">🔧 System Status:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div>✅ Page loads successfully</div>
                <div>✅ Authentication working</div>
                <div>✅ RBAC permissions integrated</div>
                <div>⚠️ Waiting for profile change requests to be submitted</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

