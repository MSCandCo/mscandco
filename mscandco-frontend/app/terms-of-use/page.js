/**
 * Terms of Use Page - App Router Version
 */
'use client'

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Use</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using MSC & Co's services, you agree to be bound by these Terms of Use
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              MSC & Co provides music distribution, licensing, and publishing services for artists,
              labels, and content creators. Our platform facilitates the distribution of music to digital
              streaming platforms and provides licensing solutions for various media applications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Creation</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>One account per person or entity</li>
              <li>Must be 18 years or older, or have parental consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Responsibilities</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Keep login credentials confidential</li>
              <li>Notify us immediately of unauthorized access</li>
              <li>Accept responsibility for all account activity</li>
              <li>Maintain current contact information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content Submission</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Content</h3>
            <p className="text-gray-700 mb-4">
              When you upload music or other content to our platform, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You own all rights to the content or have proper authorization</li>
              <li>The content does not infringe on any third-party rights</li>
              <li>The content complies with all applicable laws</li>
              <li>The content does not contain malicious code or viruses</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Content Standards</h3>
            <p className="text-gray-700 mb-4">Content must not contain:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Hate speech or discriminatory language</li>
              <li>Explicit violence or graphic content</li>
              <li>Unauthorized copyrighted material</li>
              <li>Spam or misleading information</li>
              <li>Content that violates platform policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Pricing Tiers and Commission Rates</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Progressive Tier System</h3>
            <p className="text-gray-700 mb-4">
              We operate a 4-tier pricing system with progressive commission rates:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>MSC Free:</strong> £0/month, 20% commission, 3 releases/year, 15 tracks/year, 3 Apollo queries/month</li>
              <li><strong>MSC Pro:</strong> £19.99/month or £199/year, 15% commission, unlimited releases/tracks, 100 Apollo queries/month</li>
              <li><strong>MPP Partner:</strong> £99/month or £999/year (or FREE if auto-qualified), 10% commission, unlimited releases/tracks, 500 Apollo queries/month</li>
              <li><strong>Investment Partner:</strong> £10K-£50K one-time investment, 2.5% commission, unlimited everything, equity ownership</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">MPP Partner Auto-Qualification</h3>
            <p className="text-gray-700 mb-4">
              You automatically qualify for FREE MPP Partner status by meeting ANY of these criteria:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>£10,000+ annual earnings</li>
              <li>100,000+ total streams</li>
              <li>50+ total releases</li>
              <li>£5,000+ commissions paid</li>
            </ul>
            <p className="text-gray-700 mb-4">
              The system checks automatically and upgrades you instantly when you qualify. If you're already on a paid plan,
              your subscription will be automatically cancelled and you'll receive FREE MPP Partner for life.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Tier Limits and Enforcement</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Free tier release and track limits are strictly enforced</li>
              <li>Limits reset annually on January 1st for releases/tracks</li>
              <li>Apollo Intelligence query limits reset monthly on the 1st</li>
              <li>When limits are reached, you'll receive upgrade prompts with savings calculations</li>
              <li>You can purchase Unlimited Apollo Intelligence for £9.99/month on any tier (except Investment)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Commission Structure</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Commission rates apply to all streaming royalties and platform earnings</li>
              <li>Commission is calculated: (Total Earnings × Commission Rate)</li>
              <li>You receive: (Total Earnings - Commission)</li>
              <li>Example: £1,000 earnings on Pro tier (15%) = you keep £850, we keep £150</li>
              <li>Lower tiers reward growth and loyalty with reduced commission rates</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Subscription Fees</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Fees are charged in advance for subscription periods</li>
              <li>Annual plans offer approximately 2 months free compared to monthly billing</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>Prices may change with 30 days notice</li>
              <li>Failed payments may result in service suspension</li>
              <li>If you auto-qualify for MPP Partner, paid subscriptions are automatically cancelled</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Royalty Payments</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Royalties are paid according to your tier's commission rate</li>
              <li>Minimum payout thresholds may apply</li>
              <li>Tax obligations are the user's responsibility</li>
              <li>Payment methods include Revolut Business and bank transfers</li>
              <li>Commission rates are applied before royalty distribution to you</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Apollo Intelligence AI</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Assistant Usage</h3>
            <p className="text-gray-700 mb-4">
              Apollo Intelligence is our AI-powered assistant built on OpenAI GPT-4 Turbo. By using Apollo, you agree that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Conversations are processed by OpenAI's API with anonymized personally identifiable information</li>
              <li>Apollo is provided "as is" and responses may not always be accurate</li>
              <li>You will not use Apollo to generate harmful, illegal, or inappropriate content</li>
              <li>Query limits are enforced per your tier (3/100/500/unlimited per month)</li>
              <li>Conversations may be logged for quality improvement and support purposes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Apollo Query Limits</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Each message to Apollo counts as one query</li>
              <li>Queries reset monthly on the 1st of each month</li>
              <li>Exceeding your limit requires upgrade or Unlimited Apollo add-on (£9.99/month)</li>
              <li>Investment tier users have unlimited queries</li>
              <li>Users with Unlimited Apollo add-on are exempt from monthly resets</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Limitations</h3>
            <p className="text-gray-700 mb-4">
              While Apollo is highly advanced, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>AI responses may contain errors or inaccuracies</li>
              <li>Apollo is not a substitute for professional legal or financial advice</li>
              <li>You are responsible for verifying AI-provided information</li>
              <li>We are not liable for decisions made based on Apollo's responses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may not use our service to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute malware or harmful code</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass or abuse other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to access our service without permission</li>
              <li>Abuse or spam Apollo Intelligence with excessive or inappropriate queries</li>
              <li>Attempt to circumvent tier limits or usage tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The MSC & Co platform, including its design, functionality, Apollo Intelligence, and content
              (excluding user-submitted content), is protected by copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for conduct
              that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
              This includes but is not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violating tier limits or usage restrictions</li>
              <li>Abusing Apollo Intelligence</li>
              <li>Attempting to circumvent payment or commission systems</li>
              <li>Uploading content that violates our content policies</li>
              <li>Engaging in fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              MSC & Co shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of our service, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Apollo Intelligence errors or inaccuracies</li>
              <li>Tier limit enforcement or automatic tier changes</li>
              <li>Failed auto-qualification for MPP Partner</li>
              <li>Usage counter resets or cron job processing</li>
              <li>Commission calculations or royalty distributions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms shall be governed by and construed in accordance with the laws of England and Wales,
              without regard to conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Use, please contact us at:
              <br />
              Email: support@mscandco.com
              <br />
              Subject: "Terms of Use Inquiry"
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
