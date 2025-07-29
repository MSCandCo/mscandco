import Layout from '../components/layouts/mainLayout';

export default function About() {
  return (
    <Layout>
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
                    <span className="text-blue-600 mr-2">•</span>
                    Simplify music distribution across all major platforms
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Provide transparent analytics and earnings tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Offer comprehensive artist management tools
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Support both individual artists and label operations
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-gray-600">
                    We're building a community of artists, labels, and industry professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center bg-white rounded-lg p-8 border">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of artists who trust MSC & Co for their music distribution needs.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </a>
                <a
                  href="/pricing"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 