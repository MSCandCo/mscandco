import Layout from '../components/layouts/mainLayout';
import { FileText, Music, Globe, Shield, Users, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LicenseTerms() {
  const lastUpdated = "December 15, 2024";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <FileText className="w-16 h-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                License Terms
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Understanding your rights and obligations when using our music distribution platform.
              </p>
              <p className="text-sm opacity-75 mt-4">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-green-600" />
                  Introduction
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    These License Terms ("Terms") govern your use of MSC & Co's music distribution platform and services. By using our platform, you agree to be bound by these terms and all applicable laws and regulations.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    These terms apply to all users, including artists, labels, distributors, and contributors who use our platform for music distribution and related services.
                  </p>
                </div>
              </section>

              {/* Platform License */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-green-600" />
                  Platform License
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Grant of License</h4>
                    <p className="text-green-700 text-sm">
                      MSC & Co grants you a limited, non-exclusive, non-transferable license to use our platform for music distribution purposes in accordance with these terms.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">License Scope:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Access to our distribution platform and tools</li>
                      <li>Use of analytics and reporting features</li>
                      <li>Access to contributor management systems</li>
                      <li>Use of marketing and promotional tools</li>
                      <li>Access to support and customer service</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Content Licensing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Music className="w-6 h-6 mr-3 text-green-600" />
                  Content Licensing and Rights
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Content Rights</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        You retain all rights to your original content. By uploading content to our platform, you grant us a limited license to distribute your music to our partner platforms and provide related services.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">License Grant to MSC & Co</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Right to distribute your music to partner platforms</li>
                      <li>Right to use metadata for distribution purposes</li>
                      <li>Right to display content in our platform interface</li>
                      <li>Right to use content for promotional purposes (with your consent)</li>
                      <li>Right to process and analyze content for service improvement</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Rights</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        You must ensure you have all necessary rights and permissions for any content you upload, including music, artwork, and contributor information. You are responsible for obtaining proper licenses and clearances.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Distribution Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-green-600" />
                  Distribution Rights and Territories
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Global Distribution</h4>
                      <p className="text-gray-600 text-sm">
                        Our platform enables worldwide distribution to over 150 digital platforms and streaming services.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Territory Control</h4>
                      <p className="text-gray-600 text-sm">
                        You can specify which territories your music should be distributed to or excluded from.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Platform Selection</h4>
                      <p className="text-gray-600 text-sm">
                        Choose which specific platforms and services should receive your content.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Rights Management</h4>
                      <p className="text-gray-600 text-sm">
                        Manage and update distribution rights and permissions at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contributor Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-green-600" />
                  Contributor and Credit Rights
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Credit Attribution</h4>
                    <p className="text-green-700 text-sm">
                      All contributors must be properly credited in accordance with industry standards and legal requirements. Our platform ensures proper attribution across all distribution channels.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Contributor Responsibilities:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Ensure all contributors have provided consent for distribution</li>
                      <li>Maintain accurate and up-to-date contributor information</li>
                      <li>Resolve any disputes regarding credits or royalties</li>
                      <li>Comply with ISNI and other identification standards</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Royalty and Revenue */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-green-600" />
                  Royalty and Revenue Distribution
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Revenue Collection</h4>
                    <p className="text-blue-700 text-sm">
                      We collect royalties and revenue from distribution partners on your behalf and distribute them according to your specified splits and agreements.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Revenue Distribution Terms:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Revenue is distributed according to your specified splits</li>
                      <li>Processing fees may apply to certain transactions</li>
                      <li>Minimum payout thresholds apply to all accounts</li>
                      <li>Monthly reporting and payment schedules</li>
                      <li>Tax reporting and documentation provided</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Prohibited Uses */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
                  Prohibited Uses
                </h2>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Content Restrictions</h4>
                    <p className="text-red-700 text-sm">
                      You may not upload content that is illegal, infringing, defamatory, or violates the rights of others. This includes unauthorized covers, samples, or derivative works.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Prohibited Activities:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Uploading content you don't own or have rights to</li>
                      <li>Violating copyright or intellectual property rights</li>
                      <li>Attempting to circumvent platform security measures</li>
                      <li>Using the platform for unauthorized commercial purposes</li>
                      <li>Sharing account credentials with unauthorized users</li>
                      <li>Uploading malicious content or attempting to harm the platform</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Service Level Agreement */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  Service Level Agreement
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Platform Availability</h4>
                      <p className="text-green-700 text-sm">
                        We strive for 99.9% platform uptime. Scheduled maintenance is communicated in advance.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Support Response</h4>
                      <p className="text-green-700 text-sm">
                        Standard support requests are responded to within 24 hours during business days.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Data Security</h4>
                      <p className="text-green-700 text-sm">
                        Industry-standard encryption and security measures protect your content and data.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Backup & Recovery</h4>
                      <p className="text-green-700 text-sm">
                        Regular backups ensure your content is safe and recoverable in case of issues.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Account Termination</h4>
                    <p className="text-yellow-700 text-sm">
                      Either party may terminate this agreement with 30 days written notice. Upon termination, your content will be removed from distribution within 90 days, subject to existing contractual obligations.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Termination Effects:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Access to platform services will be suspended</li>
                      <li>Outstanding royalties will be processed and paid</li>
                      <li>Your content will be removed from distribution</li>
                      <li>Data retention policies will apply to your information</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    MSC & Co's liability is limited to the amount paid for services in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages, including lost profits or data.
                  </p>
                </div>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    You agree to indemnify and hold harmless MSC & Co from any claims, damages, or expenses arising from your use of the platform, your content, or your violation of these terms.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to License Terms</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    We may update these terms from time to time. Material changes will be communicated via email and platform notifications. Your continued use of the platform constitutes acceptance of updated terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    For questions about these License Terms or licensing matters, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-600"><strong>Email:</strong> legal@mscandco.com</p>
                    <p className="text-gray-600"><strong>Address:</strong> MSC & Co, Legal Department</p>
                    <p className="text-gray-600"><strong>Support:</strong> <a href="/support" className="text-green-600 hover:underline">Contact Support</a></p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 