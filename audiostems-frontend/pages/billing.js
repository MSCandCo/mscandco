import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Crown, 
  Building2, 
  Loader2, 
  Wallet, 
  Plus, 
  AlertCircle,
  X,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

const BillingPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('subscription');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [selectedBilling, setSelectedBilling] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  
  // Mock data - replace with real data from your backend
  const walletBalance = 0.00;
  const userRole = 'artist'; // Get from your auth context
  const currentSubscription = null; // Get from your backend

  // Static configuration
  const CURRENCIES = [
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }
  ];

  const PLAN_PRICES = {
    'artist-starter': { monthly: 9.99, yearly: 99.99 },
    'artist-pro': { monthly: 29.99, yearly: 299.99 },
    'label-starter': { monthly: 29.99, yearly: 299.99 },
    'label-pro': { monthly: 49.99, yearly: 499.99 }
  };

  const EXCHANGE_RATES = {
    GBP: 1.00, USD: 1.27, EUR: 1.17, CAD: 1.71, NGN: 2050.00,
    GHS: 19.50, KES: 164.00, ZAR: 23.50, ZMW: 27.80
  };

  const PLANS = [
    {
      id: 'artist-starter',
      name: 'Artist Starter',
      icon: Zap,
      color: 'bg-blue-500',
      features: ['5 releases per month', 'Basic analytics', 'Standard distribution', 'Email support'],
      target: 'artist',
      popular: false
    },
    {
      id: 'artist-pro',
      name: 'Artist Pro',
      icon: Crown,
      color: 'bg-purple-500',
      features: ['Unlimited releases', 'Advanced analytics', 'Priority distribution', 'Priority support', 'Custom branding'],
      target: 'artist',
      popular: true
    },
    {
      id: 'label-starter',
      name: 'Label Starter',
      icon: Building2,
      color: 'bg-green-500',
      features: ['4 artists', '8 releases per month', 'Label dashboard', 'Artist management', 'Revenue sharing'],
      target: 'label',
      popular: false
    },
    {
      id: 'label-pro',
      name: 'Label Pro',
      icon: Crown,
      color: 'bg-orange-500',
      features: ['Unlimited artists', 'Unlimited releases', 'Advanced tools', 'Custom contracts', 'Priority support'],
      target: 'label',
      popular: true
    }
  ];

  // Mock transactions
  const recentTransactions = [
    { id: 1, type: 'subscription', amount: -29.99, description: 'Artist Pro Monthly', date: '2025-08-15', status: 'completed' },
    { id: 2, type: 'topup', amount: 50.00, description: 'Wallet Top-up via Revolut', date: '2025-08-10', status: 'completed' },
    { id: 3, type: 'refund', amount: 29.99, description: 'Subscription Refund', date: '2025-08-05', status: 'completed' }
  ];

  // Helper functions
  const convertPrice = (gbpPrice) => {
    if (selectedCurrency === 'GBP') return gbpPrice;
    return gbpPrice * (EXCHANGE_RATES[selectedCurrency] || 1);
  };

  const formatPrice = (price, currencyCode = selectedCurrency) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    const highValueCurrencies = ['NGN', 'KES', 'ZMW', 'GHS'];
    
    if (highValueCurrencies.includes(currencyCode)) {
      return `${symbol}${Math.round(price).toLocaleString()}`;
    }
    return `${symbol}${price.toFixed(2)}`;
  };

  const getAvailablePlans = () => {
    if (userRole === 'artist') return PLANS.filter(plan => plan.target === 'artist');
    if (userRole === 'label_admin') return PLANS.filter(plan => plan.target === 'label');
    return PLANS;
  };

  const getPlanPrice = (planId, billing = selectedBilling) => {
    return PLAN_PRICES[planId]?.[billing] || 0;
  };

  // Event handlers
  const handleSubscribe = async (planId) => {
    setIsLoading(true);
    setSelectedPlan(planId);
    
    try {
      const gbpPrice = getPlanPrice(planId);
      const localPrice = convertPrice(gbpPrice);
      
      console.log('=== SUBSCRIPTION ATTEMPT ===');
      console.log('Plan ID:', planId);
      console.log('GBP Price:', gbpPrice);
      console.log('Local Price:', localPrice);
      console.log('Wallet Balance:', walletBalance);
      console.log('Has Enough Funds:', walletBalance >= gbpPrice);

      if (walletBalance >= gbpPrice) {
        // Simulate wallet payment
        console.log('Processing wallet payment...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setPaymentStatus('success');
        console.log('✅ Subscription successful via wallet');
      } else {
        // Need to top up
        const shortfall = gbpPrice - walletBalance;
        setTopUpAmount(Math.ceil(shortfall));
        setShowTopUpModal(true);
        console.log('💳 Need to top up:', shortfall);
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleTopUpAndSubscribe = async () => {
    setIsLoading(true);
    
    try {
      console.log('=== TOP UP & SUBSCRIPTION ===');
      console.log('Top up amount:', topUpAmount);
      console.log('Plan:', selectedPlan);
      
      // Call your actual Revolut API for top-up
      const response = await fetch('/api/revolut/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: topUpAmount,
          currency: 'GBP',
          description: `Top-up for ${PLANS.find(p => p.id === selectedPlan)?.name} subscription`,
          // Add user details from your auth context
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }
      
      const { paymentUrl } = await response.json();
      
      // Store the pending subscription details
      sessionStorage.setItem('pendingSubscription', JSON.stringify({
        planId: selectedPlan,
        billing: selectedBilling,
        amount: topUpAmount
      }));
      
      // Redirect to Revolut payment page
      console.log('Redirecting to Revolut for top-up:', paymentUrl);
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Real Revolut integration not set up yet:', error);
      
      // Fallback simulation for testing UI
      console.log('Using simulation instead...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPaymentStatus('success');
      setShowTopUpModal(false);
      console.log('✅ Simulation: Top-up + Subscription successful');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async (amount = 50) => {
    // Ensure amount is a number, not an event object
    const fundAmount = typeof amount === 'number' ? amount : 50;
    
    console.log('=== ADD FUNDS CLICKED ===');
    console.log('Amount to add:', fundAmount);
    
    try {
      const response = await fetch('/api/revolut/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: fundAmount,
          currency: 'GBP',
          description: 'Wallet Top-up',
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }
      
      const { paymentUrl } = await response.json();
      
      // Redirect to Revolut payment page
      console.log('Redirecting to Revolut:', paymentUrl);
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment creation failed:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  const availablePlans = getAvailablePlans();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="text-gray-600 mt-1">Manage your artist subscription and wallet</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscription'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscription
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wallet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            


            {/* Currency and Billing Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period</label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectedBilling('monthly')}
                      className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                        selectedBilling === 'monthly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedBilling('yearly')}
                      className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all relative ${
                        selectedBilling === 'yearly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Yearly
                      <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-green-500 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        Save 17%
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-green-800 font-medium">Subscription activated successfully!</p>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-red-800 font-medium">Payment failed. Please try again.</p>
                </div>
              </div>
            )}

            {/* Subscription Plans */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {availablePlans.map((plan) => {
                  const gbpPrice = getPlanPrice(plan.id);
                  const localPrice = convertPrice(gbpPrice);
                  const hasEnoughFunds = walletBalance >= gbpPrice;
                  const Icon = plan.icon;

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-xl shadow-sm border-2 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all ${
                        plan.popular ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-blue-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4 sm:mb-6">
                        <div className={`${plan.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          {formatPrice(localPrice)}
                        </div>
                        <div className="text-sm sm:text-base text-gray-600 mb-2">per {selectedBilling}</div>
                        
                        {selectedCurrency !== 'GBP' && (
                          <div className="text-xs sm:text-sm text-gray-500">Base: £{gbpPrice.toFixed(2)}</div>
                        )}

                        <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-2 sm:mt-3 ${
                          hasEnoughFunds ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {hasEnoughFunds ? (
                            <>
                              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Pay from wallet</span>
                              <span className="sm:hidden">Wallet</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Top up £{(gbpPrice - walletBalance).toFixed(2)} needed</span>
                              <span className="sm:hidden">+£{(gbpPrice - walletBalance).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading}
                        className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all flex items-center justify-center text-sm sm:text-base ${
                          plan.popular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        } ${isLoading && selectedPlan === plan.id ? 'opacity-75' : ''}`}
                      >
                        {isLoading && selectedPlan === plan.id ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span>Processing...</span>
                          </>
                        ) : hasEnoughFunds ? (
                          <span>Subscribe Now</span>
                        ) : (
                          <span className="hidden sm:inline">Top Up & Subscribe</span>
                        )}
                        {!hasEnoughFunds && (
                          <span className="sm:hidden">Subscribe</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-purple-100 mb-2 text-sm sm:text-base">Wallet Balance</p>
                  <p className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">£{walletBalance.toFixed(2)}</p>
                  <p className="text-purple-100 text-sm sm:text-base">Add funds to your wallet for subscription payments and other platform services.</p>
                </div>
                <div className="text-center sm:text-right">
                  <button 
                    onClick={() => handleAddFunds(50)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all backdrop-blur-sm w-full sm:w-auto"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Transactions</h2>
              </div>
              <div className="p-4 sm:p-6">
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                            transaction.type === 'subscription' ? 'bg-red-100' :
                            transaction.type === 'topup' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {transaction.type === 'subscription' ? <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" /> :
                             transaction.type === 'topup' ? <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> :
                             <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-semibold text-sm sm:text-base ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 px-4">Your transaction history will appear here once you start using the platform.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Top Up Wallet</h3>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                You need <strong>£{topUpAmount}</strong> to complete this subscription.
                Your current balance is <strong>£{walletBalance.toFixed(2)}</strong>.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top-up amount (GBP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">£</span>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    min={topUpAmount}
                    step="0.01"
                    className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUpAndSubscribe}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Top Up & Subscribe</span>
                    <span className="sm:hidden">Subscribe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;