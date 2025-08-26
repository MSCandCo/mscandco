import MainLayout from '@/components/layouts/MainLayout'
import Container from '@/components/Container'
import { COMPANY_INFO } from '@/lib/brand-config'

export default function LicenseTerms() {
  return (
    <MainLayout>
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Music License Terms</h1>
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. License Grant</h2>
              <p className="text-gray-700 mb-4">
                Subject to these terms and your subscription, {COMPANY_INFO.name} grants you a non-exclusive, 
                non-transferable license to use our music catalog for the purposes specified in your subscription plan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Permitted Uses</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Standard License</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Personal and commercial projects</li>
                <li>Social media content</li>
                <li>Podcasts and audio content</li>
                <li>Small-scale video productions</li>
                <li>Live streaming (with attribution)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Extended License</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Broadcast television and radio</li>
                <li>Theatrical releases</li>
                <li>Large-scale commercial campaigns</li>
                <li>Resale of end products</li>
                <li>Unlimited distribution rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Restrictions</h2>
              <p className="text-gray-700 mb-4">You may not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Redistribute, resell, or sublicense the music files</li>
                <li>Use music for illegal or defamatory purposes</li>
                <li>Claim ownership of the original compositions</li>
                <li>Use music in ways that compete with our platform</li>
                <li>Remove or alter copyright notices</li>
                <li>Use music in adult content without explicit permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Attribution Requirements</h2>
              <p className="text-gray-700 mb-4">
                When required by your license type, attribution should include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Artist name</li>
                <li>Song title</li>
                <li>"{COMPANY_INFO.name}" credit</li>
                <li>Link to our platform (when possible)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Royalty-Free vs Rights-Managed</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Royalty-Free Music</h3>
              <p className="text-gray-700 mb-4">
                Pay once, use multiple times within license terms. No additional royalties required.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Rights-Managed Music</h3>
              <p className="text-gray-700 mb-4">
                Licensed for specific use cases with defined scope, duration, and territory. 
                Additional fees may apply for extended use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Copyright and Ownership</h2>
              <p className="text-gray-700 mb-4">
                All music remains the property of the original copyright holders. Your license grants 
                usage rights only, not ownership of the underlying compositions or recordings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700 mb-4">
                Licenses may be terminated for breach of terms. Upon termination, you must cease 
                all use of licensed music and remove it from any ongoing projects.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                We provide copyright clearance for licensed music. However, users are responsible 
                for ensuring their use complies with all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact for Licensing</h2>
              <p className="text-gray-700">
                For custom licensing needs or questions about these terms:
                <br />
                Email: {COMPANY_INFO.email}
                <br />
                Subject: "Licensing Inquiry"
              </p>
            </section>
          </div>
        </div>
      </Container>
    </MainLayout>
  )
}