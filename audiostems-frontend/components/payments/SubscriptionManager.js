import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserRoleSync } from '@/lib/user-utils';
import { Check, Star, Globe, CreditCard, Loader, AlertCircle, CheckCircle, RefreshCw, Crown, Zap } from 'lucide-react';

const SubscriptionManager = ({ user, currentSubscription, onSubscriptionChange }) => {
  // State management
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [selectedBilling, setSelectedBilling] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rateError, setRateError] = useState(false);

  // Get user role to filter plans
  const userRole = getUserRoleSync(user);

  // Global currency support with proper symbols
  const currencies = [
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', flag: '🇿🇲' }
  ];

  // Base prices in GBP (your source of truth)
  const basePrices = {
    'artist_starter': { monthly: 9.99, yearly: 99.99 },
    'artist_pro': { monthly: 29.99, yearly: 299.99 },
    'label_admin_starter': { monthly: 29.99, yearly: 299.99 },
    'label_admin_pro': { monthly: 49.99, yearly: 499.99 }
  };

  // Live exchange rate fetching with error handling
  const fetchExchangeRates = async (isManualRefresh = false) => {
    setRatesLoading(true);
    setRateError(false);
    
    try {
      // Using ExchangeRate-API (free tier: 1,500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate that we have the currencies we need
      const requiredCurrencies = currencies.map(c => c.code);
      const missingCurrencies = requiredCurrencies.filter(code => !data.rates[code]);
      
      if (missingCurrencies.length > 0) {
        console.warn('Missing exchange rates for:', missingCurrencies);
      }
      
      setExchangeRates(data.rates);
      setLastUpdated(new Date());
      
      if (isManualRefresh) {
        setPaymentStatus('rates-updated');
        setTimeout(() => setPaymentStatus(null), 3000);
      }
      
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setRateError(true);
      
      // Comprehensive fallback rates (approximate values as of 2025)
      const fallbackRates = {
        GBP: 1,
        USD: 1.25,
        EUR: 1.15,
        CAD: 1.70,
        NGN: 525.00,
        GHS: 10.50,
        KES: 162.00,
        ZAR: 22.50,
        ZMW: 32.50
      };
      
      setExchangeRates(fallbackRates);
      setLastUpdated(new Date());
      
      if (isManualRefresh) {
        setPaymentStatus('rates-error');
        setTimeout(() => setPaymentStatus(null), 5000);
      }
      
    } finally {
      setRatesLoading(false);
    }
  };

  // Currency conversion with validation
  const convertPrice = (gbpPrice) => {
    if (selectedCurrency === 'GBP') return gbpPrice;
    
    const rate = exchangeRates[selectedCurrency];
    if (!rate) {
      console.warn(`No exchange rate available for ${selectedCurrency}`);
      return gbpPrice; // Fallback to GBP
    }
    
    return gbpPrice * rate;
  };

  // Smart price formatting based on currency characteristics
  const formatPrice = (price) => {
    const convertedPrice = convertPrice(price);
    
    // Handle high-value currencies (typically whole numbers)
    if (['NGN', 'KES', 'ZMW', 'GHS'].includes(selectedCurrency)) {
      return Math.round(convertedPrice).toLocaleString();
    }
    
    // Handle decimal currencies
    return convertedPrice.toFixed(2);
  };

  // Auto-refresh rates every 30 minutes + manual refresh capability
  useEffect(() => {
    fetchExchangeRates();
    
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Plan configuration based on user role
  const getPlansForRole = () => {
    const artistPlans = [
      {
        id: 'artist_starter',
        name: 'Artist Starter',
        description: 'Perfect for new artists getting started',
        features: [
          '5 releases maximum',
          'Basic analytics dashboard',
          'Standard customer support',
          'Basic distribution network'
        ],
        popular: false,
        badge: 'Getting Started',
        icon: <Zap className="w-6 h-6" />,
        color: 'blue'
      },
      {
        id: 'artist_pro',
        name: 'Artist Pro',
        description: 'For serious artists ready to scale',
        features: [
          'Unlimited releases',
          'Advanced analytics & insights',
          'Priority customer support',
          'Premium distribution network',
          'Custom branding options',
          'Revenue optimization tools'
        ],
        popular: true,
        badge: 'Most Popular',
        icon: <Crown className="w-6 h-6" />,
        color: 'purple'
      }
    ];

    const labelPlans = [
      {
        id: 'label_admin_starter',
        name: 'Label Admin Starter',
        description: 'Manage your roster efficiently',
        features: [
          'Manage up to 4 artists',
          '8 releases maximum',
          'Basic analytics dashboard',
          'Standard customer support'
        ],
        popular: false,
        badge: 'Small Labels',
        icon: <Star className="w-6 h-6" />,
        color: 'green'
      },
      {
        id: 'label_admin_pro',
        name: 'Label Admin Pro',
        description: 'Scale your label without limits',
        features: [
          'Unlimited artists',
          'Unlimited releases',
          'Advanced analytics & insights',
          'Priority customer support',
          'Custom branding options',
          'Revenue optimization tools'
        ],
        popular: true,
        badge: 'Best Value',
        icon: <Crown className="w-6 h-6" />,
        color: 'indigo'
      }
    ];

    return userRole === 'artist' ? artistPlans : labelPlans;
  };

  const plans = getPlansForRole();
  const currentCurrency = currencies.find(c => c.code === selectedCurrency);

  // Enhanced savings calculation with currency conversion
  const calculateSavings = (planId) => {
    const monthlyPrice = basePrices[planId].monthly;
    const yearlyPrice = basePrices[planId].yearly;
    
    const monthlyTotal = convertPrice(monthlyPrice) * 12;
    const yearlyTotal = convertPrice(yearlyPrice);
    const savings = monthlyTotal - yearlyTotal;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    
    return { amount: savings, percentage, monthlyTotal, yearlyTotal };
  };

  // Get current subscription details
  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    const planId = currentSubscription.tier;
    const cycle = currentSubscription.billing_cycle || 'monthly';
    return { planId, cycle };
  };

  const isCurrentPlan = (planId) => {
    const current = getCurrentPlan();
    if (!current) return false;
    return current.planId === planId && current.cycle === selectedBilling;
  };

  // Enhanced subscription handler with comprehensive data
  const handleSubscribe = async (plan) => {
    setIsLoading(true);
    setSelectedPlan(plan.id);
    setPaymentStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const subscriptionData = {
        plan_id: `${plan.id}_${selectedBilling}`,
        billing_cycle: selectedBilling,
        currency: selectedCurrency,
        amount: convertPrice(basePrices[plan.id][selectedBilling]),
        customer_data: {
          email: user.email,
          name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim()
        }
      };

      const response = await fetch('/api/payments/revolut/create-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentStatus('success');
        
        // Call the callback to refresh subscription data
        if (onSubscriptionChange) {
          onSubscriptionChange(result.subscription);
        }
        
        setTimeout(() => {
          setPaymentStatus(null);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to update subscription');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      setPaymentStatus('error');
      
      setTimeout(() => {
        setPaymentStatus(null);
      }, 5000);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchExchangeRates(true);
  };

  const getPlanColor = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50',
      green: 'border-green-200 bg-green-50',
      indigo: 'border-indigo-200 bg-indigo-50'
    };
    return colors[color] || colors.blue;
  };

  const getButtonColor = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      green: 'bg-green-600 hover:bg-green-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your {userRole === 'artist' ? 'Artist' : 'Label'} Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Grow your music career with professional distribution tools and analytics
        </p>
      </div>

      {/* Enhanced Status Messages */}
      {paymentStatus === 'success' && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            🎉 Subscription activated successfully! Welcome to MSC & Co.
          </span>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">
            Payment failed. Please try again or contact support at support@mscandco.com
          </span>
        </div>
      )}

      {paymentStatus === 'rates-updated' && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">
            ✅ Exchange rates updated successfully!
          </span>
        </div>
      )}

      {paymentStatus === 'rates-error' && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">
            ⚠️ Using cached exchange rates. Prices may not reflect current rates.
          </span>
        </div>
      )}

      {/* Enhanced Controls Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          
          {/* Enhanced Currency Selector */}
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Currency
                {ratesLoading && <span className="text-xs text-blue-600 ml-2">(Updating rates...)</span>}
                {rateError && <span className="text-xs text-amber-600 ml-2">(Using cached rates)</span>}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  disabled={ratesLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg font-medium disabled:opacity-50 min-w-[280px]"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleManualRefresh}
                  disabled={ratesLoading}
                  className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                  title="Refresh exchange rates"
                >
                  <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {lastUpdated && !ratesLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Rates updated: {lastUpdated.toLocaleTimeString()} 
                  {rateError && <span className="text-amber-600"> (Cached)</span>}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Billing Cycle Toggle */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Billing Cycle
              </label>
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setSelectedBilling('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    selectedBilling === 'monthly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedBilling('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                    selectedBilling === 'yearly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save up to 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {plans.find(p => p.id === currentSubscription.tier)?.icon}
              <div>
                <p className="font-medium text-gray-900">
                  {plans.find(p => p.id === currentSubscription.tier)?.name || currentSubscription.tier}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize font-medium text-green-600">{currentSubscription.status || 'Active'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Billing: <span className="font-medium">{currentSubscription.billing_cycle || 'Monthly'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {plans.map((plan) => {
          const savings = calculateSavings(plan.id);
          const monthlyPrice = basePrices[plan.id].monthly;
          const yearlyPrice = basePrices[plan.id].yearly;
          const price = selectedBilling === 'monthly' ? monthlyPrice : yearlyPrice;
          const isCurrentPlanActive = isCurrentPlan(plan.id);
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 p-8 transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-100' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${isCurrentPlanActive ? 'ring-2 ring-green-100 border-green-500' : ''}`}
            >
              {/* Enhanced Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlanActive && (
                <div className="absolute -top-4 right-8">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    ✅ Active Plan
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {plan.icon}
                  <h3 className="text-2xl font-bold text-gray-900 ml-3">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Enhanced Pricing Display */}
                <div className="mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {ratesLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      `${currentCurrency.symbol}${formatPrice(price)}`
                    )}
                  </div>
                  <div className="text-gray-600">
                    per {selectedBilling === 'monthly' ? 'month' : 'year'}
                    {selectedBilling === 'monthly' && (
                      <div className="text-sm mt-1 text-amber-600">
                        📅 3-month minimum commitment
                      </div>
                    )}
                  </div>
                  
                  {/* Base Price Reference */}
                  {selectedCurrency !== 'GBP' && !ratesLoading && (
                    <div className="text-sm text-gray-500 mt-2">
                      Base price: £{price.toFixed(2)} GBP
                      {exchangeRates[selectedCurrency] && (
                        <span className="ml-2">
                          (Rate: {exchangeRates[selectedCurrency].toFixed(4)})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced Savings Display */}
                  {selectedBilling === 'yearly' && !ratesLoading && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="text-green-700 font-bold text-lg">
                        💰 Save {currentCurrency.symbol}{formatPrice(savings.amount)} ({savings.percentage}%)
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Yearly vs monthly billing • That's {currentCurrency.symbol}{Math.round(savings.amount / 12)} per month saved!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Features List */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Enhanced Action Button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading || isCurrentPlanActive || ratesLoading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  isCurrentPlanActive
                    ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                    : ratesLoading
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : `${getButtonColor(plan.color)} text-white shadow-md hover:shadow-lg`
                } ${isLoading && selectedPlan === plan.id ? 'opacity-75' : ''}`}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : isCurrentPlanActive ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Current Plan
                  </>
                ) : ratesLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Loading Rates...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Get Started Now
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enhanced Trust Indicators */}
      <div className="text-center">
        <div className="inline-flex items-center gap-6 text-sm text-gray-500 bg-white px-8 py-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Secure payments via Revolut
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Live exchange rates
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            GBP base pricing
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            24/7 support
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;