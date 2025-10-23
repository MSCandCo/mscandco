'use client'

// Artist Request Manager - Handle Label Admin Invitations
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { 
  Mail, CheckCircle, XCircle, Clock, User, Building2,
  AlertTriangle, Calendar
} from 'lucide-react';

export default function ArtistRequestManager() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

  // Load artist requests
  useEffect(() => {
    if (user) {
      loadArtistRequests();
    }
  }, [user]);

  const loadArtistRequests = async () => {
    try {
      setLoading(true);
      console.log('📬 Loading artist requests...');

      const { data, error } = await supabase
        .from('artist_requests')
        .select('*')
        .eq('to_artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading requests:', error);
      } else {
        console.log('✅ Artist requests loaded:', data?.length || 0);
        setRequests(data || []);
      }
    } catch (error) {
      console.error('❌ Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, response) => {
    try {
      setResponding(requestId);
      console.log('📝 Responding to request:', requestId, response);

      const { error } = await supabase
        .from('artist_requests')
        .update({
          status: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('to_artist_id', user.id); // Security check

      if (error) {
        console.error('❌ Error responding to request:', error);
        showNotification('error', 'Response Failed', 'Failed to respond to invitation');
      } else {
        showNotification('success', 'Response Sent', 
          response === 'accepted' 
            ? 'You have joined the label!' 
            : 'Invitation declined'
        );
        
        // If accepted, update user's label_admin_id
        if (response === 'accepted') {
          const request = requests.find(r => r.id === requestId);
          if (request) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ label_admin_id: request.from_label_id })
              .eq('id', user.id);

            if (updateError) {
              console.error('❌ Error updating label admin relationship:', updateError);
            }
          }
        }
        
        loadArtistRequests(); // Refresh
      }
    } catch (error) {
      console.error('❌ Error responding to request:', error);
      showNotification('error', 'Connection Error', 'Failed to send response');
    } finally {
      setResponding(null);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: '', title: '', message: '' }), 5000);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return null; // Don't show if no pending requests
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Mail className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Label Invitations</h3>
            <p className="text-sm text-slate-600">{pendingRequests.length} pending invitation(s)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div key={request.id} className="border border-slate-200 rounded-xl p-6 bg-slate-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    Invitation from {request.label_admin_name}
                  </h4>
                  <p className="text-slate-600">{request.label_admin_email}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Sent {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  {request.message && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{request.message}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => respondToRequest(request.id, 'declined')}
                  disabled={responding === request.id}
                  className="flex items-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </button>
                <button
                  onClick={() => respondToRequest(request.id, 'accepted')}
                  disabled={responding === request.id}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {responding === request.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Accept
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branded Notification */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className={`flex items-center mb-4 ${
              notification.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}>
              {notification.type === 'error' ? (
                <AlertTriangle className="w-6 h-6 mr-3" />
              ) : (
                <CheckCircle className="w-6 h-6 mr-3" />
              )}
              <h3 className="text-lg font-semibold">{notification.title}</h3>
            </div>
            <p className="text-slate-600 mb-6">{notification.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
