import Layout from '../components/layouts/mainLayout';
import { FileText, Shield, Users, CreditCard, AlertTriangle, CheckCircle, Globe, Lock } from 'lucide-react';

export default function TermsOfUse() {
  const lastUpdated = "December 15, 2024";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <FileText className="w-16 h-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms of Use
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                The terms and conditions that govern your use of our music distribution platform.
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
                  <FileText className="w-6 h-6 mr-3 text-purple-600" />
                  Agreement to Terms
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    These Terms of Use ("Terms") constitute a legally binding agreement between you and MSC & Co ("we," "us," or "our") regarding your use of our music distribution platform and related services.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
                  </p>
                </div>
              </section>

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  Account Registration and Security
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Account Creation</h4>
                    <p className="text-blue-700 text-sm">
                      You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Account Responsibilities:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Maintain the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Ensure all account information is accurate and up-to-date</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Not share your account credentials with others</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-purple-600" />
                  Acceptable Use Policy
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Permitted Uses</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Music distribution and management</li>
                        <li>• Analytics and reporting</li>
                        <li>• Contributor management</li>
                        <li>• Marketing and promotion</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Prohibited Uses</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Illegal or unauthorized content</li>
                        <li>• Copyright infringement</li>
                        <li>• Platform abuse or manipulation</li>
                        <li>• Harmful or malicious activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Content Guidelines */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-purple-600" />
                  Content Guidelines and Standards
                </h2>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Content Requirements</h4>
                    <p className="text-yellow-700 text-sm">
                      All content uploaded to our platform must comply with our content guidelines and applicable laws. You are responsible for ensuring your content meets these standards.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Content Standards:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Content must be original or properly licensed</li>
                      <li>No copyright infringement or unauthorized use</li>
                      <li>No defamatory, obscene, or harmful content</li>
                      <li>No spam, misleading, or fraudulent content</li>
                      <li>Compliance with all applicable laws and regulations</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-purple-600" />
                  Payment Terms and Billing
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Subscription Payments</h4>
                    <p className="text-blue-700 text-sm">
                      Subscription fees are billed in advance on a monthly or annual basis. All payments are non-refundable except as required by law or as specified in our refund policy.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Payment Terms:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Fees are charged automatically on your billing cycle</li>
                      <li>Failed payments may result in service suspension</li>
                      <li>Price changes will be communicated 30 days in advance</li>
                      <li>Taxes may apply based on your location</li>
                      <li>Refunds are processed according to our refund policy</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-purple-600" />
                  Intellectual Property Rights
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Content</h4>
                      <p className="text-gray-600 text-sm">
                        You retain ownership of your original content. You grant us a license to use your content for distribution and platform services.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Our Platform</h4>
                      <p className="text-gray-600 text-sm">
                        Our platform, software, and services are protected by intellectual property laws. You may not copy, modify, or reverse engineer our technology.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy and Data */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-purple-600" />
                  Privacy and Data Protection
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Data Protection</h4>
                    <p className="text-green-700 text-sm">
                      We are committed to protecting your privacy and personal data. Our data practices are governed by our Privacy Policy, which is incorporated into these Terms.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Data Practices:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>We collect and process data as described in our Privacy Policy</li>
                      <li>Your data is protected using industry-standard security measures</li>
                      <li>We do not sell your personal information to third parties</li>
                      <li>You have rights regarding your data as outlined in our Privacy Policy</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-purple-600" />
                  Service Availability and Maintenance
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Service Commitment</h4>
                    <p className="text-blue-700 text-sm">
                      We strive to provide reliable and consistent service. However, we do not guarantee uninterrupted access and may perform maintenance that temporarily affects service availability.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Service Terms:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>We aim for 99.9% platform uptime</li>
                      <li>Scheduled maintenance is communicated in advance</li>
                      <li>Emergency maintenance may occur without notice</li>
                      <li>Service availability may vary by region</li>
                      <li>We are not liable for temporary service interruptions</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Termination Rights</h4>
                    <p className="text-yellow-700 text-sm">
                      Either party may terminate this agreement at any time. We may terminate accounts for violations of these Terms or for any other reason at our discretion.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Termination Effects:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Immediate suspension of platform access</li>
                      <li>Processing of outstanding payments and royalties</li>
                      <li>Removal of content from distribution (subject to partner agreements)</li>
                      <li>Retention of data as required by law or our policies</li>
                      <li>No refunds for partial months unless required by law</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitations</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Service Disclaimers</h4>
                    <p className="text-gray-700 text-sm">
                      Our services are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Limitation of Liability:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Our liability is limited to the amount paid for services</li>
                      <li>We are not liable for indirect or consequential damages</li>
                      <li>No liability for lost profits, data, or business opportunities</li>
                      <li>Limitations apply to the maximum extent permitted by law</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    You agree to indemnify, defend, and hold harmless MSC & Co and its affiliates from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of our services, your content, or your violation of these Terms.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Disputes</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Jurisdiction</h4>
                    <p className="text-blue-700 text-sm">
                      These Terms are governed by the laws of the jurisdiction where MSC & Co is incorporated. Any disputes will be resolved through binding arbitration or in the courts of that jurisdiction.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Dispute Resolution:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Disputes are resolved through binding arbitration</li>
                      <li>Arbitration is conducted by a neutral arbitrator</li>
                      <li>Class action lawsuits are waived</li>
                      <li>Small claims court actions are permitted</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Modification of Terms</h4>
                  <p className="text-purple-700 text-sm">
                    We may modify these Terms at any time. Material changes will be communicated via email and platform notifications. Your continued use of our services after changes constitutes acceptance of the modified Terms.
                  </p>
                </div>
              </section>

              {/* Severability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    If you have any questions about these Terms of Use, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-600"><strong>Email:</strong> legal@mscandco.com</p>
                    <p className="text-gray-600"><strong>Address:</strong> MSC & Co, Legal Department</p>
                    <p className="text-gray-600"><strong>Support:</strong> <a href="/support" className="text-purple-600 hover:underline">Contact Support</a></p>
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