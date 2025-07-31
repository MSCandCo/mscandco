import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, useRef } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { Calendar, ChevronDown, Globe } from 'lucide-react';

export default function ArtistEarnings() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP'); // Default to GBP
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyDropdownRef = useRef(null);
  
  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('artist-earnings-currency');
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    } else {
      // Auto-detect currency based on user's location if no saved preference
      detectUserCurrency();
    }
  }, []);
  
  // Save currency preference to localStorage when changed
  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencyDropdown(false);
    localStorage.setItem('artist-earnings-currency', currencyCode);
    
    // Trigger storage event to sync currency across components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'artist-earnings-currency',
      newValue: currencyCode,
      oldValue: selectedCurrency,
      storageArea: localStorage
    }));
  };
  
  // Auto-detect currency based on user's location
  const detectUserCurrency = async () => {
    try {
      // Try to get user's location from IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code === 'GB') {
        handleCurrencyChange('GBP');
      } else {
        // Check if the country's currency is in our list
        const countryCurrency = data.currency;
        const hasCurrency = currencies.find(c => c.code === countryCurrency);
        
        if (hasCurrency) {
          handleCurrencyChange(countryCurrency);
        } else {
          // Default to USD for countries not in our list
          handleCurrencyChange('USD');
        }
      }
    } catch (error) {
      console.log('Could not detect user location, defaulting to GBP');
      handleCurrencyChange('GBP');
    }
  };
  
  // Handle clicking outside the currency dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Major international currencies with exchange rates (simplified - in production, use real-time rates)
  const currencies = [
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1.0 }, // Base currency
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.27 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 1.17 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.72 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.92 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 185.0 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 1.10 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 2.08 },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 13.2 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 13.5 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 8.7 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.72 },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 9.9 },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1700.0 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 105.0 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 6.3 },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 21.5 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 23.8 }
  ];

  const [earningsData] = useState({
    totalEarnings: 12450,
    pendingEarnings: 2340,
    heldEarnings: 1560,
    pendingWithdrawal: 320, // Money withdrawn but still in transit
    minimumCashoutThreshold: 100,
    minimumBalance: 100, // Minimum balance that must be held in account
    thisMonth: 3450,
    lastMonth: 2890,
    thisYear: 12450,
    lastYear: 8900,
    monthlyData: [
      { month: 'Jan', earnings: 2100, streams: 45000 },
      { month: 'Feb', earnings: 1800, streams: 38000 },
      { month: 'Mar', earnings: 2400, streams: 52000 },
      { month: 'Apr', earnings: 2200, streams: 48000 },
      { month: 'May', earnings: 2800, streams: 61000 },
      { month: 'Jun', earnings: 3200, streams: 72000 },
      { month: 'Jul', earnings: 2900, streams: 65000 },
      { month: 'Aug', earnings: 3100, streams: 68000 },
      { month: 'Sep', earnings: 2600, streams: 58000 },
      { month: 'Oct', earnings: 2400, streams: 52000 },
      { month: 'Nov', earnings: 2800, streams: 61000 },
      { month: 'Dec', earnings: 3500, streams: 78000 }
    ],
    recentTransactions: [
      {
        id: 1,
        type: 'streaming',
        amount: 450,
        date: '2024-01-15',
        platform: 'Spotify',
        status: 'paid'
      },
      {
        id: 2,
        type: 'download',
        amount: 120,
        date: '2024-01-14',
        platform: 'iTunes',
        status: 'pending'
      },
      {
        id: 3,
        type: 'streaming',
        amount: 380,
        date: '2024-01-13',
        platform: 'Apple Music',
        status: 'paid'
      },
      {
        id: 4,
        type: 'sync',
        amount: 800,
        date: '2024-01-12',
        platform: 'Film License',
        status: 'paid'
      },
      {
        id: 5,
        type: 'streaming',
        amount: 290,
        date: '2024-01-11',
        platform: 'YouTube Music',
        status: 'pending'
      }
    ]
  });

  // Get current currency object
  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  // Convert amount from GBP to selected currency
  const convertCurrency = (amount) => {
    const currency = getCurrentCurrency();
    return amount * currency.rate;
  };

  // Format amount with currency symbol
  const formatCurrency = (amount) => {
    const currency = getCurrentCurrency();
    const convertedAmount = convertCurrency(amount);
    
    // Format based on currency
    if (currency.code === 'JPY' || currency.code === 'KRW') {
      return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else if (currency.code === 'INR') {
      return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else {
      return `${currency.symbol}${convertedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  };

  // Calculate available for withdrawal dynamically
  const getAvailableForWithdrawal = () => {
    // Available = Held Earnings - Minimum Balance - Pending Withdrawals
    return Math.max(0, earningsData.heldEarnings - earningsData.minimumBalance - earningsData.pendingWithdrawal);
  };
  
  // Example calculations:
  // - If heldEarnings = 1560, pendingWithdrawal = 320, availableForWithdrawal = 1560 - 100 - 320 = 1140
  // - If heldEarnings = 80, pendingWithdrawal = 0, availableForWithdrawal = Math.max(0, 80 - 100 - 0) = 0
  // - If heldEarnings = 100, pendingWithdrawal = 50, availableForWithdrawal = 100 - 100 - 50 = 0
  // - If heldEarnings = 200, pendingWithdrawal = 50, availableForWithdrawal = 200 - 100 - 50 = 50

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your earnings.</div>;
  }

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Only allow artists to access this page
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getCurrentPeriodEarnings = () => {
    switch (selectedPeriod) {
      case 'month':
        return earningsData.thisMonth;
      case 'year':
        return earningsData.thisYear;
      case 'custom':
        // For custom date range, calculate based on selected dates
        if (customStartDate && customEndDate) {
          // Mock calculation for custom date range
          const daysDiff = Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24));
          const avgDailyEarnings = earningsData.totalEarnings / 365; // Assuming 1 year of data
          return Math.round(avgDailyEarnings * daysDiff);
        }
        return earningsData.thisMonth; // Default to current month if no custom dates
      case 'all':
      default:
        return earningsData.totalEarnings;
    }
  };

  const getPreviousPeriodEarnings = () => {
    switch (selectedPeriod) {
      case 'month':
        return earningsData.lastMonth;
      case 'year':
        return earningsData.lastYear;
      case 'custom':
        // For custom date range, calculate previous period of same length
        if (customStartDate && customEndDate) {
          const daysDiff = Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24));
          const avgDailyEarnings = earningsData.totalEarnings / 365; // Assuming 1 year of data
          // Calculate previous period of same length (80% of current for demo)
          return Math.round(avgDailyEarnings * daysDiff * 0.8);
        }
        return earningsData.lastMonth; // Default to last month if no custom dates
      case 'all':
      default:
        return earningsData.totalEarnings * 0.8; // Assume 20% growth for demo
    }
  };

  const getPercentageChange = () => {
    const current = getCurrentPeriodEarnings();
    const previous = getPreviousPeriodEarnings();
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'streaming': return '🎵';
      case 'download': return '⬇️';
      case 'sync': return '🎬';
      default: return '💰';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your revenue, payments, and earnings performance</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {[
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom Range' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    if (period.id === 'custom') {
                      setShowCustomDateRange(true);
                    } else {
                      setShowCustomDateRange(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedPeriod === period.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {/* Currency Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Display Currency:</span>
              <div className="relative" ref={currencyDropdownRef}>
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{getCurrentCurrency().symbol} {getCurrentCurrency().code}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showCurrencyDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-1 mb-2">Select Currency</div>
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleCurrencyChange(currency.code)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left rounded hover:bg-gray-100 ${
                            selectedCurrency === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{currency.symbol}</span>
                            <span className="text-sm">{currency.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{currency.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Exchange Rate Info */}
              {selectedCurrency !== 'GBP' && (
                <div className="text-xs text-gray-500">
                  <span>
                    1 GBP = {getCurrentCurrency().symbol}{getCurrentCurrency().rate.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomDateRange && (
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Start date"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="End date"
              />
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.totalEarnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Period</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(getCurrentPeriodEarnings())}
                </p>
                <p className={`text-sm ${getPercentageChange() > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {getPercentageChange()}% vs previous period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.pendingEarnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className={`text-2xl font-bold ${getPercentageChange() > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {getPercentageChange()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Funds Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Funds</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(earningsData.heldEarnings)}
              </div>
              <div className="text-sm text-gray-600">Available Balance</div>
              <div className="text-xs text-gray-500 mt-1">Minimum {formatCurrency(earningsData.minimumBalance)} held in account</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getAvailableForWithdrawal())}
              </div>
              <div className="text-sm text-gray-600">Available for Withdrawal</div>
              <div className="text-xs text-gray-500 mt-1">Amount above {formatCurrency(earningsData.minimumBalance)} minimum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(earningsData.pendingWithdrawal)}
              </div>
              <div className="text-sm text-gray-600">Pending Withdrawal</div>
              <div className="text-xs text-gray-500 mt-1">In transit to your account</div>
            </div>
            <div className="text-center">
              <button
                disabled={getAvailableForWithdrawal() <= 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  getAvailableForWithdrawal() > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {getAvailableForWithdrawal() > 0
                  ? 'Withdraw'
                  : 'No funds available'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Earnings chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earningsData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getTypeIcon(transaction.type)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
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