'use client'

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, FileText, CreditCard, Users, Music, Globe, Shield, Zap, Building2 } from 'lucide-react';
import Layout from '@/components/layouts/mainLayout';

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
    { id: 'pricing', name: 'Pricing & Tiers', icon: CreditCard },
    { id: 'label-pricing', name: 'Label Pricing', icon: Building2 },
    { id: 'apollo', name: 'Apollo Intelligence', icon: Zap },
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
        question: 'What makes MSC & Co different from competitors?',
        answer: 'We\'re the only music distribution platform with: (1) Progressive commission rates that reward growth (20% → 15% → 10% → 2.5%), (2) Apollo Intelligence AI assistant for onboarding and support, (3) Auto-qualification for FREE MPP Partner status when you hit milestones, (4) Real-time tier enforcement with smart upgrade prompts, and (5) Complete transparency with no hidden fees.'
      }
    ],
    pricing: [
      {
        id: 'price-1',
        question: 'What are the 4 pricing tiers?',
        answer: 'MSC Free (£0/month, 20% commission, 3 releases/year), MSC Pro (£19.99/month or £199/year, 15% commission, unlimited releases), MPP Partner (£99/month or £999/year or FREE if auto-qualified, 10% commission), and Investment Partner (£10K-£50K one-time, 2.5% commission, equity ownership). Each tier includes progressively lower commission rates and more features.'
      },
      {
        id: 'price-2',
        question: 'How do I know which tier is right for me?',
        answer: 'Start with Free to test the platform (3 releases/year). If you\'re releasing regularly, upgrade to Pro for unlimited releases and lower 15% commission. If you earn £10K+/year or have 100K+ streams, you\'ll auto-qualify for FREE MPP Partner (10% commission). Investment tier is for artists who want ownership, equity, and the lowest 2.5% rate.'
      },
      {
        id: 'price-3',
        question: 'What happens when I reach my Free tier limits?',
        answer: 'When you reach your 3 release or 15 track limit, you\'ll see an upgrade prompt showing exactly how much you\'d save with Pro\'s lower commission rate. The platform calculates your break-even point - if you\'ve earned enough, Pro actually costs less due to the 5% commission savings. You can upgrade instantly or wait until next year when limits reset on January 1st.'
      },
      {
        id: 'price-4',
        question: 'Do the commission rates apply to all my earnings?',
        answer: 'Yes, the commission rate applies to all streaming royalties, downloads, and platform earnings. For example, if you earn £1,000 on Free tier (20% commission), you keep £800. On Pro tier (15% commission), you\'d keep £850 from the same £1,000. The difference adds up quickly as you grow!'
      },
      {
        id: 'price-5',
        question: 'Can I switch tiers anytime?',
        answer: 'Yes! You can upgrade anytime. If you auto-qualify for MPP Partner while on a paid plan, we automatically upgrade you to FREE MPP Partner and cancel your subscription. You can also downgrade, but Free tier limits (3 releases/15 tracks per year) will apply going forward. All tier changes are instant.'
      }
    ],
    'label-pricing': [
      {
        id: 'label-1',
        question: 'What are the 4 label pricing tiers?',
        answer: 'Label Starter (FREE, 25% commission, 5 artists max), Label Pro (£99/month or £999/year, 18% commission, 25 artists max), MPP Partner (£499/month or £4,999/year - or FREE if auto-qualified, 12% commission, 100 artists max), and Investment Partner (£50K-£250K investment, 5% commission, unlimited). Each tier offers lower commission rates as you scale.'
      },
      {
        id: 'label-2',
        question: 'How do label tier limits work?',
        answer: 'Label tier limits are aggregated across ALL artists under your label. For example, on Label Starter (5 artists, 10 releases/year, 30 tracks/year), those limits apply to all your artists combined. Release/track limits reset January 1st, Apollo queries reset monthly on the 1st.'
      },
      {
        id: 'label-3',
        question: 'Can I qualify for FREE Partner tier as a label?',
        answer: 'Yes! Labels automatically qualify for FREE Partner tier by meeting ANY of these criteria: £50,000+ annual earnings, 500,000+ total streams, 25+ artists under label, or £10,000+ commissions paid. The system checks daily and upgrades you automatically.'
      },
      {
        id: 'label-4',
        question: 'What happens when I reach my artist limit?',
        answer: 'When you reach your artist limit (5 on Starter, 25 on Pro), you must upgrade to add more artists. The platform shows an upgrade prompt with commission savings calculations. You cannot add artists until you upgrade or remove existing artists.'
      },
      {
        id: 'label-5',
        question: 'How does label pricing differ from artist pricing?',
        answer: 'Label pricing is for label admins managing multiple artists with one subscription covering all artists. Artist pricing is for independent artists managing only their own music. Labels benefit from aggregate limits and lower commission rates as they scale.'
      },
      {
        id: 'label-6',
        question: 'What commission rates do labels pay?',
        answer: 'Label commission rates are progressive: Starter 25%, Pro 18%, Partner 12%, Enterprise 5%. The commission applies to all earnings across ALL artists under your label. Lower rates reward labels for growth and scale.'
      },
      {
        id: 'label-7',
        question: 'Can labels use Apollo Intelligence?',
        answer: 'Yes! Labels get Apollo query limits per tier: Starter 10/month, Pro 200/month, Partner 1,000/month, Enterprise unlimited. Labels can use Apollo for bulk operations, label analytics, release planning, and roster management.'
      },
      {
        id: 'label-8',
        question: 'What happens when I upgrade my label tier?',
        answer: 'When you upgrade, your new limits take effect immediately. Higher tiers unlock features like white-label branding, API access, dedicated account managers, and multi-user team access. If you auto-qualify for Partner while on a paid plan, we cancel your subscription and upgrade you to FREE Partner.'
      },
      {
        id: 'label-9',
        question: 'How many team members can I have?',
        answer: 'Team member limits by tier: Starter 1, Pro 3, Partner 10, Enterprise unlimited. Team members can be assigned different roles and permissions to help manage your label roster, releases, and analytics.'
      },
      {
        id: 'label-10',
        question: 'What is Investment Partner tier for labels?',
        answer: 'Investment Partner is our highest label tier requiring £50K-£250K one-time investment. You get 5% commission (lowest rate), equity ownership in MSC & Co, board voting rights, revenue share, unlimited everything, and custom feature development. It\'s designed for established labels wanting partnership in our growth.'
      }
    ],
    apollo: [
      {
        id: 'apollo-1',
        question: 'What is Apollo Intelligence?',
        answer: 'Apollo Intelligence is our AI-powered assistant built on OpenAI GPT-4 Turbo. Apollo helps with onboarding new users, creating releases, answering platform questions, and providing real-time guidance throughout your music career. It\'s like having a personal music distribution expert available 24/7.'
      },
      {
        id: 'apollo-2',
        question: 'How many Apollo queries do I get per tier?',
        answer: 'Free tier: 3 queries per month, Pro tier: 100 queries per month, MPP Partner: 500 queries per month, Investment Partner: Unlimited queries. Queries reset on the 1st of each month. You can also purchase Unlimited Apollo Intelligence for £9.99/month on any tier (except Investment, which is already unlimited).'
      },
      {
        id: 'apollo-3',
        question: 'What counts as an Apollo query?',
        answer: 'Each message you send to Apollo counts as one query. This includes questions during onboarding, release creation help, platform guidance, and general support. The AI remembers context within a conversation, so follow-up questions in the same session still count as separate queries.'
      },
      {
        id: 'apollo-4',
        question: 'What happens when I run out of Apollo queries?',
        answer: 'When you reach your monthly limit, you\'ll see a prompt to either: (1) Wait until next month when queries reset, (2) Upgrade to a higher tier with more queries, or (3) Add Unlimited Apollo Intelligence for £9.99/month. The prompt shows your current usage and reset date.'
      },
      {
        id: 'apollo-5',
        question: 'Is the Unlimited Apollo add-on worth it?',
        answer: 'If you\'re actively releasing music, creating multiple releases per month, or need frequent platform support, the £9.99/month Unlimited Apollo add-on is excellent value. It gives you unlimited AI assistance for less than the cost of a single support ticket on other platforms. Pro users with 100 queries/month rarely need it, but heavy users love the unlimited access.'
      },
      {
        id: 'apollo-6',
        question: 'How does Apollo help with onboarding?',
        answer: 'Apollo guides new users through the onboarding process conversationally, collecting all required personal information (name, DOB, nationality, etc.) and artist information (artist name, genre, bio). Once complete, critical personal fields are locked for security and KYC compliance. Apollo makes onboarding feel like a friendly conversation instead of a tedious form.'
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
        answer: 'We offer a 4-tier progressive pricing system: MSC Free (£0/month, 20% commission), MSC Pro (£19.99/month or £199/year, 15% commission), MPP Partner (£99/month or £999/year - or FREE if you auto-qualify, 10% commission), and Investment Partner (£10K-£50K investment, 2.5% commission). Each tier has different release limits, Apollo Intelligence query limits, and features. Visit our pricing page for detailed comparisons.'
      },
      {
        id: 'bill-2',
        question: 'What is the commission rate for each tier?',
        answer: 'Our progressive commission model rewards growth: Free tier - 20% commission (you keep 80%), Pro tier - 15% commission (you keep 85%), MPP Partner - 10% commission (you keep 90%), Investment Partner - 2.5% commission (you keep 97.5%). Lower commission rates incentivize artists to grow with us.'
      },
      {
        id: 'bill-3',
        question: 'How can I get MPP Partner for free?',
        answer: 'You can automatically qualify for FREE MPP Partner status by meeting ANY of these criteria: £10,000+ annual earnings, 100,000+ total streams, 50+ total releases, or £5,000+ commissions paid. The system checks automatically and upgrades you instantly when you qualify. No manual application needed!'
      },
      {
        id: 'bill-4',
        question: 'What are the release and track limits?',
        answer: 'Free tier: 3 releases and 15 tracks per year (enforced). Pro tier and above: Unlimited releases and tracks. Limits reset annually on January 1st. If you reach your limit, you\'ll be prompted to upgrade with a savings calculator showing how much you\'ll save.'
      },
      {
        id: 'bill-5',
        question: 'What is Apollo Intelligence and how many queries do I get?',
        answer: 'Apollo Intelligence is our AI assistant that helps with onboarding, release creation, and platform guidance. Free tier: 3 queries/month, Pro tier: 100 queries/month, MPP Partner: 500 queries/month, Investment Partner: Unlimited. You can also add unlimited Apollo AI for £9.99/month on any tier. Query limits reset monthly on the 1st.'
      },
      {
        id: 'bill-6',
        question: 'How does the billing cycle work?',
        answer: 'Billing occurs monthly or annually, with annual plans offering significant savings (approximately 2 months free). You can switch between billing cycles at any time. If you auto-qualify for MPP Partner while on a paid plan, your subscription is automatically cancelled and you get FREE MPP Partner for life.'
      },
      {
        id: 'bill-7',
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No refunds are provided for partial months, but you can continue using the platform until your period ends. Note: If you downgrade from Pro to Free, release/track limits will apply going forward.'
      },
      {
        id: 'bill-8',
        question: 'How do I update my payment method?',
        answer: 'You can update your payment method in the Billing section of your account. We support major credit cards, debit cards, and digital wallets via Revolut Business. All payment information is securely encrypted and processed by our payment partners.'
      },
      {
        id: 'bill-9',
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees! Our pricing is completely transparent. You pay either the subscription fee OR the commission rate (not both). For example, Pro tier is £199/year + 15% commission on earnings. The only optional add-on is Unlimited Apollo Intelligence for £9.99/month.'
      },
      {
        id: 'bill-10',
        question: 'When will I be prompted to upgrade?',
        answer: 'Free tier users are prompted to upgrade when they: (1) reach their release/track limit, (2) run out of Apollo Intelligence queries, or (3) earn £5,000+ in a year (we\'ll show you how much you\'d save with Pro\'s lower 15% commission). All prompts include a savings calculator so you can make informed decisions.'
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