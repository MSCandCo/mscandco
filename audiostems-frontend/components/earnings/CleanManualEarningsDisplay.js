// Clean Manual Earnings Display Component - Same concept as Analytics
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/components/shared/CurrencySelector';
import EarningsCharts from './EarningsCharts';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  Calendar,
  Award
} from 'lucide-react';

export default function CleanManualEarningsDisplay({ artistId, showAdvanced = false }) {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  // Listen for currency changes from other components
  useEffect(() => {
    // Get initial currency from localStorage
    const savedCurrency = typeof window !== 'undefined' ? localStorage.getItem('selectedCurrency') : null;
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }

    // Listen for currency change events
    const handleCurrencyChange = (event) => {
      setSelectedCurrency(event.detail.currency);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('currencyChange', handleCurrencyChange);
      return () => window.removeEventListener('currencyChange', handleCurrencyChange);
    }
  }, []);

  // Fetch manual earnings data
  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!artistId) {
        setLoading(false);
        return;
      }

      try {
        console.log('💰 Fetching manual earnings for artist:', artistId);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error('❌ No auth token');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Call earnings data API
        const response = await fetch('/api/artist/earnings-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.data) {
          console.log('✅ Manual earnings loaded:', result.data);
          setEarningsData(result.data);
        } else {
          console.log('📭 No earnings data found:', result);
          setEarningsData(null);
        }

      } catch (err) {
        console.error('❌ Error fetching earnings:', err);
        setError('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [artistId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
        <div className="text-red-600 mb-4">
          <DollarSign className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Earnings</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!earningsData || !earningsData.basicEarnings) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Earnings Data</h2>
          <p className="text-slate-600 mb-8">
            Your earnings will appear here once your admin team adds your revenue and payout data.
          </p>
          <div className="text-sm text-slate-500">
            Contact your admin to set up your earnings dashboard.
          </div>
        </div>
      </div>
    );
  }

  const { 
    basicEarnings, 
    platformBreakdown = [], 
    monthlyBreakdown = [],
    revenueStreams = [],
    payoutHistory = [],
    projectedEarnings = {},
    taxSummary = {},
    royaltyRates = {}
  } = earningsData;

  // Define which sections to show based on showAdvanced prop
  const basicSections = ['totalEarnings', 'platformBreakdown', 'monthlyBreakdown'];
  const advancedSections = [
    'totalEarnings', 'platformBreakdown', 'monthlyBreakdown', 
    'revenueStreams', 'payoutHistory', 'projectedEarnings', 
    'taxSummary', 'royaltyRates'
  ];
  
  const allowedSections = showAdvanced ? advancedSections : basicSections;

  return (
    <div className="space-y-8">
      
      {/* Total Earnings Overview */}
      {allowedSections.includes('totalEarnings') && basicEarnings && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3" />
            Total Earnings Overview
          </h3>
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <h4 className="text-xs font-medium text-green-800 mb-2">Total Earnings</h4>
                <p className="text-lg font-bold text-green-600">{formatCurrency(parseFloat(basicEarnings.totalEarnings || '0'), selectedCurrency)}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <h4 className="text-xs font-medium text-blue-800 mb-2">Current Month</h4>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(parseFloat(basicEarnings.currentMonth || '0'), selectedCurrency)}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <h4 className="text-xs font-medium text-purple-800 mb-2">Last Month</h4>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(parseFloat(basicEarnings.lastMonth || '0'), selectedCurrency)}</p>
              </div>
            </div>
        </div>
      )}

      {/* Charts Section - Only show for advanced users with data */}
      {showAdvanced && earningsData && (
        <EarningsCharts 
          earningsData={earningsData} 
          selectedCurrency={selectedCurrency}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Platform Breakdown */}
      {allowedSections.includes('platformBreakdown') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3" />
            Platform Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(platformBreakdown.length > 0 ? platformBreakdown : [
              { platform: 'Spotify', earnings: '0', percentage: '0' },
              { platform: 'Apple Music', earnings: '0', percentage: '0' },
              { platform: 'YouTube Music', earnings: '0', percentage: '0' }
            ]).map((platform, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">{platform.platform}</h4>
                <p className="text-base font-bold text-blue-600 mb-1">{formatCurrency(parseFloat(platform.earnings || '0'), selectedCurrency)}</p>
                <p className="text-xs text-blue-700">{platform.percentage || '0'}% of total</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {allowedSections.includes('monthlyBreakdown') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 sm:mr-3" />
            Monthly Breakdown
          </h3>
          
          <div className="space-y-4">
            {(monthlyBreakdown.length > 0 ? monthlyBreakdown : [
              { month: 'January 2024', earnings: '0', growth: '0' },
              { month: 'February 2024', earnings: '0', growth: '0' },
              { month: 'March 2024', earnings: '0', growth: '0' }
            ]).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{month.month}</h4>
                  <p className="text-base font-bold text-purple-600">{formatCurrency(parseFloat(month.earnings || '0'), selectedCurrency)}</p>
                </div>
                <div className={`text-sm font-medium ${
                  (month.growth || '0').toString().startsWith('+') ? 'text-green-600' : 
                  (month.growth || '0').toString() === '0' ? 'text-slate-600' : 'text-red-600'
                }`}>
                  {month.growth || '0'}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Streams - Advanced Only */}
      {allowedSections.includes('revenueStreams') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2 sm:mr-3" />
            Revenue Streams
          </h3>
          
          <div className="space-y-4">
            {(revenueStreams.length > 0 ? revenueStreams : [
              { source: 'Streaming Royalties', amount: '0', percentage: '0' },
              { source: 'Performance Rights', amount: '0', percentage: '0' },
              { source: 'Sync Licensing', amount: '0', percentage: '0' }
            ]).map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{stream.source}</h4>
                  <p className="text-sm font-bold text-orange-600">{formatCurrency(parseFloat(stream.amount || '0'), selectedCurrency)}</p>
                </div>
                <div className="text-sm font-medium text-orange-700">
                  {stream.percentage || '0'}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout History - Advanced Only */}
      {allowedSections.includes('payoutHistory') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mr-2 sm:mr-3" />
            Payout History
          </h3>
          
          <div className="space-y-4">
            {(payoutHistory.length > 0 ? payoutHistory : [
              { date: new Date().toISOString().split('T')[0], amount: '0', method: 'Bank Transfer', status: 'Completed' }
            ]).map((payout, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{payout.date ? new Date(payout.date).toLocaleDateString() : 'No date'}</h4>
                  <p className="text-sm font-bold text-indigo-600">{formatCurrency(parseFloat(payout.amount || '0'), selectedCurrency)}</p>
                  <p className="text-xs text-indigo-700">{payout.method || 'Bank Transfer'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payout.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  payout.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {payout.status || 'Completed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projected Earnings - Advanced Only */}
      {allowedSections.includes('projectedEarnings') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 sm:mr-3" />
            Projected Earnings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
              <h4 className="text-xs font-medium text-emerald-800 mb-2">Next Month Projection</h4>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(parseFloat(projectedEarnings.nextMonth || '0'), selectedCurrency)}</p>
              <p className="text-xs text-emerald-700 mt-1">Based on current trends</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
              <h4 className="text-xs font-medium text-teal-800 mb-2">Year End Projection</h4>
              <p className="text-base font-bold text-teal-600">{formatCurrency(parseFloat(projectedEarnings.yearEnd || '0'), selectedCurrency)}</p>
              <p className="text-xs text-teal-700 mt-1">Estimated annual total</p>
            </div>
          </div>
        </div>
      )}

      {/* Tax Summary - Advanced Only */}
      {allowedSections.includes('taxSummary') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3" />
            Tax Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Tax Withheld</h4>
              <p className="text-sm font-bold text-red-600">{formatCurrency(parseFloat(taxSummary.taxWithheld || '0'), selectedCurrency)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Net Earnings</h4>
              <p className="text-sm font-bold text-green-600">{formatCurrency(parseFloat(taxSummary.netEarnings || '0'), selectedCurrency)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Royalty Rates - Advanced Only */}
      {allowedSections.includes('royaltyRates') && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 mr-2 sm:mr-3" />
            Royalty Rates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Streaming Rate</h4>
              <p className="text-sm font-bold text-cyan-600">{royaltyRates.streamingRate || '70'}%</p>
              <p className="text-xs text-cyan-700">Your share of streaming revenue</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Performance Rate</h4>
              <p className="text-sm font-bold text-violet-600">{royaltyRates.performanceRate || '85'}%</p>
              <p className="text-xs text-violet-700">Your share of performance rights</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">Sync Rate</h4>
              <p className="text-sm font-bold text-amber-600">{royaltyRates.syncRate || '90'}%</p>
              <p className="text-xs text-amber-700">Your share of sync licensing</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
