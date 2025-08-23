// 🚀 Mock Revolut Payment Page for Development
// This simulates the Revolut payment flow during development

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from 'flowbite-react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function MockRevolutPayment() {
  const router = useRouter();
  const { amount, currency, customer, id } = router.query;
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Simulate payment processing delay
    const timer = setTimeout(() => {
      setPaymentStatus('success');
      
      // Start countdown for redirect
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            // Redirect to success page
            router.push('/billing?revolut_success=true&payment_id=' + id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, router]);

  const handleSuccessRedirect = () => {
    router.push('/billing?revolut_success=true&payment_id=' + id);
  };

  const handleFailureRedirect = () => {
    router.push('/billing?revolut_error=payment_cancelled');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center p-6">
          {/* Revolut Logo Mockup */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Revolut Business</h1>
            <p className="text-gray-600 text-sm">Development Payment Simulator</p>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Amount: <span className="font-semibold">{currency} {amount}</span></p>
              <p>Customer: <span className="font-semibold">{customer}</span></p>
              <p>Payment ID: <span className="font-mono text-xs">{id}</span></p>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus === 'pending' && (
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing payment...</p>
              <p className="text-xs text-gray-500 mt-2">This usually takes a few seconds</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-semibold mb-2">Payment Successful!</p>
              <p className="text-sm text-gray-600 mb-4">
                Redirecting in {countdown} seconds...
              </p>
              <button
                onClick={handleSuccessRedirect}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {/* Development Controls */}
          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-gray-500 mb-3">Development Mode Controls:</p>
            <div className="flex gap-2">
              <button
                onClick={handleSuccessRedirect}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
              >
                ✅ Success
              </button>
              <button
                onClick={handleFailureRedirect}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
              >
                ❌ Cancel
              </button>
            </div>
          </div>

          {/* Fee Information */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-800">
              <p className="font-semibold">Revolut Advantage:</p>
              <p>Fee: 0.8% (£{(parseFloat(amount) * 0.008).toFixed(2)})</p>
              <p>vs Stripe: 2.9% (£{(parseFloat(amount) * 0.029).toFixed(2)})</p>
              <p className="font-semibold">You save: £{(parseFloat(amount) * 0.021).toFixed(2)} (72%)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
