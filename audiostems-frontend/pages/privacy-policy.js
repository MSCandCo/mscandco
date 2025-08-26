import MainLayout from '@/components/layouts/MainLayout'
import Container from '@/components/Container'
import { COMPANY_INFO } from '@/lib/brand-config'

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, upload music, 
                make a purchase, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Music files and metadata</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and maintain our music distribution services</li>
                <li>Process payments and royalty distributions</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal obligations and industry standards</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Digital music platforms (Spotify, Apple Music, etc.) for distribution</li>
                <li>Payment processors for transaction processing</li>
                <li>Analytics providers to improve our services</li>
                <li>Legal authorities when required by law</li>
                <li>Service providers who assist in our operations</li>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: {COMPANY_INFO.email}
                <br />
                Address: {COMPANY_INFO.name}
              </p>
            </section>
          </div>
        </div>
      </Container>
    </MainLayout>
  )
}