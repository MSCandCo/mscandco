import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, TrendingUp, TrendingDown, CreditCard, Loader, CheckCircle, XCircle } from 'lucide-react';

const WalletManager = ({ user }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [processMessage, setProcessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Load wallet transactions
      const { data: transactionData, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading wallet transactions:', error);
      } else {
        setTransactions(transactionData || []);
        
        // Calculate current balance from transactions
        const balance = transactionData?.reduce((acc, transaction) => {
          if (transaction.transaction_type === 'credit') {
            return acc + parseFloat(transaction.amount);
          } else {
            return acc - parseFloat(transaction.amount);
          }
        }, 0) || 0;
        
        setWalletBalance(balance);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    
    if (!amount || amount <= 0) {
      setProcessMessage('Please enter a valid amount');
      setTimeout(() => setProcessMessage(''), 3000);
      return;
    }

    if (amount > 1000) {
      setProcessMessage('Maximum top-up amount is £1,000');
      setTimeout(() => setProcessMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setProcessMessage('Processing payment...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/payments/revolut/add-wallet-funds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'GBP'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProcessMessage(result.message);
        setWalletBalance(result.new_balance);
        setAddAmount('');
        setShowAddFunds(false);
        
        // Reload wallet data to get updated transactions
        await loadWalletData();
        
        setTimeout(() => {
          setProcessMessage('');
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Add funds error:', error);
      setProcessMessage('Failed to add funds. Please try again.');
      
      setTimeout(() => {
        setProcessMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount, currency = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type, status) => {
    if (status === 'failed') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    
    return type === 'credit' 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTransactionColor = (type, status) => {
    if (status === 'failed') {
      return 'text-red-600';
    }
    
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Process Message */}
      {processMessage && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          processMessage.includes('Successfully') || processMessage.includes('successfully')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : processMessage.includes('Failed') || processMessage.includes('error')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {processMessage.includes('Processing') ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : processMessage.includes('Successfully') || processMessage.includes('successfully') ? (
            <CheckCircle className="w-5 h-5" />
          ) : processMessage.includes('Failed') || processMessage.includes('error') ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <Wallet className="w-5 h-5" />
          )}
          <span>{processMessage}</span>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-8 h-8" />
            <div>
              <p className="text-blue-100">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatAmount(walletBalance)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddFunds(!showAddFunds)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      {/* Add Funds Form */}
      {showAddFunds && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Wallet</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (GBP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="pl-8 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: £1.00 • Maximum: £1,000.00
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddFunds}
                disabled={isLoading || !addAmount}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Add Funds</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowAddFunds(false);
                  setAddAmount('');
                }}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.transaction_type, transaction.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.created_at)} • {transaction.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.transaction_type, transaction.status)}`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                  {transaction.balance_after && (
                    <p className="text-xs text-gray-500">
                      Balance: {formatAmount(transaction.balance_after)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Add funds to get started</p>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Secure Payments</p>
            <p className="text-xs text-gray-600">
              All transactions are processed securely via Revolut Business API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManager;
