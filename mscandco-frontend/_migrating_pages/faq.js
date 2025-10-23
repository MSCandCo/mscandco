import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, FileText, CreditCard, Users, Music, Globe, Shield, Zap } from 'lucide-react';
import Layout from '../components/layouts/mainLayout';

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'releases', name: 'Releases & Distribution', icon: Music },
    { id: 'billing', name: 'Billing & Payments', icon: CreditCard },
    { id: 'roster', name: 'Roster & Contributors', icon: Users },
    { id: 'analytics', name: 'Analytics & Earnings', icon: FileText },
    { id: 'technical', name: 'Technical Support', icon: Zap },
    { id: 'legal', name: 'Legal & Compliance', icon: Shield },
    { id: 'platform', name: 'Platform Features', icon: Globe },
  ];

  const faqData = {
    general: [
      {
        id: 'gen-1',
        question: 'What is MSC & Co and how does it work?',
        answer: 'MSC & Co is a comprehensive music distribution platform that helps artists, labels, and distributors manage their music releases, track earnings, and connect with contributors. Our platform streamlines the entire distribution process from release creation to royalty tracking.'
      },
      {
        id: 'gen-2',
        question: 'How do I get started with the platform?',
        answer: 'Getting started is easy! Simply create an account, complete your artist profile, and you can immediately begin creating releases. Our onboarding process guides you through setting up your first release with all necessary metadata and contributor information.'
      },
      {
        id: 'gen-3',
        question: 'What types of artists can use this platform?',
        answer: 'Our platform supports all types of artists including solo artists, bands, producers, labels, and distributors. We offer role-based access control to ensure each user has the appropriate tools and permissions for their specific needs.'
      },
      {
        id: 'gen-4',
        question: 'Is there a minimum requirement for releases?',
        answer: 'No, there are no minimum requirements for releases. You can start with a single track or create full albums. Our platform is designed to scale with your needs, from independent artists to major labels.'
      }
    ],
    releases: [
      {
        id: 'rel-1',
        question: 'How do I create a new release?',
        answer: 'To create a new release, navigate to the "My Releases" section and click "Create New Release". You\'ll need to provide basic information like release title, artist name, genre, and release type. You can then upload audio files, artwork, and add contributor credits.'
      },
      {
        id: 'rel-2',
        question: 'What file formats are supported for audio uploads?',
        answer: 'We support high-quality audio formats including WAV (44.1kHz/24-bit minimum), FLAC, and AIFF. For distribution, we recommend WAV files as they provide the best quality for processing and distribution to various platforms.'
      },
      {
        id: 'rel-3',
        question: 'How long does the review process take?',
        answer: 'Our review process typically takes 3-5 business days. During this time, we verify all metadata, check audio quality, and ensure compliance with distribution partner requirements. You\'ll receive status updates throughout the process.'
      },
      {
        id: 'rel-4',
        question: 'Can I edit a release after it\'s submitted?',
        answer: 'You can edit releases that are in "Draft" or "In Review" status. Once a release is "Live", editing capabilities are limited to protect distribution integrity. Contact support for any necessary changes to live releases.'
      },
      {
        id: 'rel-5',
        question: 'What happens if my release is rejected?',
        answer: 'If a release is rejected, you\'ll receive detailed feedback explaining the issue. Common reasons include incomplete metadata, audio quality issues, or copyright concerns. You can address the feedback and resubmit the release.'
      }
    ],
    billing: [
      {
        id: 'bill-1',
        question: 'What are the pricing plans available?',
        answer: 'We offer tiered pricing plans including Starter and Pro for artists, with additional plans for labels and distributors. Each plan includes different features like analytics depth, support level, and distribution reach. Visit our pricing page for detailed comparisons.'
      },
      {
        id: 'bill-2',
        question: 'How does the billing cycle work?',
        answer: 'Billing occurs monthly or annually, with annual plans offering significant savings. You can switch between billing cycles at any time. All plans include a 30-day money-back guarantee for new subscribers.'
      },
      {
        id: 'bill-3',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No refunds are provided for partial months, but you can continue using the platform until your period ends.'
      },
      {
        id: 'bill-4',
        question: 'How do I update my payment method?',
        answer: 'You can update your payment method in the Billing section of your account. We support major credit cards, debit cards, and digital wallets. All payment information is securely encrypted and never stored on our servers.'
      },
      {
        id: 'bill-5',
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees! Our pricing is transparent. The subscription fee covers platform access, support, and basic distribution. Additional costs may apply for premium services like custom marketing campaigns or expedited processing.'
      }
    ],
    roster: [
      {
        id: 'ros-1',
        question: 'How do I add contributors to my roster?',
        answer: 'You can add contributors through the Roster section. Click "Add Contributor" and provide their name, role, and ISNI (if available). You can also upload profile images and specify their contribution type (producer, vocalist, etc.).'
      },
      {
        id: 'ros-2',
        question: 'What is an ISNI and why is it important?',
        answer: 'ISNI (International Standard Name Identifier) is a unique 16-digit identifier for artists and contributors. It helps ensure proper attribution and royalty distribution across all platforms. While not required, we strongly recommend including ISNIs for all contributors.'
      },
      {
        id: 'ros-3',
        question: 'Can I manage multiple contributors for one release?',
        answer: 'Absolutely! You can add multiple contributors to each release with different roles. The system tracks individual contributions and ensures proper credit distribution. You can also set different royalty splits for each contributor.'
      },
      {
        id: 'ros-4',
        question: 'How do I handle contributor permissions?',
        answer: 'Contributors can be given different permission levels. Some may have full access to view and edit releases, while others may have limited access. You control these permissions through the contributor management system.'
      }
    ],
    analytics: [
      {
        id: 'ana-1',
        question: 'What analytics are available?',
        answer: 'Our analytics include streaming data, download statistics, revenue tracking, geographic performance, and social footprint metrics. Pro plans include advanced analytics like audience demographics and playlist performance.'
      },
      {
        id: 'ana-2',
        question: 'How often is analytics data updated?',
        answer: 'Analytics data is updated daily from most platforms, with some platforms providing real-time data. Revenue data typically updates within 24-48 hours of platform reporting.'
      },
      {
        id: 'ana-3',
        question: 'Can I export my analytics data?',
        answer: 'Yes, you can export analytics data in various formats including CSV, PDF, and Excel. Pro users have access to advanced export options and automated reporting features.'
      },
      {
        id: 'ana-4',
        question: 'What is Social Footprint?',
        answer: 'Social Footprint is our comprehensive metric that combines your social media presence (Instagram, TikTok, YouTube, etc.) with music platform performance to give you a complete picture of your digital presence and influence.'
      }
    ],
    technical: [
      {
        id: 'tech-1',
        question: 'What browsers are supported?',
        answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome or Safari.'
      },
      {
        id: 'tech-2',
        question: 'How do I reset my password?',
        answer: 'You can reset your password through the login page by clicking "Forgot Password". You\'ll receive a secure link via email to create a new password. For security, links expire after 24 hours.'
      },
      {
        id: 'tech-3',
        question: 'Is my data secure?',
        answer: 'Yes, we use enterprise-grade security measures including SSL encryption, secure data centers, and regular security audits. Your audio files and personal data are protected with industry-standard encryption.'
      },
      {
        id: 'tech-4',
        question: 'Can I access the platform on mobile devices?',
        answer: 'Yes, our platform is fully responsive and works on all mobile devices. While we recommend desktop for complex tasks like release creation, you can view analytics and manage basic functions on mobile.'
      }
    ],
    legal: [
      {
        id: 'leg-1',
        question: 'What are the copyright requirements?',
        answer: 'You must own or have proper licensing for all content you upload. This includes music, artwork, and any other intellectual property. We require confirmation that you have the rights to distribute the content.'
      },
      {
        id: 'leg-2',
        question: 'How do you handle royalty distribution?',
        answer: 'Royalties are distributed according to the splits you specify in your release settings. We process payments monthly and provide detailed breakdowns of all revenue streams. Contributors receive payments based on their specified percentages.'
      },
      {
        id: 'leg-3',
        question: 'What happens if there\'s a copyright dispute?',
        answer: 'We take copyright seriously and have procedures in place to handle disputes. If a claim is made, we may temporarily suspend distribution while the matter is resolved. We work with all parties to ensure fair resolution.'
      },
      {
        id: 'leg-4',
        question: 'Are there age restrictions for using the platform?',
        answer: 'You must be at least 18 years old to use our platform, or have parental consent if you\'re between 13-17 years old. We comply with all applicable laws regarding minor users.'
      }
    ],
    platform: [
      {
        id: 'plat-1',
        question: 'Which platforms do you distribute to?',
        answer: 'We distribute to all major platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal, and many more. Our network covers over 150 digital platforms worldwide.'
      },
      {
        id: 'plat-2',
        question: 'How do I track my releases across platforms?',
        answer: 'Our platform provides unified tracking across all distribution partners. You can see real-time status updates, performance metrics, and revenue data all in one dashboard, regardless of which platforms your music is on.'
      },
      {
        id: 'plat-3',
        question: 'Can I schedule releases in advance?',
        answer: 'Yes, you can schedule releases up to 6 months in advance. This is especially useful for coordinated marketing campaigns and ensuring your music goes live at the optimal time for your audience.'
      },
      {
        id: 'plat-4',
        question: 'What marketing tools are available?',
        answer: 'We offer various marketing tools including pre-save campaigns, social media integration, email marketing templates, and promotional asset generation. Pro users get access to advanced marketing analytics and automation features.'
      }
    ]
  };

  const filteredFAQs = Object.entries(faqData).reduce((acc, [category, items]) => {
    if (activeCategory === 'all' || category === activeCategory) {
      const filtered = items.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    }
    return acc;
  }, {});

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Find answers to common questions about our music distribution platform, 
                billing, releases, and everything you need to know.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {Object.entries(filteredFAQs).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {category.replace('-', ' ')} Questions
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full text-left flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedItems.has(item.id) && (
                        <div className="mt-4 pl-2">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help 
              with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/about"
                className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 