// Manual Earnings Management Interface - Similar to Analytics System
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import { 
  DollarSign, 
  Plus, 
  Trash2,
  Save,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  CreditCard,
  Globe,
  Music,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ManualEarningsInterface({ selectedArtistId, selectedArtistData, onDataUpdated }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Basic Earnings State (4 key metrics)
  const [basicMetrics, setBasicMetrics] = useState({
    totalEarnings: { value: 0, label: 'Total Earnings', change: '0%' },
    thisMonth: { value: 0, label: 'This Month', change: '0%' },
    available: { value: 0, label: 'Available', change: '0%' },
    growth: { value: 0, label: 'Growth', change: '0%', isPercentage: true }
  });

  // Advanced Earnings State
  const [advancedMetrics, setAdvancedMetrics] = useState({
    totalEarnings: { value: 0, label: 'Total Earnings' },
    streamingRevenue: { value: 0, label: 'Streaming Revenue' },
    syncRevenue: { value: 0, label: 'Sync Revenue' },
    growthRate: { value: 0, label: 'Growth Rate', isPercentage: true },
    pending: { value: 0, label: 'Pending' }
  });

  // Dynamic Platform Revenue
  const [platformRevenue, setPlatformRevenue] = useState([
    { id: 1, platform: 'Spotify', revenue: 0, percentage: 0, color: 'bg-green-500' },
    { id: 2, platform: 'Apple Music', revenue: 0, percentage: 0, color: 'bg-gray-800' },
    { id: 3, platform: 'YouTube Music', revenue: 0, percentage: 0, color: 'bg-red-500' }
  ]);

  // Dynamic Territory Revenue
  const [territoryRevenue, setTerritoryRevenue] = useState([
    { id: 1, country: '🇺🇸 United States', revenue: 0, percentage: 0 },
    { id: 2, country: '🇬🇧 United Kingdom', revenue: 0, percentage: 0 },
    { id: 3, country: '🇩🇪 Germany', revenue: 0, percentage: 0 }
  ]);

  // Date Range for Advanced
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    period: '30d'
  });

  // Section Visibility
  const [sectionVisibility, setSectionVisibility] = useState({
    basicMetrics: true,
    earningsOverview: true,
    recentTransactions: true,
    payoutSection: true,
    advancedMetrics: true,
    platformRevenue: true,
    territoryRevenue: true,
    transactionHistory: true
  });

  // Last Updated
  const [lastUpdated, setLastUpdated] = useState('');

  // Check admin permissions
  useEffect(() => {
    const checkAdminPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userRole = user.user_metadata?.role;
      const isAdminRole = ['super_admin', 'company_admin'].includes(userRole);
      
      console.log('🔐 Earnings management permission check:', {
        userId: user.id,
        userRole,
        isAdminRole,
        selectedArtistId
      });
      
      setIsAdmin(isAdminRole);
      setLoading(false);
    };

    checkAdminPermissions();
  }, [user, selectedArtistId]);

  // Load existing earnings data
  useEffect(() => {
    const loadEarningsData = async () => {
      if (!selectedArtistId) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('earnings_data')
          .eq('id', selectedArtistId)
          .single();

        if (error) {
          console.error('Error loading earnings data:', error);
          return;
        }

        if (data?.earnings_data) {
          const earningsData = data.earnings_data;
          console.log('📊 Loaded earnings data:', earningsData);
          
          // Load data into state
          if (earningsData.basicMetrics) setBasicMetrics(earningsData.basicMetrics);
          if (earningsData.advancedMetrics) setAdvancedMetrics(earningsData.advancedMetrics);
          if (earningsData.platformRevenue) setPlatformRevenue(earningsData.platformRevenue);
          if (earningsData.territoryRevenue) setTerritoryRevenue(earningsData.territoryRevenue);
          if (earningsData.dateRange) setDateRange(earningsData.dateRange);
          if (earningsData.sectionVisibility) setSectionVisibility(earningsData.sectionVisibility);
          if (earningsData.lastUpdated) setLastUpdated(earningsData.lastUpdated);
        }
      } catch (error) {
        console.error('Error loading earnings data:', error);
      }
    };

    loadEarningsData();
  }, [selectedArtistId]);

  // Helper functions for dynamic arrays
  const addPlatform = () => {
    const newId = Math.max(...platformRevenue.map(p => p.id), 0) + 1;
    setPlatformRevenue(prev => [...prev, {
      id: newId,
      platform: 'New Platform',
      revenue: 0,
      percentage: 0,
      color: 'bg-blue-500'
    }]);
  };

  const removePlatform = (id) => {
    setPlatformRevenue(prev => prev.filter(p => p.id !== id));
  };

  const updatePlatform = (id, field, value) => {
    setPlatformRevenue(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addTerritory = () => {
    const newId = Math.max(...territoryRevenue.map(t => t.id), 0) + 1;
    setTerritoryRevenue(prev => [...prev, {
      id: newId,
      country: '🌍 New Territory',
      revenue: 0,
      percentage: 0
    }]);
  };

  const removeTerritory = (id) => {
    setTerritoryRevenue(prev => prev.filter(t => t.id !== id));
  };

  const updateTerritory = (id, field, value) => {
    setTerritoryRevenue(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // Save functions
  const saveBasicEarnings = async () => {
    if (!selectedArtistId) {
      alert('Please select an artist first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/earnings/simple-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtistId,
          basicMetrics,
          sectionVisibility,
          lastUpdated: lastUpdated || new Date().toISOString(),
          type: 'basic'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Basic earnings saved successfully');
        alert('✅ Basic earnings saved successfully!');
        if (onDataUpdated) onDataUpdated();
      } else {
        console.error('❌ Failed to save basic earnings:', result.error);
        alert('❌ Failed to save basic earnings: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error saving basic earnings:', error);
      alert('❌ Error saving basic earnings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAdvancedEarnings = async () => {
    if (!selectedArtistId) {
      alert('Please select an artist first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/earnings/simple-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtistId,
          advancedMetrics,
          platformRevenue,
          territoryRevenue,
          dateRange,
          sectionVisibility,
          lastUpdated: lastUpdated || new Date().toISOString(),
          type: 'advanced'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Advanced earnings saved successfully');
        alert('✅ Advanced earnings saved successfully!');
        if (onDataUpdated) onDataUpdated();
      } else {
        console.error('❌ Failed to save advanced earnings:', result.error);
        alert('❌ Failed to save advanced earnings: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error saving advanced earnings:', error);
      alert('❌ Error saving advanced earnings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-slate-600 mt-4">Loading earnings management...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
        <p className="text-slate-600">You need Company Admin or Super Admin permissions to manage earnings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Management Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Earnings Management</h2>
              <p className="text-slate-600">Manage artist earnings data and financial metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Artist:</span> {selectedArtistData?.artist_name || selectedArtistData?.first_name + ' ' + selectedArtistData?.last_name}
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {selectedArtistData?.role === 'artist' ? 'Artist Profile' : 'Label Admin Profile'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Basic Earnings (4 metrics)
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Advanced Earnings (Full breakdown)
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Last updated:</span>
            <input
              type="datetime-local"
              value={lastUpdated ? new Date(lastUpdated).toISOString().slice(0, 16) : ''}
              onChange={(e) => setLastUpdated(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="text-sm px-2 py-1 border border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Basic Earnings Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Basic Earnings Metrics</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Visible to users:</span>
                <input
                  type="checkbox"
                  checked={sectionVisibility.basicMetrics !== false}
                  onChange={(e) => setSectionVisibility(prev => ({ ...prev, basicMetrics: e.target.checked }))}
                  className="rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(basicMetrics).map(([key, metric]) => (
                <div key={key} className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    {metric.label}
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Value</label>
                      <input
                        type="number"
                        step="0.01"
                        value={metric.value}
                        onChange={(e) => setBasicMetrics(prev => ({
                          ...prev,
                          [key]: { ...prev[key], value: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Change Percentage</label>
                      <input
                        type="text"
                        value={metric.change}
                        onChange={(e) => setBasicMetrics(prev => ({
                          ...prev,
                          [key]: { ...prev[key], change: e.target.value }
                        }))}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="+5.2%"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={saveBasicEarnings}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Basic Earnings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Earnings Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Date Range Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Period</label>
                <select
                  value={dateRange.period}
                  onChange={(e) => setDateRange(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Advanced Earnings Metrics</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Visible to users:</span>
                <input
                  type="checkbox"
                  checked={sectionVisibility.advancedMetrics !== false}
                  onChange={(e) => setSectionVisibility(prev => ({ ...prev, advancedMetrics: e.target.checked }))}
                  className="rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(advancedMetrics).map(([key, metric]) => (
                <div key={key} className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metric.value}
                    onChange={(e) => setAdvancedMetrics(prev => ({
                      ...prev,
                      [key]: { ...prev[key], value: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Revenue by Platform</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Visible to users:</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.platformRevenue !== false}
                    onChange={(e) => setSectionVisibility(prev => ({ ...prev, platformRevenue: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                <button
                  onClick={addPlatform}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Platform
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {platformRevenue.map((platform) => (
                <div key={platform.id} className="relative border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <button
                    onClick={() => removePlatform(platform.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        value={platform.platform}
                        onChange={(e) => updatePlatform(platform.id, 'platform', e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="e.g. Spotify, Apple Music"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Revenue Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={platform.revenue}
                        onChange={(e) => updatePlatform(platform.id, 'revenue', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Percentage Share</label>
                      <input
                        type="number"
                        step="0.01"
                        value={platform.percentage}
                        onChange={(e) => updatePlatform(platform.id, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Chart Color</label>
                      <select
                        value={platform.color}
                        onChange={(e) => updatePlatform(platform.id, 'color', e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      >
                        <option value="bg-green-500">🟢 Green</option>
                        <option value="bg-blue-500">🔵 Blue</option>
                        <option value="bg-red-500">🔴 Red</option>
                        <option value="bg-purple-500">🟣 Purple</option>
                        <option value="bg-orange-500">🟠 Orange</option>
                        <option value="bg-pink-500">🩷 Pink</option>
                        <option value="bg-gray-500">⚫ Gray</option>
                        <option value="bg-yellow-500">🟡 Yellow</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Territory Revenue */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Revenue by Territory</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Visible to users:</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.territoryRevenue !== false}
                    onChange={(e) => setSectionVisibility(prev => ({ ...prev, territoryRevenue: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                <button
                  onClick={addTerritory}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Territory
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {territoryRevenue.map((territory) => (
                <div key={territory.id} className="relative border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <button
                    onClick={() => removeTerritory(territory.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-12">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Country/Territory</label>
                      <input
                        type="text"
                        value={territory.country}
                        onChange={(e) => updateTerritory(territory.id, 'country', e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="🌍 Territory Name (e.g. 🇺🇸 United States)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Revenue Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={territory.revenue}
                        onChange={(e) => updateTerritory(territory.id, 'revenue', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Percentage Share</label>
                      <input
                        type="number"
                        step="0.01"
                        value={territory.percentage}
                        onChange={(e) => updateTerritory(territory.id, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveAdvancedEarnings}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Advanced Earnings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
