'use client'

// LABEL ADMIN EARNINGS - Combined earnings from all accepted artists
import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/SupabaseProvider'
import { createClient } from '@supabase/supabase-js'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Music
} from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Currency selector component
const CurrencySelector = ({ selectedCurrency, onCurrencyChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }
  ]

  const selectedCurr = currencies.find(c => c.code === selectedCurrency) || currencies[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        <span>{selectedCurr.symbol}</span>
        <span>{selectedCurr.code}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px] max-h-64 overflow-y-auto">
          {currencies.map(currency => (
            <button
              key={currency.code}
              onClick={() => {
                onCurrencyChange(currency.code)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="font-medium">{currency.symbol} {currency.code}</span>
              <span className="text-gray-500 text-xs ml-2">{currency.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EarningsClient() {
  const { user, session } = useUser()
  const [acceptedArtists, setAcceptedArtists] = useState([])
  const [combinedEarnings, setCombinedEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('GBP')
  const [showAmounts, setShowAmounts] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all_time')

  const currencySymbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$',
    'NGN': '₦', 'GHS': '₵', 'KES': 'KSh', 'ZAR': 'R', 'ZMW': 'ZK'
  }

  const formatAmount = (amount) => {
    if (!showAmounts) return '••••••'
    const symbol = currencySymbols[selectedCurrency] || selectedCurrency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const timePeriods = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 3 Months' },
    { value: 'last_365_days', label: 'Last 12 Months' },
    { value: 'all_time', label: 'All Time' }
  ]

  useEffect(() => {
    if (user && session) {
      loadEarningsData()
    }
  }, [user, session])

  const loadEarningsData = async () => {
    try {
      setLoading(true)
      
      const token = session?.access_token
      if (!token) {
        throw new Error('Authentication required')
      }

      // Fetch label admin earnings (their split from shared_earnings table)
      const response = await fetch('/api/labeladmin/earnings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to load earnings')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load earnings')
      }

      // Transform the data for display
      const combined = {
        totalEarned: data.summary.totalLabelEarnings, // Only label admin's share
        totalPending: 0, // TODO: Add status tracking to shared_earnings
        totalPaidOut: data.summary.totalLabelEarnings, // Assume all paid for now
        transactionCount: data.summary.entryCount,
        artistBreakdown: Object.values(data.earningsByArtist).map(artist => ({
          artistId: artist.artistId,
          artistName: artist.artistName,
          totalEarned: artist.totalEarnings, // Total from this artist
          labelShare: artist.labelShare, // Label admin's share
          artistShare: artist.artistShare, // Artist's share
          percentage: artist.percentage,
          transactionCount: artist.entries.length
        })),
        recentTransactions: data.recentEarnings.map(earning => ({
          id: earning.id,
          created_at: earning.created_at,
          amount: earning.label_amount, // Show label admin's share
          total_amount: earning.total_amount,
          artist_amount: earning.artist_amount,
          description: `${earning.earning_type || 'Earnings'} from ${earning.platform || 'Platform'}`,
          status: 'paid', // TODO: Add status tracking
          artistName: earning.label_artist_affiliations?.user_profiles?.artist_name || 'Unknown',
          platform: earning.platform,
          earning_type: earning.earning_type
        }))
      }

      setCombinedEarnings(combined)

      // Set accepted artists from earnings data
      const artists = Object.values(data.earningsByArtist).map(artist => ({
        artistId: artist.artistId,
        artistName: artist.artistName,
        artistEmail: artist.artistEmail
      }))
      setAcceptedArtists(artists)

    } catch (error) {
      console.error('Error loading earnings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PageLoading message="Loading earnings..." />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-900 font-semibold mb-2">Error Loading Earnings</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (acceptedArtists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artists Connected</h3>
            <p className="text-gray-600 mb-6">
              You need to have accepted artists before viewing earnings.
            </p>
            <button
              onClick={() => window.location.href = '/labeladmin/artists'}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Manage Artists
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wallet className="h-8 w-8" />
                Label Earnings
              </h1>
              <p className="text-gray-600 mt-2">
                Combined earnings from {acceptedArtists.length} artists
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title={showAmounts ? 'Hide amounts' : 'Show amounts'}
              >
                {showAmounts ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatAmount(combinedEarnings?.totalEarned || 0)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatAmount(combinedEarnings?.totalPending || 0)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Out</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatAmount(combinedEarnings?.totalPaidOut || 0)}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {combinedEarnings?.transactionCount || 0}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Artist Breakdown */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Earnings by Artist
            </h2>
            <p className="text-sm text-gray-600 mt-1">Your share from each artist based on split agreement</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Split %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Your Share</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Artist Share</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedEarnings?.artistBreakdown.map((artist) => (
                  <tr key={artist.artistId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {artist.artistName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {artist.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatAmount(artist.totalEarned)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                      {formatAmount(artist.labelShare)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {formatAmount(artist.artistShare)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {artist.transactionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedEarnings?.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  combinedEarnings?.recentTransactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.artistName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description || 'Earnings'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status || 'pending'}
                        </span>
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

