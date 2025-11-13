'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AILearningInsights() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('predictions'); // predictions, patterns, recommendations, history
  const [intelligence, setIntelligence] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningHistory, setLearningHistory] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('streams');

  const metrics = [
    { value: 'streams', label: 'Stream Count', icon: '▶️' },
    { value: 'revenue', label: 'Revenue', icon: '💰' },
    { value: 'engagement', label: 'Engagement Rate', icon: '❤️' },
    { value: 'followers', label: 'Follower Growth', icon: '👥' },
    { value: 'playlist_adds', label: 'Playlist Adds', icon: '➕' },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadIntelligence();
        await loadPredictions();
        await loadPatterns();
        await loadRecommendations();
        await loadLearningHistory();
      }
      setLoading(false);
    }
    loadData();
  }, [selectedMetric]);

  async function loadIntelligence() {
    try {
      const response = await fetch('/api/features/ai-learning/comprehensive');
      const data = await response.json();
      setIntelligence(data.intelligence);
    } catch (error) {
      console.error('Failed to load intelligence:', error);
    }
  }

  async function loadPredictions() {
    try {
      const response = await fetch(`/api/features/ai-learning/predict?metric=${selectedMetric}&days=30`);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  }

  async function loadPatterns() {
    try {
      const response = await fetch('/api/features/ai-learning/patterns');
      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  }

  async function loadRecommendations() {
    try {
      const response = await fetch('/api/features/ai-learning/recommendations');
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }

  async function loadLearningHistory() {
    try {
      const { data } = await supabase
        .from('ai_learning_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setLearningHistory(data || []);
    } catch (error) {
      console.error('Failed to load learning history:', error);
    }
  }

  async function trackInteraction(action, metadata) {
    try {
      await fetch('/api/features/ai-learning/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: action,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 AI Learning & Predictive Insights</h1>
          <p className="text-gray-600">
            Advanced machine learning predictions, pattern detection, and personalized recommendations
          </p>
        </div>

        {/* Intelligence Overview */}
        {intelligence && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Learning Stage</div>
              <div className="text-2xl font-bold capitalize">{intelligence.learning_stage || 'Building'}</div>
              <div className="text-xs text-gray-500 mt-1">
                {intelligence.data_points_collected} data points
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Model Accuracy</div>
              <div className="text-2xl font-bold text-blue-600">
                {intelligence.model_accuracy ? `${(intelligence.model_accuracy * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Prediction confidence</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Patterns Found</div>
              <div className="text-2xl font-bold text-purple-600">
                {intelligence.patterns_detected || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Behavioral insights</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Recommendations</div>
              <div className="text-2xl font-bold text-green-600">
                {intelligence.active_recommendations || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Actionable insights</div>
            </div>
          </div>
        )}

        {/* Metric Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Select Metric to Analyze:</label>
          <div className="flex gap-2">
            {metrics.map(metric => (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedMetric === metric.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{metric.icon}</span>
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'predictions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('predictions')}
          >
            🔮 Predictions
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'patterns'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('patterns')}
          >
            🧩 Patterns
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'recommendations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            💡 Recommendations ({recommendations.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            📜 Learning History
          </button>
        </div>

        {/* TAB: Predictions */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Prediction Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">📈 30-Day Forecast</h3>
              {predictions.length > 0 ? (
                <div className="h-80">
                  <Line
                    data={{
                      labels: predictions.map(p => new Date(p.predicted_date).toLocaleDateString()),
                      datasets: [
                        {
                          label: `Predicted ${metrics.find(m => m.value === selectedMetric)?.label}`,
                          data: predictions.map(p => p.predicted_value),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Upper Bound (95% confidence)',
                          data: predictions.map(p => p.confidence_upper),
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          borderDash: [5, 5],
                          fill: false,
                        },
                        {
                          label: 'Lower Bound (95% confidence)',
                          data: predictions.map(p => p.confidence_lower),
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          borderDash: [5, 5],
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                label += selectedMetric === 'revenue'
                                  ? `£${context.parsed.y.toFixed(2)}`
                                  : context.parsed.y.toLocaleString();
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Not enough data to generate predictions. Keep using the platform to build your AI model!
                </div>
              )}
            </div>

            {/* Key Predictions */}
            {predictions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">🎯 Key Predictions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Next 7 Days</div>
                    <div className="text-2xl font-bold">
                      {selectedMetric === 'revenue' ? '£' : ''}
                      {predictions.slice(0, 7).reduce((sum, p) => sum + p.predicted_value, 0).toLocaleString()}
                    </div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${getConfidenceColor(predictions[0]?.confidence || 0)}`}>
                      {getConfidenceLabel(predictions[0]?.confidence || 0)}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Next 30 Days</div>
                    <div className="text-2xl font-bold">
                      {selectedMetric === 'revenue' ? '£' : ''}
                      {predictions.reduce((sum, p) => sum + p.predicted_value, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Trend: {predictions[predictions.length - 1]?.predicted_value > predictions[0]?.predicted_value ? '📈 Growing' : '📉 Declining'}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Peak Day</div>
                    <div className="text-lg font-bold">
                      {predictions.reduce((max, p) => p.predicted_value > max.predicted_value ? p : max, predictions[0])?.predicted_date
                        ? new Date(predictions.reduce((max, p) => p.predicted_value > max.predicted_value ? p : max, predictions[0]).predicted_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Expected: {selectedMetric === 'revenue' ? '£' : ''}
                      {predictions.reduce((max, p) => p.predicted_value > max.predicted_value ? p : max, predictions[0])?.predicted_value?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Patterns */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🧩 Detected Behavioral Patterns</h2>
              <p className="text-gray-600 mb-6">
                AI-detected patterns in your music performance and audience behavior
              </p>

              {patterns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No patterns detected yet. The AI needs more data to identify behavioral patterns.
                </div>
              ) : (
                <div className="space-y-4">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{pattern.pattern_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(pattern.confidence)}`}>
                          {(pattern.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>

                      {pattern.insights && pattern.insights.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Key Insights:</div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {pattern.insights.map((insight, i) => (
                              <li key={i}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {pattern.frequency && (
                        <div className="mt-3 text-xs text-gray-500">
                          Frequency: {pattern.frequency} | Last detected: {new Date(pattern.last_detected).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">💡 AI-Powered Recommendations</h2>
              <p className="text-gray-600 mb-6">
                Personalized, data-driven recommendations to optimize your music career
              </p>

              {recommendations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No recommendations available yet. Keep using the platform to receive personalized insights!
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`border-l-4 rounded-lg p-4 ${
                        rec.priority === 'high'
                          ? 'border-red-500 bg-red-50'
                          : rec.priority === 'medium'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{rec.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{rec.description}</p>

                      {rec.expected_impact && (
                        <div className="mb-3 p-3 bg-white rounded">
                          <div className="text-sm font-medium mb-1">Expected Impact:</div>
                          <div className="text-sm text-gray-700">{rec.expected_impact}</div>
                        </div>
                      )}

                      {rec.action_items && rec.action_items.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-2">Action Steps:</div>
                          <ul className="text-sm space-y-1">
                            {rec.action_items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          trackInteraction('recommendation_viewed', { recommendation_id: rec.id });
                          alert('Recommendation marked as viewed!');
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Learning History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">📜 AI Learning History</h2>
            <p className="text-gray-600 mb-6">
              Track how the AI learns from your interactions and improves over time
            </p>

            {learningHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No learning history yet. Start interacting with the platform to build your AI profile!
              </div>
            ) : (
              <div className="space-y-2">
                {learningHistory.map((interaction, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border rounded hover:bg-gray-50">
                    <div className="text-2xl">
                      {interaction.action_type === 'page_view' && '👁️'}
                      {interaction.action_type === 'feature_use' && '🎯'}
                      {interaction.action_type === 'release_action' && '🎵'}
                      {interaction.action_type === 'recommendation_viewed' && '💡'}
                      {interaction.action_type === 'prediction_requested' && '🔮'}
                      {!['page_view', 'feature_use', 'release_action', 'recommendation_viewed', 'prediction_requested'].includes(interaction.action_type) && '📊'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {interaction.action_type.replace(/_/g, ' ')}
                      </div>
                      {interaction.metadata && (
                        <div className="text-sm text-gray-600">
                          {typeof interaction.metadata === 'string'
                            ? interaction.metadata
                            : JSON.stringify(interaction.metadata).slice(0, 100)}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(interaction.created_at).toLocaleString()}
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
