import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Search,
  UserCircle,
  LogIn,
  Shield,
  AlertCircle,
  Check,
  X,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import { requirePermission } from '@/lib/serverSidePermissions';

// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'admin:ghost_login:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function GhostLogin() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [activeGhostSessions, setActiveGhostSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchActiveSessions();
    }
  }, [user]);

  const fetchUsers = async (search) => {
    if (!search || search.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/usermanagement?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out super admins
        const filteredUsers = (data.users || []).filter(u => u.role !== 'super_admin');
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/superadmin/ghost-login', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveGhostSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleGhostLogin = async (targetUserId) => {
    if (!confirm('Start ghost login session? This action will be logged for security audit.')) {
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/superadmin/ghost-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Ghost session created! Opening in new tab...', 'success');
        // Open magic link in new tab
        window.open(data.ghost_session.magic_link, '_blank');
        // Reset form
        setSelectedUser(null);
        setNotes('');
        setSearchTerm('');
        setUsers([]);
        fetchActiveSessions();
      } else {
        showNotification(data.error || 'Failed to create ghost session', 'error');
      }
    } catch (error) {
      console.error('Error creating ghost session:', error);
      showNotification('Error creating ghost session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/superadmin/ghost-login', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (response.ok) {
        showNotification('Ghost session ended', 'success');
        fetchActiveSessions();
      } else {
        showNotification('Failed to end session', 'error');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showNotification('Error ending session', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2';
    const borderColor = type === 'success' ? '#065f46' : '#991b1b';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';

    const notificationDiv = document.createElement('div');
    notificationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${borderColor};
        padding: 16px 24px;
        color: ${textColor};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
      ">
        ${message}
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => document.body.removeChild(notificationDiv), 3000);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ghost Login - Super Admin</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={32} className="text-red-600" />
              <h1 className="text-4xl font-bold" style={{ color: '#1f2937' }}>Ghost Login</h1>
            </div>
            <p className="text-gray-600">Super Admin feature: Log in as any user for support and debugging</p>
            <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-600 rounded">
              <p className="text-sm text-red-800">
                <AlertCircle size={16} className="inline mr-2" />
                All ghost login sessions are logged for security audit. Use responsibly.
              </p>
            </div>
          </div>

          {/* Active Sessions */}
          {activeGhostSessions.length > 0 && (
            <div className="mb-8 rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>
                Active Ghost Sessions
              </h2>
              <div className="space-y-3">
                {activeGhostSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.target?.artist_name || `${session.target?.first_name} ${session.target?.last_name}`.trim()}
                        </p>
                        <p className="text-sm text-gray-600">{session.target?.email}</p>
                        <p className="text-xs text-gray-500">
                          Started: {new Date(session.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      End Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div className="rounded-2xl shadow-lg p-6 mb-8" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>
              Search Users
            </h2>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle size={24} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.artist_name || `${user.first_name} ${user.last_name}`.trim()}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Role: {user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && searchTerm && users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No users found matching "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Confirm Ghost Login */}
          {selectedUser && (
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
              border: '1px solid rgba(31, 41, 55, 0.08)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>
                Confirm Ghost Login
              </h2>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">Selected User:</p>
                <p className="text-gray-700">
                  {selectedUser.artist_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
                </p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-xs text-gray-500">Role: {selectedUser.role}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional - for audit log)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for ghost login (e.g., 'Troubleshooting upload issue')"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  rows={3}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleGhostLogin(selectedUser.id)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shield size={20} />
                  Start Ghost Login
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setNotes('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
