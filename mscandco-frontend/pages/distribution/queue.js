import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import Layout from '@/components/layouts/mainLayout';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { Eye, CheckCircle, XCircle, Send, Edit, X } from 'lucide-react';
import {
  RELEASE_STATUSES,
  getStatusLabel,
  getStatusColor
} from '@/lib/constants';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'distribution:read:partner');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function DistributionQueue() {
  const router = useRouter();
  const { user } = useUser();
    const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRelease, setEditingRelease] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Handle URL params for status filtering
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam && ['submitted', 'in_review', 'completed', 'live'].includes(statusParam)) {
      setStatusFilter(statusParam);
    }
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch releases with status: submitted, in_review, completed, or live
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .in('status', ['submitted', 'in_review', 'completed', 'live'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setReleases(data || []);
    } catch (error) {
      console.error('Error loading releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReleases = useMemo(() => {
    let filtered = releases;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [releases, statusFilter, searchTerm]);

  const handleStatusChange = async (releaseId, newStatus) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (error) throw error;

      // Refresh the list
      loadReleases();

      alert(`Release status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleEditMetadata = async (releaseId, updates) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('releases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (error) throw error;

      loadReleases();
      setIsEditModalOpen(false);
      setEditingRelease(null);
      alert('Release metadata updated successfully');
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata');
    }
  };

  const stats = useMemo(() => ({
    total: releases.length,
    submitted: releases.filter(r => r.status === 'submitted').length,
    inReview: releases.filter(r => r.status === 'in_review').length,
    completed: releases.filter(r => r.status === 'completed').length,
    live: releases.filter(r => r.status === 'live').length
  }), [releases]);

  // Check permissions
  useEffect(() => {
    if (!permissionsLoading && !hasPermission('distribution:read:partner') && !hasPermission('distribution:read:any')) {
      router.push('/dashboard');
    }
  }, [permissionsLoading, hasPermission, router]);

  if (loading || permissionsLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading distribution queue...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If no permission, don't render (will redirect)
  if (!hasPermission('distribution:read:partner') && !hasPermission('distribution:read:any')) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Distribution Queue</h1>
            <p className="mt-2 text-gray-600">Review and manage submitted releases</p>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.submitted}</div>
                <div className="text-sm text-blue-700">Submitted</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-800">{stats.inReview}</div>
                <div className="text-sm text-orange-700">In Review</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-800">{stats.completed}</div>
                <div className="text-sm text-indigo-700">Completed</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{stats.live}</div>
                <div className="text-sm text-green-700">Live</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>

        {/* Releases Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReleases.map((release) => (
                  <tr key={release.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {release.artwork_url && (
                          <img
                            src={release.artwork_url}
                            alt={release.title}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">{release.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {release.artist_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(release.status)}`}>
                        {getStatusLabel(release.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {release.release_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRelease(release);
                            setIsEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          title="Edit Metadata"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {release.status === 'submitted' && (
                          <button
                            onClick={() => handleStatusChange(release.id, 'in_review')}
                            className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                            title="Move to Review"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {release.status === 'in_review' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(release.id, 'completed')}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              title="Approve & Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(release.id, 'revision')}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              title="Request Revision"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {release.status === 'completed' && (
                          <button
                            onClick={() => handleStatusChange(release.id, 'live')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Mark as Live"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Metadata Modal */}
        {isEditModalOpen && editingRelease && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Edit Release Metadata</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRelease(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingRelease.title}
                      onChange={(e) => setEditingRelease({...editingRelease, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <input
                      type="text"
                      value={editingRelease.genre || ''}
                      onChange={(e) => setEditingRelease({...editingRelease, genre: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                    <input
                      type="date"
                      value={editingRelease.release_date}
                      onChange={(e) => setEditingRelease({...editingRelease, release_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You cannot edit artwork or audio files. If these need changes, push the release back to draft.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRelease(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditMetadata(editingRelease.id, {
                    title: editingRelease.title,
                    genre: editingRelease.genre,
                    release_date: editingRelease.release_date
                  })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
