// 🎯 Comprehensive Subscription Management Component
// Handles active subscription details, payment methods, and billing history

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'flowbite-react';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Settings,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
  Users,
  Music,
  BarChart3,
  Headphones
} from 'lucide-react';
import { formatCurrency } from '@/components/shared/CurrencySelector';

export default function SubscriptionManager({ 
  subscription, 
  paymentMethod, 
  billingHistory,
  userRole,
  selectedCurrency,
  onUpgrade,
  onUpdatePayment,
  onViewInvoices,
  onCancelSubscription,
  processing 
}) {
  const [autoRenew, setAutoRenew] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get plan features based on subscription
  const getPlanFeatures = (planName) => {
    const features = {
      'Artist Starter': [
        'Upload up to 50 tracks',
        'Basic analytics dashboard',
        'Standard music distribution',
        'Email support',
        'Basic stem extraction',
        'Download history tracking'
      ],
      'Artist Pro': [
        'Unlimited track uploads',
        'Advanced analytics & insights',
        'Priority music distribution',
        'Priority support + phone',
        'AI-powered stem extraction',
        'Advanced collaboration tools',
        'Custom branding options',
        'Revenue optimization tools'
      ],
      'Label Admin Starter': [
        'Manage up to 100 artists',
        'Basic label analytics',
        'Standard distribution network',
        'Email support',
        'Basic revenue tracking',
        'Artist performance overview'
      ],
      'Label Admin Pro': [
        'Unlimited artist management',
        'Advanced label analytics',
        'Global distribution network',
        'Priority support + phone',
        'Advanced revenue analytics',
        'Multi-currency support',
        'White-label options',
        'API access for integrations'
      ]
    };
    return features[planName] || [];
  };

  // Get the next billing amount considering upgrades
  const getNextBillingAmount = () => {
    return subscription.price;
  };

  // Get upgrade recommendation
  const getUpgradeRecommendation = () => {
    if (subscription.plan.includes('Starter')) {
      return {
        recommended: true,
        planName: subscription.plan.replace('Starter', 'Pro'),
        benefits: ['2x more features', 'Priority support', 'Advanced analytics'],
        savings: subscription.plan.includes('yearly') ? 'Save 2 months with yearly billing' : 'Save 17% with yearly upgrade'
      };
    }
    return { recommended: false };
  };

  const upgrade = getUpgradeRecommendation();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{subscription.plan}</h2>
              <p className="text-gray-600">Active subscription</p>
            </div>
            <Badge 
              color={subscription.status === 'active' ? 'green' : subscription.status === 'past_due' ? 'yellow' : 'red'}
              size="lg"
            >
              {subscription.status === 'active' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </>
              ) : subscription.status === 'past_due' ? (
                <>
                  <Clock className="w-4 h-4 mr-1" />
                  Past Due
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Billing Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Billing Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(getNextBillingAmount(), selectedCurrency)}
                  </p>
                  <p className="text-sm text-gray-500">per {subscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next billing date</p>
                  <p className="font-medium text-gray-900">{subscription.nextBilling}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auto-renewal</p>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAutoRenew(!autoRenew)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        autoRenew ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          autoRenew ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm text-gray-600">
                      {autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Plan Features
              </h3>
              <div className="space-y-2">
                {getPlanFeatures(subscription.plan).slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
                {getPlanFeatures(subscription.plan).length > 4 && (
                  <p className="text-xs text-gray-500">
                    +{getPlanFeatures(subscription.plan).length - 4} more features
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {upgrade.recommended && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Upgrade to Pro</span>
                    </div>
                    <Badge color="blue" size="sm">Recommended</Badge>
                  </button>
                )}
                <button
                  onClick={onUpdatePayment}
                  disabled={processing}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-700">Update Payment</span>
                </button>
                <button
                  onClick={onViewInvoices}
                  disabled={processing}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-700">Download Invoices</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Method Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-6 h-6 mr-2" />
            Payment Method
          </h2>
          
          {paymentMethod ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Revolut Business</p>
                  <p className="text-sm text-gray-600">Connected • 0.8% fees</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge color="green" size="sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <button
                  onClick={onUpdatePayment}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">No payment method</p>
                  <p className="text-sm text-gray-600">Add a payment method to continue your subscription</p>
                </div>
              </div>
              <Button onClick={onUpdatePayment} color="blue">
                Add Payment Method
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Usage & Analytics (if Pro plan) */}
      {subscription.plan.includes('Pro') && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Current Usage
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Music className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">127</p>
                <p className="text-sm text-blue-700">Tracks Uploaded</p>
                <p className="text-xs text-blue-600 mt-1">Unlimited on Pro</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">2.4k</p>
                <p className="text-sm text-green-700">Monthly Listeners</p>
                <p className="text-xs text-green-600 mt-1">+23% this month</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Headphones className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">18</p>
                <p className="text-sm text-purple-700">Stem Extractions</p>
                <p className="text-xs text-purple-600 mt-1">AI-powered</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Billing Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Recent Billing Activity
            </h2>
            <button
              onClick={onViewInvoices}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {billingHistory && billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.slice(0, 3).map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      invoice.status === 'paid' ? 'bg-green-500' : 
                      invoice.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{invoice.description}</p>
                      <p className="text-sm text-gray-600">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-3">
                      {formatCurrency(invoice.amount, selectedCurrency)}
                    </span>
                    <Badge 
                      color={invoice.status === 'paid' ? 'green' : invoice.status === 'pending' ? 'yellow' : 'red'}
                      size="sm"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No billing history yet</p>
              <p className="text-sm text-gray-500">Your billing history will appear here after your first payment</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && upgrade.recommended && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade to {upgrade.planName}</h3>
              <p className="text-gray-600">Unlock advanced features and grow your music career</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {upgrade.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {benefit}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  onUpgrade(upgrade.planName);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
