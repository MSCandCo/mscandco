import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaUser, FaClock } from 'react-icons/fa';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function ChangeRequestReview({ userRole }) {
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  // Load change requests
  useEffect(() => {
    loadChangeRequests();
  }, []);

  const loadChangeRequests = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, show empty state
      setChangeRequests([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading change requests:', error);
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // TODO: API call to approve request
      console.log('Approving request:', requestId);
      
      // Update local state
      setChangeRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved', reviewedBy: userRole, reviewedAt: new Date().toISOString() }
            : req
        )
      );
      
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      // TODO: API call to reject request
      console.log('Rejecting request:', requestId, 'Reason:', reason);
      
      // Update local state
      setChangeRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected', 
                reviewedBy: userRole, 
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason
              }
            : req
        )
      );
      
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = changeRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading change requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Change Requests</h2>
          <p className="text-gray-600">Review and approve changes to locked profile information</p>
        </div>
        
        {/* Filter */}
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
          <p className="text-gray-500">
            {filter === 'pending' 
              ? 'No pending change requests at this time.' 
              : `No ${filter} change requests found.`
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
                    Requested Changes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {request.artistName?.charAt(0) || 'A'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.artistName || 'Artist'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.artistEmail || 'artist@example.com'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {Object.entries(request.requestedData || {})
                          .filter(([key, value]) => value !== request.currentData?.[key])
                          .map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="ml-1">{value}</span>
                            </div>
                          ))
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) handleReject(request.id, reason);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Change Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Request Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <span className="ml-2">{new Date(selectedRequest.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Changes Comparison */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Requested Changes</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedRequest.requestedData || {}).map(([key, newValue]) => {
                      const currentValue = selectedRequest.currentData?.[key];
                      if (newValue === currentValue) return null;
                      
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900 capitalize mb-2">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <div className="font-medium text-gray-900">{currentValue || 'Not set'}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Requested:</span>
                              <div className="font-medium text-blue-600">{newValue}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Reason for Changes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedRequest.reason}</p>
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) handleReject(selectedRequest.id, reason);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
