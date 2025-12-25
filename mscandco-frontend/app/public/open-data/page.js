'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function OpenDataPortalPage() {
  const supabase = createClient();

  const [metrics, setMetrics] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [trends, setTrends] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load public metrics
      const { data: metricsData } = await supabase
        .from('open_data_metrics')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      setMetrics(metricsData || []);

      // Load datasets
      const { data: datasetsData } = await supabase
        .from('research_datasets')
        .select('*')
        .eq('access_level', 'public')
        .order('published_at', { ascending: false });

      setDatasets(datasetsData || []);

      // Load streaming trends
      const { data: trendsData } = await supabase
        .from('streaming_trends')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      setTrends(trendsData || []);

      // Load user's API keys (if authenticated)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: keysData } = await supabase
          .from('open_data_api_keys')
          .select('*')
          .eq('user_id', user.id);

        setApiKeys(keysData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading open data:', error);
      setLoading(false);
    }
  }

  async function generateAPIKey() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in to generate API keys');
        return;
      }

      const apiKey = `msc_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const { data, error } = await supabase
        .from('open_data_api_keys')
        .insert([
          {
            user_id: user.id,
            api_key: apiKey,
            access_level: 'free',
            rate_limit_per_hour: 100,
            monthly_request_quota: 10000,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await loadData();
      setShowAPIKeyModal(false);
      alert('API Key generated successfully!');
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key');
    }
  }

  const topGenres = trends
    .reduce((acc, t) => {
      const existing = acc.find((g) => g.genre === t.genre);
      if (existing) {
        existing.streams += Number(t.stream_count || 0);
      } else {
        acc.push({ genre: t.genre, streams: Number(t.stream_count || 0) });
      }
      return acc;
    }, [])
    .sort((a, b) => b.streams - a.streams)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Open Data Portal</h1>
        <p className="mt-2 text-gray-600">
          Access anonymized music industry insights and trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Public Metrics</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {metrics.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available data points</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Research Datasets</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {datasets.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">For academic use</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">API Requests</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">1.2M+</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Researchers</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">500+</p>
          <p className="text-xs text-gray-500 mt-1">Active users</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Data & Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending Genres */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Trending Genres</h2>
            <div className="space-y-3">
              {topGenres.map((genre, index) => (
                <div key={genre.genre} className="flex items-center space-x-4">
                  <div className="w-8 text-center font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {genre.genre}
                      </span>
                      <span className="text-sm text-gray-600">
                        {(genre.streams / 1000000).toFixed(1)}M streams
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (genre.streams / topGenres[0].streams) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Datasets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Research Datasets ({datasets.length})
            </h2>

            {datasets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No datasets available yet
              </div>
            ) : (
              <div className="space-y-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {dataset.dataset_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {dataset.dataset_description}
                        </p>

                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span>📊 {dataset.row_count?.toLocaleString()} rows</span>
                          <span>
                            📦 {(dataset.dataset_size_bytes / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <span>
                            📅{' '}
                            {new Date(dataset.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        {dataset.citation_text && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                            <strong>Citation:</strong> {dataset.citation_text}
                          </div>
                        )}
                      </div>

                      <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Metrics</h2>

            <div className="grid grid-cols-2 gap-4">
              {metrics.slice(0, 8).map((metric) => (
                <div
                  key={metric.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => setSelectedMetric(metric)}
                >
                  <p className="text-sm text-gray-600">{metric.metric_name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {typeof metric.metric_value === 'number'
                      ? metric.metric_value.toLocaleString()
                      : metric.metric_value}
                  </p>
                  {metric.metric_unit && (
                    <p className="text-xs text-gray-500 mt-1">
                      {metric.metric_unit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - API & Tools */}
        <div className="space-y-6">
          {/* API Access */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🔌 API Access
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Access all data programmatically via RESTful API
            </p>

            {apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="bg-white rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        {key.access_level.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          key.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                      {key.api_key}
                    </code>
                    <div className="mt-2 text-xs text-gray-500">
                      {key.monthly_request_quota?.toLocaleString()} requests/month
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowAPIKeyModal(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Generate API Key
              </button>
            )}
          </div>

          {/* API Documentation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">API Documentation</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">Base URL</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">
                  https://api.mscandco.com/v1
                </code>
              </div>

              <div>
                <p className="font-medium text-gray-900">Endpoints</p>
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  <li>• GET /metrics - Public metrics</li>
                  <li>• GET /datasets - Research datasets</li>
                  <li>• GET /trends - Streaming trends</li>
                  <li>• GET /genres - Genre statistics</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-900">Authentication</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>

            <a
              href="/docs/api"
              className="block w-full text-center mt-4 px-4 py-2 border border-gray-300 rounded hover:border-green-500 transition text-sm"
            >
              View Full Documentation →
            </a>
          </div>

          {/* Use Cases */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Use Cases
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Academic research & papers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📈</span>
                <span>Market trend analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔍</span>
                <span>Genre popularity tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                <span>Machine learning models</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>Third-party applications</span>
              </li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">🔒 Privacy</h3>
            <p className="text-xs text-gray-600">
              All data is anonymized using differential privacy techniques. No
              personally identifiable information is included. Data is aggregated
              at minimum thresholds to prevent re-identification.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Generation Modal */}
      {showAPIKeyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Generate API Key</h3>
              <button
                onClick={() => setShowAPIKeyModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Free Tier</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ 10,000 requests/month</li>
                  <li>✓ 100 requests/hour</li>
                  <li>✓ Access to public metrics</li>
                  <li>✓ Streaming trends data</li>
                </ul>
              </div>

              <button
                onClick={generateAPIKey}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Generate Free API Key
              </button>

              <p className="text-xs text-gray-500 text-center">
                Need higher limits?{' '}
                <a href="/contact" className="text-green-600 hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
