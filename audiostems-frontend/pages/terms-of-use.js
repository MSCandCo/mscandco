import MainLayout from '@/components/layouts/MainLayout'
import Container from '@/components/Container'
import { COMPANY_INFO } from '@/lib/brand-config'

export default function TermsOfUse() {
  return (
    <MainLayout>
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Use</h1>
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using {COMPANY_INFO.name}'s services, you agree to be bound by these Terms of Use 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                {COMPANY_INFO.name} provides music distribution, licensing, and publishing services for artists, 
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Subscription Fees</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Fees are charged in advance for subscription periods</li>
                <li>All fees are non-refundable unless required by law</li>
                <li>Prices may change with 30 days notice</li>
                <li>Failed payments may result in service suspension</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Royalty Payments</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Royalties are paid according to your distribution agreement</li>
                <li>Minimum payout thresholds may apply</li>
                <li>Tax obligations are the user's responsibility</li>
                <li>Payment methods and schedules are specified in your agreement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our service to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute malware or harmful code</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or abuse other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to access our service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The {COMPANY_INFO.name} platform, including its design, functionality, and content 
                (excluding user-submitted content), is protected by copyright, trademark, and other 
                intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for conduct 
                that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                {COMPANY_INFO.name} shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Use, please contact us at:
                <br />
                Email: {COMPANY_INFO.email}
                <br />
                Subject: "Terms of Use Inquiry"
              </p>
            </section>
          </div>
        </div>
      </Container>
    </MainLayout>
  )
}