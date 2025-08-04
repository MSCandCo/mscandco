import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  BarChart3, TrendingUp, Users, Clock, 
  Target, Activity, Zap, CheckCircle
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { getReleases, getUsers } from '@/lib/mockDatabase';
import { getUserRole } from '@/lib/auth0-config';

export default function CompanyAdminAnalytics() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Get user role
  const userRole = getUserRole(user);

  // Get all data
  const allReleases = getReleases();
  const allUsers = getUsers();
  const artists = allUsers.filter(u => u.role === 'artist');
  const labelAdmins = allUsers.filter(u => u.role === 'label_admin');

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Business Operations Analytics
  const businessMetrics = {
    totalRevenue: allUsers.reduce((sum, user) => sum + (user.totalRevenue || user.totalEarnings || 0), 0),
    totalArtists: artists.length,
    totalLabels: labelAdmins.length,
    totalReleases: allReleases.length,
    activeArtists: artists.filter(a => a.status === 'active').length,
    liveReleases: allReleases.filter(r => ['live', 'distributed'].includes(r.status)).length,
    avgFormCompletionTime: 18, // minutes
    avgReviewProcessingTime: 23, // hours
    avgApprovalTime: 9, // hours
    systemEfficiency: 89, // percentage
    completionRate: 63 // percentage
  };

  // Platform Performance by Distribution Channel
  const platformPerformance = [
    { name: 'Spotify', releases: 45, revenue: 85000, streams: 8500000 },
    { name: 'Apple Music', releases: 42, revenue: 74400, streams: 6200000 },
    { name: 'YouTube Music', releases: 38, revenue: 24000, streams: 4800000 },
    { name: 'Amazon Music', releases: 35, revenue: 31000, streams: 3100000 },
    { name: 'Deezer', releases: 28, revenue: 14400, streams: 1800000 },
    { name: 'Tidal', releases: 22, revenue: 14250, streams: 950000 },
    { name: 'Pandora', releases: 18, revenue: 7200, streams: 720000 },
    { name: 'SoundCloud', releases: 15, revenue: 4500, streams: 450000 },
    { name: 'Other Platforms', releases: 12, revenue: 8200, streams: 820000 }
  ];

  // Workflow Efficiency Metrics
  const workflowStages = [
    { stage: 'Form Creation', avgTime: 18, efficiency: 92 },
    { stage: 'Review Processing', avgTime: 23, efficiency: 87 },
    { stage: 'Approval Process', avgTime: 9, efficiency: 94 },
    { stage: 'Distribution Setup', avgTime: 6, efficiency: 96 },
    { stage: 'Go Live', avgTime: 2, efficiency: 98 }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Business Analytics - Company Admin"
        description="Operations efficiency and performance metrics"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600 mt-2">Operations efficiency and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-blue-600">{businessMetrics.activeArtists + labelAdmins.length}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8% this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Releases</p>
                <p className="text-3xl font-bold text-green-600">{businessMetrics.totalReleases}</p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">{businessMetrics.liveReleases} live</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Channels</p>
                <p className="text-3xl font-bold text-purple-600">10</p>
                <div className="flex items-center mt-2 text-sm">
                  <Activity className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">All operational</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Efficiency</p>
                <p className="text-3xl font-bold text-yellow-600">{businessMetrics.systemEfficiency}%</p>
                <div className="flex items-center mt-2 text-sm">
                  <Zap className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="font-bold text-purple-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / formatCurrency(businessMetrics.totalRevenue, selectedCurrency).length))}px`
                }}>
                  {formatCurrency(businessMetrics.totalRevenue, selectedCurrency)}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+6% this month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Workflow Efficiency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">System Workflow Efficiency</h3>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Avg Form Completion Time</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{businessMetrics.avgFormCompletionTime} min</span>
              </div>
            
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Avg Review Processing</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{businessMetrics.avgReviewProcessingTime} hrs</span>
              </div>
            
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Avg Approval Time</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{businessMetrics.avgApprovalTime} hrs</span>
              </div>
            
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">Completion Rate</span>
                </div>
                <span className="text-xl font-bold text-green-600">{businessMetrics.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Operational KPIs</h3>
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            
            <div className="space-y-6">
              {workflowStages.map((stage, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.avgTime} {stage.stage.includes('Form') ? 'min' : 'hrs'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stage.efficiency}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stage.efficiency}% efficiency</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Platform Performance</h3>
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Revenue/Stream</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {platformPerformance.map((platform, index) => (
                  <tr key={platform.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-red-500' : 
                          index === 3 ? 'bg-yellow-500' : index === 4 ? 'bg-purple-500' : index === 5 ? 'bg-indigo-500' : 
                          index === 6 ? 'bg-pink-500' : index === 7 ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                          {platform.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="ml-3 font-medium text-gray-900">{platform.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {platform.releases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(platform.revenue, selectedCurrency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {platform.streams.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(platform.revenue / platform.streams, selectedCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}