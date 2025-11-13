/**
 * Privacy Policy Page - App Router Version
 */
'use client'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 13, 2025</p>

        <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, upload music,
              make a purchase, or contact us for support.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Personal information (name, email address, phone number, date of birth, nationality, address)</li>
              <li>Payment information (processed securely through Revolut Business and third-party providers)</li>
              <li>Music files and metadata</li>
              <li>Usage data and analytics</li>
              <li>Communication preferences</li>
              <li>Tier usage data (release counts, track counts, Apollo Intelligence query usage)</li>
              <li>Apollo AI conversation data (for improving AI responses and platform support)</li>
              <li>Auto-qualification metrics (earnings, streams, releases, commissions paid)</li>
              <li>AI-generated content (artwork, lyrics analysis, hit predictions, audio mastering)</li>
              <li>Blockchain transaction data (royalty distributions, copyright registrations)</li>
              <li>Carbon footprint data (stream-level CO2 calculations, offset purchases)</li>
              <li>Earth/Percent donation preferences and contribution history</li>
              <li>Social media integration data (OAuth tokens for Instagram, TikTok, Twitter, YouTube, Facebook)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain our music distribution services</li>
              <li>Process payments and royalty distributions</li>
              <li>Communicate with you about your account and services</li>
              <li>Improve our platform and develop new features</li>
              <li>Comply with legal obligations and industry standards (KYC/AML)</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Enforce tier limits and usage restrictions (release/track/Apollo Intelligence limits)</li>
              <li>Automatically qualify users for MPP Partner tier based on performance metrics</li>
              <li>Provide personalized upgrade prompts and savings calculations</li>
              <li>Train and improve Apollo Intelligence AI responses</li>
              <li>Reset usage counters via automated cron jobs (annually for releases/tracks, monthly for Apollo queries)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Digital music platforms (Spotify, Apple Music, etc.) for distribution</li>
              <li>Payment processors (Revolut Business) for transaction processing</li>
              <li>Analytics providers to improve our services</li>
              <li>Legal authorities when required by law</li>
              <li>Service providers who assist in our operations</li>
              <li>OpenAI (for Apollo Intelligence AI processing - conversations are anonymized)</li>
              <li>Vercel (for cron job processing of usage counter resets)</li>
              <li>Polygon Blockchain (for royalty verification and copyright registration records)</li>
              <li>DIMPACT API (for carbon footprint calculations)</li>
              <li>Earth/Percent (for climate action donations - only if you opt-in)</li>
              <li>Social media platforms (Instagram, TikTok, Twitter, YouTube, Facebook - only if you connect accounts)</li>
              <li>Printful (for merchandise orders - only if you use merch features)</li>
              <li>Ticketmaster & Eventbrite (for live performance management - only if you use event features)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
              <li>File complaints with data protection authorities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Apollo Intelligence AI</h2>
            <p className="text-gray-700 mb-4">
              Our Apollo Intelligence AI assistant processes your conversations to provide support and guidance.
              Here's how we handle Apollo AI data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Conversations are processed by OpenAI's GPT-4 Turbo API</li>
              <li>We anonymize personally identifiable information before sending to OpenAI</li>
              <li>Conversations are logged for quality improvement and support purposes</li>
              <li>You can request deletion of your conversation history at any time</li>
              <li>Apollo query usage is tracked to enforce tier limits (3/100/500/unlimited per month)</li>
              <li>We do not use your Apollo conversations for marketing purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Tier-Based Usage Tracking</h2>
            <p className="text-gray-700 mb-4">
              We track your platform usage to enforce tier limits and provide upgrade prompts:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Release and track counts are tracked per year (reset January 1st)</li>
              <li>Apollo Intelligence query counts are tracked per month (reset on the 1st)</li>
              <li>Total lifetime metrics (earnings, streams, releases, commissions) are tracked for MPP auto-qualification</li>
              <li>Automated cron jobs run to reset counters (Vercel Cron with authentication)</li>
              <li>Usage data is never sold to third parties</li>
              <li>You can view your current usage anytime in your account dashboard</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Locked Personal Information</h2>
            <p className="text-gray-700 mb-4">
              For KYC/AML compliance and security, certain personal information fields are locked after onboarding:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>First name, last name, date of birth, nationality, city, postal code, and phone number</li>
              <li>Locked fields can only be updated through a profile change request</li>
              <li>Change requests require admin review and approval</li>
              <li>We maintain an immutable audit trail of all personal information changes</li>
              <li>This protects against account takeover and ensures regulatory compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. AI-Powered Features</h2>
            <p className="text-gray-700 mb-4">
              MSC & Co uses advanced AI technology to provide innovative features:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Apollo Intelligence:</strong> AI assistant powered by OpenAI GPT-4 Turbo for platform guidance and support</li>
              <li><strong>Hit Prediction:</strong> ML models analyze audio features, timing, and social signals to predict commercial success</li>
              <li><strong>Artwork Generation:</strong> DALL-E 3 generates album artwork based on your preferences</li>
              <li><strong>Audio Mastering:</strong> AI-powered audio enhancement and mastering services</li>
              <li><strong>Playlist Matching:</strong> ML algorithms match your music to 15M+ playlists</li>
              <li><strong>Fraud Detection:</strong> Real-time AI monitoring for streaming anomalies and bot detection</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All AI processing respects your privacy. Personal information is anonymized before being sent to AI providers, and you can request deletion of AI-generated content at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Blockchain & Carbon Tracking</h2>
            <p className="text-gray-700 mb-4">
              MSC & Co is committed to transparency and sustainability:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Blockchain Verification:</strong> Royalty distributions are recorded on Polygon blockchain for immutable proof. These records are public and permanent.</li>
              <li><strong>Carbon Tracking:</strong> We calculate CO2 emissions per stream using DIMPACT methodology. This data helps you understand your environmental impact.</li>
              <li><strong>Earth/Percent Integration:</strong> If you opt-in, a percentage of your earnings can be automatically donated to Earth/Percent climate initiatives. Donation preferences are stored securely.</li>
              <li><strong>Carbon Offsets:</strong> Purchase data for verified carbon offsets is stored to track your carbon neutrality status.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Blockchain records are permanent and cannot be deleted. Carbon tracking data can be deleted upon request, but historical blockchain records will remain.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: support@mscandco.com
              <br />
              Privacy Email: privacy@mscandco.com
              <br />
              Address: MSC & Co
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
