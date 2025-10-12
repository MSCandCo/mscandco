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
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load requests when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadRequests();
    }
  }, [user, authLoading]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('Authentication required');
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🔍 Loading profile change requests...');
      const response = await fetch('/api/admin/profile-change-requests/list', { headers });
      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📄 Response data:', data);
        
        if (data.success) {
          setRequests(data.requests || []);
          console.log('✅ Loaded requests:', data.requests?.length || 0);
        } else {
          setError('Failed to load requests: ' + data.error);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError('API Error: ' + (errorData.error || 'Failed to load requests'));
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request, action) => {
    setProcessing(request.id);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/profile-change-requests/${request.id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ admin_notes: '' })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Request ${action}d successfully`);
        loadRequests(); // Reload the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || `Failed to ${action} request`);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const parseValue = (value) => {
    if (!value) return 'Not set';
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, val]) => `${key}: ${val}`).join(', ');
      }
      return parsed;
    } catch {
      return value;
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

        {/* Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">{request.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{request.field_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div><strong>From:</strong> {parseValue(request.current_value)}</div>
                        <div><strong>To:</strong> {parseValue(request.requested_value)}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          <strong>Reason:</strong> {request.reason}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(request, 'approve')}
                            disabled={processing === request.id}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                            {processing === request.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(request, 'reject')}
                            disabled={processing === request.id}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            {processing === request.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-400">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No profile change requests have been submitted yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
