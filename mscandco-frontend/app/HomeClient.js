'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function HomeClient() {
  const [activeMyth, setActiveMyth] = useState(1) // Default to index 1 (Digital Distribution is Too Expensive)
  const timeoutRef = useRef(null)

  const myths = [
    { text: "You Need a Major Label to Succeed", image: "/images/myth-1.png" },
    { text: "Digital Distribution is Too Expensive", image: null }, // Pricing card
    { text: "Independent Artists Can't Compete", image: "/images/myth-3.png" },
    { text: "Gospel Music Has Limited Reach", image: "/images/myth-4.png" },
    { text: "You Need Connections to Get Heard", image: "/images/myth-5.png" }
  ]

  // All available video IDs
  const allVideoIds = [
    'jKd5lFaNQRY', 'VZfGJlD2SbY', 'C-be3I6RulQ', 'pb4KwPKJoFM', 'AB-3Av8RYo8',
    'PYUx2fLCGtc', 'dkPClcO4Whw', 'f2oxGYpuLkw', 'QKVJQkrQ35I', 'a6kAbZuDIdA',
    'Jv_4BfyH7Dg', 'T1LRsp8qBY0', 'qzXjYLkgq3s', 'koWvyXIWrqs', 'GFF2xl3kkeU',
    'oUk_70d0KeM', 'S_WLGu2f19c', 'FBtYIaIgu6U', 'TD6wY8v8C-g', 'iSY2P7z7e30',
    'ym7Q1po1wqQ', '0N8jWaBQUuA', 'D9iFy7XtwPo', 'fpCLZMYB1xk', 'DfG_fSMQagw',
    'KzvElaklFx0', 'jHZJsHE5fcU'
  ]

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Use allVideoIds initially, then shuffle on mount to avoid hydration mismatch
  const [shuffledVideos, setShuffledVideos] = useState(allVideoIds)

  // Shuffle videos after mount to avoid hydration mismatch
  useEffect(() => {
    setShuffledVideos(shuffleArray(allVideoIds))
  }, [])

  const handleMouseEnter = (index) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveMyth(index)
  }

  const handleMouseLeave = () => {
    // Set timeout to return to default after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setActiveMyth(1) // Return to default (Digital Distribution is Too Expensive)
    }, 3000)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section>
        <div className="w-full relative">
          <div
            className="h-[370px] md:h-[670px] bg-cover bg-no-repeat bg-right md:bg-center"
            style={{ backgroundImage: 'url("/desktop-hero.jpg")' }}
          ></div>
          <div className="md:absolute md:inset-y-0 md:left-[8%] flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12 md:py-4 text-center md:text-left md:text-white md:max-w-md">
              <div className="mb-6 flex justify-center md:justify-start">
                <img
                  src="/logos/MSCandCoLogoV2.svg"
                  alt="MSC & Co Logo"
                  className="h-16 md:h-20 w-auto filter brightness-0 invert"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                AI-Native Music Distribution & Publishing
              </h1>
              <h3 className="text-xl font-normal mb-8">
                The first and only AI-native music distribution platform. Manage your releases, track your earnings, and grow your career through AI-powered insights. Purpose-built for gospel, Christian, and general music creators.
              </h3>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm md:bg-black/20 text-[#1f2937] md:text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
                  AI-Powered
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm md:bg-black/20 text-[#1f2937] md:text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
                  Global Distribution
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm md:bg-black/20 text-[#1f2937] md:text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/30">
                  Instant Analytics
                </span>
              </div>
              <button
                className="bg-transparent text-[#1f2937] border border-[#1f2937] md:text-white md:border-white rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white md:hover:bg-white md:hover:text-[#1f2937] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] md:focus:ring-white mx-auto md:ml-0"
                onClick={() => window.location.href = '/register'}
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Music Distribution Myths Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center lg:min-h-[500px]">
            {/* Left Column - Myths List */}
            <div className="w-full lg:w-3/12 flex justify-center lg:justify-end lg:items-center">
              <div className="flex flex-col justify-center">
                <div className="flex flex-col gap-6">
                  {myths.map((myth, index) => (
                    <div
                      key={index}
                      className={`text-left text-lg font-bold cursor-pointer transition-colors duration-200 ${
                        activeMyth === index ? 'text-gray-900' : 'text-gray-300 hover:text-gray-600'
                      }`}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleMouseEnter(index)}
                    >
                      {myth.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - Pricing Card or Image */}
            <div className="w-full lg:w-4/12 flex justify-center lg:justify-start lg:items-center">
              <div className="relative max-w-sm mx-auto">
                {activeMyth === 1 ? (
                  // Myth 2 (index 1): Show pricing card
                  <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-800">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Artist Starter</h3>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-800">£9.99</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700 mb-8 text-left">
                        {[
                          'Up to 10 releases per year',
                          'Basic analytics dashboard',
                          'Email support only',
                          'Distribution to 5+ major platforms',
                          'Basic earnings overview',
                          'Standard release management',
                          'Basic artist profile'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => window.location.href = '/register'}
                        className="w-full bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl py-3 px-6 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
                      >
                        Get Started Today
                      </button>
                    </div>
                  </div>
                ) : (
                  // Other myths: Show image
                  <img
                    src={myths[activeMyth].image}
                    alt={myths[activeMyth].text}
                    className="w-full h-auto transition-opacity duration-300"
                  />
                )}
              </div>
            </div>

            {/* Right Column - Title & CTA */}
            <div className="w-full lg:w-3/12 text-center lg:text-left flex flex-col justify-center lg:items-start">
              <div className="flex flex-col justify-center">
                <h2 className="text-5xl font-bold mb-8">Music Distribution Myths</h2>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performing Releases Section - Video Carousel */}
      <section className="py-12 bg-gray-800 text-gray-100 overflow-hidden">
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Top Performing Releases</h2>
          </div>
          <div className="relative overflow-hidden w-full">
            <div className="flex space-x-8 animate-scroll">
              {/* First set of videos */}
              {shuffledVideos.map((videoId) => (
                <div
                  key={videoId}
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                >
                  <div className="relative w-96 h-60 bg-gray-900 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                    {/* Thumbnail as background while video loads */}
                    <img
                      src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {shuffledVideos.map((videoId, index) => (
                <div
                  key={`${videoId}-duplicate-${index}`}
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                >
                  <div className="relative w-96 h-60 bg-gray-900 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                    {/* Thumbnail as background while video loads */}
                    <img
                      src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Vision Statement Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            From Studio to Streams. From Vision to Revenue.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Empowering artists and labels with AI-powered insights to reach the world with their music.
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              AI-powered tools built for the modern music creator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Distribution</h3>
              <p className="text-gray-600">
                Distribute your music to all major streaming platforms including Spotify, Apple Music, Amazon Music, and more.
              </p>
            </div>

            {/* Feature 2 - AI Analytics */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                AI-POWERED
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Analytics</h3>
              <p className="text-gray-600">
                Get intelligent insights and predictions about your releases, audience growth, and revenue opportunities powered by advanced AI.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Payments</h3>
              <p className="text-gray-600">
                Get paid quickly with transparent royalty tracking and flexible payout options.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast Releases</h3>
              <p className="text-gray-600">
                Submit your music and go live on streaming platforms in as little as 24-48 hours.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rights Protection</h3>
              <p className="text-gray-600">
                Keep 100% of your rights while we handle distribution and royalty collection.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Get help from our dedicated support team who understand the music industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Choose the plan that's right for you. No hidden fees, no surprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="bg-white text-indigo-600 rounded-xl px-8 py-3 font-bold shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              View Pricing Plans
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-transparent text-white border-2 border-white rounded-xl px-8 py-3 font-bold shadow-lg transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Artists Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our artists are saying about MSC & Co
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "MSC & Co made it incredibly easy to get my music on all the major platforms. The analytics dashboard helps me understand my audience better than ever before."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-700 font-bold text-lg">SA</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sarah Anderson</p>
                  <p className="text-sm text-gray-600">Gospel Artist</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The pricing is fair and transparent. I love that I keep all my rights and get paid quickly. Customer support has been fantastic!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-700 font-bold text-lg">MJ</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Marcus Johnson</p>
                  <p className="text-sm text-gray-600">Independent Artist</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "As a label admin, MSC & Co gives me the tools I need to manage multiple artists efficiently. The platform is intuitive and powerful."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-700 font-bold text-lg">EC</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Emily Chen</p>
                  <p className="text-sm text-gray-600">Label Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Share Your Music with the World?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of artists who trust MSC & Co to distribute their music globally.
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="bg-white text-gray-900 rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Get Started for Free
          </button>
          <p className="mt-4 text-sm text-gray-400">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
