// ARTIST AFFILIATION REQUESTS INBOX
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../../components/layouts/mainLayout';
import { Mail, CheckCircle, XCircle, Clock, Building, Percent } from 'lucide-react';

export default function ArtistRequests() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/artist/affiliation-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        console.error('Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, response, responseMessage = '') => {
    try {
      setResponding(requestId);

      const apiResponse = await fetch('/api/artist/affiliation-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          response,
          responseMessage
        })
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        alert(result.message);
        loadRequests(); // Refresh requests
      } else {
        const error = await apiResponse.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request');
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Mail className="w-8 h-8 mr-3" />
            Label Partnership Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Manage incoming partnership requests from record labels
          </p>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Partnership Requests</h3>
            <p className="text-gray-500">
              When record labels want to partner with you, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Label Info */}
                    <div className="flex items-center mb-4">
                      <Building className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.companyName}
                        </h3>
                        <p className="text-gray-600">{request.labelAdminName}</p>
                        <p className="text-sm text-gray-500">{request.labelAdminEmail}</p>
                      </div>
                    </div>

                    {/* Partnership Terms */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <Percent className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-blue-900">Partnership Terms</span>
                      </div>
                      <p className="text-blue-800">
                        <strong>{request.labelPercentage}%</strong> of your earnings will go to the label
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        You keep <strong>{100 - request.labelPercentage}%</strong> of all earnings
                      </p>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="mb-4">
                        <p className="text-gray-700 italic">"{request.message}"</p>
                      </div>
                    )}

                    {/* Status & Date */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        {request.status === 'pending' && <Clock className="w-4 h-4 mr-1 text-yellow-600" />}
                        {request.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1 text-green-600" />}
                        {request.status === 'denied' && <XCircle className="w-4 h-4 mr-1 text-red-600" />}
                        <span className={`capitalize ${
                          request.status === 'pending' ? 'text-yellow-600' :
                          request.status === 'approved' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <span>•</span>
                      <span>Received {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() => respondToRequest(request.id, 'denied')}
                        disabled={responding === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => respondToRequest(request.id, 'approved')}
                        disabled={responding === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Partnership</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Message */}
                {request.responseMessage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Your response:</strong> {request.responseMessage}
                    </p>
                    <p className="text-xs text-gray-500">
                      Responded on {new Date(request.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
