'use client'

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
      // Load wallet balance
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('wallet_balance, wallet_currency')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error loading wallet balance:', subError);
        setWalletBalance(0);
      } else {
        const balance = parseFloat(subscriptionData?.wallet_balance || 0);
        setWalletBalance(balance);
      }

      // Load recent transactions
      const { data: transactionData, error: transError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transError) {
        console.error('Error loading transactions:', transError);
        setTransactions([]);
      } else {
        setTransactions(transactionData || []);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setWalletBalance(0);
      setTransactions([]);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    
    if (!amount || amount <= 0) {
      setProcessMessage('Please enter a valid amount');
      return;
    }

    if (amount < 1) {
      setProcessMessage('Minimum funding amount is £1.00');
      return;
    }

    if (amount > 1000) {
      setProcessMessage('Maximum funding amount is £1,000.00');
      return;
    }

    setIsLoading(true);
    setProcessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/wallet/add-funds', {
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
      setProcessMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setProcessMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to manage your wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {processMessage && (
        <div className={`p-4 rounded-lg ${
          processMessage.includes('Successfully') || processMessage.includes('added')
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {processMessage.includes('Successfully') || processMessage.includes('added') ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{processMessage}</span>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-blue-100">Wallet Balance</span>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(walletBalance)}
            </div>
          </div>
          <button
            onClick={() => setShowAddFunds(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
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
          <p className="text-gray-600 mb-4">
            Add funds to your wallet for subscription payments and platform services. 
            You can also enable negative balance for approved accounts.
          </p>
          
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
                  className="pl-8 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: £1.00 • Maximum: £1,000.00</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddFunds}
                disabled={isLoading || !addAmount}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                  setProcessMessage('');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Add funds to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Secure Payment Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Secure Payment Processing</h4>
            <p className="text-sm text-gray-600 mt-1">
              All transactions are processed securely via Revolut Business API. Currently running in sandbox mode with real API integration.
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• <strong>Subscription Changes:</strong> Upgrades take effect immediately</li>
              <li>• <strong>Wallet Funds:</strong> Available for subscription payments and platform services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManager;
