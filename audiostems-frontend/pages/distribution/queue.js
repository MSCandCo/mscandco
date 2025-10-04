import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layouts/mainLayout';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { Eye, CheckCircle, XCircle, Send } from 'lucide-react';
import {
  RELEASE_STATUSES,
  getStatusLabel,
  getStatusColor
} from '@/lib/constants';

export default function DistributionQueue() {
  const { user } = useUser();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch releases with status: submitted, in_review, or completed
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .in('status', ['submitted', 'in_review', 'completed'])
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

  const stats = useMemo(() => ({
    total: releases.length,
    submitted: releases.filter(r => r.status === 'submitted').length,
    inReview: releases.filter(r => r.status === 'in_review').length,
    completed: releases.filter(r => r.status === 'completed').length
  }), [releases]);

  if (loading) {
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Distribution Queue</h1>
            <p className="mt-2 text-gray-600">Review and manage submitted releases</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
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
      </div>
    </Layout>
  );
}
