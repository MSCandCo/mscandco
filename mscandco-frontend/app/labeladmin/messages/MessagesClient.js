'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Mail, Bell, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function LabelAdminMessagesClient() {
  const { user, session } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, invitation_response, earning, payout
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [filter, session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?type=${filter}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.error) {
      } else {
      }

      setNotifications(data.notifications || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      });

      fetchNotifications();
    } catch (error) {
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      });

      fetchNotifications(); // Refresh list
      showSuccessNotification('Notification deleted');
    } catch (error) {
      showErrorNotification('Failed to delete notification');
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

  // Branded error notification function
  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fef2f2;
      border-left: 4px solid #991b1b;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; color: #991b1b;">
        <svg style="width: 20px; height: 20px; margin-right: 12px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L9 11.586l-2.293-2.293a1 1 0 00-1.414 1.414L7.586 13l-2.293 2.293a1 1 0 001.414 1.414L9 14.414l2.293 2.293a1 1 0 001.414-1.414L11.414 13l2.293-2.293z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 4000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invitation_response': return <Mail className="w-6 h-6 text-blue-600" />;
      case 'earning': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'payout': return <DollarSign className="w-6 h-6 text-purple-600" />;
      default: return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Mail className="w-8 h-8 mr-3" />
        Messages
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
          <PageLoading message="Loading..." />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Messages</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'You have no messages' : `No ${filter.replace('_', ' ')} messages`}
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
                <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                  <p className="font-medium text-red-900 mb-1">Decline Reason:</p>
                  <p className="text-red-800 italic">"{notif.data.decline_reason}"</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  {/* Add any action buttons here if needed for label admin */}
                </div>

                <div className="flex items-center space-x-2">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as read</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
