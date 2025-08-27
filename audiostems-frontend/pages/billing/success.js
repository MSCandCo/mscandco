/**
 * Payment Success Page
 * 
 * Displays payment confirmation and processes subscription activation
 * after successful Revolut payment.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Check, ArrowRight, Download, Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getRevolutPaymentDetails, formatAmount } from '@/lib/revolut-payment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PaymentSuccess() {
  const router = useRouter();
  const { order_id, plan_id, billing } = router.query;
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch payment details and process subscription
  useEffect(() => {
    if (!order_id) return;

    const processPayment = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Processing successful payment:', { order_id, plan_id, billing });
        
        // Fetch payment details from Revolut
        const paymentData = await getRevolutPaymentDetails(order_id);
        
        if (!paymentData.success) {
          throw new Error('Failed to fetch payment details');
        }
        
        setPaymentDetails(paymentData);
        
        console.log('✅ Payment details loaded:', {
          orderId: paymentData.id,
          state: paymentData.state,
          amount: paymentData.order_amount?.value
        });
        
        // If this is a subscription payment, the webhook should have already processed it
        // But we can double-check the subscription status here
        if (plan_id && user) {
          console.log('🔄 Verifying subscription activation...');
          
          // Give webhook a moment to process
          setTimeout(async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              
              if (token) {
                const response = await fetch('/api/user/subscription-status', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const result = await response.json();
                
                if (result.success && result.data.hasSubscription) {
                  console.log('✅ Subscription confirmed active:', result.data.planName);
                } else {
                  console.log('⚠️ Subscription not yet active, webhook may still be processing');
                }
              }
            } catch (subError) {
              console.error('⚠️ Error checking subscription status:', subError);
            }
          }, 2000);
        }
        
      } catch (err) {
        console.error('💥 Error processing payment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [order_id, plan_id, billing, user]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (loading || error) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error, router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <SEO 
          title="Processing Payment - MSC & Co"
          description="Processing your payment..."
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <SEO 
          title="Payment Error - MSC & Co"
          description="There was an error processing your payment"
        />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/billing')}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const amount = paymentDetails?.order_amount?.value ? 
    (paymentDetails.order_amount.value / 100) : 0;
  const currency = paymentDetails?.order_amount?.currency || 'GBP';

  return (
    <MainLayout>
      <SEO 
        title="Payment Successful - MSC & Co"
        description="Your payment has been processed successfully"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-gray-900">
                  {formatAmount(amount, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-900">Revolut</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm text-gray-900">
                  {paymentDetails?.id?.substring(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              {plan_id && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription Plan</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {plan_id.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Cycle</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {billing || 'Monthly'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subscription Confirmation */}
          {plan_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🎉 Subscription Activated!
              </h3>
              <p className="text-blue-800 mb-4">
                Your {plan_id.replace('-', ' ')} subscription is now active. You can access all premium features immediately.
              </p>
              <div className="text-sm text-blue-700">
                <p>• Unlimited releases and distribution</p>
                <p>• Advanced analytics and insights</p>
                <p>• Priority customer support</p>
                <p>• Revenue optimization tools</p>
              </div>
            </div>
          )}

          {/* Auto-redirect Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-center">
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Redirecting to dashboard in {countdown} seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={handlePrintReceipt}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Print Receipt
            </button>
          </div>

          {/* Support Notice */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
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
