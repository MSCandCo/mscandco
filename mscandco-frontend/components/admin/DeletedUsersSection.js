'use client'

import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Undo2, AlertTriangle, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoles } from '@/hooks/useRoles'

export default function DeletedUsersSection() {
  const { formatRoleName } = useRoles()
  const [deletedUsers, setDeletedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [restoring, setRestoring] = useState(null)

  useEffect(() => {
    loadDeletedUsers()
  }, [])

  const loadDeletedUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/deleted-users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load deleted users')
      }

      const data = await response.json()
      setDeletedUsers(data.data || [])
    } catch (err) {
      console.error('Error loading deleted users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (userId, email) => {
    if (!confirm(`Are you sure you want to restore ${email}?\n\nThis will allow them to log in again.`)) {
      return
    }

    setRestoring(userId)
    setError(null)

    try {
      const response = await fetch('/api/admin/deleted-users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore user')
      }

      // Reload the list
      await loadDeletedUsers()
    } catch (err) {
      console.error('Error restoring user:', err)
      setError(err.message)
    } finally {
      setRestoring(null)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Loading deleted users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Trash2 className="h-6 w-6 mr-2 text-gray-700" />
            Deleted Users
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            View deleted user accounts and their financial data
          </p>
        </div>
        <Button
          onClick={loadDeletedUsers}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Deleted Users List */}
      {deletedUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Trash2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deleted Users</h3>
          <p className="text-gray-600">
            There are no deleted user accounts to display.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deletedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.artist_name && (
                          <div className="text-xs text-purple-600 mt-1">
                            Artist: {user.artist_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        {formatRoleName(user.role_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(user.deleted_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.deleted_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span className={user.final_wallet_balance > 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {formatCurrency(user.final_wallet_balance)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center text-gray-900">
                          <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                          Total: {formatCurrency(user.total_earnings)}
                        </div>
                        {user.pending_earnings > 0 && (
                          <div className="text-xs text-amber-600 mt-1">
                            Pending: {formatCurrency(user.pending_earnings)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={user.deletion_reason}>
                        {user.deletion_reason || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => handleRestore(user.user_id, user.email)}
                        variant="outline"
                        size="sm"
                        disabled={restoring === user.user_id}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        {restoring === user.user_id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <Undo2 className="h-4 w-4 mr-1" />
                            Restore
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total deleted users: <strong className="text-gray-900">{deletedUsers.length}</strong>
              </span>
              <span className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
