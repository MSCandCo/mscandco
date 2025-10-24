'use client'

import { useState, useEffect } from 'react'
import { Database, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Clock, HardDrive, Trash2 } from 'lucide-react'

export default function BackupsClient() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    totalSize: 0,
    lastBackup: null,
    nextScheduled: null
  })
  const [config, setConfig] = useState({
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    compression: true
  })

  useEffect(() => {
    fetchBackups()
    fetchStats()
    fetchConfig()
  }, [])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/systems/backups')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/systems/backups/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/systems/backups/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const createBackup = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/admin/systems/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      })
      if (response.ok) {
        await fetchBackups()
        await fetchStats()
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
    } finally {
      setCreating(false)
    }
  }

  const restoreBackup = async (backupId) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return
    }
    try {
      setRestoring(backupId)
      const response = await fetch(`/api/admin/systems/backups/${backupId}/restore`, {
        method: 'POST'
      })
      if (response.ok) {
        alert('Backup restored successfully')
      }
    } catch (error) {
      console.error('Failed to restore backup:', error)
      alert('Failed to restore backup')
    } finally {
      setRestoring(null)
    }
  }

  const downloadBackup = async (backupId) => {
    try {
      const response = await fetch(`/api/admin/systems/backups/${backupId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${backupId}.sql`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download backup:', error)
    }
  }

  const deleteBackup = async (backupId) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return
    }
    try {
      const response = await fetch(`/api/admin/systems/backups/${backupId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchBackups()
        await fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete backup:', error)
    }
  }

  const updateConfig = async () => {
    try {
      const response = await fetch('/api/admin/systems/backups/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (response.ok) {
        alert('Configuration updated successfully')
      }
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Progress</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backup & Recovery</h1>
            <p className="text-gray-600 mt-1">Manage database backups and recovery operations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBackups}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={createBackup}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {creating ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-sm font-medium text-gray-900">
                  {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Scheduled</p>
                <p className="text-sm font-medium text-gray-900">
                  {stats.nextScheduled ? new Date(stats.nextScheduled).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backups List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No backups found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <div key={backup.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="w-5 h-5 text-gray-400" />
                          <h3 className="font-medium text-gray-900">{backup.name}</h3>
                          {getStatusBadge(backup.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 ml-8">
                          <div>
                            <span className="font-medium">Type:</span> {backup.type}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatBytes(backup.size)}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {new Date(backup.created_at).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {backup.duration}s
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => downloadBackup(backup.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring === backup.id}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Backup Configuration</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoBackup}
                    onChange={(e) => setConfig({ ...config, autoBackup: e.target.checked })}
                    className="rounded border-gray-300 text-[#2D2D2D] focus:ring-[#2D2D2D]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Auto Backup</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
                <input
                  type="number"
                  value={config.retention}
                  onChange={(e) => setConfig({ ...config, retention: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.compression}
                    onChange={(e) => setConfig({ ...config, compression: e.target.checked })}
                    className="rounded border-gray-300 text-[#2D2D2D] focus:ring-[#2D2D2D]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Compression</span>
                </label>
              </div>
              <button
                onClick={updateConfig}
                className="w-full px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Backup Best Practices</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Keep at least 3 recent backups</li>
                  <li>Test restore procedures regularly</li>
                  <li>Store backups in multiple locations</li>
                  <li>Monitor backup success rates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

