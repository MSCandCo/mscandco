'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { Key, Copy, Check, Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function APIKeysPage() {
  const { user } = useUser();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (user) {
      loadAPIKeys();
    }
  }, [user]);

  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.api_keys || []);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async (formData) => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setNewKeyData(data);
        setShowNewKeyModal(false);
        loadAPIKeys();
      } else {
        alert(data.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    }
  };

  const revokeAPIKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/api-keys?key_id=${keyId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadAPIKeys();
      } else {
        alert(data.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return <PageLoading message="Loading API keys..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Keys</h1>
          <p className="text-gray-600">
            Generate and manage API keys to authenticate with MSC & Co's public API
          </p>
        </div>

        {/* New Key Success Modal */}
        {newKeyData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">API Key Created!</h2>
                  <p className="text-gray-600">Save this key - you won't see it again</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This is the only time you'll see the full API key. 
                  Store it securely - we don't save the full key for security reasons.
                </p>
              </div>

              <div className="bg-gray-900 text-gray-100 p-6 rounded-xl mb-6 font-mono text-sm break-all">
                {newKeyData.api_key}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(newKeyData.api_key)}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copiedKey ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={() => setNewKeyData(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create New Key Button */}
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="mb-8 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New API Key
        </button>

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No API Keys Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first API key to start building with MSC & Co
            </p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{key.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono">{key.key_prefix}...</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        key.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => revokeAPIKey(key.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    title="Revoke API Key"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revoke
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Total Requests</div>
                    <div className="font-semibold text-gray-900">{key.total_requests?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Rate Limit</div>
                    <div className="font-semibold text-gray-900">{key.rate_limit_per_hour?.toLocaleString()}/hour</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Last Used</div>
                    <div className="font-semibold text-gray-900">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Created</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(key.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Key Modal */}
        {showNewKeyModal && (
          <CreateKeyModal
            onClose={() => setShowNewKeyModal(false)}
            onCreate={createAPIKey}
          />
        )}
      </div>
    </div>
  );
}

function CreateKeyModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    rate_limit_per_hour: 1000,
    scopes: ['read'],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for your API key');
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New API Key</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Key Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Production App, Testing, MCP Server"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              value={formData.rate_limit_per_hour}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_hour: parseInt(e.target.value) })}
              min="100"
              max="10000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.scopes.includes('read')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, scopes: [...formData.scopes, 'read'] });
                    } else {
                      setFormData({ ...formData, scopes: formData.scopes.filter(s => s !== 'read') });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Read (view releases, earnings, analytics)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.scopes.includes('write')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, scopes: [...formData.scopes, 'write'] });
                    } else {
                      setFormData({ ...formData, scopes: formData.scopes.filter(s => s !== 'write') });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Write (create/update releases)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Create API Key
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

