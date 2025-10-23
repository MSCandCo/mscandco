/**
 * About Page - App Router Version
 *
 * Public page about MSC & Co
 */
'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="px-3 md:px-4 lg:px-6 m-auto max-w-7xl">
          <div className="py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About MSC & Co
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering artists and labels with cutting-edge music distribution and management tools
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 md:px-4 lg:px-6 m-auto max-w-7xl">
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Our Story */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                MSC & Co was founded with a simple mission: to democratize music distribution
                and give independent artists the tools they need to succeed in the modern music industry.
              </p>
              <p className="text-gray-600 mb-4">
                We understand the challenges that artists face in today's digital landscape.
                From complex distribution processes to limited access to major platforms,
                independent musicians often struggle to reach their audience and monetize their work effectively.
              </p>
              <p className="text-gray-600">
                That's why we've built a comprehensive platform that simplifies the entire
                music distribution process while providing powerful analytics and management tools.
              </p>
            </div>

            {/* Our Mission */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We believe that every artist deserves the opportunity to reach global audiences
                and build sustainable careers in music. Our platform is designed to:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Provide comprehensive music distribution services
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Offer publishing and licensing opportunities
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Support both gospel/christian and general music
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Offer comprehensive artist management tools
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Support both individual artists and label operations
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  Ensure fair compensation and transparent royalty tracking
                </li>
              </ul>
            </div>
          </div>

          {/* Our Values */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously innovate to provide the most advanced tools and features for music distribution.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in all our processes, from earnings to distribution.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Empowerment</h3>
                <p className="text-gray-600">
                  We empower artists to take control of their careers and maximize their potential.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose MSC & Co</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
                <p className="text-gray-600">
                  Distribute your music to all major streaming platforms worldwide, including Spotify,
                  Apple Music, Amazon Music, and more.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fair Compensation</h3>
                <p className="text-gray-600">
                  We believe in fair pay. Keep 100% of your rights and receive transparent royalty
                  tracking with flexible payout options.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Powerful Analytics</h3>
                <p className="text-gray-600">
                  Track your performance with comprehensive analytics dashboards that give you insights
                  into your audience and earnings.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Support</h3>
                <p className="text-gray-600">
                  Our dedicated support team understands the music industry and is here to help you
                  succeed every step of the way.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of artists who trust MSC & Co to distribute their music globally.
            </p>
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
  )
}
