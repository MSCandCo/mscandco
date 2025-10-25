'use client'

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Clock, Shield, TrendingUp, Plus, Edit, Trash2, Save } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function RateLimitClient() {
  const { hasPermission } = usePermissions();
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState({ blocked: 0, allowed: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRules();
    fetchStats();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/systems/ratelimit', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/systems/ratelimit/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const saveRule = async (rule) => {
    if (!hasPermission('systems:ratelimit:manage')) return;
    
    try {
      const response = await fetch('/api/admin/systems/ratelimit', {
        method: rule.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rule)
      });
      
      if (response.ok) {
        fetchRules();
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const deleteRule = async (ruleId) => {
    if (!hasPermission('systems:ratelimit:manage')) return;
    if (!confirm('Delete this rate limit rule?')) return;
    
    try {
      const response = await fetch(`/api/admin/systems/ratelimit/${ruleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-orange-600" />
              Rate Limiting
            </h1>
            <p className="text-gray-600">Configure API rate limits and monitor usage</p>
          </div>
          {hasPermission('systems:ratelimit:manage') && (
            <button
              onClick={() => setEditingRule({ endpoint: '', limit: 100, window: 60 })}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Blocked Today</p>
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.blocked}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Allowed Today</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.allowed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Block Rate</p>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.rate}%</p>
          </div>
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rate Limit Rules</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rules.map(rule => (
                <div key={rule.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.endpoint}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {rule.limit} requests per {rule.window} seconds
                      </p>
                    </div>
                    {hasPermission('systems:ratelimit:manage') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                {editingRule.id ? 'Edit' : 'Add'} Rate Limit Rule
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint Pattern
                  </label>
                  <input
                    type="text"
                    value={editingRule.endpoint}
                    onChange={(e) => setEditingRule({...editingRule, endpoint: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="/api/*"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Limit
                  </label>
                  <input
                    type="number"
                    value={editingRule.limit}
                    onChange={(e) => setEditingRule({...editingRule, limit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Window (seconds)
                  </label>
                  <input
                    type="number"
                    value={editingRule.window}
                    onChange={(e) => setEditingRule({...editingRule, window: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingRule(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveRule(editingRule)}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

