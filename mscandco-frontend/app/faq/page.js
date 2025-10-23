/**
 * FAQ Page - App Router Version
 *
 * Public page with frequently asked questions
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const faqData = {
    general: {
      title: 'General Questions',
      items: [
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
        }
      ]
    },
    releases: {
      title: 'Releases & Distribution',
      items: [
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
          question: 'Which platforms do you distribute to?',
          answer: 'We distribute to all major platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal, and many more. Our network covers over 150 digital platforms worldwide.'
        }
      ]
    },
    billing: {
      title: 'Billing & Payments',
      items: [
        {
          id: 'bill-1',
          question: 'What are the pricing plans available?',
          answer: 'We offer tiered pricing plans including Starter and Pro for artists, with additional plans for labels and distributors. Each plan includes different features like analytics depth, support level, and distribution reach. Visit our pricing page for detailed comparisons.'
        },
        {
          id: 'bill-2',
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No refunds are provided for partial months, but you can continue using the platform until your period ends.'
        },
        {
          id: 'bill-3',
          question: 'How do I update my payment method?',
          answer: 'You can update your payment method in the Billing section of your account. We support major credit cards, debit cards, and digital wallets. All payment information is securely encrypted and never stored on our servers.'
        }
      ]
    },
    analytics: {
      title: 'Analytics & Earnings',
      items: [
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
        }
      ]
    },
    technical: {
      title: 'Technical Support',
      items: [
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
        }
      ]
    }
  }

  const filteredCategories = Object.entries(faqData).reduce((acc, [key, category]) => {
    const filteredItems = category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filteredItems.length > 0 || searchTerm === '') {
      acc[key] = { ...category, items: searchTerm === '' ? category.items : filteredItems }
    }
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
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
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {Object.entries(filteredCategories).map(([key, category]) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.title}
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full text-left flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <h3 className="text-lg font-medium text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      {expandedItems.has(item.id) ? (
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
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
            <Link
              href="/support"
              className="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-6 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
            >
              Contact Support
            </Link>
            <Link
              href="/about"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
