import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  HardDrive,
  Music,
  Image as ImageIcon,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Check,
  X,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import { useUser } from '@/components/providers/SupabaseProvider';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'content:asset_library:read');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function AssetLibrary() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
    const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, per_page: 50, total: 0 });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Check permission
  
  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchStats();
    }
  }, [user, activeTab, pagination.page, sortConfig]);

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('No auth token available');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        status: activeTab === 'recyclebin' ? 'deleted' : activeTab === 'all' ? 'active' : 'active',
        page: pagination.page,
        per_page: pagination.per_page
      });

      if (activeTab !== 'all' && activeTab !== 'recyclebin') {
        params.append('file_type', activeTab);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (sortConfig.key) {
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction);
      }

      const response = await fetch(`/api/admin/assetlibrary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      showNotification('Failed to load files', 'error');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch('/api/admin/assetlibrary/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Move this file to recycle bin? It will be permanently deleted after 90 days.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/assetlibrary/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('File moved to recycle bin', 'success');
        fetchFiles();
        fetchStats();
      } else {
        showNotification('Failed to delete file', 'error');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification('Error deleting file', 'error');
    }
  };

  const handleRestore = async (fileId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/assetlibrary/${fileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'restore' })
      });

      if (response.ok) {
        showNotification('File restored successfully', 'success');
        fetchFiles();
        fetchStats();
      } else {
        showNotification('Failed to restore file', 'error');
      }
    } catch (error) {
      console.error('Error restoring file:', error);
      showNotification('Error restoring file', 'error');
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (!confirm('PERMANENTLY delete this file? This action CANNOT be undone!')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/assetlibrary/${fileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'permanent_delete' })
      });

      if (response.ok) {
        showNotification('File permanently deleted', 'success');
        fetchFiles();
        fetchStats();
      } else {
        showNotification('Failed to permanently delete file', 'error');
      }
    } catch (error) {
      console.error('Error permanently deleting file:', error);
      showNotification('Error permanently deleting file', 'error');
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm('Run cleanup to permanently delete all files that have been in recycle bin for >90 days?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/assetlibrary/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(data.message, 'success');
        fetchFiles();
        fetchStats();
      } else {
        showNotification('Failed to run cleanup', 'error');
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      showNotification('Error running cleanup', 'error');
    }
  };

  const playAudio = (filePath) => {
    if (audioElement) {
      if (playingAudio === filePath) {
        audioElement.pause();
        setPlayingAudio(null);
      } else {
        audioElement.src = filePath;
        audioElement.play();
        setPlayingAudio(filePath);
        audioElement.onended = () => setPlayingAudio(null);
      }
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        // Toggle direction if same column
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // Default to ascending for new column
      return { key, direction: 'asc' };
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(files.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (!confirm(`Move ${selectedFiles.length} file(s) to recycle bin?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let successCount = 0;
      for (const fileId of selectedFiles) {
        const response = await fetch(`/api/admin/assetlibrary/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) successCount++;
      }

      showNotification(`${successCount} file(s) moved to recycle bin`, 'success');
      setSelectedFiles([]);
      fetchFiles();
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting files:', error);
      showNotification('Error deleting files', 'error');
    }
  };

  const handleBulkDownload = () => {
    if (selectedFiles.length === 0) return;

    const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id));
    selectedFileObjects.forEach(file => {
      window.open(file.storage_url, '_blank');
    });

    showNotification(`Opening ${selectedFiles.length} file(s) for download`, 'success');
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="text-gray-700" />
      : <ArrowDown size={14} className="text-gray-700" />;
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading Asset Library...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All Files', icon: HardDrive, count: stats?.stats?.active_files },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'recyclebin', label: 'Recycle Bin', icon: Trash2, count: stats?.stats?.deleted_files }
  ];

  return (
    <>
      <Head>
        <title>Asset Library - Admin Portal</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1f2937' }}>Asset Library</h1>
            <p className="text-gray-600">Manage all media files with 90-day recycle bin protection</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-2xl shadow-lg p-6" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Storage</h3>
                <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                  {stats.stats.total_storage_gb} GB
                </p>
                <p className="text-xs text-gray-500 mt-2">{stats.stats.active_files} active files</p>
              </div>

              <div className="rounded-2xl shadow-lg p-6" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Recent Uploads</h3>
                <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                  {stats.stats.recent_uploads}
                </p>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>

              <div className="rounded-2xl shadow-lg p-6" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Avg File Size</h3>
                <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                  {stats.stats.average_file_size_mb} MB
                </p>
                <p className="text-xs text-gray-500 mt-2">Per file</p>
              </div>

              <div className="rounded-2xl shadow-lg p-6" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Recycle Bin</h3>
                <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                  {stats.stats.deleted_files}
                </p>
                <p className="text-xs text-gray-500 mt-2">Awaiting cleanup</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' : '#ffffff',
                    color: activeTab === tab.id ? '#ffffff' : '#4b5563',
                    border: '1px solid',
                    borderColor: activeTab === tab.id ? '#1f2937' : '#d1d5db'
                  }}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: activeTab === tab.id ? '#ffffff20' : '#f3f4f6',
                            color: activeTab === tab.id ? '#ffffff' : '#6b7280'
                          }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search and Actions */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchFiles()}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div className="flex items-center space-x-3">
              {selectedFiles.length > 0 && (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFiles.length} selected
                  </span>
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center space-x-2 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2 bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </>
              )}

              {activeTab === 'recyclebin' && (
                <button
                  onClick={handleRunCleanup}
                  className="flex items-center space-x-2 bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-all"
                >
                  <Trash2 size={18} />
                  <span>Run Cleanup</span>
                </button>
              )}

              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchFiles();
                  fetchStats();
                  setTimeout(() => setRefreshing(false), 500);
                }}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Files Table */}
          <div className="rounded-2xl shadow-lg overflow-hidden" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={files.length > 0 && selectedFiles.length === files.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <span>File</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('file_type')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Type</span>
                        {getSortIcon('file_type')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('file_size')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Size</span>
                        {getSortIcon('file_size')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Date</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    {activeTab === 'recyclebin' && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Days Left
                      </th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No files found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or search term</p>
                      </td>
                    </tr>
                  ) : (
                    files.map((file, index) => (
                      <tr
                        key={file.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleSelectFile(file.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {file.file_type === 'image' && (
                              <img
                                src={file.storage_url}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            )}
                            {file.file_type === 'image' && (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                                <ImageIcon size={20} className="text-gray-400" />
                              </div>
                            )}
                            {file.file_type === 'audio' && (
                              <button
                                onClick={() => playAudio(file.storage_url)}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {playingAudio === file.storage_url ? (
                                  <Pause size={16} className="text-gray-700" />
                                ) : (
                                  <Play size={16} className="text-gray-700" />
                                )}
                              </button>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              {file.bucket_id && (
                                <p className="text-xs text-gray-500">{file.bucket_id}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: file.file_type === 'audio' ? '#eff6ff' :
                                                 file.file_type === 'image' ? '#f0fdf4' :
                                                 '#fef3c7',
                                  color: file.file_type === 'audio' ? '#1e40af' :
                                       file.file_type === 'image' ? '#065f46' :
                                       '#92400e'
                                }}>
                            {file.file_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatFileSize(file.file_size)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {file.owner_email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          {formatDate(file.created_at)}
                        </td>
                        {activeTab === 'recyclebin' && (
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              file.days_until_permanent_delete <= 7 ? 'bg-red-100 text-red-800' :
                              file.days_until_permanent_delete <= 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {file.days_until_permanent_delete} days
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {activeTab === 'recyclebin' ? (
                              <>
                                <button
                                  onClick={() => handleRestore(file.id)}
                                  className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                                  title="Restore"
                                >
                                  <RotateCcw size={18} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() => handlePermanentDelete(file.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Permanent Delete"
                                >
                                  <X size={18} className="text-red-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <a
                                  href={file.storage_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Download"
                                >
                                  <Download size={18} className="text-gray-700" />
                                </a>
                                <button
                                  onClick={() => handleDelete(file.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Move to Recycle Bin"
                                >
                                  <Trash2 size={18} className="text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} files
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
