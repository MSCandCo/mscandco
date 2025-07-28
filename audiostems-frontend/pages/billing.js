import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getUserRole } from '@/lib/auth0-config';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';

export default function Billing() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = getUserRole(user);
      
      // Role-specific billing data
      const getRoleSpecificPlans = (role) => {
        switch (role) {
          case 'artist':
            return {
              subscription: {
                status: 'active',
                plan: 'Artist Pro',
                price: '$29.99/month',
                nextBilling: '2024-02-15',
                billingCycle: 'monthly',
                autoRenew: true,
                autoRenewDate: '2024-02-15',
                features: [
                  'Unlimited Releases',
                  'Advanced Analytics',
                  'Priority Support',
                  'Custom Branding'
                ]
              },
              availablePlans: [
                {
                  name: 'Artist Starter',
                  monthlyPrice: '$9.99',
                  yearlyPrice: '$99.99',
                  yearlySavings: '$19.89',
                  features: [
                    'Up to 10 Releases',
                    'Basic Analytics',
                    'Email Support',
                    'Standard Branding'
                  ]
                },
                {
                  name: 'Artist Pro',
                  monthlyPrice: '$29.99',
                  yearlyPrice: '$299.99',
                  yearlySavings: '$59.89',
                  features: [
                    'Unlimited Releases',
                    'Advanced Analytics',
                    'Priority Support',
                    'Custom Branding'
                  ],
                  current: true
                }
              ]
            };

          case 'company_admin':
            return {
              subscription: {
                status: 'active',
                plan: 'Label Management',
                price: '$199.99/month',
                nextBilling: '2024-02-15',
                billingCycle: 'monthly',
                autoRenew: true,
                autoRenewDate: '2024-02-15',
                features: [
                  'Unlimited Artists',
                  'Label Analytics',
                  'Artist Management',
                  'Content Oversight',
                  'Advanced Reporting'
                ]
              },
              availablePlans: [
                {
                  name: 'Label Basic',
                  monthlyPrice: '$99.99',
                  yearlyPrice: '$999.99',
                  yearlySavings: '$199.89',
                  features: [
                    'Up to 10 Artists',
                    'Basic Label Analytics',
                    'Email Support',
                    'Standard Reporting'
                  ]
                },
                {
                  name: 'Label Management',
                  monthlyPrice: '$199.99',
                  yearlyPrice: '$1,999.99',
                  yearlySavings: '$399.89',
                  features: [
                    'Unlimited Artists',
                    'Label Analytics',
                    'Artist Management',
                    'Content Oversight',
                    'Advanced Reporting'
                  ],
                  current: true
                },
                {
                  name: 'Label Enterprise',
                  monthlyPrice: '$499.99',
                  yearlyPrice: '$4,999.99',
                  yearlySavings: '$999.89',
                  features: [
                    'Unlimited Artists',
                    'Advanced Label Analytics',
                    'Priority Support',
                    'White-label Options',
                    'API Access',
                    'Dedicated Account Manager',
                    'Custom Integrations'
                  ]
                }
              ]
            };

          case 'super_admin':
            return {
              subscription: {
                status: 'active',
                plan: 'Platform Enterprise',
                price: '$999.99/month',
                nextBilling: '2024-02-15',
                billingCycle: 'monthly',
                autoRenew: true,
                autoRenewDate: '2024-02-15',
                features: [
                  'Multi-Brand Management',
                  'Platform Analytics',
                  'User Management',
                  'System Administration',
                  'Custom Branding',
                  'API Access',
                  'Dedicated Support'
                ]
              },
              availablePlans: [
                {
                  name: 'Platform Basic',
                  monthlyPrice: '$499.99',
                  yearlyPrice: '$4,999.99',
                  yearlySavings: '$999.89',
                  features: [
                    'Single Brand Management',
                    'Basic Platform Analytics',
                    'Email Support',
                    'Standard Administration'
                  ]
                },
                {
                  name: 'Platform Enterprise',
                  monthlyPrice: '$999.99',
                  yearlyPrice: '$9,999.99',
                  yearlySavings: '$1,999.89',
                  features: [
                    'Multi-Brand Management',
                    'Platform Analytics',
                    'User Management',
                    'System Administration',
                    'Custom Branding',
                    'API Access',
                    'Dedicated Support'
                  ],
                  current: true
                },
                {
                  name: 'Platform Ultimate',
                  monthlyPrice: '$1,999.99',
                  yearlyPrice: '$19,999.99',
                  yearlySavings: '$3,999.89',
                  features: [
                    'Unlimited Brands',
                    'Advanced Platform Analytics',
                    'Priority Support',
                    'White-label Options',
                    'Full API Access',
                    'Dedicated Account Manager',
                    'Custom Integrations',
                    'On-premise Options'
                  ]
                }
              ]
            };

          case 'distribution_partner':
            return {
              subscription: {
                status: 'active',
                plan: 'Partner Pro',
                price: '$149.99/month',
                nextBilling: '2024-02-15',
                billingCycle: 'monthly',
                autoRenew: true,
                autoRenewDate: '2024-02-15',
                features: [
                  'Distribution Analytics',
                  'Content Management',
                  'Partner Reporting',
                  'API Access',
                  'Priority Support'
                ]
              },
              availablePlans: [
                {
                  name: 'Partner Basic',
                  monthlyPrice: '$79.99',
                  yearlyPrice: '$799.99',
                  yearlySavings: '$159.89',
                  features: [
                    'Basic Distribution Analytics',
                    'Content Management',
                    'Email Support',
                    'Standard Reporting'
                  ]
                },
                {
                  name: 'Partner Pro',
                  monthlyPrice: '$149.99',
                  yearlyPrice: '$1,499.99',
                  yearlySavings: '$299.89',
                  features: [
                    'Distribution Analytics',
                    'Content Management',
                    'Partner Reporting',
                    'API Access',
                    'Priority Support'
                  ],
                  current: true
                },
                {
                  name: 'Partner Enterprise',
                  monthlyPrice: '$299.99',
                  yearlyPrice: '$2,999.99',
                  yearlySavings: '$599.89',
                  features: [
                    'Advanced Distribution Analytics',
                    'Full Content Management',
                    'Custom Reporting',
                    'Full API Access',
                    'Dedicated Support',
                    'White-label Options',
                    'Custom Integrations'
                  ]
                }
              ]
            };

          default:
            return {
              subscription: {
                status: 'active',
                plan: 'Basic Plan',
                price: '$9.99/month',
                nextBilling: '2024-02-15',
                billingCycle: 'monthly',
                autoRenew: true,
                autoRenewDate: '2024-02-15',
                features: [
                  'Basic Features',
                  'Email Support'
                ]
              },
              availablePlans: [
                {
                  name: 'Basic Plan',
                  monthlyPrice: '$9.99',
                  yearlyPrice: '$99.99',
                  yearlySavings: '$19.89',
                  features: [
                    'Basic Features',
                    'Email Support'
                  ],
                  current: true
                }
              ]
            };
        }
      };

      const roleData = getRoleSpecificPlans(userRole);
      
      // Mock billing data - replace with actual API call
      setBillingData({
        ...roleData,
        paymentMethod: {
          type: 'Visa',
          last4: '4242',
          expiry: '12/25'
        },
        billingHistory: [
          {
            id: 'inv_001',
            date: '2024-01-15',
            amount: roleData.subscription.price,
            status: 'paid',
            description: `${roleData.subscription.plan} - January 2024`
          },
          {
            id: 'inv_002',
            date: '2023-12-15',
            amount: roleData.subscription.price,
            status: 'paid',
            description: `${roleData.subscription.plan} - December 2023`
          }
        ]
      });
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="mt-2 text-gray-600">Manage your subscription and billing information</p>
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
                      <p className="text-3xl font-bold text-gray-900 mb-2">{billingData.subscription.price}</p>
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
                                          {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                        </span>
                                        <span className="text-gray-500">
                                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                                        </span>
                                      </div>
                                      {billingCycle === 'yearly' && (
                                        <div className="flex items-center justify-center space-x-2">
                                          <span className="text-sm text-gray-500 line-through">
                                            {plan.monthlyPrice}/month
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
                          <span className="font-medium text-gray-900">{invoice.amount}</span>
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
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Update Payment Method</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">View Invoice History</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Contact Support</span>
                      </div>
                    </button>
                  </div>
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