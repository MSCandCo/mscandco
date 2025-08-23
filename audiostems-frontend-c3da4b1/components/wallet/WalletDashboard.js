import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const WalletDashboard = ({ 
  userRole = 'artist',
  showRevenueBreakdown = true,
  showSubscriptionInfo = true 
}) => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
    currentBalance: 0,
    walletEnabled: true,
    negativeBalanceAllowed: false,
    creditLimit: 0
  });

  const [revenueData, setRevenueData] = useState({
    distributions: [],
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0
  });

  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'Artist Starter',
    nextPaymentDue: null,
    lastPayment: null,
    autoPayFromWallet: false,
    revolutSubscriptionActive: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadWalletData();
    loadRevenueData();
    loadSubscriptionData();
  }, [selectedTimeframe, filterType]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      // This would be an API call
      // const response = await fetch('/api/wallet/transactions');
      // const data = await response.json();
      
      // Mock data for now
      setWalletData({
        balance: 1247.53,
        currentBalance: 1247.53,
        walletEnabled: true,
        negativeBalanceAllowed: userRole === 'artist',
        creditLimit: userRole === 'artist' ? 500 : 0,
        transactions: [
          {
            id: 1,
            type: 'revenue_payout',
            amount: 245.67,
            description: 'October 2024 Revenue Distribution',
            date: '2024-11-01',
            status: 'completed',
            platform: 'Spotify',
            release: 'YAHWEH - Single'
          },
          {
            id: 2,
            type: 'subscription_payment',
            amount: -29.99,
            description: 'Artist Pro Monthly Subscription',
            date: '2024-11-01',
            status: 'completed'
          },
          {
            id: 3,
            type: 'revenue_payout',
            amount: 156.32,
            description: 'September 2024 Revenue Distribution',
            date: '2024-10-01',
            status: 'completed',
            platform: 'Apple Music',
            release: 'YAHWEH - EP'
          }
        ]
      });
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      // Mock revenue data
      setRevenueData({
        totalEarnings: 2847.92,
        thisMonthEarnings: 245.67,
        pendingPayouts: 0,
        distributions: [
          {
            id: 1,
            releaseTitle: 'YAHWEH - Single',
            period: 'October 2024',
            grossRevenue: 350.95,
            distributionPartnerAmount: 35.10,
            netRevenue: 315.85,
            artistAmount: 221.10,
            labelAmount: 63.17,
            companyAmount: 31.58,
            platforms: ['Spotify', 'Apple Music', 'YouTube Music'],
            processed: true
          },
          {
            id: 2,
            releaseTitle: 'YAHWEH - EP',
            period: 'September 2024',
            grossRevenue: 223.18,
            distributionPartnerAmount: 22.32,
            netRevenue: 200.86,
            artistAmount: 140.60,
            labelAmount: 40.17,
            companyAmount: 20.09,
            platforms: ['Spotify', 'Apple Music'],
            processed: true
          }
        ]
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      // Mock subscription data
      setSubscriptionData({
        plan: 'Artist Pro',
        nextPaymentDue: '2024-12-01',
        lastPayment: '2024-11-01',
        autoPayFromWallet: true,
        revolutSubscriptionActive: true,
        amount: 29.99
      });
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'revenue_payout':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'subscription_payment':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Wallet Balance</h3>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/80 hover:text-white"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {showBalance ? formatCurrency(walletData.currentBalance) : '••••••'}
            </div>
            {walletData.negativeBalanceAllowed && (
              <div className="text-blue-200 text-sm">
                Credit limit: {formatCurrency(walletData.creditLimit)}
              </div>
            )}
          </div>
          {!walletData.walletEnabled && (
            <div className="mt-3 text-yellow-200 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Wallet disabled
            </div>
          )}
        </div>

        {/* This Month Earnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(revenueData.thisMonthEarnings)}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            From {revenueData.distributions.length} releases
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {formatCurrency(revenueData.totalEarnings)}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            All-time revenue
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {showSubscriptionInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscriptionData.revolutSubscriptionActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {subscriptionData.revolutSubscriptionActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Current Plan</div>
              <div className="font-semibold">{subscriptionData.plan}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Next Payment</div>
              <div className="font-semibold">
                {subscriptionData.nextPaymentDue 
                  ? new Date(subscriptionData.nextPaymentDue).toLocaleDateString()
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Payment Method</div>
              <div className="font-semibold">
                {subscriptionData.autoPayFromWallet ? 'Wallet Balance' : 'Revolut'}
              </div>
            </div>
          </div>
          
          {subscriptionData.autoPayFromWallet && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-800 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Auto-pay enabled from wallet balance ({formatCurrency(subscriptionData.amount)}/month)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Breakdown */}
      {showRevenueBreakdown && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Distribution</h3>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {revenueData.distributions.map((distribution) => (
              <div key={distribution.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{distribution.releaseTitle}</div>
                    <div className="text-sm text-gray-600">{distribution.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(distribution.artistAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Your share</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-gray-600">Gross Revenue</div>
                    <div className="font-semibold">{formatCurrency(distribution.grossRevenue)}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-gray-600">Distribution Fee (10%)</div>
                    <div className="font-semibold text-red-600">
                      -{formatCurrency(distribution.distributionPartnerAmount)}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-gray-600">Net Revenue</div>
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(distribution.netRevenue)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-gray-600">Your Split (70%)</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(distribution.artistAmount)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {distribution.platforms.map((platform) => (
                    <span 
                      key={platform}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="revenue_payout">Revenue</option>
              <option value="subscription_payment">Subscriptions</option>
              <option value="refund">Refunds</option>
            </select>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {walletData.transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                    {transaction.platform && ` • ${transaction.platform}`}
                    {transaction.release && ` • ${transaction.release}`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(transaction.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {walletData.transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
