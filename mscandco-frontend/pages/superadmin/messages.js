import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import Layout from '../../components/layouts/mainLayout';
import { Mail, Bell, CheckCircle, TrendingUp, DollarSign, FileText, AlertCircle, Shield, Users } from 'lucide-react';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'messages:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function SuperAdminMessages() {
  const router = useRouter();
  const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, system, release, earning, payout, invitation
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

      const response = await fetch(`/api/notifications/superadmin?type=${filter}`, {
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

  const deleteNotification = async (notificationId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ notification_id: notificationId })
      });

      fetchNotifications(); // Refresh list
      showSuccessNotification('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
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
      case 'system': return <Bell className="w-6 h-6 text-blue-600" />;
      case 'release': return <FileText className="w-6 h-6 text-purple-600" />;
      case 'earning': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'payout': return <DollarSign className="w-6 h-6 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'invitation': return <Users className="w-6 h-6 text-indigo-600" />;
      default: return <Mail className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Super Admin - All Platform Notifications
            </h1>
            <p className="mt-2 text-red-100">Monitor all platform activity and notifications (CC'd on everything)</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="flex gap-2 p-4 border-b overflow-x-auto">
              {['all', 'system', 'release', 'earning', 'payout', 'invitation'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 capitalize whitespace-nowrap rounded-lg transition-colors ${
                    filter === type
                      ? 'bg-red-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Messages</h3>
                <p className="text-gray-500">
                  {filter === 'all' ? 'No notifications on the platform' : `No ${filter} notifications`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      notif.read ? 'opacity-60' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-900">{notif.title}</h3>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="capitalize">{notif.type}</span>
                            <span>•</span>
                            <span>{new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {notif.user_email && (
                              <>
                                <span>•</span>
                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">
                                  User: {notif.user_email}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 ml-9">{notif.message}</p>

                    {/* Action URL if provided */}
                    {notif.action_url && (
                      <div className="ml-9 mb-4">
                        <a
                          href={notif.action_url}
                          className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          View Details →
                        </a>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-3 ml-9">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
