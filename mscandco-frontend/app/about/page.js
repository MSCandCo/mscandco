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
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="px-3 md:px-4 lg:px-6 m-auto max-w-7xl">
          <div className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About MSC & Co
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-4">
              AI-Native · Blockchain-Verified · Carbon-Neutral
            </p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto">
              The world's most advanced music distribution platform. Powered by AI intelligence, secured with blockchain verification, and committed to carbon neutrality.
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
                MSC & Co was founded with a revolutionary vision: to transform music distribution through cutting-edge AI technology, blockchain transparency, and environmental responsibility.
              </p>
              <p className="text-gray-600 mb-4">
                We recognized that independent artists face three critical challenges: slow payments (industry standard 3-6 months), lack of transparency, and limited access to advanced tools. While competitors rely on legacy systems, we built a next-generation platform from the ground up.
              </p>
              <p className="text-gray-600">
                Today, MSC & Co is the most technically advanced music distribution platform in existence—with 181+ AI-powered tools, instant same-day payments, blockchain-verified royalty records, and real-time carbon tracking. We're not just distributing music; we're revolutionizing how artists build sustainable careers.
              </p>
            </div>

            {/* Our Mission */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We believe every artist deserves instant payments, AI-powered insights, and complete transparency. Our platform delivers:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Instant Payments:</strong> Same-day wallet deposits vs. industry 3-6 month delays
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>AI Intelligence:</strong> Hit prediction, audio mastering, fraud detection, A&R discovery
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Blockchain Verification:</strong> Immutable royalty records on Polygon blockchain
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Carbon Neutrality:</strong> Real-time CO2 tracking with Earth/Percent integration and verified offset marketplace
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Real-Time Analytics:</strong> See every stream as it happens, not monthly reports
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Global Distribution:</strong> 150+ platforms including Spotify, Apple Music, TikTok, YouTube Music
                </li>
                <li className="flex items-start">
                  <span className="text-[#1f2937] mr-2">•</span>
                  <strong>Enterprise Features:</strong> Label management, automated splits, white-label ready
                </li>
              </ul>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Platform Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <div className="text-2xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600">
                  Hit prediction, audio mastering, artwork generation, playlist matching, and fraud detection powered by GPT-4 and advanced ML models.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <div className="text-2xl mb-3">⛓️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Verified</h3>
                <p className="text-sm text-gray-600">
                  Every royalty payment recorded on Polygon blockchain. Immutable proof of all distributions with timestamped verification certificates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="text-2xl mb-3">🌍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Carbon Neutral</h3>
                <p className="text-sm text-gray-600">
                  Real-time CO2 tracking per stream using DIMPACT methodology. Purchase verified offsets, support Earth/Percent climate initiatives, and achieve carbon neutrality badges.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Payments</h3>
                <p className="text-sm text-gray-600">
                  Same-day wallet deposits. Get paid instantly vs. industry standard 90-180 day delays. Multi-currency support with flexible payout options.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Native Innovation</h3>
                <p className="text-gray-600">
                  We're built from the ground up with AI at our core. Every feature leverages machine learning to give artists superhuman insights and capabilities.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Transparency</h3>
                <p className="text-gray-600">
                  Blockchain-verified records, real-time analytics, and transparent pricing. No hidden fees, no surprises—just complete visibility into your music career.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainability First</h3>
                <p className="text-gray-600">
                  We're the only platform tracking carbon footprint per stream. Achieve carbon neutrality and join the movement toward a sustainable music industry.
                </p>
              </div>
            </div>
          </div>

          {/* Social Impact & Sustainability */}
          <div className="mt-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Social Impact & Climate Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🌍</span>
                  <h3 className="text-2xl font-bold text-gray-900">Earth/Percent Partnership</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  MSC & Co is proud to partner with <strong>Earth/Percent</strong>, a charity founded by Brian Eno and other leading music industry figures to address the climate crisis. Through our platform, artists can automatically donate a percentage of their earnings to support climate action initiatives worldwide.
                </p>
                <p className="text-gray-700">
                  Every contribution goes directly to verified environmental projects, helping to fund renewable energy, reforestation, ocean conservation, and climate justice programs. Together, we're building a music industry that gives back to the planet.
                </p>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">♻️</span>
                  <h3 className="text-2xl font-bold text-gray-900">Carbon Neutrality Program</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  We're the first music distribution platform to offer <strong>real-time carbon tracking</strong> for every stream. Using the DIMPACT methodology (developed by the University of Bristol), we calculate the exact CO2 emissions from streaming your music.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Track carbon footprint per stream in real-time
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Purchase verified carbon offsets from premium providers
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Achieve carbon neutrality badges and certificates
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Support Earth/Percent climate initiatives automatically
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white rounded-lg border border-green-300">
              <p className="text-sm text-gray-600 italic text-center">
                "Music has the power to inspire change. By combining technology with environmental responsibility, MSC & Co empowers artists to make a positive impact on the planet while building their careers."
              </p>
            </div>
          </div>

          {/* Our Impact & Vision */}
          <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Impact & Vision</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 mb-8 text-center">
                MSC & Co was built to transform an entire industry. We're not just another distribution platform—we're creating a new standard for how music reaches the world, how artists get paid, and how technology serves creativity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🌍 Global Reach, Local Impact</h3>
                  <p className="text-gray-600 mb-3">
                    We're built to serve artists in 209 countries, supporting 94 languages, and empowering 100M+ independent creators worldwide. Our platform breaks down barriers—geographic, financial, and technological.
                  </p>
                  <p className="text-gray-600">
                    From Lagos to London, from emerging artists to established labels, we provide the same world-class tools and instant payments to everyone, regardless of location or background.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Market Transformation</h3>
                  <p className="text-gray-600 mb-3">
                    The $8 billion music distribution industry has been stagnant for too long. Legacy platforms rely on outdated technology, slow payments, and limited transparency.
                  </p>
                  <p className="text-gray-600">
                    We're disrupting this market with AI-powered insights, blockchain verification, and same-day payments—setting a new standard that forces the entire industry to evolve.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🔬 Deep Technology Innovation</h3>
                  <p className="text-gray-600 mb-3">
                    Our platform represents cutting-edge innovation across multiple domains: machine learning for hit prediction, blockchain for transparency, real-time analytics for insights, and carbon tracking for sustainability.
                  </p>
                  <p className="text-gray-600">
                    With 181+ AI tools, 95+ database tables, and 110+ API endpoints, we've built infrastructure that's years ahead of competitors—ready to scale to millions of users.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">💚 Purpose-Driven Growth</h3>
                  <p className="text-gray-600 mb-3">
                    We believe technology should serve humanity. That's why we've integrated climate action from day one—not as an afterthought, but as core to our mission.
                  </p>
                  <p className="text-gray-600">
                    Through Earth/Percent partnerships, carbon neutrality programs, and financial inclusion initiatives, we're proving that profitable growth and positive social impact can go hand-in-hand.
                  </p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-white rounded-lg border-2 border-indigo-200">
                <p className="text-center text-gray-700 italic text-lg">
                  "We're not just building a platform—we're building the future of music distribution. A future where artists have instant access to global audiences, transparent earnings, and the tools to build sustainable careers. A future where technology serves creativity, not the other way around."
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 AI Hit Prediction</h3>
                <p className="text-sm text-gray-600">
                  Predict commercial success before release. Our AI analyzes audio features, timing, social signals, and artist momentum to forecast hit potential.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 DALL-E 3 Artwork</h3>
                <p className="text-sm text-gray-600">
                  Generate professional album artwork with AI. Smart cropping for all platform requirements, unlimited variations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎵 ML Playlist Pitching</h3>
                <p className="text-sm text-gray-600">
                  AI matches your music to 15M+ playlists. Automated email campaigns with 15-25% acceptance rates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Social Media Automation</h3>
                <p className="text-sm text-gray-600">
                  Connect Instagram, TikTok, Twitter, YouTube, Facebook. AI-generated captions and scheduled posts across all platforms.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎤 Audio Mastering AI</h3>
                <p className="text-sm text-gray-600">
                  Professional-grade audio mastering powered by AI. Enhance your tracks automatically with industry-standard quality.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Fan Analytics</h3>
                <p className="text-sm text-gray-600">
                  Churn prediction, lifetime value calculation, and fan segmentation. Understand your audience like never before.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎪 Live Performance</h3>
                <p className="text-sm text-gray-600">
                  Create and manage concerts with Ticketmaster and Eventbrite integration. Track ticket sales and post-show analytics.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👕 Print-on-Demand</h3>
                <p className="text-sm text-gray-600">
                  Merchandise store with Printful integration. Create apparel, vinyl, posters—no inventory needed, automatic fulfillment.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🛡️ Copyright Protection</h3>
                <p className="text-sm text-gray-600">
                  Pre-publication sample clearance, blockchain registration, AI monitoring, and DMCA takedown filing. Protect your work.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose MSC & Co</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Instant Payments</h3>
                <p className="text-gray-600">
                  Get paid same day to your wallet vs. industry standard 3-6 months. No more waiting for rent money. Real-time earnings tracking with flexible payout options via Revolut.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🌍 Global Distribution</h3>
                <p className="text-gray-600">
                  Distribute to 150+ platforms including Spotify, Apple Music, Amazon Music, YouTube Music, TikTok, Tidal, and more. Reach audiences worldwide.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Real-Time Analytics</h3>
                <p className="text-gray-600">
                  See every stream as it happens. Advanced demographics, retention analysis, and predictive insights—not monthly batch reports like competitors.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🏢 Enterprise Ready</h3>
                <p className="text-gray-600">
                  Built for labels and distributors. Automated revenue splits, unlimited artists, white-label capability, and 200+ granular permissions for complete control.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Bank-Level Security</h3>
                <p className="text-gray-600">
                  GDPR compliant, DSA compliant, EU AI Act ready. Row-level security, encrypted data, immutable audit trails. Your data is protected.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">💬 Expert Support</h3>
                <p className="text-gray-600">
                  Our dedicated support team understands the music industry. Email, chat, and VIP support available. We're here to help you succeed.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mt-16 bg-gray-900 text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Built on Modern Technology</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">181+</div>
                <div className="text-sm text-gray-300">MCP Tools</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">95+</div>
                <div className="text-sm text-gray-300">Database Tables</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">110+</div>
                <div className="text-sm text-gray-300">API Endpoints</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-sm text-gray-300">Streaming Platforms</div>
              </div>
            </div>
            <p className="text-center text-gray-300 mt-6 text-sm">
              Next.js 15 · PostgreSQL 17 · OpenAI GPT-4 · Polygon Blockchain · Enterprise-Grade Security
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Music Career?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the next generation of artists using AI-powered distribution, blockchain verification, and instant payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/register'}
                className="bg-transparent text-[#1f2937] border-2 border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
            >
              Create Free Account
            </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-[#1f2937] text-white border-2 border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937]"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
