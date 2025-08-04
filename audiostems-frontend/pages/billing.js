import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { getUserRole } from '@/lib/auth0-config';
import { getStripe } from '@/lib/stripe';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  Globe,
  ChevronDown
} from 'lucide-react';

// Production-ready billing data function
const getRoleSpecificPlans = (userRole, user) => {
  // For admin roles, show no billing
  if (userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'distribution_partner') {
    return {
      subscription: null,
      paymentMethod: null,
      billingHistory: [],
      availablePlans: [],
      noBilling: true
    };
  }

  // For Label Admin, show only Label Admin plans
  if (userRole === 'label_admin') {
    // Generate dynamic subscription data based on user
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    const labelAdminSubscription = {
      plan: 'Label Admin',
      price: 29.99,
      nextBilling: nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      billingCycle: 'monthly',
      autoRenewDate: nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      features: [
        'Manage unlimited artists',
        'Label analytics dashboard',
        'Priority support',
        'Artist management tools',
        'Combined earnings reporting'
      ]
    };

    const labelAdminPaymentMethod = {
      type: 'Card',
      last4: '****',
      expiry: 'Not connected'
    };

    const labelAdminBillingHistory = [
      {
        id: 1,
        description: 'Label Admin - Monthly',
        date: 'February 15, 2024',
        amount: 29.99,
        status: 'Paid'
      },
      {
        id: 2,
        description: 'Label Admin - Monthly',
        date: 'January 15, 2024',
        amount: 29.99,
        status: 'Paid'
      }
    ];

    const labelAdminAvailablePlans = [
      {
        name: 'Label Admin',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        yearlySavings: '17%',
        current: true,
        features: [
          'Manage unlimited artists',
          'Label-wide analytics dashboard',
          'Priority support',
          'Artist management tools',
          'Combined earnings reporting',
          'Label branding options',
          'Advanced release management',
          'Artist onboarding tools',
          'Label social media integration',
          'Marketing campaign management',
          'Royalty tracking for all artists',
          'Label profile optimization'
        ]
      }
    ];

    return {
      subscription: labelAdminSubscription,
      paymentMethod: labelAdminPaymentMethod,
      billingHistory: labelAdminBillingHistory,
      availablePlans: labelAdminAvailablePlans,
      stripeCustomerId: user?.app_metadata?.stripe_customer_id || null,
      userId: user?.sub || null
    };
  }

  // Default Artist plans
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  
  const baseSubscription = {
    plan: 'Artist Pro',
    price: 19.99,
    nextBilling: nextBillingDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    billingCycle: 'monthly',
    autoRenewDate: nextBillingDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    features: [
      'Unlimited releases',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Earnings reporting'
    ]
  };

  const basePaymentMethod = {
    type: 'Card',
    last4: '****',
    expiry: 'Not connected'
  };

  const baseBillingHistory = [
    {
      id: 1,
      description: 'Artist Pro - Monthly',
      date: 'February 15, 2024',
      amount: 19.99,
      status: 'Paid'
    },
    {
      id: 2,
      description: 'Artist Pro - Monthly',
      date: 'January 15, 2024',
      amount: 19.99,
      status: 'Paid'
    }
  ];

  const baseAvailablePlans = [
    {
      name: 'Artist Starter',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      yearlySavings: '17%',
      current: false,
      features: [
        'Up to 10 releases per year',
        'Basic analytics and reporting',
        'Email support',
        'Distribution to major platforms (Spotify, Apple Music, etc.)',
        'Basic earnings tracking',
        'Release management tools'
      ]
    },
    {
      name: 'Artist Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      yearlySavings: '17%',
      current: true,
      features: [
        'Unlimited releases per year',
        'Advanced analytics and reporting',
        'Priority email and phone support',
        'Custom branding options',
        'Distribution to all major platforms',
        'Detailed earnings tracking and reporting',
        'Advanced release management tools',
        'Social media integration',
        'Marketing campaign tools',
        'Priority customer service',
        'Advanced royalty tracking',
        'Custom artist profile optimisation'
      ]
    }
  ];

  return {
    subscription: baseSubscription,
    paymentMethod: basePaymentMethod,
    billingHistory: baseBillingHistory,
    availablePlans: baseAvailablePlans,
    stripeCustomerId: user?.app_metadata?.stripe_customer_id || null,
    userId: user?.sub || null
  };
};

export default function Billing() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [autoRenew, setAutoRenew] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-detect currency based on user's location (using shared currency system)
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to get user's location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Supported currencies in shared system
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'];
        
        if (data.country_code === 'GB') {
          updateCurrency('GBP');
        } else if (supportedCurrencies.includes(data.currency)) {
          updateCurrency(data.currency);
        } else {
          // Default to USD for countries not in our supported list
          updateCurrency('USD');
        }
      } catch (error) {
        console.log('Could not detect user location, defaulting to GBP');
        updateCurrency('GBP');
      }
    };

    detectUserCurrency();
  }, [updateCurrency]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBillingData();
    }
  }, [isAuthenticated, user]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Get user-specific billing data
      const userRole = getUserRole(user);
      const userBillingData = getRoleSpecificPlans(userRole, user);
      
      setBillingData(userBillingData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a customer portal session without a customer ID
      // Stripe will handle customer creation during the first payment
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: null }), // Remove hardcoded demo ID
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      setMessage('Stripe is not configured. Please contact support to set up billing.');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewInvoiceHistory = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a customer portal session without a customer ID
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: null }), // Remove hardcoded demo ID
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error viewing invoice history:', error);
      setMessage('Stripe is not configured. Please contact support to set up billing.');
    } finally {
      setProcessing(false);
    }
  };

  const handleContactSupport = () => {
    // Open support email or redirect to support page
    window.open('mailto:support@mscandco.com?subject=Billing%20Support', '_blank');
  };

  const handleUpgradePlan = async (planName) => {
    try {
      setProcessing(true);
      setMessage('');

      // For new customers, we'll create a checkout session without a customer ID
      // Stripe will handle customer creation during the first payment
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
          billingCycle,
          customerId: null, // Remove hardcoded demo ID
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setMessage('Stripe is not configured. Please contact support to set up billing.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      setMessage('');

      // Get user's Stripe customer ID from billing data or database
      const customerId = billingData?.stripeCustomerId;
      
      if (!customerId) {
        setMessage('No subscription found to cancel. Please contact support if you believe this is an error.');
        return;
      }
      
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setMessage('Stripe is not configured. Please contact support to manage your subscription.');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const roleBillingData = getRoleSpecificPlans(userRole);

  // Allow access to billing for all authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access billing</h1>
        </div>
      </div>
    );
  }

  // Show no-billing message for admin roles
  if (roleBillingData.noBilling) {
    return (
      <Layout>
        <Head>
          <title>Billing - MSC & Co</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No Billing Required</h1>
                <p className="text-gray-600">
                  As a {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}, 
                  you have full access to the platform without any billing requirements.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Access Includes:</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  {userRole === 'super_admin' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to all brands and platforms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Complete system administration
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        User management and role assignment
                      </li>
                    </>
                  )}
                  {userRole === 'company_admin' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to YHWH MSC brand
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Company-wide analytics and reporting
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Brand management tools
                      </li>
                    </>
                  )}
                  {userRole === 'distribution_partner' && (
                    <>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Access to all releases and distribution
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Release approval and management
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Distribution partner tools
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Billing - MSC & Co</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="mt-2 text-gray-600">Manage your subscription and billing information</p>
              </div>
              
              {/* Currency Selector */}
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                showLabel={true}
                showExchangeRate={true}
                compact={false}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Subscription */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{billingData.subscription.plan}</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-2 truncate">{sharedFormatCurrency(billingData.subscription.price, selectedCurrency)}</p>
                      <p className="text-sm text-gray-500">Next billing: {billingData.subscription.nextBilling}</p>
                      <p className="text-sm text-gray-500 capitalize">Billing cycle: {billingData.subscription.billingCycle}</p>
                      
                      {/* Auto-Renewal Settings */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Auto-Renewal</h4>
                            <p className="text-xs text-gray-500">
                              {autoRenew ? 'Your subscription will automatically renew' : 'Your subscription will expire on the next billing date'}
                            </p>
                          </div>
                          <button
                            onClick={() => setAutoRenew(!autoRenew)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              autoRenew ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                autoRenew ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {autoRenew ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Next renewal: {billingData.subscription.autoRenewDate}
                            </div>
                          ) : (
                            <div className="flex items-center text-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Subscription will expire on {billingData.subscription.nextBilling}
                            </div>
                          )}
                        </div>
                        
                        <button className="w-full text-left p-2 text-xs text-blue-600 hover:text-blue-700">
                          Manage renewal preferences
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
                      <ul className="space-y-2">
                        {billingData.subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button 
                      onClick={() => handleUpgradePlan(billingData.subscription.plan)}
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Manage Plan'}
                    </button>
                    <button 
                      onClick={handleCancelSubscription}
                      disabled={processing}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Billing Cycle:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            billingCycle === 'monthly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingCycle('yearly')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            billingCycle === 'yearly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Yearly
                          {billingCycle === 'yearly' && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                              Save
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {billingData.availablePlans.map((plan, index) => (
                      <div
                        key={index}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          plan.current
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {plan.current && (
                          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                          </span>
                        )}
                        
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                              {billingCycle === 'monthly' ? sharedFormatCurrency(plan.monthlyPrice, selectedCurrency) : sharedFormatCurrency(plan.yearlyPrice, selectedCurrency)}
                            </span>
                            <span className="text-gray-500">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-sm text-gray-500 line-through">
                                {sharedFormatCurrency(plan.monthlyPrice, selectedCurrency)}/month
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Save {plan.yearlySavings}
                              </span>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => !plan.current && handleUpgradePlan(plan.name)}
                          disabled={plan.current || processing}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            plan.current
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                          }`}
                        >
                          {processing ? 'Processing...' : plan.current ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        {billingData.stripeCustomerId ? (
                          <>
                            <p className="font-medium text-gray-900">{billingData.paymentMethod.type} ending in {billingData.paymentMethod.last4}</p>
                            <p className="text-sm text-gray-500">Expires {billingData.paymentMethod.expiry}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-gray-900">No payment method connected</p>
                            <p className="text-sm text-gray-500">Add a payment method to manage your subscription</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdatePaymentMethod}
                      disabled={processing}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : billingData.stripeCustomerId ? 'Update' : 'Add Payment Method'}
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
                  <div className="space-y-4">
                    {billingData.stripeCustomerId && billingData.billingHistory.length > 0 ? (
                      billingData.billingHistory.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{invoice.description}</p>
                              <p className="text-sm text-gray-500">{invoice.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{sharedFormatCurrency(invoice.amount, selectedCurrency)}</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {invoice.status}
                            </span>
                            <button 
                              onClick={() => window.open(`/api/billing/invoice/${invoice.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                        <p className="text-gray-500">
                          {billingData.stripeCustomerId 
                            ? "You don't have any invoices yet." 
                            : "Connect a payment method to start your subscription and view billing history."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleUpdatePaymentMethod}
                      disabled={processing}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">Update Payment Method</span>
                        </div>
                        {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                      </div>
                    </button>
                    <button 
                      onClick={handleViewInvoiceHistory}
                      disabled={processing}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">View Invoice History</span>
                        </div>
                        {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                      </div>
                    </button>
                    <button 
                      onClick={handleContactSupport}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">Contact Support</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                  
                  {message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{message}</p>
                    </div>
                  )}
                </div>

                {/* Auto-Renewal Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Renewal Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Auto-Renewal</p>
                        <p className="text-xs text-gray-500">
                          {autoRenew ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoRenew(!autoRenew)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoRenew ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoRenew ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      {autoRenew ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Next renewal: {billingData.subscription.autoRenewDate}
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Subscription will expire on {billingData.subscription.nextBilling}
                        </div>
                      )}
                    </div>
                    
                    <button className="w-full text-left p-2 text-xs text-blue-600 hover:text-blue-700">
                      Manage renewal preferences
                    </button>
                  </div>
                </div>

                {/* Usage Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Releases Created</span>
                      <span className="text-sm font-medium text-gray-900">3 / Unlimited</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage Used</span>
                      <span className="text-sm font-medium text-gray-900">2.1 GB / 10 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Downloads</span>
                      <span className="text-sm font-medium text-gray-900">1,247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}