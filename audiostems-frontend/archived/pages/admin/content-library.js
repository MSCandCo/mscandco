import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layouts/mainLayout';
import Header from '@/components/header';
import { Trash2, Download, Image, Music, Search, Filter } from 'lucide-react';

export default function ContentLibrary() {
  const { user } = useUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, artwork, audio
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      // Get all releases with their assets
      const { data: releases, error } = await supabase
        .from('releases')
        .select('id, title, artist_name, artwork_url, audio_file_url, audio_file_name, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform into asset list
      const assetList = [];

      releases.forEach(release => {
        if (release.artwork_url) {
          assetList.push({
            id: `artwork-${release.id}`,
            releaseId: release.id,
            type: 'artwork',
            url: release.artwork_url,
            releaseTitle: release.title,
            artistName: release.artist_name,
            uploadedAt: release.created_at,
            fileName: release.artwork_url.split('/').pop()
          });
        }

        if (release.audio_file_url) {
          assetList.push({
            id: `audio-${release.id}`,
            releaseId: release.id,
            type: 'audio',
            url: release.audio_file_url,
            releaseTitle: release.title,
            artistName: release.artist_name,
            uploadedAt: release.created_at,
            fileName: release.audio_file_name || release.audio_file_url.split('/').pop()
          });
        }
      });

      setAssets(assetList);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = !searchTerm ||
      asset.releaseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.fileName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleDeleteAsset = async (asset) => {
    if (!confirm(`Delete this ${asset.type} file? This action cannot be undone.`)) {
      return;
    }

    try {
      // Extract bucket and path from URL
      const urlParts = asset.url.split('/');
      const bucket = asset.type === 'artwork' ? 'release-artwork' : 'release-audio';
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (storageError) throw storageError;

      // Update release to remove URL
      const updateField = asset.type === 'artwork' ? 'artwork_url' : 'audio_file_url';
      const { error: dbError } = await supabase
        .from('releases')
        .update({ [updateField]: null })
        .eq('id', asset.releaseId);

      if (dbError) throw dbError;

      // Remove from local state
      setAssets(prev => prev.filter(a => a.id !== asset.id));

      alert('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;

    if (!confirm(`Delete ${selectedAssets.length} selected assets? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const assetId of selectedAssets) {
        const asset = assets.find(a => a.id === assetId);
        if (asset) {
          await handleDeleteAsset(asset);
        }
      }
      setSelectedAssets([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  const stats = {
    total: assets.length,
    artwork: assets.filter(a => a.type === 'artwork').length,
    audio: assets.filter(a => a.type === 'audio').length
  };

  if (loading) {
    return (
      <Layout>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content library...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
            <p className="mt-2 text-gray-600">Manage uploaded artwork and audio files</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Assets</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.artwork}</div>
                <div className="text-sm text-blue-700">Artwork Files</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-800">{stats.audio}</div>
                <div className="text-sm text-purple-700">Audio Files</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by release, artist, or filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="artwork">Artwork Only</option>
                <option value="audio">Audio Only</option>
              </select>

              {selectedAssets.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedAssets.length})
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets(filteredAssets.map(a => a.id));
                        } else {
                          setSelectedAssets([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Release</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssets([...selectedAssets, asset.id]);
                          } else {
                            setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {asset.type === 'artwork' ? (
                        <img src={asset.url} alt="" className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                          <Music className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        asset.type === 'artwork' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{asset.releaseTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{asset.artistName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{asset.fileName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
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
