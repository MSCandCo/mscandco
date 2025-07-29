import Layout from '../components/layouts/mainLayout';
import { Shield, Lock, Eye, User, Database, Globe, Bell } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "December 15, 2024";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Shield className="w-16 h-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Your privacy is important to us. Learn how we collect, use, and protect your information.
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
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Introduction
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    MSC & Co ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our music distribution platform and related services.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    By using our platform, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-3 text-blue-600" />
                  Information We Collect
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Name, email address, and contact information</li>
                      <li>Artist profile information (stage name, bio, social media links)</li>
                      <li>Payment and billing information</li>
                      <li>Profile images and media content</li>
                      <li>Communication preferences and settings</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Platform usage patterns and preferences</li>
                      <li>Release and distribution data</li>
                      <li>Analytics and performance metrics</li>
                      <li>Technical information (IP address, browser type, device information)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Music files and audio content</li>
                      <li>Artwork and visual materials</li>
                      <li>Metadata and release information</li>
                      <li>Contributor and credit information</li>
                      <li>Marketing materials and promotional content</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-blue-600" />
                  How We Use Your Information
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Service Provision</h4>
                      <p className="text-gray-600 text-sm">
                        To provide and maintain our music distribution services, process payments, and manage your account.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                      <p className="text-gray-600 text-sm">
                        To send important updates, notifications, and respond to your inquiries and support requests.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Analytics & Improvement</h4>
                      <p className="text-gray-600 text-sm">
                        To analyze usage patterns, improve our platform, and develop new features and services.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance</h4>
                      <p className="text-gray-600 text-sm">
                        To comply with legal obligations, resolve disputes, and enforce our terms and policies.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-blue-600" />
                  Information Sharing and Disclosure
                </h2>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Distribution Partners</h4>
                    <p className="text-yellow-700 text-sm">
                      We share your music and metadata with distribution partners (Spotify, Apple Music, etc.) to facilitate distribution of your content.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Other Sharing Scenarios:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in platform operations</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                      <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                      <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-blue-600" />
                  Data Security
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We implement industry-standard security measures to protect your information:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Encryption</h4>
                      <p className="text-green-700 text-sm">
                        All data is encrypted in transit and at rest using SSL/TLS protocols.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Access Controls</h4>
                      <p className="text-green-700 text-sm">
                        Strict access controls and authentication measures protect your data.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Regular Audits</h4>
                      <p className="text-green-700 text-sm">
                        Regular security assessments and vulnerability testing.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Data Backups</h4>
                      <p className="text-green-700 text-sm">
                        Secure backup systems ensure data integrity and availability.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-3 text-blue-600" />
                  Your Privacy Rights
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    You have the following rights regarding your personal information:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Access & Portability</h4>
                      <p className="text-gray-600 text-sm">
                        Request access to your data and receive a copy in a portable format.
                      </p>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Correction</h4>
                      <p className="text-gray-600 text-sm">
                        Request correction of inaccurate or incomplete information.
                      </p>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Deletion</h4>
                      <p className="text-gray-600 text-sm">
                        Request deletion of your personal information (subject to legal requirements).
                      </p>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Opt-Out</h4>
                      <p className="text-gray-600 text-sm">
                        Opt out of marketing communications and certain data processing activities.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar technologies to enhance your experience:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                        <p className="text-gray-600 text-sm">Required for platform functionality and security</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                        <p className="text-gray-600 text-sm">Help us understand how you use our platform</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Preference Cookies</h4>
                        <p className="text-gray-600 text-sm">Remember your settings and preferences</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-600"><strong>Email:</strong> privacy@mscandco.com</p>
                    <p className="text-gray-600"><strong>Address:</strong> MSC & Co, Privacy Team</p>
                    <p className="text-gray-600"><strong>Support:</strong> <a href="/support" className="text-blue-600 hover:underline">Contact Support</a></p>
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