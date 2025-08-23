import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../components/layouts/mainLayout';
import Container from '../components/container';
import { useState } from 'react';

export default function Support() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: "How do I get started with MSC & Co?",
      answer: "Getting started is easy! Simply create an account, choose your plan, and you can immediately begin uploading your music and managing your releases. Our platform guides you through every step of the process."
    },
    {
      question: "Which platforms do you distribute to?",
      answer: "We distribute to all major streaming platforms including Spotify, Apple Music, Amazon Music, Deezer, Tidal, and many more. We also handle distribution to digital stores like iTunes, Google Play, and Amazon."
    },
    {
      question: "How long does it take for my music to go live?",
      answer: "Typically, it takes 1-2 weeks for your music to appear on streaming platforms after submission. However, this can vary depending on the platform and the time of year."
    },
    {
      question: "How do I track my earnings?",
      answer: "Our platform provides comprehensive analytics and earnings tracking. You can view your earnings in real-time through your dashboard, with detailed breakdowns by platform and time period."
    },
    {
      question: "What file formats do you accept?",
      answer: "We accept high-quality audio files including WAV, FLAC, and AIFF. For artwork, we accept JPG and PNG files. All files should meet our quality standards for optimal distribution."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time through your billing dashboard. Changes take effect immediately, and we'll prorate any billing adjustments."
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help with technical issues and account questions",
      contact: "support@mscandco.com",
      response: "Within 24 hours"
    },
    {
      title: "Priority Support",
      description: "Dedicated support for Pro and Enterprise users",
      contact: "priority@mscandco.com",
      response: "Within 4 hours"
    },
    {
      title: "Technical Issues",
      description: "Report bugs and technical problems",
      contact: "tech@mscandco.com",
      response: "Within 12 hours"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <Container>
            <div className="py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Support Center
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're here to help you succeed with your music distribution journey
              </p>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <Container>
          <div className="py-16">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'faq'
                    ? 'text-[#1f2937] border-b-2 border-[#1f2937]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'contact'
                    ? 'text-[#1f2937] border-b-2 border-[#1f2937]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'resources'
                    ? 'text-[#1f2937] border-b-2 border-[#1f2937]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resources
              </button>
            </div>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="bg-white rounded-lg border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {method.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold">Email:</span> {method.contact}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Response Time:</span> {method.response}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Submit a Support Ticket
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Submit Ticket
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Helpful Resources
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Getting Started Guide
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Learn the basics of uploading music, managing releases, and tracking your success.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Read Guide →
                    </a>
                  </div>

                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Best Practices
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tips and tricks for optimizing your music distribution and maximizing earnings.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View Tips →
                    </a>
                  </div>

                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Video Tutorials
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Step-by-step video guides for all platform features and workflows.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Watch Videos →
                    </a>
                  </div>

                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Community Forum
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect with other artists and share experiences, tips, and advice.
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Join Forum →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </Layout>
  );
} 