import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Check, ArrowRight, Download, Loader2, X } from 'lucide-react'
import MainLayout from '@/components/layouts/mainLayout'
import SEO from '@/components/seo'

export default function PaymentSuccess() {
  const router = useRouter()
  const { order_id } = router.query
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(10)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (order_id) {
      fetchPaymentDetails()
      startCountdown()
    }
  }, [order_id])

  const fetchPaymentDetails = async () => {
    try {
      console.log('🔍 Fetching payment details for order:', order_id)
      const response = await fetch(`/api/revolut/payment-details?order_id=${order_id}`)
      const result = await response.json()
      
      if (result.success) {
        setPaymentDetails(result.data)
        console.log('💳 Payment details loaded:', result.data)
        
        // Process the subscription if needed
        await processSubscription(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch payment details')
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const processSubscription = async (paymentData) => {
    if (paymentData.metadata?.planId) {
      try {
        console.log('🔄 Processing subscription for plan:', paymentData.metadata.planId)
        const response = await fetch('/api/subscriptions/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order_id,
            paymentData
          })
        })
        
        const result = await response.json()
        if (result.success) {
          console.log('✅ Subscription processed successfully')
        } else {
          console.warn('⚠️ Subscription processing failed:', result.error)
        }
      } catch (error) {
        console.error('Subscription processing failed:', error)
      }
    }
  }

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  if (loading) {
    return (
      <MainLayout>
        <SEO pageTitle="Processing Payment - MSC & Co" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <SEO pageTitle="Payment Error - MSC & Co" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/billing')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Back to Billing
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <SEO pageTitle="Payment Successful - MSC & Co" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Your payment has been processed and your account has been updated.
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Amount Paid:</span>
                <span className="font-semibold">
                  {paymentDetails.currency === 'GBP' ? '£' : paymentDetails.currency}
                  {(paymentDetails.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Reference:</span>
                <span className="font-mono text-sm text-gray-800">{paymentDetails.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold capitalize">{paymentDetails.state}</span>
              </div>
              {paymentDetails.metadata?.planId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="font-semibold">{paymentDetails.metadata.planId}</span>
                </div>
              )}
            </div>
          )}

          {/* Auto redirect notice */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              Redirecting to your dashboard in <span className="font-bold">{countdown}</span> seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            
            <button
              onClick={() => window.print()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Print Receipt
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            Need help? <a href="/support" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
