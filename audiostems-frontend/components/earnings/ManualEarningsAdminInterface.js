// Manual Earnings Admin Interface - Same concept as Analytics
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import { 
  DollarSign, 
  Settings, 
  Save, 
  Plus, 
  Trash2,
  CheckCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet
} from 'lucide-react';

export default function ManualEarningsAdminInterface({ selectedArtistId, selectedArtistData, onDataUpdated, onUnsavedChanges }) {
  
  // Brand Error Modal State
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
    icon: '❌'
  });

  const showBrandError = (title, message, icon = '❌') => {
    setErrorModal({
      show: true,
      title,
      message,
      icon
    });
  };

  const closeBrandError = () => {
    setErrorModal({
      show: false,
      title: '',
      message: '',
      icon: '❌'
    });
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Basic Earnings State
  const [basicEarnings, setBasicEarnings] = useState({
    totalEarnings: '0',
    currentMonth: '0',
    lastMonth: '0',
    currency: 'GBP',
    lastUpdated: new Date().toISOString().slice(0, 16)
  });

  // Advanced Earnings State  
  const [platformBreakdown, setPlatformBreakdown] = useState([
    { platform: 'Spotify', earnings: '0', percentage: '0', streams: '0' },
    { platform: 'Apple Music', earnings: '0', percentage: '0', streams: '0' },
    { platform: 'YouTube Music', earnings: '0', percentage: '0', streams: '0' }
  ]);

  const [monthlyBreakdown, setMonthlyBreakdown] = useState([
    { month: 'January 2024', earnings: '0', growth: '0' },
    { month: 'February 2024', earnings: '0', growth: '0' },
    { month: 'March 2024', earnings: '0', growth: '0' }
  ]);

  const [revenueStreams, setRevenueStreams] = useState([
    { source: 'Streaming Royalties', amount: '0', percentage: '0' },
    { source: 'Performance Rights', amount: '0', percentage: '0' },
    { source: 'Sync Licensing', amount: '0', percentage: '0' }
  ]);

  const [payoutHistory, setPayoutHistory] = useState([
    { date: '', amount: '0', status: 'Completed', method: 'Bank Transfer' }
  ]);

  // Projected Earnings State
  const [projectedEarnings, setProjectedEarnings] = useState({
    nextMonth: '0',
    yearEnd: '0'
  });

  // Tax Summary State
  const [taxSummary, setTaxSummary] = useState({
    taxWithheld: '0',
    netEarnings: '0'
  });

  // Royalty Rates State
  const [royaltyRates, setRoyaltyRates] = useState({
    streamingRate: '70',
    performanceRate: '85',
    syncRate: '90'
  });

  // Load existing data when artist is selected
  useEffect(() => {
    const loadExistingData = async () => {
      if (!selectedArtistId) {
        setLoading(false);
        return;
      }

      try {
        console.log('📥 Loading earnings data for artist:', selectedArtistId);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          console.error('No auth token available');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/admin/earnings/load-data?artistId=${selectedArtistId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          console.log('📥 Load API response:', result);
          
          if (result.success && result.data) {
            const existingData = result.data;
            
            console.log('📊 Loading existing earnings data:', existingData);
            
            // Load basic earnings
            if (existingData.basicEarnings) {
              console.log('💰 Loading basic earnings:', existingData.basicEarnings);
              // Convert empty strings to "0" for consistency
              const cleanBasicEarnings = {
                ...existingData.basicEarnings,
                totalEarnings: existingData.basicEarnings.totalEarnings || '0',
                currentMonth: existingData.basicEarnings.currentMonth || '0',
                lastMonth: existingData.basicEarnings.lastMonth || '0'
              };
              setBasicEarnings(cleanBasicEarnings);
            }

            // Load advanced data
            if (existingData.platformBreakdown) {
              console.log('📊 Loading platform breakdown:', existingData.platformBreakdown);
              const cleanPlatformBreakdown = existingData.platformBreakdown.map(platform => ({
                ...platform,
                earnings: platform.earnings || '0',
                percentage: platform.percentage || '0',
                streams: platform.streams || '0'
              }));
              console.log('📊 Setting platform breakdown to:', cleanPlatformBreakdown);
              setPlatformBreakdown(cleanPlatformBreakdown);
            }
            if (existingData.monthlyBreakdown) {
              console.log('📅 Loading monthly breakdown:', existingData.monthlyBreakdown);
              const cleanMonthlyBreakdown = existingData.monthlyBreakdown.map(month => ({
                ...month,
                earnings: month.earnings || '0',
                growth: month.growth || '0'
              }));
              setMonthlyBreakdown(cleanMonthlyBreakdown);
            }
            if (existingData.revenueStreams) {
              console.log('💸 Loading revenue streams:', existingData.revenueStreams);
              const cleanRevenueStreams = existingData.revenueStreams.map(stream => ({
                ...stream,
                amount: stream.amount || '0',
                percentage: stream.percentage || '0'
              }));
              setRevenueStreams(cleanRevenueStreams);
            }
            if (existingData.payoutHistory) {
              console.log('💳 Loading payout history:', existingData.payoutHistory);
              const cleanPayoutHistory = existingData.payoutHistory.map(payout => ({
                ...payout,
                amount: payout.amount || '0'
              }));
              setPayoutHistory(cleanPayoutHistory);
            }
            if (existingData.projectedEarnings) {
              console.log('📈 Loading projected earnings:', existingData.projectedEarnings);
              setProjectedEarnings({
                nextMonth: existingData.projectedEarnings.nextMonth || '0',
                yearEnd: existingData.projectedEarnings.yearEnd || '0'
              });
            }
            if (existingData.taxSummary) {
              console.log('🧾 Loading tax summary:', existingData.taxSummary);
              setTaxSummary({
                taxWithheld: existingData.taxSummary.taxWithheld || '0',
                netEarnings: existingData.taxSummary.netEarnings || '0'
              });
            }
            if (existingData.royaltyRates) {
              console.log('📊 Loading royalty rates:', existingData.royaltyRates);
              setRoyaltyRates({
                streamingRate: existingData.royaltyRates.streamingRate || '70',
                performanceRate: existingData.royaltyRates.performanceRate || '85',
                syncRate: existingData.royaltyRates.syncRate || '90'
              });
            }

            console.log('✅ Earnings data loaded successfully');
            
            // Reset unsaved changes flag after loading data
            setHasUnsavedChanges(false);
            setInitialLoadDone(true);
          } else {
            console.log('📭 No existing earnings data found');
            
            // Reset unsaved changes flag for new artist
            setHasUnsavedChanges(false);
            setInitialLoadDone(true);
          }
        }
      } catch (error) {
        console.error('Error loading earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [selectedArtistId]);

  // Track unsaved changes (only after initial load)
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  useEffect(() => {
    if (initialLoadDone) {
      setHasUnsavedChanges(true);
      if (onUnsavedChanges) onUnsavedChanges(true);
    }
  }, [basicEarnings, platformBreakdown, monthlyBreakdown, revenueStreams, payoutHistory, projectedEarnings, taxSummary, royaltyRates, initialLoadDone, onUnsavedChanges]);

  // Save Functions
  const saveBasicEarnings = async () => {
    if (!selectedArtistId) {
      showBrandError('No Artist Selected', 'Please select an artist first', '👤');
      return;
    }
    
    setSaving(true);
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        showBrandError('Authentication Error', 'No auth token available', '🔒');
        setSaving(false);
        return;
      }

      const saveData = {
        artistId: selectedArtistId,
        basicEarnings,
        platformBreakdown,
        monthlyBreakdown,
        revenueStreams,
        payoutHistory,
        type: 'basic'
      };

      console.log('💾 Sending basic earnings data:', saveData);

      const response = await fetch('/api/admin/earnings/save', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(saveData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Basic earnings saved successfully');
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
        if (onUnsavedChanges) onUnsavedChanges(false);
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Basic Earnings Saved Successfully!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
        
        if (onDataUpdated) onDataUpdated();
      } else {
        showBrandError('Save Failed', `Failed to save earnings: ${result.error || 'Unknown error'}`, '❌');
      }
    } catch (error) {
      console.error('Error saving basic earnings:', error);
      showBrandError('Save Error', `Error saving earnings: ${error.message}`, '❌');
    } finally {
      setSaving(false);
    }
  };

  const saveAdvancedEarnings = async () => {
    if (!selectedArtistId) {
      showBrandError('No Artist Selected', 'Please select an artist first', '👤');
      return;
    }
    
    setSaving(true);
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        showBrandError('Authentication Error', 'No auth token available', '🔒');
        setSaving(false);
        return;
      }

      const saveData = {
        artistId: selectedArtistId,
        basicEarnings,
          platformBreakdown,
          monthlyBreakdown,
          revenueStreams,
          payoutHistory,
          projectedEarnings,
          taxSummary,
          royaltyRates,
          type: 'advanced'
      };

      console.log('💾 Sending advanced earnings data:', saveData);

      const response = await fetch('/api/admin/earnings/save', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(saveData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Advanced earnings saved successfully');
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
        if (onUnsavedChanges) onUnsavedChanges(false);
        
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div class="fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Advanced Earnings Saved Successfully!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 3000);
        
        if (onDataUpdated) onDataUpdated();
      } else {
        showBrandError('Save Failed', `Failed to save advanced earnings: ${result.error || 'Unknown error'}`, '❌');
      }
    } catch (error) {
      console.error('Error saving advanced earnings:', error);
      showBrandError('Save Error', `Error saving advanced earnings: ${error.message}`, '❌');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const addPlatform = () => {
    setPlatformBreakdown([...platformBreakdown, { platform: '', earnings: '', percentage: '', streams: '' }]);
  };

  const removePlatform = (index) => {
    setPlatformBreakdown(platformBreakdown.filter((_, i) => i !== index));
  };

  const updatePlatform = (index, field, value) => {
    const updated = [...platformBreakdown];
    updated[index][field] = value;
    setPlatformBreakdown(updated);
  };

  const addMonth = () => {
    setMonthlyBreakdown([...monthlyBreakdown, { month: '', earnings: '', growth: '' }]);
  };

  const removeMonth = (index) => {
    setMonthlyBreakdown(monthlyBreakdown.filter((_, i) => i !== index));
  };

  const updateMonth = (index, field, value) => {
    const updated = [...monthlyBreakdown];
    updated[index][field] = value;
    setMonthlyBreakdown(updated);
  };

  const addRevenueStream = () => {
    setRevenueStreams([...revenueStreams, { source: '', amount: '', percentage: '' }]);
  };

  const removeRevenueStream = (index) => {
    setRevenueStreams(revenueStreams.filter((_, i) => i !== index));
  };

  const updateRevenueStream = (index, field, value) => {
    const updated = [...revenueStreams];
    updated[index][field] = value;
    setRevenueStreams(updated);
  };

  const addPayout = () => {
    setPayoutHistory([...payoutHistory, { date: '', amount: '', status: 'Pending', method: 'Bank Transfer' }]);
  };

  const removePayout = (index) => {
    setPayoutHistory(payoutHistory.filter((_, i) => i !== index));
  };

  const updatePayout = (index, field, value) => {
    const updated = [...payoutHistory];
    updated[index][field] = value;
    setPayoutHistory(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading earnings data...</span>
      </div>
    );
  }

  if (!selectedArtistId) {
    return (
      <div className="text-center p-8">
        <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Select an Artist</h3>
        <p className="text-slate-600">Choose an artist from the list to manage their earnings data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-3" />
              Earnings Management
            </h2>
            <p className="text-slate-600 mt-1">Manage manual earnings data for {selectedArtistData?.artist_name || 'selected artist'}</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Basic Earnings (3 sections)
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Advanced Earnings (8 sections)
            </button>
          </div>
        </div>
      </div>

      {/* BASIC EARNINGS - 3 sections */}
      {activeTab === 'basic' && (
        <div className="space-y-8">
          
          {/* 1. Total Earnings Overview */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                Total Earnings Overview
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Earnings</label>
                <input 
                  type="text" 
                  placeholder="£2,450.00" 
                  value={basicEarnings.totalEarnings}
                  onChange={(e) => setBasicEarnings(prev => ({ ...prev, totalEarnings: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Month</label>
                <input 
                  type="text" 
                  placeholder="£325.00" 
                  value={basicEarnings.currentMonth}
                  onChange={(e) => setBasicEarnings(prev => ({ ...prev, currentMonth: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Month</label>
                <input 
                  type="text" 
                  placeholder="£280.00" 
                  value={basicEarnings.lastMonth}
                  onChange={(e) => setBasicEarnings(prev => ({ ...prev, lastMonth: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
          </div>

          {/* 2. Platform Breakdown */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                Platform Breakdown
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={addPlatform}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Platform
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformBreakdown.map((platform, index) => (
                <div key={index} className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {platformBreakdown.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlatform(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="pr-8 mb-3">
                    <input 
                      type="text" 
                      placeholder="Platform Name" 
                      value={platform.platform}
                      onChange={(e) => updatePlatform(index, 'platform', e.target.value)}
                      className="w-full font-semibold text-slate-900 bg-transparent border-none p-0 text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Earnings (e.g. £120.50)" 
                    value={platform.earnings}
                    onChange={(e) => updatePlatform(index, 'earnings', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm mb-2" 
                  />
                  <input 
                    type="text" 
                    placeholder="Percentage (e.g. 45%)" 
                    value={platform.percentage}
                    onChange={(e) => updatePlatform(index, 'percentage', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Monthly Breakdown */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                Monthly Breakdown
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={addMonth}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-3 py-1 rounded-lg flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Month
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {monthlyBreakdown.map((month, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                  {monthlyBreakdown.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMonth(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input 
                    type="text" 
                    placeholder="Month Year" 
                    value={month.month}
                    onChange={(e) => updateMonth(index, 'month', e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Earnings" 
                    value={month.earnings}
                    onChange={(e) => updateMonth(index, 'earnings', e.target.value)}
                    className="w-32 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Growth %" 
                    value={month.growth}
                    onChange={(e) => updateMonth(index, 'growth', e.target.value)}
                    className="w-24 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ADVANCED EARNINGS - 8 sections */}
      {activeTab === 'advanced' && (
        <div className="space-y-8">
          
          {/* Same Basic Sections */}
          <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <strong>Same as Basic Earnings</strong> - managed from Basic tab
          </div>

          {/* 4. Revenue Streams */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <PieChart className="w-5 h-5 text-orange-600 mr-2" />
                Revenue Streams
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={addRevenueStream}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1 rounded-lg flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Revenue Stream
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {revenueStreams.map((stream, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                  {revenueStreams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRevenueStream(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input 
                    type="text" 
                    placeholder="Revenue Source" 
                    value={stream.source}
                    onChange={(e) => updateRevenueStream(index, 'source', e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Amount" 
                    value={stream.amount}
                    onChange={(e) => updateRevenueStream(index, 'amount', e.target.value)}
                    className="w-32 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="%" 
                    value={stream.percentage}
                    onChange={(e) => updateRevenueStream(index, 'percentage', e.target.value)}
                    className="w-20 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. Payout History */}
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
                Payout History
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={addPayout}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-3 py-1 rounded-lg flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Payout
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {payoutHistory.map((payout, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                  {payoutHistory.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePayout(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input 
                    type="date" 
                    value={payout.date}
                    onChange={(e) => updatePayout(index, 'date', e.target.value)}
                    className="w-40 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Amount" 
                    value={payout.amount}
                    onChange={(e) => updatePayout(index, 'amount', e.target.value)}
                    className="w-32 border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <select 
                    value={payout.status}
                    onChange={(e) => updatePayout(index, 'status', e.target.value)}
                    className="w-32 border border-slate-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                  </select>
                  <select 
                    value={payout.method}
                    onChange={(e) => updatePayout(index, 'method', e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Only Sections Placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 6. Projected Earnings */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                  Projected Earnings
                </h3>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Next Month Projection" 
                  value={projectedEarnings.nextMonth}
                  onChange={(e) => setProjectedEarnings({...projectedEarnings, nextMonth: e.target.value})}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Year End Projection" 
                  value={projectedEarnings.yearEnd}
                  onChange={(e) => setProjectedEarnings({...projectedEarnings, yearEnd: e.target.value})}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                />
              </div>
            </div>

            {/* 7. Tax Summary */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Settings className="w-5 h-5 text-red-600 mr-2" />
                  Tax Summary
                </h3>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Tax Withheld" 
                  value={taxSummary.taxWithheld}
                  onChange={(e) => setTaxSummary({...taxSummary, taxWithheld: e.target.value})}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Net Earnings" 
                  value={taxSummary.netEarnings}
                  onChange={(e) => setTaxSummary({...taxSummary, netEarnings: e.target.value})}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                />
              </div>
            </div>

            {/* 8. Royalty Rates */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Wallet className="w-5 h-5 text-cyan-600 mr-2" />
                  Royalty Rates
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Streaming Rate (%)</label>
                  <input 
                    type="text" 
                    placeholder="70" 
                    value={royaltyRates.streamingRate}
                    onChange={(e) => setRoyaltyRates({...royaltyRates, streamingRate: e.target.value})}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Your share of streaming revenue</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Performance Rate (%)</label>
                  <input 
                    type="text" 
                    placeholder="85" 
                    value={royaltyRates.performanceRate}
                    onChange={(e) => setRoyaltyRates({...royaltyRates, performanceRate: e.target.value})}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Your share of performance rights</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sync Rate (%)</label>
                  <input 
                    type="text" 
                    placeholder="90" 
                    value={royaltyRates.syncRate}
                    onChange={(e) => setRoyaltyRates({...royaltyRates, syncRate: e.target.value})}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Your share of sync licensing</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={activeTab === 'basic' ? saveBasicEarnings : saveAdvancedEarnings}
          disabled={saving}
          className={`${
            activeTab === 'basic' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50`}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : `Save ${activeTab === 'basic' ? 'Basic' : 'Advanced'} Earnings`}
        </button>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <p className="text-green-800 font-medium">Manual Earnings System Active</p>
            <p className="text-green-700 text-sm">Data feeds directly to the artist earnings frontend</p>
            <p className="text-green-600 text-sm">Changes appear immediately in both Basic and Advanced views</p>
          </div>
        </div>
      </div>

      {/* Brand Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{errorModal.icon}</span>
              <h3 className="text-lg font-semibold text-slate-900">{errorModal.title}</h3>
            </div>
            <p className="text-slate-600 mb-6">{errorModal.message}</p>
            <div className="flex justify-end">
              <button
                onClick={closeBrandError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
