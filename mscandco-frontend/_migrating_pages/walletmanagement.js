import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
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
} from 'lucide-react';
import { CurrencySelector, formatCurrency as formatCurrencyUtil } from '@/components/ui/CurrencySelector';

// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'finance:wallet_management:read');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function WalletManagement() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [walletFilter, setWalletFilter] = useState('all'); // all, artists, label_admins
  const [transactionType, setTransactionType] = useState('all'); // all, credit, debit, subscription, topup
  const [currencyFilter, setCurrencyFilter] = useState('GBP'); // Currency filter
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, per_page: 20, total_pages: 1 });

  // Load data (permission already checked server-side)
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, walletFilter, transactionType, page, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      // Load stats
      const statsRes = await fetch('/api/admin/walletmanagement/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Load wallets with filters
      const walletsRes = await fetch(
        `/api/admin/walletmanagement?` +
        `role=${walletFilter}&` +
        `search=${encodeURIComponent(searchTerm)}&` +
        `page=${page}&` +
        `per_page=${pagination.per_page}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (walletsRes.ok) {
        const walletsData = await walletsRes.json();
        setWallets(walletsData.wallets || []);
        setPagination(walletsData.pagination || pagination);
      }

      // Load recent transactions
      if (selectedWallet) {
        loadTransactions(selectedWallet, token);
      } else {
        // Load all recent transactions
        const txRes = await fetch(
          `/api/admin/walletmanagement/transactions?` +
          `type=${transactionType}&` +
          `page=1&per_page=50`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (userId, token) => {
    try {
      const txRes = await fetch(
        `/api/admin/walletmanagement/transactions?` +
        `user_id=${userId}&` +
        `type=${transactionType}&` +
        `page=1&per_page=50`,
        { headers: { 'Authorization': `Bearer ${token || ''}` } }
      );
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    if (type.includes('credit') || type.includes('topup') || type.includes('earning')) {
      return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
  };

  const getTransactionColor = (type) => {
    if (type.includes('credit') || type.includes('topup') || type.includes('earning')) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  const handleExport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/admin/walletmanagement/export', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Monitor and manage platform wallets, transactions, and balances
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Platform Balance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.total_balance)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Across {stats.total_wallets} wallets
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.monthly_transactions}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatCurrency(stats.monthly_volume)} volume
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscription Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.subscription_revenue)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This month
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.active_users}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                With wallet activity
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <select
                value={walletFilter}
                onChange={(e) => setWalletFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="artist">Artists Only</option>
                <option value="label_admin">Label Admins Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
                <option value="subscription">Subscriptions</option>
                <option value="topup">Top-ups (Revolut)</option>
                <option value="earning">Earnings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <CurrencySelector
                value={currencyFilter}
                onChange={setCurrencyFilter}
                showSymbol={true}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallets List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Wallets</h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on a wallet to view transactions
              </p>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {wallets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No wallets found
                </div>
              ) : (
                wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedWallet === wallet.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {wallet.name}
                        </p>
                        <p className="text-sm text-gray-600">{wallet.email}</p>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {wallet.role}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {wallet.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.total_pages}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedWallet ? 'User Transactions' : 'Recent Transactions'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWallet ? 'Transaction history for selected user' : 'Latest platform transactions'}
              </p>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No transactions found
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getTransactionIcon(tx.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {tx.description}
                          </p>
                          {!selectedWallet && (
                            <p className="text-sm text-gray-600 truncate">
                              {tx.user_name} ({tx.user_email})
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(tx.created_at)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tx.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${getTransactionColor(tx.type)}`}>
                          {tx.type.includes('debit') || tx.type.includes('subscription') ? '-' : '+'}
                          {formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
