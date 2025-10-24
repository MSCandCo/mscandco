'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Mail, Bell, CheckCircle, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function LabelAdminMessagesClient() {
  const { user, supabase } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, invitation_response, earning, payout
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?type=${filter}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.statusText);
        setNotifications([]);
        return;
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center text-gray-900">
          <Mail className="w-8 h-8 mr-3" />
          Label Admin Messages
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 bg-white rounded-t-lg px-4">
          {['all', 'invitation_response', 'earning', 'payout'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-3 capitalize transition-colors ${
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
          <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
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
                className={`bg-white rounded-lg shadow-sm border transition-all ${
                  notif.read ? 'opacity-60 border-gray-200' : 'border-l-4 border-l-purple-500 border-gray-200'
                }`}
              >
                <div className="p-6">
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
                    <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                      <p className="font-medium text-red-900 mb-1">Decline Reason:</p>
                      <p className="text-red-800 italic">"{notif.data.decline_reason}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString()}
                    </div>

                    <div className="flex items-center space-x-2">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

