'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import {
  Wallet,
  TrendingUp,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { CurrencySelector, formatCurrency } from '@/components/ui/CurrencySelector'
import PayoutRequestModal from '@/components/modals/PayoutRequestModal'

/**
 * Wallet Management Client Component - App Router Compatible
 * 
 * Full UI restoration with all original functionality
 * Converted from Pages Router to App Router
 */

export default function WalletManagementClient({ initialData, user }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(initialData?.stats || null)
  const [wallets, setWallets] = useState(initialData?.wallets || [])
  const [transactions, setTransactions] = useState(initialData?.transactions || [])
  const [selectedWallet, setSelectedWallet] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [walletFilter, setWalletFilter] = useState('all')
  const [transactionType, setTransactionType] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('GBP')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, per_page: 20, total_pages: 1 })

  // Modal states
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [selectedWalletForPayout, setSelectedWalletForPayout] = useState(null)

  // Load data
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, page, searchTerm, walletFilter, transactionType, currencyFilter])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('wallet_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Transaction changed:', payload)
          // Refresh data when transactions change
          loadData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => {
          console.log('User profile changed:', payload)
          // Refresh data when user profiles change
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/walletmanagement/stats', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats')
      }

      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats({
          totalBalance: statsData.stats.total_balance,
          totalTransactions: statsData.stats.monthly_transactions,
          totalWallets: statsData.stats.total_wallets,
          currency: currencyFilter,
          monthlyVolume: statsData.stats.monthly_volume,
          subscriptionRevenue: statsData.stats.subscription_revenue,
          activeUsers: statsData.stats.active_users
        })
      }

      // Fetch wallets with filters
      const walletParams = new URLSearchParams({
        role: walletFilter,
        search: searchTerm,
        page: page.toString(),
        per_page: '20'
      })

      const walletsResponse = await fetch(`/api/admin/walletmanagement?${walletParams}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!walletsResponse.ok) {
        throw new Error('Failed to fetch wallets')
      }

      const walletsData = await walletsResponse.json()

      if (walletsData.success) {
        setWallets(walletsData.wallets || [])
        setPagination(walletsData.pagination)
      }

      // Fetch transactions with filters
      const txParams = new URLSearchParams({
        type: transactionType,
        page: page.toString(),
        per_page: '50'
      })

      if (selectedWallet) {
        txParams.append('user_id', selectedWallet.id)
      }

      const transactionsResponse = await fetch(`/api/admin/walletmanagement/transactions?${txParams}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const transactionsData = await transactionsResponse.json()

      if (transactionsData.success) {
        setTransactions(transactionsData.transactions || [])
      }

    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh data when filters change
  const handleRefresh = () => {
    loadData()
  }

  const handlePayoutRequest = async (payoutData) => {
    try {
      // Create payout request
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: selectedWalletForPayout.id,
          amount: payoutData.amount,
          currency: payoutData.currency,
          bank_details: payoutData.bankDetails,
          status: 'pending',
          requested_by: user.id,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Show success message
      alert('Payout request submitted successfully!')

      // Refresh data
      await loadData()
      
    } catch (error) {
      console.error('Error creating payout request:', error)
      throw error
    }
  }

  const handleExport = () => {
    // Export wallet data to CSV
    const csv = [
      ['Name', 'Email', 'Role', 'Balance', 'Currency', 'Transactions'].join(','),
      ...wallets.map(w =>
        [
          w.name || 'N/A',
          w.email || 'N/A',
          w.role || 'N/A',
          w.balance || 0,
          w.currency || 'GBP',
          w.transaction_count || 0
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wallets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && !initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <PageLoading message="Loading..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalBalance, stats.currency)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wallets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWallets}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="btn btn-outline btn-sm flex items-center"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn btn-outline btn-sm flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Type</label>
            <select
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Wallets</option>
              <option value="artists">Artists</option>
              <option value="label_admins">Label Admins</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="payout">Payout</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <CurrencySelector
              selectedCurrency={currencyFilter}
              onCurrencyChange={setCurrencyFilter}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Wallets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {wallet.name || wallet.email || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {wallet.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      wallet.role === 'artist'
                        ? 'bg-purple-100 text-purple-800'
                        : wallet.role === 'label_admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wallet.role || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(wallet.balance || 0, wallet.currency || 'GBP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {wallet.currency || 'GBP'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedWalletForPayout(wallet)
                        setShowPayoutModal(true)
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Request Payout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{transaction.description || 'No description'}</div>
                    <div className="text-gray-500 text-xs">{transaction.user_name} ({transaction.user_email})</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      ['credit', 'topup', 'earning', 'refund'].includes(transaction.type)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {['credit', 'topup', 'earning', 'refund'].includes(transaction.type) ? (
                        <ArrowUpCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3 mr-1" />
                      )}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.amount || 0, transaction.currency || 'GBP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {page} of {pagination.total_pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.total_pages, page + 1))}
              disabled={page === pagination.total_pages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false)
          setSelectedWalletForPayout(null)
        }}
        wallet={selectedWalletForPayout}
        onRequestPayout={handlePayoutRequest}
      />
    </div>
  )
}
