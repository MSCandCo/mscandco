'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MasterRosterClient({ user }) {
  const supabase = createClient()
  const [contributors, setContributors] = useState([])
  const [filteredContributors, setFilteredContributors] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'joined_date', direction: 'desc' })

  useEffect(() => {
    if (user) {
      fetchMasterRoster()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [contributors, searchTerm, roleFilter, sourceFilter, sortConfig])

  const fetchMasterRoster = async () => {
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

      const response = await fetch('/api/admin/master-roster', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch master roster')
      }

      const data = await response.json()
      setContributors(data.contributors || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error('Error fetching master roster:', error)
      showNotification('Failed to load master roster. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...contributors]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(contributor =>
        contributor.full_name.toLowerCase().includes(search) ||
        contributor.email.toLowerCase().includes(search) ||
        contributor.company_name.toLowerCase().includes(search) ||
        contributor.source.toLowerCase().includes(search)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(c => c.role === roleFilter)
    }

    if (sourceFilter === 'invited') {
      filtered = filtered.filter(c => c.source_user_id !== null)
    } else if (sourceFilter === 'direct') {
      filtered = filtered.filter(c => c.source_user_id === null)
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'joined_date' || sortConfig.key === 'last_updated') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    setFilteredContributors(filtered)
  }

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Company', 'Source', 'Joined Date']
    const rows = filteredContributors.map(c => [
      c.full_name,
      c.email,
      c.role,
      c.company_name,
      c.source,
      new Date(c.joined_date).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `master-roster-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2'
    const borderColor = type === 'success' ? '#065f46' : '#991b1b'
    const textColor = type === 'success' ? '#065f46' : '#991b1b'

    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
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
    document.body.appendChild(errorDiv)
    setTimeout(() => document.body.removeChild(errorDiv), 5000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'company_admin': 'bg-blue-100 text-blue-800 border-blue-200',
      'label_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'artist': 'bg-green-100 text-green-800 border-green-200',
      'code_group': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'analytics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'request_management': 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatRoleName = (role) => {
    if (!role) return 'Unknown'
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 opacity-20" />
    }
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading master roster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Roster</h1>
            <p className="text-gray-600">View and manage all platform contributors</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Total Contributors</p>
              <p className="text-3xl font-bold text-gray-900">{summary.total_contributors}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Invited Users</p>
              <p className="text-3xl font-bold text-blue-600">{summary.invited_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Direct Signups</p>
              <p className="text-3xl font-bold text-green-600">{summary.direct_signups}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
              <p className="text-2xl font-bold text-purple-600">{filteredContributors.length}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search name, email, company, source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {summary && Object.keys(summary.by_role).map(role => (
                  <option key={role} value={role}>
                    {formatRoleName(role)} ({summary.by_role[role]})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="invited">Invited Users</option>
                <option value="direct">Direct Signups</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Name</span>
                      <SortIcon columnKey="full_name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Email</span>
                      <SortIcon columnKey="email" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Role</span>
                      <SortIcon columnKey="role" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('company_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Company</span>
                      <SortIcon columnKey="company_name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('source')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Source</span>
                      <SortIcon columnKey="source" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('joined_date')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Joined Date</span>
                      <SortIcon columnKey="joined_date" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContributors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No contributors found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredContributors.map((contributor, index) => (
                    <tr
                      key={contributor.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contributor.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{contributor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(contributor.role)}`}>
                          {formatRoleName(contributor.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{contributor.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contributor.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(contributor.joined_date)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}







