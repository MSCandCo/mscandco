'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line, Bar, Pie } from 'react-chartjs-2';
import BrandedModal from '@/components/modals/BrandedModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OpenDataResearch() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, api-keys, usage, data-export, research
  const [apiKeys, setApiKeys] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [publicMetrics, setPublicMetrics] = useState(null);
  const [researchPapers, setResearchPapers] = useState([]);
  const [apiTier, setApiTier] = useState('free');

  // API Key form
  const [keyForm, setKeyForm] = useState({
    name: '',
    tier: 'free',
    purpose: '',
  });

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [researchForm, setResearchForm] = useState({
    title: '',
    institution: '',
    principal_investigator: '',
    email: '',
    phone: '',
    research_objectives: '',
    methodology: '',
    expected_outcomes: '',
    data_requirements: '',
    timeline: '',
    funding_source: '',
    ethical_approval: false,
    additional_info: ''
  });
  const [submittingResearch, setSubmittingResearch] = useState(false);

  const apiTiers = [
    {
      value: 'free',
      label: 'Free Tier',
      limit: '10,000 requests/month',
      cost: '£0',
      features: ['Basic anonymized metrics', 'Aggregated data only', 'Daily rate limits'],
    },
    {
      value: 'research',
      label: 'Research Tier',
      limit: '100,000 requests/month',
      cost: '£99/month',
      features: ['Extended historical data', 'Granular breakdowns', 'Academic collaboration tools', 'Priority support'],
    },
    {
      value: 'commercial',
      label: 'Commercial Tier',
      limit: '1,000,000+ requests/month',
      cost: '£999/month',
      features: ['Full dataset access', 'Real-time data', 'Custom endpoints', 'Dedicated support', 'SLA guarantees'],
    },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadAPIKeys();
        await loadUsageStats();
        await loadPublicMetrics();
        await loadResearchPapers();
        await loadUserTier();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadAPIKeys() {
    try {
      const response = await fetch('/api/features/open-data/api-keys');
      const data = await response.json();
      setApiKeys(data.api_keys || data.keys || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setApiKeys([]);
    }
  }

  async function loadUsageStats() {
    try {
      const response = await fetch('/api/features/open-data/usage');
      const data = await response.json();
      setUsageStats(data.stats || null);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      setUsageStats(null);
    }
  }

  async function loadPublicMetrics() {
    try {
      const response = await fetch('/api/features/open-data/metrics');
      const data = await response.json();
      setPublicMetrics(data.metrics || null);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setPublicMetrics(null);
    }
  }

  async function loadResearchPapers() {
    try {
      const response = await fetch('/api/features/open-data/research-papers');
      const data = await response.json();
      setResearchPapers(data.papers || []);
    } catch (error) {
      console.error('Failed to load research papers:', error);
    }
  }

  async function loadUserTier() {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('open_data_tier')
        .single();

      setApiTier(data?.open_data_tier || 'free');
    } catch (error) {
      console.error('Failed to load tier:', error);
    }
  }

  async function createAPIKey() {
    if (!keyForm.name || !keyForm.purpose) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch('/api/features/open-data/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_name: keyForm.name,
          tier: keyForm.tier,
          description: keyForm.purpose
        }),
      });

      const data = await response.json();

      if (data.success || data.api_key) {
        const apiKey = data.api_key?.api_key || data.api_key;
        setSuccessMessage(`API Key created successfully!\n\nKey: ${apiKey}\n\nPlease save this key securely - it won't be shown again.`);
        setShowSuccessModal(true);
        setKeyForm({ name: '', tier: 'free', purpose: '' });
        await loadAPIKeys();
      } else {
        setErrorMessage(data.error || 'Failed to create API key');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Create error:', error);
      setErrorMessage('Failed to create API key: ' + error.message);
      setShowErrorModal(true);
    }
  }

  async function revokeAPIKey(keyId) {
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/features/open-data/api-keys?id=${keyId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok || data.success) {
          setSuccessMessage('API key revoked successfully');
          setShowSuccessModal(true);
          await loadAPIKeys();
        } else {
          setErrorMessage(data.error || 'Failed to revoke API key');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Revoke error:', error);
        setErrorMessage('Failed to revoke: ' + error.message);
        setShowErrorModal(true);
      }
    });
    setShowConfirmModal(true);
  }

  async function exportData(format) {
    try {
      const response = await fetch(`/api/features/open-data/export?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `msc-co-data-export-${Date.now()}.${format}`;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`Data exported successfully as ${format.toUpperCase()}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage('Failed to export data: ' + error.message);
      setShowErrorModal(true);
    }
  }

  async function submitResearchProposal() {
    if (!researchForm.title || !researchForm.institution || !researchForm.principal_investigator || !researchForm.email || !researchForm.research_objectives) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    setSubmittingResearch(true);
    try {
      const response = await fetch('/api/features/open-data/research-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Research proposal submitted successfully! We will review your proposal and get back to you soon.');
        setShowSuccessModal(true);
        setShowResearchModal(false);
        setResearchForm({
          title: '',
          institution: '',
          principal_investigator: '',
          email: '',
          phone: '',
          research_objectives: '',
          methodology: '',
          expected_outcomes: '',
          data_requirements: '',
          timeline: '',
          funding_source: '',
          ethical_approval: false,
          additional_info: ''
        });
      } else {
        setErrorMessage(data.error || 'Failed to submit research proposal');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Research proposal error:', error);
      setErrorMessage('Failed to submit research proposal: ' + error.message);
      setShowErrorModal(true);
    } finally {
      setSubmittingResearch(false);
    }
  }

  const getKeyStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📈 Open Data & Research API</h1>
          <p className="text-gray-600">
            Access anonymized industry data, contribute to music research, and leverage public metrics for insights
          </p>
        </div>

        {/* Tier Banner */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Current Tier</div>
              <div className="text-3xl font-bold text-blue-600 capitalize">{apiTier}</div>
              <div className="text-sm text-gray-600 mt-1">
                {apiTiers.find(t => t.value === apiTier)?.limit || 'Custom limits'}
              </div>
            </div>
            {apiTier === 'free' && (
              <button
                onClick={() => setActiveTab('api-keys')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
              >
                Upgrade for More Access
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            📈 Dashboard
          </button>
          <button
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              activeTab === 'api-keys'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('api-keys')}
          >
            🔐 API Keys ({apiKeys.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              activeTab === 'usage'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('usage')}
          >
            📊 Usage Stats
          </button>
          <button
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              activeTab === 'data-export'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('data-export')}
          >
            📦 Data Export
          </button>
          <button
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              activeTab === 'research'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('research')}
          >
            🔍 Research & Papers
          </button>
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {publicMetrics && publicMetrics.total_artists !== null ? (
              <>
                {/* Public Metrics Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Platform Artists</div>
                    <div className="text-3xl font-bold">{publicMetrics.total_artists?.toLocaleString() || 0}</div>
                    {publicMetrics.new_artists_this_month && (
                      <div className="text-xs text-green-600 mt-1">+{publicMetrics.new_artists_this_month} this month</div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Releases</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {publicMetrics.total_releases?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">Across all genres</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Streams</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {publicMetrics.total_streams?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-purple-500 mt-1">Last 30 days</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Avg Artist Earnings</div>
                    <div className="text-3xl font-bold text-green-600">
                      £{publicMetrics.avg_artist_earnings?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-green-500 mt-1">Monthly</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No public metrics available yet.</p>
                <p className="text-gray-400 text-sm mt-2">Metrics will appear here once data is available.</p>
              </div>
            )}

            {/* Genre Distribution */}
            {publicMetrics && publicMetrics.genre_distribution && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Genre Distribution</h3>
                {publicMetrics.genre_distribution && (
                <div className="h-64">
                  <Pie
                    data={{
                      labels: Object.keys(publicMetrics.genre_distribution),
                      datasets: [{
                        data: Object.values(publicMetrics.genre_distribution),
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.7)',
                          'rgba(54, 162, 235, 0.7)',
                          'rgba(255, 206, 86, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                          'rgba(153, 102, 255, 0.7)',
                          'rgba(255, 159, 64, 0.7)',
                        ],
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                </div>
                )}
              </div>
            )}

            {/* Platform Trends */}
            {publicMetrics && publicMetrics.growth_trends && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Platform Growth Trends</h3>
                {publicMetrics.growth_trends && (
                <div className="h-80">
                  <Line
                    data={{
                      labels: publicMetrics.growth_trends.map(t => t.month),
                      datasets: [
                        {
                          label: 'Total Artists',
                          data: publicMetrics.growth_trends.map(t => t.artists),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Total Releases',
                          data: publicMetrics.growth_trends.map(t => t.releases),
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>

            {/* Data Access Info */}
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🔐 Privacy & Data Protection</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• All data is anonymized and aggregated to protect artist privacy</li>
                <li>• No personally identifiable information (PII) is ever exposed through the API</li>
                <li>• Data is collected with explicit artist consent and can be opted out at any time</li>
                <li>• We follow GDPR, CCPA, and other global data protection regulations</li>
                <li>• Research institutions must follow ethical research guidelines</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: API Keys */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            {/* Create New API Key */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">🔐 Create API Key</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Key Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={keyForm.name}
                    onChange={(e) => setKeyForm({...keyForm, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="My Research Project API Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purpose/Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={keyForm.purpose}
                    onChange={(e) => setKeyForm({...keyForm, purpose: e.target.value})}
                    className="w-full h-24 px-4 py-2 border rounded-md"
                    placeholder="Describe how you'll use this API key..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Tier</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {apiTiers.map(tier => (
                      <button
                        key={tier.value}
                        onClick={() => setKeyForm({...keyForm, tier: tier.value})}
                        className={`p-4 border rounded-lg text-left ${
                          keyForm.tier === tier.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-bold text-lg mb-1">{tier.label}</div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">{tier.cost}</div>
                        <div className="text-sm text-gray-600 mb-3">{tier.limit}</div>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {tier.features.map((feature, idx) => (
                            <li key={idx}>✓ {feature}</li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createAPIKey}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                >
                  Generate API Key
                </button>
              </div>
            </div>

            {/* Existing API Keys */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Your API Keys</h2>

              {apiKeys.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No API keys yet. Create one above to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map(key => (
                    <div key={key.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg">{key.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{key.purpose}</div>
                          <div className="font-mono text-xs text-gray-500 mt-2">
                            {key.key_preview || `${key.key?.slice(0, 20)}...`}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getKeyStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Tier</div>
                          <div className="font-semibold capitalize">{key.tier}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Requests This Month</div>
                          <div className="font-semibold">{key.requests_this_month?.toLocaleString() || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Created</div>
                          <div className="font-semibold">{new Date(key.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => revokeAPIKey(key.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                      >
                        Revoke Key
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Documentation Link */}
            <div className="p-6 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">📖 API Documentation</h3>
              <p className="text-gray-700 mb-4">
                Learn how to integrate the MSC & Co Open Data API into your applications with our comprehensive
                documentation, code examples, and interactive playground.
              </p>
              <a
                href="/docs/api/open-data"
                target="_blank"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700"
              >
                View API Docs
              </a>
            </div>
          </div>
        )}

        {/* TAB: Usage Stats */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            {usageStats ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">📊 API Usage Statistics</h2>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Requests This Month</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {usageStats.requests_this_month?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {usageStats.remaining_requests?.toLocaleString() || 0} remaining
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Successful Requests</div>
                      <div className="text-3xl font-bold text-green-600">
                        {usageStats.total_requests > 0 
                          ? ((usageStats.successful_requests / usageStats.total_requests) * 100).toFixed(1)
                          : 0}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Success rate</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                      <div className="text-3xl font-bold text-purple-600">
                        {usageStats.avg_response_time || 0}ms
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Endpoint latency</div>
                    </div>
                  </div>

                  {usageStats.daily_usage && usageStats.daily_usage.length > 0 && (
                <div className="h-64">
                  <Bar
                    data={{
                      labels: usageStats.daily_usage.map(d => new Date(d.date).toLocaleDateString()),
                      datasets: [{
                        label: 'API Requests',
                        data: usageStats.daily_usage.map(d => d.requests),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                  </div>
                  )}

                  {/* Most Used Endpoints */}
                  {usageStats.top_endpoints && usageStats.top_endpoints.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-bold mb-4">Most Used Endpoints</h3>
                      <div className="space-y-2">
                        {usageStats.top_endpoints.map((endpoint, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="font-mono text-sm">{endpoint.path}</div>
                            <div className="text-sm text-gray-600">{endpoint.requests?.toLocaleString()} requests</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No usage statistics available yet.</p>
                <p className="text-gray-400 text-sm mt-2">Usage stats will appear here once you start using the API.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Data Export */}
        {activeTab === 'data-export' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">📦 Export Platform Data</h2>

            <p className="text-gray-700 mb-6">
              Export anonymized, aggregated platform data for research, analysis, or compliance purposes.
              All exports comply with GDPR and include only non-identifiable information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportData('csv')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-4xl mb-3">📄</div>
                <div className="font-bold text-lg">CSV Export</div>
                <div className="text-sm text-gray-600 mt-2">
                  Comma-separated values format, compatible with Excel and Google Sheets
                </div>
              </button>

              <button
                onClick={() => exportData('json')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-4xl mb-3">🔗</div>
                <div className="font-bold text-lg">JSON Export</div>
                <div className="text-sm text-gray-600 mt-2">
                  JavaScript Object Notation, ideal for programmatic access and APIs
                </div>
              </button>

              <button
                onClick={() => exportData('xlsx')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-4xl mb-3">📊</div>
                <div className="font-bold text-lg">Excel Export</div>
                <div className="text-sm text-gray-600 mt-2">
                  Microsoft Excel format with formatted sheets and charts
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">ℹ️ Export Guidelines</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Exports are limited to your API tier's data access level</li>
                <li>• Data is aggregated and anonymized to protect artist privacy</li>
                <li>• Commercial use requires Commercial Tier subscription</li>
                <li>• Academic use must cite MSC & Co as the data source</li>
                <li>• Exports are rate-limited to prevent abuse</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: Research & Papers */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">🔍 Research Papers & Collaboration</h2>

              <p className="text-gray-700 mb-6">
                Explore published research using MSC & Co data, submit your own research proposals, or
                collaborate with our research partners to advance the music industry.
              </p>

              {researchPapers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No research papers available yet. Check back soon!
                </div>
              ) : (
                <div className="space-y-4">
                  {researchPapers.map((paper, idx) => (
                    <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold mb-2">{paper.title}</h3>
                      <div className="text-sm text-gray-600 mb-3">
                        {paper.authors} • {paper.institution} • {new Date(paper.published_date).getFullYear()}
                      </div>
                      <p className="text-gray-700 mb-4">{paper.abstract}</p>
                      <div className="flex gap-2">
                        {paper.pdf_url && (
                          <a
                            href={paper.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Read Paper (PDF)
                          </a>
                        )}
                        {paper.doi && (
                          <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                          >
                            View DOI
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research Proposal */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-lg mb-2">📋 Submit a Research Proposal</h3>
              <p className="text-gray-700 mb-4">
                Are you a researcher interested in using MSC & Co data for academic purposes?
                We offer grants and extended data access for approved research projects.
              </p>
              <button 
                onClick={() => setShowResearchModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700"
              >
                Submit Research Proposal
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <BrandedModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          size="md"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          }
        >
          <p className="text-gray-700 whitespace-pre-line">{errorMessage}</p>
        </BrandedModal>

        <BrandedModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success"
          size="md"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          }
        >
          <p className="text-gray-700 whitespace-pre-line">{successMessage}</p>
        </BrandedModal>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            if (confirmAction) {
              confirmAction();
            }
            setShowConfirmModal(false);
          }}
          title="Confirm Action"
          message="Are you sure you want to revoke this API key? This action cannot be undone."
          confirmText="Revoke"
          cancelText="Cancel"
          type="danger"
        />

        <BrandedModal
          isOpen={showResearchModal}
          onClose={() => setShowResearchModal(false)}
          title="Submit Research Proposal"
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResearchModal(false)}
                disabled={submittingResearch}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitResearchProposal}
                disabled={submittingResearch}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {submittingResearch ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Research Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={researchForm.title}
                onChange={(e) => setResearchForm({...researchForm, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="e.g., Music Streaming Patterns in the Digital Age"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={researchForm.institution}
                  onChange={(e) => setResearchForm({...researchForm, institution: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="University or Research Institution"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Principal Investigator <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={researchForm.principal_investigator}
                  onChange={(e) => setResearchForm({...researchForm, principal_investigator: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={researchForm.email}
                  onChange={(e) => setResearchForm({...researchForm, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="contact@institution.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={researchForm.phone}
                  onChange={(e) => setResearchForm({...researchForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Research Objectives <span className="text-red-500">*</span>
              </label>
              <textarea
                value={researchForm.research_objectives}
                onChange={(e) => setResearchForm({...researchForm, research_objectives: e.target.value})}
                className="w-full h-24 px-4 py-2 border rounded-md"
                placeholder="Describe the main objectives and goals of your research..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Methodology</label>
              <textarea
                value={researchForm.methodology}
                onChange={(e) => setResearchForm({...researchForm, methodology: e.target.value})}
                className="w-full h-20 px-4 py-2 border rounded-md"
                placeholder="Describe your research methodology..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expected Outcomes</label>
              <textarea
                value={researchForm.expected_outcomes}
                onChange={(e) => setResearchForm({...researchForm, expected_outcomes: e.target.value})}
                className="w-full h-20 px-4 py-2 border rounded-md"
                placeholder="What outcomes do you expect from this research?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Requirements</label>
              <textarea
                value={researchForm.data_requirements}
                onChange={(e) => setResearchForm({...researchForm, data_requirements: e.target.value})}
                className="w-full h-20 px-4 py-2 border rounded-md"
                placeholder="What specific data do you need for your research?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Timeline</label>
                <input
                  type="text"
                  value={researchForm.timeline}
                  onChange={(e) => setResearchForm({...researchForm, timeline: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="e.g., 6 months, 1 year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Funding Source</label>
                <input
                  type="text"
                  value={researchForm.funding_source}
                  onChange={(e) => setResearchForm({...researchForm, funding_source: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="e.g., NSF Grant, University Funding"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={researchForm.ethical_approval}
                  onChange={(e) => setResearchForm({...researchForm, ethical_approval: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">I have obtained ethical approval for this research</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <textarea
                value={researchForm.additional_info}
                onChange={(e) => setResearchForm({...researchForm, additional_info: e.target.value})}
                className="w-full h-20 px-4 py-2 border rounded-md"
                placeholder="Any additional information you'd like to share..."
              />
            </div>
          </div>
        </BrandedModal>
      </div>
    </div>
  );
}
