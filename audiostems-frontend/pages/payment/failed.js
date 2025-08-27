import { useRouter } from 'next/router'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import MainLayout from '@/components/layouts/mainLayout'
import SEO from '@/components/seo'

export default function PaymentFailed() {
  const router = useRouter()

  return (
    <MainLayout>
      <SEO pageTitle="Payment Failed - MSC & Co" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            There was an issue processing your payment. Please try again or contact our support team for assistance.
          </p>

          {/* Common Issues */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Common issues:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Insufficient funds</li>
              <li>• Card expired or blocked</li>
              <li>• Incorrect payment details</li>
              <li>• Bank security restrictions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/billing')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={() => router.push('/support')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            Need immediate help? <a href="/support" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
