/**
 * Payment Cancelled Page
 * 
 * Displays when user cancels payment process and provides
 * options to retry or return to previous page.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function PaymentCancelled() {
  const router = useRouter();
  const { order_id } = router.query;

  const handleRetryPayment = () => {
    router.push('/billing');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <MainLayout>
      <SEO 
        title="Payment Cancelled - MSC & Co"
        description="Your payment was cancelled"
      />
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          {/* Cancelled Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600">
              You cancelled the payment process. No charges have been made to your account.
            </p>
          </div>

          {/* Cancellation Details */}
          {order_id && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4">Transaction Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Transaction ID</span>
                  <span className="font-mono text-sm text-yellow-900">
                    {order_id.substring(0, 16)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Status</span>
                  <span className="font-semibold text-yellow-900">Cancelled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Date</span>
                  <span className="font-semibold text-yellow-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ What happened?
            </h3>
            <p className="text-blue-800 mb-4">
              The payment process was cancelled before completion. This could be because:
            </p>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• You clicked the cancel button</p>
              <p>• You closed the payment window</p>
              <p>• The payment session timed out</p>
              <p>• You navigated away from the payment page</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🚀 Ready to continue?
            </h3>
            <p className="text-green-800 mb-4">
              Your subscription is still waiting for you! You can complete the payment process anytime.
            </p>
            <div className="text-sm text-green-700 space-y-1">
              <p>• No account changes have been made</p>
              <p>• Your cart/selection is still saved</p>
              <p>• You can retry the payment immediately</p>
              <p>• All features remain available after payment</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Complete Payment
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoBack}
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={handleGoHome}
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </button>
            </div>
          </div>

          {/* Why Subscribe Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Why Subscribe to MSC & Co?</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-700 mb-1">🎵 Unlimited Distribution</p>
                <p>Release as many tracks as you want</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">📊 Advanced Analytics</p>
                <p>Track your performance across platforms</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">💰 Revenue Optimization</p>
                <p>Maximize your earnings with AI insights</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">🎯 Priority Support</p>
                <p>Get help when you need it most</p>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions about pricing or features? Contact us at{' '}
              <a href="mailto:support@mscandco.com" className="text-blue-600 hover:underline">
                support@mscandco.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
