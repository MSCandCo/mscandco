import { DollarSign, AlertCircle, Mail, Clock } from 'lucide-react'

export const metadata = {
  title: 'Refund Policy | MSC & Co',
  description: 'Learn about our refund and cancellation policies for subscriptions and distribution services.'
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: <strong>January 2, 2025</strong>
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Quick Summary</h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Subscriptions can be canceled anytime - no refunds for unused time</li>
                <li>• Distribution fees are non-refundable once submitted to platforms</li>
                <li>• Technical errors on our part are fully refundable</li>
                <li>• 14-day cooling-off period for EU/UK customers (certain conditions apply)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose prose-blue max-w-none">
          <h2>1. Subscription Plans</h2>

          <h3>1.1 Monthly Subscriptions</h3>
          <p>
            Monthly subscription fees are <strong>non-refundable</strong>. If you cancel your subscription:
          </p>
          <ul>
            <li>You will retain access until the end of your current billing period</li>
            <li>No partial refunds are provided for unused days</li>
            <li>Your subscription will not auto-renew after cancellation</li>
            <li>All your data and releases remain accessible until the period ends</li>
          </ul>

          <h3>1.2 Annual Subscriptions</h3>
          <p>
            Annual subscription fees are <strong>non-refundable</strong> after the first 14 days. However:
          </p>
          <ul>
            <li><strong>First 14 days:</strong> Full refund available (EU/UK cooling-off period)</li>
            <li><strong>After 14 days:</strong> No refunds, but you can cancel to prevent renewal</li>
            <li>Access continues until the end of your annual period</li>
          </ul>

          <h3>1.3 How to Cancel</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="mb-2 font-semibold">Canceling is easy:</p>
            <ol>
              <li>Log in to your account</li>
              <li>Go to <strong>Settings → Billing</strong></li>
              <li>Click <strong>"Manage Subscription"</strong></li>
              <li>Follow the prompts to cancel</li>
            </ol>
            <p className="text-sm text-gray-600 mt-2 mb-0">
              No need to contact support - cancellation is instant and self-service.
            </p>
          </div>

          <h2>2. Music Distribution Fees</h2>

          <h3>2.1 Non-Refundable Distribution Fees</h3>
          <p>
            Fees for distributing your music to streaming platforms (Spotify, Apple Music, etc.) are
            <strong> non-refundable</strong> once we have:
          </p>
          <ul>
            <li>Submitted your release to platforms</li>
            <li>Started the distribution process</li>
            <li>Incurred third-party costs (UPC codes, metadata services, etc.)</li>
          </ul>

          <h3>2.2 Exceptions</h3>
          <p>
            Refunds may be issued in the following circumstances:
          </p>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <ul className="mb-0">
              <li><strong>Technical Error on Our Part:</strong> If we fail to deliver your music due to our system error</li>
              <li><strong>Platform Rejection:</strong> If your release is rejected due to incorrect information we provided</li>
              <li><strong>Service Failure:</strong> If we cannot fulfill the distribution service as promised</li>
            </ul>
          </div>

          <h3>2.3 Platform Rejections (Your Responsibility)</h3>
          <p>
            If your release is rejected by platforms due to:
          </p>
          <ul>
            <li>Copyright violations or licensing issues</li>
            <li>Low audio quality or technical specifications</li>
            <li>Inappropriate content or metadata</li>
            <li>Duplicate content already on platforms</li>
          </ul>
          <p>
            <strong>No refund will be issued.</strong> You can resubmit after fixing the issues, but additional fees may apply.
          </p>

          <h2>3. Add-On Services</h2>

          <h3>3.1 Premium Features</h3>
          <p>
            One-time purchases for premium features (playlist pitching, promotional campaigns, etc.) are
            <strong> refundable within 48 hours</strong> if:
          </p>
          <ul>
            <li>The service has not yet been delivered or initiated</li>
            <li>You request a refund before work has begun</li>
          </ul>

          <h3>3.2 Completed Services</h3>
          <p>
            Services that have already been performed (e.g., completed promotional campaigns,
            delivered pitching services) are <strong>non-refundable</strong>.
          </p>

          <h2>4. EU/UK Consumer Rights</h2>

          <h3>4.1 14-Day Cooling-Off Period</h3>
          <p>
            Customers in the European Union and United Kingdom have a legal right to cancel within
            14 days of purchase under the Consumer Rights Directive.
          </p>

          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="font-semibold mb-2">Important Exception:</p>
            <p className="mb-0">
              By using our service immediately (e.g., uploading and distributing music, accessing
              premium features), you agree to waive your cooling-off period for that specific service.
              Subscription fees remain refundable within 14 days if the service has not been used.
            </p>
          </div>

          <h2>5. Payment Disputes & Chargebacks</h2>

          <h3>5.1 Contact Us First</h3>
          <p>
            If you have a payment issue or dispute, please <strong>contact us first</strong> before
            initiating a chargeback. We can often resolve issues quickly and amicably.
          </p>

          <h3>5.2 Chargeback Consequences</h3>
          <p>
            If you file a chargeback without contacting us:
          </p>
          <ul>
            <li>Your account may be suspended pending resolution</li>
            <li>You may lose access to distributed music (we'll need to remove it from platforms)</li>
            <li>We may charge administrative fees to cover chargeback costs</li>
            <li>Repeated chargebacks may result in permanent account termination</li>
          </ul>

          <h2>6. Refund Processing</h2>

          <h3>6.1 Timeline</h3>
          <div className="flex items-start gap-3 bg-gray-50 p-4 rounded border border-gray-200">
            <Clock className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold mb-2">Refund processing times:</p>
              <ul className="mb-0">
                <li><strong>Request Review:</strong> 1-2 business days</li>
                <li><strong>Approval:</strong> Immediate notification via email</li>
                <li><strong>Refund to Payment Method:</strong> 5-10 business days (depends on your bank)</li>
              </ul>
            </div>
          </div>

          <h3>6.2 Refund Method</h3>
          <p>
            Refunds are issued to the <strong>original payment method</strong> used for the purchase.
            We cannot refund to a different card or account.
          </p>

          <h2>7. How to Request a Refund</h2>

          <div className="bg-blue-50 p-6 rounded border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-2">Contact our billing team:</p>
                <p className="mb-2"><strong>Email:</strong> billing@mscandco.com</p>
                <p className="mb-2"><strong>Subject:</strong> "Refund Request - [Your Account Email]"</p>
                <p className="font-semibold mb-1">Please include:</p>
                <ul className="mb-0">
                  <li>Your account email address</li>
                  <li>Transaction ID or invoice number</li>
                  <li>Reason for refund request</li>
                  <li>Date of purchase</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>8. Exceptions & Special Circumstances</h2>

          <h3>8.1 Account Termination</h3>
          <p>
            If we terminate your account due to violation of our Terms of Service, no refunds will
            be issued for any prepaid fees or unused subscription time.
          </p>

          <h3>8.2 Force Majeure</h3>
          <p>
            We are not liable for refunds if services are interrupted due to circumstances beyond our
            control (natural disasters, war, pandemics, platform outages, etc.).
          </p>

          <h3>8.3 Beta Features</h3>
          <p>
            Features marked as "Beta" or "Experimental" are provided as-is. Refunds for issues with
            beta features are at our sole discretion.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Refund Policy from time to time. Changes will be effective immediately
            upon posting. Continued use of our service after changes constitutes acceptance of the
            updated policy.
          </p>

          <h2>10. Questions?</h2>
          <p>
            If you have questions about our refund policy, please don't hesitate to reach out:
          </p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="mb-1"><strong>General Inquiries:</strong> support@mscandco.com</p>
            <p className="mb-1"><strong>Billing & Refunds:</strong> billing@mscandco.com</p>
            <p className="mb-0"><strong>Phone:</strong> +44 [Your Phone Number] (Mon-Fri, 9am-5pm GMT)</p>
          </div>

          <h2>Related Policies</h2>
          <ul>
            <li><a href="/terms-of-use" className="text-blue-600 hover:text-blue-700">Terms of Service</a></li>
            <li><a href="/privacy-policy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a></li>
            <li><a href="/cookie-policy" className="text-blue-600 hover:text-blue-700">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
