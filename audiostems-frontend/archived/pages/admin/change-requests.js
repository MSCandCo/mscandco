import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { getUserRoleSync } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { supabase } from '../../lib/supabase';
import { formatDateOfBirth } from '../../lib/date-utils';

export default function ChangeRequestsAdmin() {
  const { user, isLoading } = useUser();
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [errors, setErrors] = useState({});

  // Load change requests
  const loadChangeRequests = async () => {
    try {
      setIsLoadingRequests(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/admin/change-requests', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || 'Failed to load change requests',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error loading change requests:', error);
      setErrors({
        message: 'Error loading change requests. Please refresh the page.',
        type: 'error'
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadChangeRequests();
    }
  }, [user]);

  // Handle approve/reject
  const handleRequestAction = async (requestId, action, adminNotes = '') => {
    setProcessingRequest(requestId);
    setErrors({});
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/admin/change-requests', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          requestId,
          action,
          adminNotes
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setErrors({
          message: result.message,
          type: 'success'
        });
        
        // Reload requests to update the list
        loadChangeRequests();
      } else {
        const errorData = await response.json();
        setErrors({
          message: errorData.error || `Failed to ${action} change request`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing change request:`, error);
      setErrors({
        message: `Error ${action}ing change request. Please try again.`,
        type: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Check if user is admin
  const userRole = getUserRoleSync();
  if (!['company_admin', 'super_admin'].includes(userRole)) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to administrators.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || isLoadingRequests) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading change requests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Change Requests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve profile change requests from artists
          </p>
        </div>

        {/* Messages */}
        {errors.message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            errors.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {errors.message}
          </div>
        )}

        {/* Change Requests */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">All profile change requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.user_profiles.artist_name || `${request.user_profiles.first_name} ${request.user_profiles.last_name}`}
                    </h3>
                    <p className="text-sm text-gray-600">{request.user_profiles.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(request.submitted_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>

                {/* Change Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Requested Change: {request.field_name}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Value</label>
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        {request.current_value || <em className="text-gray-500">Empty</em>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Requested Value</label>
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-sm font-medium">
                        {request.requested_value}
                      </div>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        {request.reason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRequestAction(request.id, 'approve', `Approved by ${user.email}`)}
                    disabled={processingRequest === request.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                  >
                    {processingRequest === request.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRequestAction(request.id, 'reject', `Rejected by ${user.email}: Does not meet requirements`)}
                    disabled={processingRequest === request.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      const notes = prompt('Enter admin notes (optional):');
                      if (notes !== null) {
                        handleRequestAction(request.id, 'approve', notes);
                      }
                    }}
                    disabled={processingRequest === request.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Approve with Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{requests.length}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Approved Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Rejected Today</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
