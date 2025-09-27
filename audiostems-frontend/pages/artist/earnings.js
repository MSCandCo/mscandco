import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import PayoutRequestModal from '@/components/modals/PayoutRequestModal';
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

export default function ArtistEarnings() {
  const { user } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [showAmounts, setShowAmounts] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artist/wallet-simple');
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const data = await response.json();
      console.log('💰 Wallet data loaded:', data);
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

  const formatAmount = (amount) => {
    if (!showAmounts) return '••••';
    
    const currencySymbol = selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : '£';
    return `${currencySymbol}${Number(amount).toFixed(2)}`;
  };

  const toggleAmountVisibility = () => {
    setShowAmounts(!showAmounts);
  };

  const handlePayoutRequest = () => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#1f2937'}}></div>
          <p style={{color: '#64748b'}}>Loading your earnings...</p>
        </div>
      </div>
    );
  }

  if (error || !walletData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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

  const { wallet, pending_entries = [], recent_history = [] } = walletData;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      {/* Header */}
      <div className="text-white" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #374151 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-4">
                Earnings & Wallet
              </h1>
              <p className="text-xl text-white max-w-3xl">
                Track your revenue, manage payouts, and view earnings history
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAmountVisibility}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
              >
                {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAmounts ? 'Hide' : 'Show'} Amounts</span>
              </button>
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Wallet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Balance - Highlighted */}
          <div className="text-white p-6 rounded-2xl shadow-lg relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
          }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm opacity-90">Available Balance</h3>
                <Wallet className="w-5 h-5 opacity-70" />
              </div>
              <h1 className="text-4xl font-bold mb-3">{formatAmount(wallet.available_balance)}</h1>
              <p className="text-sm opacity-90 mb-4">Ready for withdrawal</p>
              <button 
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all w-full"
                onClick={handlePayoutRequest}
              >
                Request Payout
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-8 translate-x-8"></div>
          </div>

          {/* Pending Income */}
          <div className="p-6 rounded-2xl shadow-lg" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Pending Income</h3>
              <Clock className="w-5 h-5" style={{color: '#d97706'}} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{color: '#1f2937'}}>{formatAmount(wallet.pending_balance)}</h2>
            <p className="text-sm" style={{color: '#64748b'}}>
              {pending_entries.length} pending {pending_entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {/* Total Earned */}
          <div className="p-6 rounded-2xl shadow-lg" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Total Earned</h3>
              <TrendingUp className="w-5 h-5" style={{color: '#065f46'}} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{color: '#1f2937'}}>{formatAmount(wallet.total_earned)}</h2>
            <p className="text-sm" style={{color: '#64748b'}}>All time earnings</p>
          </div>

          {/* Last Updated */}
          <div className="p-6 rounded-2xl shadow-lg" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(31, 41, 55, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Last Updated</h3>
              <Calendar className="w-5 h-5" style={{color: '#475569'}} />
            </div>
            <h2 className="text-lg font-bold mb-3" style={{color: '#1f2937'}}>
              {new Date(wallet.last_updated).toLocaleDateString()}
            </h2>
            <p className="text-sm" style={{color: '#64748b'}}>
              {new Date(wallet.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6" style={{border: '1px solid rgba(31, 41, 55, 0.08)'}}>
          <h2 className="text-xl font-bold mb-4" style={{color: '#1f2937'}}>Wallet Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
              <div>
                <p className="text-sm font-medium" style={{color: '#065f46'}}>Paid Earnings</p>
                <p className="text-xl font-bold" style={{color: '#065f46'}}>{formatAmount(wallet.available_balance)}</p>
              </div>
              <CheckCircle className="w-8 h-8" style={{color: '#065f46'}} />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg" style={{background: '#fef3c7', border: '1px solid #fcd34d'}}>
              <div>
                <p className="text-sm font-medium" style={{color: '#78350f'}}>Awaiting Payment</p>
                <p className="text-xl font-bold" style={{color: '#78350f'}}>{formatAmount(wallet.pending_balance)}</p>
              </div>
              <Clock className="w-8 h-8" style={{color: '#d97706'}} />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg" style={{background: '#f1f5f9', border: '1px solid #cbd5e1'}}>
              <div>
                <p className="text-sm font-medium" style={{color: '#475569'}}>Minimum Payout</p>
                <p className="text-xl font-bold" style={{color: '#475569'}}>{formatAmount(wallet.minimum_payout || 50)}</p>
              </div>
              <CreditCard className="w-8 h-8" style={{color: '#475569'}} />
            </div>
          </div>
        </div>

        {/* Pending Income Breakdown */}
        {pending_entries && pending_entries.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6" style={{border: '1px solid rgba(31, 41, 55, 0.08)'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{color: '#1f2937'}}>Pending Income</h2>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{background: '#fef3c7', color: '#78350f'}}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{pending_entries.length} Pending</span>
              </div>
            </div>
            <div className="space-y-3">
              {pending_entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all" style={{
                  border: '1px solid rgba(31, 41, 55, 0.08)'
                }}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="font-semibold" style={{color: '#1f2937'}}>{entry.platform}</p>
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        background: '#fef3c7', color: '#78350f'
                      }}>
                        {entry.earning_type}
                      </span>
                    </div>
                    <p className="text-sm" style={{color: '#64748b'}}>{entry.territory}</p>
                    {entry.notes && (
                      <p className="text-xs mt-1" style={{color: '#9ca3af'}}>{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{color: '#1f2937'}}>{formatAmount(entry.amount)}</p>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" style={{color: '#d97706'}} />
                      <span className="text-sm font-medium" style={{color: '#d97706'}}>Pending</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Earnings History */}
        <div className="bg-white rounded-2xl shadow-lg p-6" style={{border: '1px solid rgba(31, 41, 55, 0.08)'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{color: '#1f2937'}}>Earnings History</h2>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium transition-all">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {recent_history && recent_history.length > 0 ? recent_history.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-all" style={{
                border: '1px solid rgba(31, 41, 55, 0.08)'
              }}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <p className="font-semibold" style={{color: '#1f2937'}}>{entry.platform}</p>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                      background: entry.status === 'paid' ? '#f0fdf4' : '#fef3c7',
                      color: entry.status === 'paid' ? '#065f46' : '#78350f'
                    }}>
                      {entry.earning_type}
                    </span>
                  </div>
                  <p className="text-sm" style={{color: '#64748b'}}>
                    {entry.territory}
                    {entry.payment_date && ` • Paid ${new Date(entry.payment_date).toLocaleDateString()}`}
                  </p>
                  {entry.notes && (
                    <p className="text-xs mt-1" style={{color: '#9ca3af'}}>{entry.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{color: '#1f2937'}}>{formatAmount(Math.abs(entry.amount))}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {entry.status === 'paid' ? (
                      <>
                        <CheckCircle className="w-3 h-3" style={{color: '#065f46'}} />
                        <span className="text-sm font-medium" style={{color: '#065f46'}}>
                          {entry.earning_type === 'payout_request' ? 'Approved' : 'Paid'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" style={{color: '#d97706'}} />
                        <span className="text-sm font-medium" style={{color: '#d97706'}}>Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto mb-4" style={{color: '#9ca3af'}} />
                <p className="text-lg font-medium mb-2" style={{color: '#64748b'}}>No earnings history yet</p>
                <p className="text-sm" style={{color: '#9ca3af'}}>Your earnings will appear here once payments are processed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableBalance={wallet?.available_balance || 0}
        minimumPayout={wallet?.minimum_payout || 50}
        currency={selectedCurrency}
        onSuccess={handlePayoutSuccess}
      />
    </div>
  );
}