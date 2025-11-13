'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

export default function FanEngagementAnalytics() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('overview'); // overview, churn, segments, actions
  const [fanStats, setFanStats] = useState(null);
  const [churnPredictions, setChurnPredictions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadFanStats();
        await loadChurnPredictions();
        await loadSegments();
        await loadRecentActions();
      }
      setLoading(false);
    }
    loadData();
  }, [timeRange]);

  async function loadFanStats() {
    try {
      const response = await fetch(`/api/features/fans/stats?time_range=${timeRange}`);
      const data = await response.json();
      setFanStats(data.stats);
    } catch (error) {
      console.error('Failed to load fan stats:', error);
    }
  }

  async function loadChurnPredictions() {
    try {
      const response = await fetch('/api/features/fans/predict-churn');
      const data = await response.json();
      setChurnPredictions(data.predictions || []);
    } catch (error) {
      console.error('Failed to load churn predictions:', error);
    }
  }

  async function loadSegments() {
    try {
      const response = await fetch('/api/features/fans/segments');
      const data = await response.json();
      setSegments(data.segments || []);
    } catch (error) {
      console.error('Failed to load segments:', error);
    }
  }

  async function loadRecentActions() {
    try {
      const response = await fetch(`/api/features/fans/actions?limit=50`);
      const data = await response.json();
      setRecentActions(data.actions || []);
    } catch (error) {
      console.error('Failed to load actions:', error);
    }
  }

  const getChurnRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getChurnRiskLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getEngagementColor = (level) => {
    const colors = {
      superfan: 'bg-purple-100 text-purple-800',
      highly_engaged: 'bg-green-100 text-green-800',
      moderately_engaged: 'bg-blue-100 text-blue-800',
      lightly_engaged: 'bg-yellow-100 text-yellow-800',
      at_risk: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fan analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">👥 Fan Engagement & Churn Prediction</h1>
          <p className="text-gray-600">
            AI-powered fan behavior analysis with churn prediction and engagement insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Time Range:</label>
          <div className="flex gap-2">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md font-medium ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'churn'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('churn')}
          >
            ⚠️ Churn Predictions ({churnPredictions.filter(p => p.churn_risk_score >= 70).length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'segments'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('segments')}
          >
            🎯 Segments ({segments.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'actions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('actions')}
          >
            📈 Recent Activity
          </button>
        </div>

        {/* TAB: Overview */}
        {activeTab === 'overview' && fanStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Fans</div>
                <div className="text-3xl font-bold">{fanStats.total_fans?.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-1">
                  +{fanStats.new_fans_this_period} this period
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Avg Engagement</div>
                <div className="text-3xl font-bold text-blue-600">
                  {fanStats.avg_engagement_score}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Across all platforms
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">At-Risk Fans</div>
                <div className="text-3xl font-bold text-red-600">
                  {fanStats.at_risk_fans}
                </div>
                <div className="text-xs text-red-500 mt-1">
                  {fanStats.churn_rate}% churn rate
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Superfans</div>
                <div className="text-3xl font-bold text-purple-600">
                  {fanStats.superfans}
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  Top {((fanStats.superfans / fanStats.total_fans) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Engagement Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Fan Engagement Distribution</h3>
              <div className="grid grid-cols-5 gap-4">
                {fanStats.engagement_distribution && Object.entries(fanStats.engagement_distribution).map(([level, count]) => (
                  <div key={level} className="text-center">
                    <div className={`px-4 py-6 rounded-lg ${getEngagementColor(level)}`}>
                      <div className="text-3xl font-bold">{count}</div>
                      <div className="text-xs mt-1 capitalize">{level.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Platforms */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Fan Activity by Platform</h3>
              {fanStats.platform_breakdown && (
                <div className="space-y-3">
                  {Object.entries(fanStats.platform_breakdown).map(([platform, data]) => (
                    <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {platform === 'spotify' && '🎵'}
                          {platform === 'apple_music' && '🍎'}
                          {platform === 'youtube' && '▶️'}
                          {platform === 'instagram' && '📷'}
                          {platform === 'tiktok' && '🎵'}
                        </span>
                        <div>
                          <div className="font-semibold capitalize">{platform.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-gray-600">{data.fans?.toLocaleString()} fans</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{data.actions?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">actions</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Engagement Trends */}
            {fanStats.engagement_trends && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Engagement Trends</h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: fanStats.engagement_trends.map(t => new Date(t.date).toLocaleDateString()),
                      datasets: [
                        {
                          label: 'Average Engagement',
                          data: fanStats.engagement_trends.map(t => t.avg_engagement),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Churn Predictions */}
        {activeTab === 'churn' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">⚠️ AI Churn Risk Predictions</h2>
              <p className="text-gray-600 mb-6">
                Machine learning predictions of fans likely to disengage. Take action to retain them!
              </p>

              {churnPredictions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No churn predictions available. Need more fan data to generate predictions.
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">High Risk</div>
                      <div className="text-3xl font-bold text-red-600">
                        {churnPredictions.filter(p => p.churn_risk_score >= 70).length}
                      </div>
                      <div className="text-xs text-red-500">Immediate action needed</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-gray-600">Medium Risk</div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {churnPredictions.filter(p => p.churn_risk_score >= 40 && p.churn_risk_score < 70).length}
                      </div>
                      <div className="text-xs text-yellow-500">Monitor closely</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Low Risk</div>
                      <div className="text-3xl font-bold text-green-600">
                        {churnPredictions.filter(p => p.churn_risk_score < 40).length}
                      </div>
                      <div className="text-xs text-green-500">Engaged & stable</div>
                    </div>
                  </div>

                  {/* High Risk Fans Table */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">High Risk Fans (Immediate Attention)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3 text-left">Fan ID</th>
                            <th className="p-3 text-left">Platform</th>
                            <th className="p-3 text-center">Risk Score</th>
                            <th className="p-3 text-center">Engagement Level</th>
                            <th className="p-3 text-center">Last Active</th>
                            <th className="p-3 text-left">Recommended Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {churnPredictions
                            .filter(p => p.churn_risk_score >= 70)
                            .slice(0, 20)
                            .map((prediction, idx) => (
                              <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{prediction.fan_id.slice(0, 8)}...</td>
                                <td className="p-3 capitalize">{prediction.platform}</td>
                                <td className="p-3 text-center">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getChurnRiskColor(prediction.churn_risk_score)}`}>
                                    {prediction.churn_risk_score}%
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getEngagementColor(prediction.engagement_level)}`}>
                                    {prediction.engagement_level?.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-sm">
                                  {prediction.days_since_last_action} days ago
                                </td>
                                <td className="p-3 text-sm">
                                  {prediction.recommended_action || 'Send re-engagement content'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Recommendations */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">💡 Retention Strategies</h3>
                    <ul className="text-sm space-y-2">
                      <li>• <strong>Personalized Content:</strong> Send exclusive content to high-risk fans</li>
                      <li>• <strong>Special Offers:</strong> Early access to new releases or merch discounts</li>
                      <li>• <strong>Direct Engagement:</strong> Personal messages or shoutouts</li>
                      <li>• <strong>Re-engagement Campaigns:</strong> Targeted email or social media campaigns</li>
                      <li>• <strong>Behind-the-Scenes:</strong> Exclusive studio updates or personal stories</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: Segments */}
        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🎯 Fan Segments</h2>
              <p className="text-gray-600 mb-6">
                Automatically grouped fans based on behavior, engagement, and preferences
              </p>

              {segments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No segments available. Segments will appear as fan data accumulates.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {segments.map((segment, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold">{segment.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {segment.fan_count} fans
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Avg Engagement:</span>
                          <span className="ml-2 font-semibold">{segment.avg_engagement}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Churn Risk:</span>
                          <span className={`ml-2 font-semibold ${
                            segment.avg_churn_risk >= 70 ? 'text-red-600' :
                            segment.avg_churn_risk >= 40 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {segment.avg_churn_risk}%
                          </span>
                        </div>
                      </div>
                      {segment.top_platforms && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs text-gray-500 mb-1">Top Platforms:</div>
                          <div className="flex gap-2">
                            {segment.top_platforms.map(p => (
                              <span key={p} className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Recent Actions */}
        {activeTab === 'actions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">📈 Recent Fan Activity</h2>
            <p className="text-gray-600 mb-6">
              Real-time feed of fan engagement actions across all platforms
            </p>

            {recentActions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No recent actions. Activity will appear here as fans interact with your content.
              </div>
            ) : (
              <div className="space-y-2">
                {recentActions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border rounded hover:bg-gray-50">
                    <div className="text-2xl">
                      {action.action_type === 'stream' && '▶️'}
                      {action.action_type === 'like' && '❤️'}
                      {action.action_type === 'share' && '📤'}
                      {action.action_type === 'playlist_add' && '➕'}
                      {action.action_type === 'follow' && '👤'}
                      {action.action_type === 'comment' && '💬'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {action.action_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Fan {action.fan_id?.slice(0, 8)} • {action.platform}
                        {action.content_id && ` • Content: ${action.content_id.slice(0, 8)}`}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(action.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
