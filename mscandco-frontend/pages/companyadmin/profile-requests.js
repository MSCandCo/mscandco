import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  Building,
  Lock,
  User,
  Mail,
  Edit3
} from 'lucide-react';

export default function CompanyAdminProfileRequests() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Load profile change requests
  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/admin/profile-change-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredRequests = statusFilter === 'all' 
          ? data.requests 
          : data.requests.filter(req => req.status === statusFilter);
        setRequests(filteredRequests);
      } else {
        console.error('Failed to load profile change requests');
      }
    } catch (error) {
      console.error('Error loading profile change requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRequest = async (action) => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/profile-change-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: action,
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedRequest(null);
        setAdminNotes('');
        loadRequests(); // Reload the requests
      } else {
        console.error(`Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatFieldName = (fieldName) => {
    return fieldName.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile change requests...</p>
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Change Requests</h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and manage profile change requests from artists
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
              { key: 'all', label: 'All', count: requests.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Change Requests</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No profile change requests have been submitted yet.'
                : `No ${statusFilter} profile change requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current → Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {(request.user_profiles.artist_name || request.user_profiles.first_name || request.user_profiles.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user_profiles.artist_name || `${request.user_profiles.first_name} ${request.user_profiles.last_name}`.trim() || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {request.user_profiles.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatFieldName(request.field_name)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-500 line-through">
                            {request.current_value || 'Not set'}
                          </div>
                          <div className="text-gray-900 font-medium">
                            {request.requested_value}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Review Profile Change Request</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Artist Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Artist Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedRequest.user_profiles.artist_name || `${selectedRequest.user_profiles.first_name} ${selectedRequest.user_profiles.last_name}`.trim()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.user_profiles.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Change Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Requested Change</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Field</label>
                        <div className="mt-1 text-sm text-gray-900">{formatFieldName(selectedRequest.field_name)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Value</label>
                        <div className="mt-1 text-sm text-gray-500 line-through">
                          {selectedRequest.current_value || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Requested Value</label>
                        <div className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedRequest.requested_value}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reason</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {selectedRequest.reason}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedRequest.status === 'pending' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add notes about your decision..."
                      />
                    </div>
                  )}

                  {/* Existing Admin Notes */}
                  {selectedRequest.admin_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Admin Notes</h4>
                      <p className="text-sm text-blue-800">{selectedRequest.admin_notes}</p>
                      {selectedRequest.reviewed_at && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed on {new Date(selectedRequest.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleProcessRequest('reject')}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleProcessRequest('approve')}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
