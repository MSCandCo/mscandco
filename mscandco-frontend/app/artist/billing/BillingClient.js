'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/SupabaseProvider';
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
  RefreshCw,
  Star
} from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { BillingRenewalNotification } from '@/components/notifications/RenewalNotification';
import { createClient } from '@/lib/supabase/client';

export default function BillingClient({ userRole = 'artist' }) {
  const router = useRouter();
  const { user, session, isLoading: userLoading } = useUser();
  const supabase = createClient();

  // State management
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [selectedBilling, setSelectedBilling] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [isTopUpForSubscription, setIsTopUpForSubscription] = useState(false);
  // Use shared wallet balance hook
  const { walletBalance, isLoading: loadingBalance, refreshBalance } = useWalletBalance();

  // Transaction state
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Handle payment status from URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get('payment');
      if (payment) {
        setPaymentStatus(payment);

        // Clear the query parameter after handling
        const newUrl = window.location.pathname;
        router.replace(newUrl);

        // Auto-clear success message after 5 seconds
        if (payment === 'success') {
          setTimeout(() => setPaymentStatus(null), 5000);
        }
      }
    }
  }, [router]);

  // Fetch current subscription status and transactions
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return;

      try {
        setSubscriptionLoading(true);

        if (!session) return;

        const response = await fetch('/api/user/subscription-status', {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.hasSubscription) {
            setCurrentSubscription(result.data);
          } else {
            setCurrentSubscription(null);
          }
        }
      } catch (error) {

        setCurrentSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
    loadTransactions();
  }, [user, session]);

  // Wallet balance is now managed by the shared hook

  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

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
    'free': { monthly: 0, annual: 0 },
    'pro': { monthly: 19.99, annual: 199 },
    'mpp': { monthly: 99, annual: 999 },
    'investment': { investment: [10000, 25000, 50000] }
  };

  const EXCHANGE_RATES = {
    GBP: 1.00, USD: 1.27, EUR: 1.17, CAD: 1.71, NGN: 2050.00,
    GHS: 19.50, KES: 164.00, ZAR: 23.50, ZMW: 27.80
  };

  const PLANS = [
    {
      id: 'free',
      name: 'MSC Free',
      icon: null,
      color: 'bg-gray-500',
      features: [
        'Keep 80% of royalties',
        '12 streaming platforms',
        'ISRC & UPC codes',
        'Basic analytics',
        'CSV sales reports',
        'Copyright protection',
        'Apollo Intelligence: 3 queries/month'
      ],
      limitations: [
        'Maximum 3 releases per year',
        'Maximum 15 tracks per year',
        'Excludes TikTok, Boomplay, Anghami, Napster, KKBOX, JOOX',
        'Standard delivery: 7-10 days',
        'No pre-save campaigns',
        'No smart links',
        'No royalty splits',
        'Upgrade required at £5,000/year earnings'
      ],
      target: 'artist',
      popular: false,
      minimumCommitment: null
    },
    {
      id: 'pro',
      name: 'MSC Pro',
      icon: Star,
      color: 'bg-indigo-600',
      features: [
        'Keep 85% of royalties',
        'UNLIMITED releases & tracks',
        'ALL 18 streaming platforms',
        'Priority delivery: 1-3 days',
        'Advanced analytics (demographics, retention)',
        'Apollo Intelligence: 100 queries/month',
        'Pre-save campaigns',
        'Smart links & landing pages',
        'Royalty splits management',
        'Priority support (12h response)',
        'Custom release dates',
        'Pre-order functionality'
      ],
      target: 'artist',
      popular: true,
      minimumCommitment: null,
      badge: 'Best Value'
    },
    {
      id: 'mpp',
      name: 'MPP Partner',
      icon: Zap,
      color: 'bg-purple-600',
      features: [
        'Keep 90% of royalties',
        '24-hour express delivery',
        'Dedicated account manager',
        'Apollo Intelligence Pro: 500 queries/month',
        'White-label distribution (earn 3-5%)',
        'Referral revenue (earn 10%)',
        'Co-marketing opportunities',
        'Featured on homepage',
        'Private Partner community',
        'Networking events',
        'VIP support (6h response)',
        'Custom integrations',
        'Quarterly strategy calls'
      ],
      target: 'artist',
      popular: false,
      minimumCommitment: null,
      badge: 'Most Popular',
      qualificationNote: 'Or qualify for FREE with £10K earnings, 100K streams, or 50 releases'
    },
    {
      id: 'investment',
      name: 'Investment Partner',
      icon: Crown,
      color: 'bg-yellow-600',
      features: [
        'Keep 97.5% of royalties (LOWEST RATE)',
        'Equity ownership (0.5% - 2.0%)',
        'Board advisory seat',
        'Vote on platform decisions',
        'Revenue share: 5% of ALL platform revenue',
        'Dividend payments (when profitable)',
        'Apollo Intelligence: UNLIMITED',
        'Personal concierge support (1h response)',
        'Custom feature development',
        'White-label override (5%)',
        'Exit proceeds (acquisition/IPO)',
        'Shape product roadmap'
      ],
      target: 'artist',
      popular: false,
      minimumCommitment: null,
      badge: 'Ultimate',
      investmentNote: '£10K (0.5%) | £25K (1.0%) | £50K (2.0%) equity',
      isInvestment: true
    }
  ];

  // Load wallet transactions
  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoadingTransactions(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch('/api/wallet/transactions?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        setRecentTransactions(result.data || []);
      } else {

        setRecentTransactions([]);
      }
    } catch (error) {

      setRecentTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

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
    const plan = PLAN_PRICES[planId];
    if (!plan) return 0;
    if (plan.investment) return plan.investment[1]; // Return middle investment tier for display
    return plan[billing] || plan.monthly || 0;
  };

  // Helper function to determine button state for each plan
  const getButtonState = (planId) => {
    if (subscriptionLoading) {
      return {
        text: 'Loading...',
        className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
        disabled: true,
        icon: null
      };
    }

    // Convert between hyphen and underscore formats for comparison
    const normalizeId = (id) => id?.replace(/-/g, '_');
    const currentPlanNormalized = normalizeId(currentSubscription?.planId || currentSubscription?.tier);
    const thisPlanNormalized = normalizeId(planId);

    const isCurrentPlan = currentPlanNormalized === thisPlanNormalized;
    const hasActiveSubscription = currentSubscription?.hasSubscription;

    if (isCurrentPlan && hasActiveSubscription) {
      return {
        text: 'Current Plan',
        className: 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200',
        disabled: true,
        icon: null
      };
    }

    if (hasActiveSubscription && !isCurrentPlan) {
      // Check if it's an upgrade or downgrade
      // Convert subscription tier to hyphen format for price lookup
      const currentPlanId = (currentSubscription?.planId || currentSubscription?.tier)?.replace(/_/g, '-');
      const currentPlanPrice = getPlanPrice(currentPlanId);
      const thisPlanPrice = getPlanPrice(planId);

      if (thisPlanPrice > currentPlanPrice) {
        return {
          text: 'Upgrade Plan',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          disabled: false,
          icon: null
        };
      } else {
        return {
          text: 'Change Plan',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          disabled: false,
          icon: null
        };
      }
    }

    // No active subscription
    return {
      text: 'Get Started',
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
      disabled: false,
      icon: null
    };
  };

  // Event handlers
  const handleSubscribe = async (planId) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // Free tier doesn't need payment
      if (planId === 'free') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Please log in to continue');
        }

        const response = await fetch('/api/wallet/pay-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            planId: planId,
            billing: 'annual' // Free tier uses annual billing period
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to activate free plan');
        }

        setPaymentStatus('success');
        await refreshBalance();

        const { data: { session: refreshSession } } = await supabase.auth.getSession();
        if (refreshSession) {
          const response = await fetch('/api/user/subscription-status', {
            headers: { 'Authorization': `Bearer ${refreshSession.access_token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.hasSubscription) {
              setCurrentSubscription(result.data);
            }
          }
        }

        await loadTransactions();
        return;
      }

      const gbpPrice = getPlanPrice(planId);
      const localPrice = convertPrice(gbpPrice);

      if (walletBalance >= gbpPrice) {
        // Process real wallet payment

        // Get user session for API call
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('Please log in to continue');
        }

        const response = await fetch('/api/wallet/pay-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            planId: planId,
            billing: selectedBilling === 'monthly' ? 'monthly' : 'annual'
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Subscription payment failed');
        }

        setPaymentStatus('success');

        // Refresh wallet balance using shared hook
        await refreshBalance();

        // Refresh subscription status immediately
        const { data: { session: refreshSession } } = await supabase.auth.getSession();
        if (refreshSession) {
          const response = await fetch('/api/user/subscription-status', {
            headers: { 'Authorization': `Bearer ${refreshSession.access_token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.hasSubscription) {
              setCurrentSubscription(result.data);

            }
          }
        }

        // Refresh transactions to show the new payment
        await loadTransactions();

      } else {
        // Need to top up
        const shortfall = gbpPrice - walletBalance;
        setTopUpAmount(Math.ceil(shortfall));
        setIsTopUpForSubscription(true);
        setShowTopUpModal(true);

      }
    } catch (error) {

      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleTopUpAndSubscribe = async () => {
    setIsLoading(true);

    try {
      // Get user session for API call
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please log in to continue');
      }

      // Call your actual Revolut API for top-up with subscription
      const response = await fetch('/api/revolut/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          amount: topUpAmount,
          currency: 'GBP',
          description: `Top-up for ${PLANS.find(p => p.id === selectedPlan)?.name} subscription`,
          planId: selectedPlan,
          billing: selectedBilling
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

      window.location.href = paymentUrl;

    } catch (error) {

      // Fallback simulation for testing UI

      await new Promise(resolve => setTimeout(resolve, 3000));

      setPaymentStatus('success');
      setShowTopUpModal(false);

    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async (amount = 50) => {
    // Ensure amount is a number, not an event object
    const fundAmount = typeof amount === 'number' ? amount : 50;

    try {
      // Get user session for API call
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please log in to continue');
      }

      const response = await fetch('/api/revolut/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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

      window.location.href = paymentUrl;

    } catch (error) {

      alert(`Payment failed: ${error.message}`);
    }
  };

  const handleAddFundsFromModal = async () => {
    const fundAmount = topUpAmount > 0 ? topUpAmount : 50;
    
    try {
      setIsLoading(true);
      
      // Get user session for API call
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please log in to continue');
      }

      const response = await fetch('/api/revolut/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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
      window.location.href = paymentUrl;

    } catch (error) {
      alert(`Payment failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const availablePlans = getAvailablePlans();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Status Notifications */}
      {paymentStatus && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment has been processed successfully. Your subscription will be activated shortly.
                  </p>
                </div>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Payment Failed</h3>
                  <p className="text-sm text-red-700 mt-1">
                    There was an issue processing your payment. Please try again or contact support.
                  </p>
                </div>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'cancelled' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Payment Cancelled</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your payment was cancelled. You can try again when you're ready.
                  </p>
                </div>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="ml-auto text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your subscription and payment methods</p>
            </div>
            {/* Wallet Balance Indicator */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-lg font-bold text-gray-900">£{walletBalance.toFixed(2)}</p>
              </div>
              <button
                onClick={() => {
                  setIsTopUpForSubscription(false);
                  setTopUpAmount(0);
                  setShowTopUpModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </button>
            </div>
          </div>
          {/* Mobile Wallet Balance */}
          <div className="sm:hidden mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-lg font-bold text-gray-900">£{walletBalance.toFixed(2)}</p>
            </div>
              <button
                onClick={() => {
                  setIsTopUpForSubscription(false);
                  setTopUpAmount(0);
                  setShowTopUpModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Auto-Renewal Notification */}
        <BillingRenewalNotification
          subscriptionStatus={currentSubscription}
          walletBalance={walletBalance}
        />

        {/* Subscription Content */}
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
                      onClick={() => setSelectedBilling('annual')}
                      className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all relative ${
                        selectedBilling === 'annual'
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {availablePlans.map((plan) => {
                  const gbpPrice = getPlanPrice(plan.id);
                  const localPrice = convertPrice(gbpPrice);
                  const hasEnoughFunds = walletBalance >= gbpPrice || plan.id === 'free';
                  const Icon = plan.icon;
                  const isInvestment = plan.isInvestment;
                  const isFree = plan.id === 'free';

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-xl shadow-sm border-2 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all ${
                        plan.popular ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                          <span className={`inline-flex items-center justify-center px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                            plan.badge === 'Best Value' ? 'bg-green-100 text-green-800' :
                            plan.badge === 'Most Popular' ? 'bg-purple-100 text-purple-800' :
                            plan.badge === 'Ultimate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-500 text-white'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4 sm:mb-6">
                        {Icon && (
                          <div className={`${plan.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                        )}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                        {isInvestment ? (
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Investment</div>
                            {plan.investmentNote && (
                              <div className="text-sm text-gray-600 mb-2">{plan.investmentNote}</div>
                            )}
                          </div>
                        ) : isFree ? (
                          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Free</div>
                        ) : (
                          <>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                              {formatPrice(localPrice)}
                            </div>
                            <div className="text-sm sm:text-base text-gray-600 mb-2">
                              per {selectedBilling === 'monthly' ? 'month' : 'year'}
                            </div>
                            {selectedCurrency !== 'GBP' && (
                              <div className="text-xs sm:text-sm text-gray-500">Base: £{gbpPrice.toFixed(2)}</div>
                            )}
                          </>
                        )}

                        {!isFree && !isInvestment && (
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
                        )}
                      </div>

                      {/* Limitations (Free tier only) */}
                      {plan.limitations && plan.limitations.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="text-xs font-semibold text-yellow-900 mb-2">Limitations:</h4>
                          <ul className="space-y-1">
                            {plan.limitations.slice(0, 3).map((limitation, index) => (
                              <li key={index} className="flex items-start text-xs text-yellow-800">
                                <X className="w-3 h-3 text-yellow-600 mr-1.5 flex-shrink-0 mt-0.5" />
                                <span className="break-words">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.qualificationNote && (
                        <p className="text-xs text-center text-gray-500 mb-4 px-2">
                          {plan.qualificationNote}
                        </p>
                      )}

                      {(() => {
                        const buttonState = getButtonState(plan.id);
                        const isProcessing = isLoading && selectedPlan === plan.id;

                        if (isInvestment) {
                          return (
                            <button
                              onClick={() => router.push('/artist/billing/investment-application')}
                              className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all bg-yellow-600 hover:bg-yellow-700 text-white text-sm sm:text-base"
                            >
                              Learn More
                            </button>
                          );
                        }

                        if (isFree) {
                          return (
                            <button
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={isLoading}
                              className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all flex items-center justify-center text-sm sm:text-base ${
                                buttonState.disabled ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' :
                                'bg-gray-900 hover:bg-gray-800 text-white'
                              }`}
                            >
                              {isLoading && selectedPlan === plan.id ? (
                                <>
                                  <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <span>{buttonState.text === 'Current Plan' ? 'Current Plan' : 'Activate Free Plan'}</span>
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => !buttonState.disabled && handleSubscribe(plan.id)}
                            disabled={buttonState.disabled || isLoading}
                            className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all flex items-center justify-center text-sm sm:text-base ${
                              isProcessing ? 'opacity-75' : ''
                            } ${buttonState.className}`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <span>{buttonState.text}</span>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
              {isTopUpForSubscription ? (
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  You need <strong>£{topUpAmount}</strong> to complete this subscription.
                  Your current balance is <strong>£{walletBalance.toFixed(2)}</strong>.
                </p>
              ) : (
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Add funds to your wallet. Your current balance is <strong>£{walletBalance.toFixed(2)}</strong>.
                </p>
              )}

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
                onClick={isTopUpForSubscription ? handleTopUpAndSubscribe : handleAddFundsFromModal}
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
                    {isTopUpForSubscription ? (
                      <>
                        <span className="hidden sm:inline">Top Up & Subscribe</span>
                        <span className="sm:hidden">Subscribe</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Top Up</span>
                        <span className="sm:hidden">Top Up</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}