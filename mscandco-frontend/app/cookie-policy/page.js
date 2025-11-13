import { Cookie } from 'lucide-react'

export const metadata = {
  title: 'Cookie Policy | MSC & Co',
  description: 'Learn about how MSC & Co uses cookies and similar technologies.'
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: <strong>January 13, 2025</strong>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose prose-blue max-w-none">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website.
            They help us provide you with a better experience by remembering your preferences and
            understanding how you use our service.
          </p>

          <h2>How We Use Cookies</h2>
          <p>
            MSC & Co uses cookies for the following purposes:
          </p>

          <h3>1. Strictly Necessary Cookies (Required)</h3>
          <p>
            These cookies are essential for the website to function properly. They enable core
            functionality such as security, network management, and accessibility. Without these
            cookies, services you have asked for cannot be provided.
          </p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="font-semibold mb-2">Examples:</p>
            <ul>
              <li><strong>Authentication tokens:</strong> Keep you logged in securely</li>
              <li><strong>Session cookies:</strong> Maintain your session state</li>
              <li><strong>Security tokens:</strong> Protect against CSRF attacks</li>
              <li><strong>Load balancing:</strong> Distribute traffic across our servers</li>
            </ul>
          </div>

          <h3>2. Analytics & Performance Cookies (Optional)</h3>
          <p>
            These cookies help us understand how visitors interact with our website by collecting
            and reporting information anonymously. This helps us improve our service and fix issues.
          </p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="font-semibold mb-2">Examples:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Visitor statistics and behavior</li>
              <li><strong>Error tracking:</strong> Identify and fix technical issues</li>
              <li><strong>Performance monitoring:</strong> Measure page load times</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              You can opt out of these cookies without affecting your ability to use our service.
            </p>
          </div>

          <h3>3. Functional Cookies (Optional)</h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as remembering
            your preferences and settings.
          </p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="font-semibold mb-2">Examples:</p>
            <ul>
              <li><strong>Theme preferences:</strong> Light/dark mode selection</li>
              <li><strong>Language settings:</strong> Your preferred language</li>
              <li><strong>UI preferences:</strong> Dashboard layout and filters</li>
            </ul>
          </div>

          <h2>Third-Party Cookies</h2>
          <p>
            We use carefully selected third-party services that may place cookies on your device:
          </p>
          <ul>
            <li><strong>Stripe:</strong> Payment processing (necessary for transactions)</li>
            <li><strong>Google Analytics:</strong> Website analytics (optional)</li>
            <li><strong>Sentry:</strong> Error tracking and monitoring (optional)</li>
          </ul>
          <p>
            These services have their own privacy policies and cookie policies, which we encourage
            you to review.
          </p>

          <h2>Managing Your Cookie Preferences</h2>
          <p>
            You have full control over which cookies you accept:
          </p>
          <ol>
            <li>
              <strong>Cookie Banner:</strong> When you first visit our site, you'll see a cookie
              consent banner where you can accept all, reject all, or customize your preferences.
            </li>
            <li>
              <strong>Cookie Settings:</strong> You can change your preferences at any time by
              clicking the "Cookie Settings" link in the website footer.
            </li>
            <li>
              <strong>Browser Settings:</strong> Most browsers allow you to control cookies through
              their settings. However, blocking all cookies may affect your ability to use some
              features of our website.
            </li>
          </ol>

          <h2>Do Not Track (DNT)</h2>
          <p>
            We respect the "Do Not Track" (DNT) browser setting. If you have DNT enabled, we will:
          </p>
          <ul>
            <li>Only use strictly necessary cookies</li>
            <li>Disable all analytics and tracking cookies</li>
            <li>Not share your data with third-party analytics services</li>
          </ul>

          <h2>Cookie Retention</h2>
          <p>
            Different cookies have different retention periods:
          </p>
          <ul>
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Authentication cookies:</strong> 30 days or until you log out</li>
            <li><strong>Preference cookies:</strong> 12 months</li>
            <li><strong>Analytics cookies:</strong> 24 months (Google Analytics default)</li>
          </ul>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or legal requirements. We will notify you of any material changes by posting the new
            policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:
          </p>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="mb-1"><strong>Email:</strong> privacy@mscandco.com</p>
            <p className="mb-1"><strong>Mail:</strong> MSC & Co, [Your Address]</p>
            <p className="mb-0"><strong>Data Protection Officer:</strong> dpo@mscandco.com</p>
          </div>

          <h2>Related Policies</h2>
          <ul>
            <li><a href="/privacy-policy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a></li>
            <li><a href="/terms-of-use" className="text-blue-600 hover:text-blue-700">Terms of Service</a></li>
            <li><a href="/refund-policy" className="text-blue-600 hover:text-blue-700">Refund Policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
