// LABEL ADMIN MESSAGES PAGE - Same as artist but for label admin notifications
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import { Mail, Bell, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function LabelAdminMessages() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, invitation_response, earning, payout
  const [loading, setLoading] = useState(true);

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invitation_response': return <Users className="w-6 h-6 text-blue-600" />;
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
          Label Admin Messages
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['all', 'invitation_response', 'earning', 'payout'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 capitalize ${
                filter === type 
                  ? 'border-b-2 border-purple-600 text-purple-600 font-medium' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              {type.replace('_', ' ')}
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
              {filter === 'all' ? 'You have no notifications' : `No ${filter.replace('_', ' ')} notifications`}
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
                        {notif.type.replace('_', ' ')} • {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{notif.message}</p>

                {/* Show decline reason if provided */}
                {notif.type === 'invitation_response' && notif.data?.decline_reason && (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <p className="font-medium text-red-900 mb-1">Decline Reason:</p>
                    <p className="text-red-800 italic">"{notif.data.decline_reason}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString()}
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
