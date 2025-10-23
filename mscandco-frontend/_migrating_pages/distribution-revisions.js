import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import Layout from '@/components/layouts/mainLayout';
import { FaSearch } from 'react-icons/fa';
import { Eye, Send } from 'lucide-react';
import { getStatusColor } from '@/lib/constants';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'distribution:read:partner');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function RevisionQueue() {
  const router = useRouter();
  const { user } = useUser();
    const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('status', 'revision')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setReleases(data || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReleases = useMemo(() => {
    if (!searchTerm) return releases;

    return releases.filter(r =>
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [releases, searchTerm]);

  const handleSendToReview = async (releaseId) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (error) throw error;

      loadReleases();
      alert('Release sent back to review queue');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading revisions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Revision Queue</h1>
            <p className="mt-2 text-gray-600">Review releases pending revision</p>

            <div className="mt-6 bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-800">{releases.length}</div>
              <div className="text-sm text-purple-700">Releases in Revision</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Release</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('revision')}`}>
                        Revision
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(release.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendToReview(release.id)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Send to Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
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
