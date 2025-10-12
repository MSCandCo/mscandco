/**
 * Payment Failed Page
 * 
 * Displays payment failure information and provides options
 * to retry or contact support.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { X, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function PaymentFailed() {
  const router = useRouter();
  const { order_id, reason } = router.query;
  
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    // Decode and format the failure reason
    if (reason) {
      const decodedReason = decodeURIComponent(reason);
      setFailureReason(decodedReason);
    }
  }, [reason]);

  const handleRetryPayment = () => {
    router.push('/billing');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // Open email client or redirect to support page
    window.location.href = 'mailto:support@mscandco.com?subject=Payment Failed - Order ' + order_id;
  };

  // Common failure reasons and their user-friendly messages
  const getFailureMessage = (reason) => {
    const reasonLower = reason?.toLowerCase() || '';
    
    if (reasonLower.includes('insufficient')) {
      return {
        title: 'Insufficient Funds',
        message: 'Your payment method doesn\'t have enough funds to complete this transaction.',
        suggestion: 'Please check your account balance or try a different payment method.'
      };
    }
    
    if (reasonLower.includes('declined') || reasonLower.includes('card')) {
      return {
        title: 'Card Declined',
        message: 'Your card was declined by your bank or card issuer.',
        suggestion: 'Please contact your bank or try a different payment method.'
      };
    }
    
    if (reasonLower.includes('expired')) {
      return {
        title: 'Card Expired',
        message: 'The payment method you used has expired.',
        suggestion: 'Please update your payment method with current details.'
      };
    }
    
    if (reasonLower.includes('limit')) {
      return {
        title: 'Transaction Limit Exceeded',
        message: 'This transaction exceeds your daily or monthly spending limit.',
        suggestion: 'Please contact your bank to increase your limit or try a smaller amount.'
      };
    }
    
    if (reasonLower.includes('security') || reasonLower.includes('fraud')) {
      return {
        title: 'Security Check Failed',
        message: 'Your payment was flagged by security systems.',
        suggestion: 'Please contact your bank to authorize this transaction.'
      };
    }
    
    // Default message for unknown reasons
    return {
      title: 'Payment Failed',
      message: 'We were unable to process your payment at this time.',
      suggestion: 'Please try again or contact support if the problem persists.'
    };
  };

  const failureInfo = getFailureMessage(failureReason);

  return (
    <MainLayout>
      <SEO 
        title="Payment Failed - MSC & Co"
        description="Your payment could not be processed"
      />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          {/* Failure Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{failureInfo.title}</h1>
            <p className="text-gray-600">{failureInfo.message}</p>
          </div>

          {/* Failure Details */}
          {(order_id || failureReason) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Transaction Details</h2>
              <div className="space-y-3">
                {order_id && (
                  <div className="flex justify-between">
                    <span className="text-red-700">Transaction ID</span>
                    <span className="font-mono text-sm text-red-900">
                      {order_id.substring(0, 16)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-red-700">Date</span>
                  <span className="font-semibold text-red-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                {failureReason && (
                  <div className="pt-3 border-t border-red-200">
                    <span className="text-red-700 block mb-2">Reason</span>
                    <span className="text-red-900 text-sm bg-red-100 px-3 py-2 rounded-lg block">
                      {failureReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestion Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 What can you do?
            </h3>
            <p className="text-blue-800 mb-4">{failureInfo.suggestion}</p>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Check your payment method details</p>
              <p>• Ensure sufficient funds are available</p>
              <p>• Try a different payment method</p>
              <p>• Contact your bank if needed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
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
                onClick={handleContactSupport}
                className="bg-orange-100 text-orange-700 py-3 px-6 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Support
              </button>
            </div>
          </div>

          {/* Common Issues Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Common Issues & Solutions</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <details className="cursor-pointer">
                <summary className="font-medium text-gray-700 hover:text-gray-900">
                  My card was declined
                </summary>
                <p className="mt-2 pl-4">
                  Contact your bank to ensure international transactions are enabled and 
                  your card hasn't been flagged for security reasons.
                </p>
              </details>
              
              <details className="cursor-pointer">
                <summary className="font-medium text-gray-700 hover:text-gray-900">
                  Insufficient funds error
                </summary>
                <p className="mt-2 pl-4">
                  Check your account balance and ensure you have enough funds including 
                  any potential currency conversion fees.
                </p>
              </details>
              
              <details className="cursor-pointer">
                <summary className="font-medium text-gray-700 hover:text-gray-900">
                  Payment keeps failing
                </summary>
                <p className="mt-2 pl-4">
                  Try using a different payment method or contact our support team 
                  for assistance with your specific situation.
                </p>
              </details>
            </div>
          </div>

          {/* Support Contact */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Still having trouble? Contact our support team at{' '}
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
