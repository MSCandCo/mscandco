import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import { Mail, Bell, CheckCircle, XCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';

export default function Messages() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, invitation, earning, payout
  const [loading, setLoading] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [pendingDecline, setPendingDecline] = useState(null); // {notificationId, invitationId}

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/notifications?type=${filter}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ notification_id: notificationId })
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleInvitationResponse = async (notificationId, invitationId, action) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/artist/respond-invitation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ invitation_id: invitationId, action })
      });

      if (response.ok) {
        markAsRead(notificationId);
        alert(`Invitation ${action}ed successfully`);
        fetchNotifications(); // Refresh to show updated status
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Failed to respond to invitation');
    }
  };

  const handleDecline = (notificationId, invitationId) => {
    setPendingDecline({ notificationId, invitationId });
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!pendingDecline) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/artist/respond-invitation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          invitation_id: pendingDecline.invitationId, 
          action: 'decline',
          decline_reason: declineReason.trim() || null
        })
      });

      if (response.ok) {
        markAsRead(pendingDecline.notificationId);
        // Show branded success notification
        showSuccessNotification('Invitation declined successfully');
        fetchNotifications(); // Refresh to show updated status
        
        // Reset modal state
        setShowDeclineModal(false);
        setDeclineReason('');
        setPendingDecline(null);
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert('Failed to decline invitation');
    }
  };

  // Branded success notification function
  const showSuccessNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f0fdf4;
      border-left: 4px solid #065f46;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; color: #065f46;">
        <svg style="width: 20px; height: 20px; margin-right: 12px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invitation': return <Mail className="w-6 h-6 text-blue-600" />;
      case 'earning': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'payout': return <DollarSign className="w-6 h-6 text-purple-600" />;
      default: return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Mail className="w-8 h-8 mr-3" />
          Messages & Notifications
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['all', 'invitation', 'earning', 'payout'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 capitalize ${
                filter === type 
                  ? 'border-b-2 border-purple-600 text-purple-600 font-medium' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Messages</h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'You have no notifications' : `No ${filter} notifications`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  notif.read ? 'opacity-60' : 'border-l-4 border-l-purple-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(notif.type)}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{notif.title}</h3>
                      <span className="text-xs text-gray-500 capitalize">
                        {notif.type} • {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{notif.message}</p>

                {/* Invitation-specific UI */}
                {notif.type === 'invitation' && notif.action_required && notif.data && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="font-medium mb-3">Revenue Split Proposal:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">You receive:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {notif.data.artist_split_percentage}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Label receives:</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {notif.data.label_split_percentage}%
                        </p>
                      </div>
                    </div>
                    {notif.data.personal_message && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-700">Personal Message:</p>
                        <p className="text-gray-600 italic">"{notif.data.personal_message}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {notif.action_required && notif.type === 'invitation' && (
                      <>
                        <button
                          onClick={() => handleInvitationResponse(notif.id, notif.data.invitation_id, 'accept')}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept Partnership</span>
                        </button>
                        <button
                          onClick={() => handleDecline(notif.id, notif.data.invitation_id)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as read</span>
                    </button>
                  )}
                </div>
              </div>
            )          )}
        </div>
      )}

      {/* Branded Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Decline Partnership
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Why are you declining this partnership invitation? (Optional)
              </p>
              
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                placeholder="e.g., Already have a label, terms don't suit me, focusing on independent releases..."
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                    setPendingDecline(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDecline}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Decline Partnership
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
  );
}
