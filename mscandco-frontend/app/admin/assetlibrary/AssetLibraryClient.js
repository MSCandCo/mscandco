'use client'

import { useState, useEffect } from 'react'
import {
  HardDrive,
  Music,
  Image as ImageIcon,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function AssetLibraryClient({ user }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [playingAudio, setPlayingAudio] = useState(null)
  const [audioElement, setAudioElement] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, per_page: 50, total: 0 })
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFiles()
      fetchStats()
    }
  }, [user, activeTab, pagination.page, sortConfig])

  useEffect(() => {
    const audio = new Audio()
    setAudioElement(audio)

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const fetchFiles = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        console.error('No auth token available')
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (sortConfig.key) {
        params.append('sort_by', sortConfig.key)
        params.append('sort_order', sortConfig.direction)
      }

      const response = await fetch(`/api/admin/assetlibrary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }

      const data = await response.json()
      setFiles(data.files || [])
      setPagination(prev => ({ ...prev, ...data.pagination }))

      setLoading(false)
    } catch (error) {
      console.error('Error fetching files:', error)
      showNotification('Failed to load files', 'error')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) return

      const response = await fetch('/api/admin/assetlibrary/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const playAudio = (filePath) => {
    if (audioElement) {
      if (playingAudio === filePath) {
        audioElement.pause()
        setPlayingAudio(null)
      } else {
        audioElement.src = filePath
        audioElement.play()
        setPlayingAudio(filePath)
        audioElement.onended = () => setPlayingAudio(null)
      }
    }
  }

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(files.map(f => f.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId)
      } else {
        return [...prev, fileId]
      }
    })
  }

  const handleBulkDownload = () => {
    if (selectedFiles.length === 0) return

    const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id))
    selectedFileObjects.forEach(file => {
      window.open(file.storage_url, '_blank')
    })

    showNotification(`Opening ${selectedFiles.length} file(s) for download`, 'success')
  }

  const handleDeleteClick = (file) => {
    setFileToDelete(file)
    setShowDeleteModal(true)
  }

  const handleBulkDeleteClick = () => {
    if (selectedFiles.length === 0) return
    setFileToDelete('bulk')
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return

    try {
      setIsDeleting(true)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showNotification('Authentication required', 'error')
        return
      }

      let deletePayload

      if (fileToDelete === 'bulk') {
        // Bulk delete
        const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id))
        deletePayload = {
          bucket_id: selectedFileObjects[0]?.bucket_id,
          file_ids: selectedFileObjects.map(f => ({
            bucket_id: f.bucket_id,
            full_path: f.full_path
          }))
        }
      } else {
        // Single delete
        deletePayload = {
          bucket_id: fileToDelete.bucket_id,
          full_path: fileToDelete.full_path
        }
      }

      const response = await fetch('/api/admin/assetlibrary/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(deletePayload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file(s)')
      }

      showNotification(data.message || 'File(s) deleted successfully', 'success')
      setSelectedFiles([])
      setShowDeleteModal(false)
      setFileToDelete(null)
      fetchFiles()
      fetchStats()

    } catch (error) {
      console.error('Error deleting file(s):', error)
      showNotification(error.message || 'Failed to delete file(s)', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setFileToDelete(null)
  }

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2'
    const borderColor = type === 'success' ? '#065f46' : '#991b1b'
    const textColor = type === 'success' ? '#065f46' : '#991b1b'

    const notificationDiv = document.createElement('div')
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
    `
    document.body.appendChild(notificationDiv)
    setTimeout(() => document.body.removeChild(notificationDiv), 3000)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const datePart = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    const timePart = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${datePart}, ${timePart}`
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="text-gray-400" />
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="text-gray-700" />
      : <ArrowDown size={14} className="text-gray-700" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading Asset Library...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'all', label: 'All Files', icon: HardDrive, count: stats?.stats?.active_files },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Library</h1>
          <p className="text-gray-600">Manage all media files from Supabase storage</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Storage</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.stats.total_storage_gb} GB
              </p>
              <p className="text-xs text-gray-500 mt-2">{stats.stats.active_files} active files</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Recent Uploads</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.stats.recent_uploads}
              </p>
              <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Avg File Size</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.stats.average_file_size_mb} MB
              </p>
              <p className="text-xs text-gray-500 mt-2">Per file</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Files</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.stats.total_files}
              </p>
              <p className="text-xs text-gray-500 mt-2">All buckets</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchFiles()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex items-center space-x-2 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleBulkDeleteClick}
                  className="flex items-center space-x-2 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setRefreshing(true)
                fetchFiles()
                fetchStats()
                setTimeout(() => setRefreshing(false), 500)
              }}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
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
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No files found</p>
                      <p className="text-sm mt-2">Try adjusting your search term</p>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
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
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
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
                        {file.owner_email || 'System'}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
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
                            onClick={() => handleDeleteClick(file)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {fileToDelete === 'bulk' ? 'Delete Multiple Files' : 'Delete File'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {fileToDelete === 'bulk'
                ? `Are you sure you want to delete ${selectedFiles.length} file(s)? This action cannot be undone.`
                : `Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`
              }
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







