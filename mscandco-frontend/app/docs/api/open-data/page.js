'use client';

export default function OpenDataAPIDocs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📖 Open Data API Documentation</h1>
          <p className="text-xl text-gray-600">
            Comprehensive guide to integrating with the MSC & Co Open Data API
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-blue-600">
            <li><a href="#overview" className="hover:underline">Overview</a></li>
            <li><a href="#authentication" className="hover:underline">Authentication</a></li>
            <li><a href="#endpoints" className="hover:underline">API Endpoints</a></li>
            <li><a href="#rate-limits" className="hover:underline">Rate Limits</a></li>
            <li><a href="#data-formats" className="hover:underline">Data Formats</a></li>
            <li><a href="#examples" className="hover:underline">Code Examples</a></li>
            <li><a href="#best-practices" className="hover:underline">Best Practices</a></li>
            <li><a href="#support" className="hover:underline">Support</a></li>
          </ul>
        </div>

        {/* Overview */}
        <section id="overview" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            The MSC & Co Open Data API provides programmatic access to anonymized, aggregated music industry data.
            All data is privacy-compliant, GDPR-ready, and designed for research and analysis purposes.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="text-sm text-gray-700">
              <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">https://api.mscandco.com/v1/open-data</code>
            </p>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Authentication</h2>
          <p className="text-gray-700 mb-4">
            All API requests require authentication using an API key. Include your API key in the request header:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
            </pre>
          </div>
          <p className="text-gray-700 mb-4">
            You can generate API keys from your account dashboard. Each key has tier-based rate limits and access levels.
          </p>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Get Public Metrics</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`GET /metrics
Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>
            <p className="text-gray-700 mb-2"><strong>Description:</strong> Retrieve aggregated platform metrics</p>
            <p className="text-gray-700 mb-2"><strong>Response:</strong></p>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <pre className="text-sm overflow-x-auto">
{`{
  "total_artists": 1250,
  "total_releases": 5432,
  "total_streams": 12500000,
  "avg_artist_earnings": 1250.50,
  "genre_distribution": {
    "Pop": 25,
    "Hip-Hop": 20,
    "Rock": 15
  }
}`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Get Genre Statistics</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`GET /metrics/genres?genre=Pop
Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>
            <p className="text-gray-700 mb-2"><strong>Description:</strong> Get statistics for a specific genre</p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Get Platform Trends</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`GET /metrics/trends?period=30days
Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>
            <p className="text-gray-700 mb-2"><strong>Description:</strong> Get platform growth trends over time</p>
            <p className="text-gray-700 mb-2"><strong>Parameters:</strong></p>
            <ul className="list-disc list-inside text-gray-700 mb-3 ml-4">
              <li><code>period</code>: 7days, 30days, 90days, 1year</li>
            </ul>
          </div>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Rate Limits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hourly Limit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Free</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10,000 requests</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100 requests</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Research</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100,000 requests</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,000 requests</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Commercial</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,000,000+ requests</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10,000 requests</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-gray-700">
              Rate limit headers are included in all responses: <code className="bg-white px-2 py-1 rounded">X-RateLimit-Remaining</code> and <code className="bg-white px-2 py-1 rounded">X-RateLimit-Reset</code>
            </p>
          </div>
        </section>

        {/* Data Formats */}
        <section id="data-formats" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Data Formats</h2>
          <p className="text-gray-700 mb-4">
            All API responses are returned in JSON format. Data is anonymized and aggregated to protect privacy.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> All data is anonymized. No personally identifiable information (PII) is ever exposed.
            </p>
          </div>
        </section>

        {/* Code Examples */}
        <section id="examples" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Code Examples</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">JavaScript/Node.js</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`const fetchMetrics = async () => {
  const response = await fetch('https://api.mscandco.com/v1/open-data/metrics', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
};`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Python</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.mscandco.com/v1/open-data/metrics',
    headers=headers
)

data = response.json()
print(data)`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">cURL</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X GET \\
  https://api.mscandco.com/v1/open-data/metrics \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`}
              </pre>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Cache responses when possible to reduce API calls</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Handle rate limit errors gracefully with exponential backoff</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Use appropriate tier for your use case</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Always cite MSC & Co as the data source in publications</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Follow ethical research guidelines when using data</span>
            </li>
          </ul>
        </section>

        {/* Support */}
        <section id="support" className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Support</h2>
          <p className="text-gray-700 mb-4">
            Need help? Contact our support team:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>📧 Email: <a href="mailto:support@mscandco.com" className="text-blue-600 hover:underline">support@mscandco.com</a></li>
            <li>📖 Documentation: <a href="/docs/api/open-data" className="text-blue-600 hover:underline">Full Documentation</a></li>
            <li>💬 Support Portal: <a href="/support" className="text-blue-600 hover:underline">Visit Support</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

