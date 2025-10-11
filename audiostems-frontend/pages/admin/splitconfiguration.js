import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import {
  PieChart,
  Users,
  Building2,
  Percent,
  Save,
  RefreshCw,
  AlertCircle,
  Check,
  Info
} from 'lucide-react';

export default function SplitConfiguration() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Global default splits
  const [defaultSplits, setDefaultSplits] = useState({
    company_percentage: 20,
    artist_percentage: 80,
    label_percentage: 0
  });

  // Special super label admin (labeladmin@mscandco.com)
  const [superLabelAdmin, setSuperLabelAdmin] = useState(null);
  const [superLabelPercentage, setSuperLabelPercentage] = useState(20);

  // Individual overrides
  const [artistOverrides, setArtistOverrides] = useState([]);
  const [labelOverrides, setLabelOverrides] = useState([]);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverridesOnly, setShowOverridesOnly] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      // Load global configuration
      const configRes = await fetch('/api/admin/splitconfiguration', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (configRes.ok) {
        const config = await configRes.json();
        setDefaultSplits({
          company_percentage: parseFloat(config.company_percentage) || 20,
          artist_percentage: parseFloat(config.artist_percentage) || 80,
          label_percentage: parseFloat(config.label_percentage) || 0
        });

        setSuperLabelAdmin(config.super_label_admin);
        setSuperLabelPercentage(parseFloat(config.super_label_percentage) || 20);

        // Load individual overrides
        if (config.artist_overrides) {
          setArtistOverrides(config.artist_overrides);
        }
        if (config.label_overrides) {
          setLabelOverrides(config.label_overrides);
        }
      }
    } catch (error) {
      console.error('Error loading split configuration:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDefaults = async () => {
    // Validate that total equals 100%
    const total = defaultSplits.company_percentage +
                  defaultSplits.artist_percentage +
                  defaultSplits.label_percentage;

    if (Math.abs(total - 100) > 0.01) {
      setMessage({
        type: 'error',
        text: `Split percentages must total 100%. Current total: ${total.toFixed(2)}%`
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/splitconfiguration', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_percentage: defaultSplits.company_percentage,
          artist_percentage: defaultSplits.artist_percentage,
          label_percentage: defaultSplits.label_percentage,
          super_label_percentage: superLabelPercentage
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Default splits saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving splits:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverride = async (userId, percentage, type) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/splitconfiguration/override', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          percentage: parseFloat(percentage),
          type
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Override saved successfully' });
        setTimeout(() => setMessage(null), 3000);
        await loadData(); // Reload to show updated data
      } else {
        throw new Error('Failed to save override');
      }
    } catch (error) {
      console.error('Error saving override:', error);
      setMessage({ type: 'error', text: 'Failed to save override' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOverride = async (userId, type) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/splitconfiguration/override', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, type })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Override removed successfully' });
        setTimeout(() => setMessage(null), 3000);
        await loadData();
      } else {
        throw new Error('Failed to remove override');
      }
    } catch (error) {
      console.error('Error removing override:', error);
      setMessage({ type: 'error', text: 'Failed to remove override' });
    } finally {
      setSaving(false);
    }
  };

  const filteredArtists = artistOverrides.filter(artist =>
    !searchTerm ||
    artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabels = labelOverrides.filter(label =>
    !searchTerm ||
    label.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading split configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Split Configuration</h1>
              <p className="mt-2 text-sm text-gray-600">
                Configure revenue split percentages for the platform
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Revenue Split Flow:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Revenue is reported and enters the system</li>
                <li>Super Label Admin ({superLabelAdmin?.email || 'labeladmin@mscandco.com'}) gets their percentage first</li>
                <li>Remaining amount is split between Artist and Label (if artist has a label)</li>
                <li>Individual overrides take precedence over default splits</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Split Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <PieChart className="w-5 h-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Default Revenue Splits</h2>
            </div>

            <div className="space-y-6">
              {/* Super Label Admin */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <Building2 className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Super Label Admin (Company)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {superLabelAdmin?.name || 'MSC & Co'} ({superLabelAdmin?.email || 'labeladmin@mscandco.com'})
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={superLabelPercentage}
                        onChange={(e) => setSuperLabelPercentage(parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Artist / Label Split */}
              <div>
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Artist / Label Split</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  These percentages apply to the remaining amount after company cut
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artist Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={defaultSplits.artist_percentage}
                        onChange={(e) => setDefaultSplits({
                          ...defaultSplits,
                          artist_percentage: parseFloat(e.target.value)
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Admin Percentage (if artist has label)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={defaultSplits.label_percentage}
                        onChange={(e) => setDefaultSplits({
                          ...defaultSplits,
                          label_percentage: parseFloat(e.target.value)
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must total 100% with artist percentage
                    </p>
                  </div>
                </div>

                {/* Total Validation */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Total (Artist + Label):</span>
                    <span className={`font-bold ${
                      Math.abs((defaultSplits.artist_percentage + defaultSplits.label_percentage) - 100) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(defaultSplits.artist_percentage + defaultSplits.label_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveDefaults}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Default Splits'}
              </button>
            </div>
          </div>

          {/* Individual Overrides */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-700 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Individual Overrides</h2>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Set custom split percentages for specific artists or label admins
            </p>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Artists with Overrides */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Artists</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredArtists.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No artist overrides configured
                  </p>
                ) : (
                  filteredArtists.map(artist => (
                    <div key={artist.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {artist.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{artist.email}</p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">
                            {artist.percentage}%
                          </span>
                          <button
                            onClick={() => handleRemoveOverride(artist.id, 'artist')}
                            disabled={saving}
                            className="text-red-600 hover:text-red-800 text-xs underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Label Admins with Overrides */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Label Admins</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredLabels.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No label admin overrides configured
                  </p>
                ) : (
                  filteredLabels.map(label => (
                    <div key={label.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {label.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{label.email}</p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">
                            {label.percentage}%
                          </span>
                          <button
                            onClick={() => handleRemoveOverride(label.id, 'label_admin')}
                            disabled={saving}
                            className="text-red-600 hover:text-red-800 text-xs underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> To add new overrides, contact the development team or use the API directly.
                Overrides must be carefully managed to ensure revenue is split correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
