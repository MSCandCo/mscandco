import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { getUserRole } from '@/lib/auth0-config';
import { getStripe } from '@/lib/stripe';
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

// Currency configuration
const currencies = [
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1.0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.27 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1.17 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.72 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.95 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 185.0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 1.10 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 13.2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 13.5 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 8.8 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', rate: 5.1 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 29.8 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 450.0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', rate: 5.9 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', rate: 2.3 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', rate: 8.7 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 115.0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 40.5 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 6.3 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 21.8 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', rate: 1080.0 },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', rate: 1200.0 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', rate: 5000.0 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', rate: 4.7 },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', rate: 50.0 },
  { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs', rate: 35.0 },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', rate: 8.8 },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', rate: 9200.0 },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', rate: 110.0 },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', rate: 13.5 },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', rate: 4.4 },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', rate: 2.2 },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', rate: 3.4 },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', rate: 520.0 },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', rate: 3.2 },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', rate: 22.5 },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', rate: 120.0 },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', rate: 61.0 },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', rate: 137.0 },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', rate: 2.3 },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', rate: 3500.0 },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', rate: 580.0 },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', rate: 5200.0 },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', rate: 26000.0 },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', rate: 2700.0 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 140.0 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', rate: 160.0 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', rate: 350.0 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', rate: 400.0 },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', rate: 19.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 105.0 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 20000.0 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 45.0 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 6.0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.7 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 70.0 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 31000.0 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1700.0 },
  { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', rate: 40.0 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 9.9 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 9.2 },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', rate: 3.9 },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', rate: 170.0 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م', rate: 12.8 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 40.0 },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', rate: 6.1 },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س', rate: 600.0 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rate: 70.0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 200.0 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 3200.0 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 4800.0 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1600.0 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 15.0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 24.0 },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', rate: 24.0 },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', rate: 17.0 },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', rate: 30.0 },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', rate: 2100.0 },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', rate: 500.0 },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', rate: 1000.0 },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', rate: 80.0 },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', rate: 130.0 },
  { code: 'STD', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', rate: 28000.0 },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 80.0 },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', rate: 11000.0 },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', rate: 25000.0 },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', rate: 200.0 },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', rate: 25000.0 },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', rate: 1.0 },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', rate: 1.0 },
  { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', rate: 1.0 },
  { code: 'JEP', name: 'Jersey Pound', symbol: '£', rate: 1.0 },
  { code: 'GGP', name: 'Guernsey Pound', symbol: '£', rate: 1.0 },
  { code: 'IMP', name: 'Isle of Man Pound', symbol: '£', rate: 1.0 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1.0 }
];

// Mock billing data function
const getRoleSpecificPlans = (userRole) => {
  const baseSubscription = {
    plan: 'Artist Pro',
    price: '£19.99',
    nextBilling: 'March 15, 2024',
    billingCycle: 'monthly',
    autoRenewDate: 'March 15, 2024',
    features: [
      'Unlimited releases',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Earnings reporting'
    ]
  };

  const basePaymentMethod = {
    type: 'Visa',
    last4: '4242',
    expiry: '12/25'
  };

  const baseBillingHistory = [
    {
      id: 1,
      description: 'Artist Pro - Monthly',
      date: 'February 15, 2024',
      amount: '£19.99',
      status: 'Paid'
    },
    {
      id: 2,
      description: 'Artist Pro - Monthly',
      date: 'January 15, 2024',
      amount: '£19.99',
      status: 'Paid'
    }
  ];

  const baseAvailablePlans = [
    {
      name: 'Artist Starter',
      monthlyPrice: '£9.99',
      yearlyPrice: '£99.99',
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
      monthlyPrice: '£19.99',
      yearlyPrice: '£199.99',
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
    availablePlans: baseAvailablePlans
  };
};

export default function Billing() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyDropdownRef = useRef(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-detect currency based on user's location
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to get user's location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code === 'GB') {
          setSelectedCurrency('GBP');
        } else {
          // Check if the country's currency is in our list
          const countryCurrency = data.currency;
          const hasCurrency = currencies.find(c => c.code === countryCurrency);
          
          if (hasCurrency) {
            setSelectedCurrency(countryCurrency);
          } else {
            // Default to USD for countries not in our list
            setSelectedCurrency('USD');
          }
        }
      } catch (error) {
        console.log('Could not detect user location, defaulting to GBP');
        setSelectedCurrency('GBP');
      }
    };

    detectUserCurrency();
  }, []);

  // Currency helper functions
  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  const convertCurrency = (amount, fromCurrency = 'GBP', toCurrency = selectedCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    
    return (amount * toRate) / fromRate;
  };

  const formatCurrency = (amount, currency = selectedCurrency) => {
    const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
    const convertedAmount = convertCurrency(parseFloat(amount.replace(/[^0-9.-]+/g, '')), 'GBP', currency);
    
    return `${currencyInfo.symbol}${convertedAmount.toFixed(2)}`;
  };

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);
    setShowCurrencyDropdown(false);
  };

  // Close dropdown when clicking outside
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

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBillingData();
    }
  }, [isAuthenticated, user]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use mock data
      // In production, you would fetch real billing data from your API
      const userRole = getUserRole(user);
      const mockBillingData = getRoleSpecificPlans(userRole);
      
      setBillingData(mockBillingData);
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

      // In production, you would get the customer ID from your database
      const customerId = 'cus_demo123'; // Replace with actual customer ID
      
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        setMessage('Error creating portal session');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setMessage('Error canceling subscription');
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

  return (
    <>
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
                      <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(billingData.subscription.price)}</p>
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
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade Plan
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel Subscription
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
                                          {billingCycle === 'monthly' ? formatCurrency(plan.monthlyPrice) : formatCurrency(plan.yearlyPrice)}
                                        </span>
                                        <span className="text-gray-500">
                                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                                        </span>
                                      </div>
                                      {billingCycle === 'yearly' && (
                                        <div className="flex items-center justify-center space-x-2">
                                          <span className="text-sm text-gray-500 line-through">
                                            {formatCurrency(plan.monthlyPrice)}/month
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
                                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                        plan.current
                                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                      disabled={plan.current}
                                    >
                                      {plan.current ? 'Current Plan' : 'Select Plan'}
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
                        <p className="font-medium text-gray-900">{billingData.paymentMethod.type} ending in {billingData.paymentMethod.last4}</p>
                        <p className="text-sm text-gray-500">Expires {billingData.paymentMethod.expiry}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
                  <div className="space-y-4">
                    {billingData.billingHistory.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{invoice.description}</p>
                            <p className="text-sm text-gray-500">{invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invoice.status}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
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
    </>
  );
}