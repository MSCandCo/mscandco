import MainLayout from '@/components/layouts/MainLayout'
import Container from '@/components/Container'
import { COMPANY_INFO } from '@/lib/brand-config'

export default function DMCAPolicy() {
  return (
    <MainLayout>
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">DMCA Copyright Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Commitment to Copyright Protection</h2>
              <p className="text-gray-700 mb-4">
                {COMPANY_INFO.name} respects the intellectual property rights of others and expects our users 
                to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond 
                to valid copyright infringement notices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Filing a DMCA Notice</h2>
              <p className="text-gray-700 mb-4">
                If you believe your copyrighted work has been infringed, please provide our designated 
                copyright agent with the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your physical or electronic signature</li>
                <li>Identification of the copyrighted work claimed to be infringed</li>
                <li>Identification of the allegedly infringing material and its location</li>
                <li>Your contact information (address, phone, email)</li>
                <li>A statement of good faith belief that the use is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Designated Copyright Agent</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>DMCA Agent</strong><br />
                  {COMPANY_INFO.name}<br />
                  Email: dmca@{COMPANY_INFO.domain}<br />
                  Subject Line: "DMCA Takedown Notice"
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Counter-Notification Process</h2>
              <p className="text-gray-700 mb-4">
                If you believe your content was removed in error, you may file a counter-notification containing:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your physical or electronic signature</li>
                <li>Identification of the removed material and its former location</li>
                <li>A statement under penalty of perjury that removal was due to mistake or misidentification</li>
                <li>Your contact information and consent to jurisdiction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Repeat Infringer Policy</h2>
              <p className="text-gray-700 mb-4">
                We will terminate the accounts of users who are determined to be repeat infringers 
                of copyrighted material.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Response Timeline</h2>
              <p className="text-gray-700 mb-4">
                We will respond to valid DMCA notices within 24-48 hours and take appropriate action, 
                which may include removing or disabling access to allegedly infringing material.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </MainLayout>
  )
}
