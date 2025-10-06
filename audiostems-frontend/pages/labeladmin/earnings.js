import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import PayoutRequestModal from '@/components/modals/PayoutRequestModal';
import { useCurrencyConversion, fetchLiveExchangeRates } from '@/lib/currency-service';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  CurrencyPound,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight
} from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Comprehensive currency selector component
const CurrencySelector = ({ selectedCurrency, onCurrencyChange, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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
  ];

  const selectedCurr = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
        >
          <span>{selectedCurr.symbol}</span>
          <span>{selectedCurr.code}</span>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[120px] max-h-64 overflow-y-auto">
            {currencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency.code);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 text-sm first:rounded-t-lg last:rounded-b-lg text-slate-700 hover:text-slate-900"
              >
                <span className="font-medium">{currency.symbol} {currency.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default function LabelAdminEarnings() {
  const { user } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [showAmounts, setShowAmounts] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Use currency conversion hook
  const { convertAmount, formatAmount, symbol } = useCurrencyConversion(selectedCurrency);

  // Time period options
  const timePeriods = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 3 Months' },
    { value: 'last_365_days', label: 'Last 12 Months' },
    { value: 'all_time', label: 'All Time' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Calculate period-specific metrics
  const calculatePeriodMetrics = () => {
    if (!walletData?.recent_history) return { totalEarned: 0, transactionCount: 0, averageTransaction: 0 };

    let filteredHistory = walletData.recent_history;
    const now = new Date();
    
    // Filter by selected period
    if (selectedPeriod !== 'all_time' && selectedPeriod !== 'custom') {
      const daysMap = {
        'last_7_days': 7,
        'last_30_days': 30,
        'last_90_days': 90,
        'last_365_days': 365
      };
      
      const days = daysMap[selectedPeriod];
      if (days) {
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        filteredHistory = filteredHistory.filter(entry => 
          new Date(entry.created_at) >= cutoffDate
        );
      }
    } else if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      filteredHistory = filteredHistory.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    const totalEarned = filteredHistory
      .filter(entry => entry.amount > 0)
      .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    const transactionCount = filteredHistory.filter(entry => entry.amount > 0).length;
    const averageTransaction = transactionCount > 0 ? totalEarned / transactionCount : 0;

    return { totalEarned, transactionCount, averageTransaction };
  };

  const periodMetrics = calculatePeriodMetrics();

  useEffect(() => {
    fetchWalletData();
    // Fetch live exchange rates on component mount
    fetchLiveExchangeRates();
  }, []);

  // Listen for currency updates and refresh rates
  useEffect(() => {
    const handleRateUpdate = () => {
      // Currency rates updated, component will re-render automatically
    };

    window.addEventListener('exchangeRatesUpdated', handleRateUpdate);
    return () => window.removeEventListener('exchangeRatesUpdated', handleRateUpdate);
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch('/api/labeladmin/wallet-simple', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const data = await response.json();
      console.log('💰 Label Admin wallet data loaded:', data);
      setWalletData(data);
    } catch (error) {
      console.error('Error loading wallet:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = (currency) => {
    setSelectedCurrency(currency);
  };

  const displayAmount = (gbpAmount) => {
    if (!showAmounts) return '••••';
    return formatAmount(convertAmount(gbpAmount, 'GBP'));
  };

  const handleRequestPayout = () => {
    setShowPayoutModal(true);
  };

  const handlePayoutSuccess = (request) => {
    // Refresh wallet data to reflect any changes
    fetchWalletData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{color: '#991b1b'}}>Error Loading Earnings</h2>
          <p className="mb-4" style={{color: '#64748b'}}>{error || 'Unable to load earnings data'}</p>
          <button
            onClick={fetchWalletData}
            className="px-4 py-2 text-white rounded-lg font-medium transition-all"
            style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const wallet = walletData?.wallet || {};
  const pendingEntries = walletData?.pending_entries || [];
  const recentHistory = walletData?.recent_history || [];

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Wallet className="w-8 h-8 mr-3" />
              Label Earnings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your label earnings and payouts
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Currency Selector */}
            <CurrencySelector 
              selectedCurrency={selectedCurrency} 
              onCurrencyChange={updateCurrency}
              compact={true}
            />
            
            {/* Show/Hide Toggle */}
            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="flex items-center px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
            >
              {showAmounts ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {showAmounts ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="ml-3 text-sm font-medium text-slate-600">Available Balance</h3>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">
                {displayAmount(wallet.available_balance || 0)}
              </p>
              <p className="text-sm text-slate-500">
                Ready for payout
              </p>
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="ml-3 text-sm font-medium text-slate-600">Pending Earnings</h3>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">
                {displayAmount(wallet.pending_balance || 0)}
              </p>
              <p className="text-sm text-slate-500">
                {pendingEntries.length} pending transactions
              </p>
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="ml-3 text-sm font-medium text-slate-600">Total Earned</h3>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">
                {displayAmount(wallet.total_earned || 0)}
              </p>
              <p className="text-sm text-slate-500">
                All time earnings
              </p>
            </div>
          </div>
        </div>

        {/* Payout Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Request Payout</h2>
              <p className="text-sm text-slate-600 mt-1">
                Minimum payout: {symbol}{wallet.minimum_payout || 50}
              </p>
            </div>
            <button
              onClick={handleRequestPayout}
              disabled={(wallet.available_balance || 0) < (wallet.minimum_payout || 50)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
                (wallet.available_balance || 0) >= (wallet.minimum_payout || 50)
                  ? 'text-white shadow-md hover:shadow-lg'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              style={(wallet.available_balance || 0) >= (wallet.minimum_payout || 50) ? {
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
              } : {}}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Request Payout
            </button>
          </div>
          
          {(wallet.available_balance || 0) < (wallet.minimum_payout || 50) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <p className="text-sm text-yellow-800">
                  You need at least {symbol}{wallet.minimum_payout || 50} to request a payout. 
                  Current balance: {displayAmount(wallet.available_balance || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Period Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Earnings Analytics</h2>
            
            {/* Period Selector */}
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timePeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Period Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {displayAmount(periodMetrics.totalEarned)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {periodMetrics.transactionCount}
              </p>
              <p className="text-sm text-slate-600 mt-1">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {displayAmount(periodMetrics.averageTransaction)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Average per Transaction</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
          </div>
          
          <div className="divide-y divide-slate-200">
            {recentHistory.length > 0 ? (
              recentHistory.slice(0, 10).map((entry, index) => (
                <div key={index} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      entry.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {entry.amount > 0 ? (
                        <ArrowUpRight className={`w-4 h-4 ${
                          entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-900">
                        {entry.description || 'Streaming Revenue'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.amount > 0 ? '+' : ''}{displayAmount(Math.abs(entry.amount))}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {entry.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Transactions Yet</h3>
                <p className="text-slate-600">Your earnings will appear here once you start receiving payments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payout Request Modal */}
        {showPayoutModal && (
          <PayoutRequestModal
            isOpen={showPayoutModal}
            onClose={() => setShowPayoutModal(false)}
            availableBalance={wallet.available_balance || 0}
            minimumPayout={wallet.minimum_payout || 50}
            currency={selectedCurrency}
            onSuccess={handlePayoutSuccess}
            userType="labeladmin"
          />
        )}
      </div>
    </div>
  );
}