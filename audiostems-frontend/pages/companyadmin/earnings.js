// Company Admin Earnings - COMPLETE REBUILD - REAL DATA ONLY
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  DollarSign, TrendingUp, Download, Settings, BarChart3,
  AlertTriangle, CheckCircle, Calendar, Users
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

export default function CompanyAdminEarnings() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Real database state
  const [earningsData, setEarningsData] = useState({});
  const [revenueReports, setRevenueReports] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && user) {
      loadRealEarningsData();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadRealEarningsData = async () => {
    try {
      console.log('💰 Loading REAL earnings data - NO MOCK DATA');
      
      // Load real users with earnings data
      const usersResponse = await fetch('/api/admin/bypass-users');
      const usersResult = await usersResponse.json();

      if (usersResult.success) {
        const users = usersResult.users;
        
        // Load real revenue reports from database
        const { data: reports, error: reportsError } = await supabase
          .from('revenue_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (reportsError) {
          console.error('❌ Error loading revenue reports:', reportsError);
        }

        setRevenueReports(reports || []);

        // Calculate REAL earnings statistics
        const totalRevenue = (reports || []).reduce((sum, report) => sum + parseFloat(report.amount || 0), 0);
        const pendingRevenue = (reports || []).filter(r => r.status === 'pending').reduce((sum, report) => sum + parseFloat(report.amount || 0), 0);
        const approvedRevenue = (reports || []).filter(r => r.status === 'approved').reduce((sum, report) => sum + parseFloat(report.amount || 0), 0);

        const realStats = {
          totalEarnings: totalRevenue,
          availableForWithdrawal: approvedRevenue,
          pendingEarnings: pendingRevenue,
          totalWithdrawn: 0, // Will be calculated from wallet transactions
          
          // User statistics
          totalArtists: users.filter(u => u.role === 'artist').length,
          artistsWithEarnings: users.filter(u => u.hasEarningsData).length,
          
          // Report statistics
          totalReports: (reports || []).length,
          pendingReports: (reports || []).filter(r => r.status === 'pending').length,
          approvedReports: (reports || []).filter(r => r.status === 'approved').length,
          
          // Platform breakdown
          platformBreakdown: {}
        };

        // Calculate platform breakdown from real data
        (reports || []).forEach(report => {
          if (!realStats.platformBreakdown[report.platform]) {
            realStats.platformBreakdown[report.platform] = { amount: 0, count: 0 };
          }
          realStats.platformBreakdown[report.platform].amount += parseFloat(report.amount || 0);
          realStats.platformBreakdown[report.platform].count += 1;
        });

        setStats(realStats);
        setEarningsData({
          lastUpdated: new Date().toISOString(),
          source: 'real_database',
          reportCount: (reports || []).length
        });

        console.log('✅ REAL earnings data calculated:', realStats);
        setError(null);
      } else {
        setError('Failed to load real data from database');
      }
    } catch (error) {
      console.error('❌ Error loading real earnings data:', error);
      setError('Failed to connect to database');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading real earnings data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Earnings Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={loadRealEarningsData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Company Admin Earnings - Real Data"
        description="Company Admin earnings with real database integration"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Admin Earnings</h1>
            <p className="text-gray-600 mt-2">REAL DATA - Track and manage earnings from all assets across the platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/companyadmin/earnings-management">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Manage Artist Earnings
              </button>
            </Link>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>

        {/* REAL Earnings Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Total Company Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings || 0, selectedCurrency)}</p>
                <p className="text-xs text-green-600 font-medium mt-1">REAL AMOUNT from DB</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Available for Withdrawal</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.availableForWithdrawal || 0, selectedCurrency)}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">REAL AMOUNT from DB</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingEarnings || 0, selectedCurrency)}</p>
                <p className="text-xs text-orange-600 font-medium mt-1">REAL AMOUNT from DB</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Revenue Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports || 0}</p>
                <p className="text-xs text-purple-600 font-medium mt-1">{stats.pendingReports || 0} pending</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Reports Table - REAL DATA */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Reports ({revenueReports.length})</h3>
                <p className="text-sm text-green-700">REAL DATA from revenue_reports table</p>
              </div>
              <button
                onClick={loadRealEarningsData}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Refresh Real Data
              </button>
            </div>
          </div>

          {revenueReports.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No revenue reports in database</p>
              <p className="text-gray-400 text-sm">Real count from revenue_reports table: 0</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenueReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(report.amount, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period_description || `${report.period_start} - ${report.period_end}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : report.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Would need to join with user_profiles for artist name */}
                        Artist ID: {report.artist_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Platform Breakdown - REAL DATA */}
        {Object.keys(stats.platformBreakdown || {}).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Revenue Breakdown (Real Data)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.platformBreakdown).map(([platform, data]) => (
                <div key={platform} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{platform}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {data.count} reports
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.amount, selectedCurrency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Status */}
        <div className="mt-8 bg-slate-100 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Real Database Status</h4>
          <div className="text-xs text-slate-600 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>Total Revenue Reports: {stats.totalReports || 0}</div>
            <div>Pending Reports: {stats.pendingReports || 0}</div>
            <div>Artists with Earnings: {stats.artistsWithEarnings || 0}</div>
            <div>Platform Sources: {Object.keys(stats.platformBreakdown || {}).length}</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
