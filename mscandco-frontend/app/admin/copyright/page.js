'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, AlertTriangle, CheckCircle, Clock, Search, Filter, Download } from 'lucide-react';

export default function CopyrightManagementPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [verifications, setVerifications] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permission check
  useEffect(() => {
    if (!permissionsLoading) {
      if (!hasPermission('copyright:manage') && !hasPermission('*:*:*')) {
        router.push('/');
        return;
      }
    }
  }, [permissionsLoading, hasPermission, router]);

  // Fetch all copyright verifications and clearances
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch all verifications
        const { data: verificationsData, error: verifyError } = await supabase
          .from('copyright_verifications')
          .select(`
            *,
            releases (title, artist_name),
            user_profiles (first_name, last_name, artist_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (verifyError) throw verifyError;

        // Fetch all clearances
        const { data: clearancesData, error: clearError } = await supabase
          .from('copyright_clearances')
          .select(`
            *,
            releases (title, artist_name),
            user_profiles (first_name, last_name, artist_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (clearError) throw clearError;

        setVerifications(verificationsData || []);
        setClearances(clearancesData || []);
      } catch (error) {
        console.error('Error fetching copyright data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && hasPermission('copyright:manage')) {
      fetchData();
    }
  }, [supabase, router, permissionsLoading, hasPermission]);

  // Filter verifications
  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = !searchTerm ||
      v.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      processing: { icon: Clock, text: 'Processing', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
      clear: { icon: CheckCircle, text: 'Clear', classes: 'bg-green-100 text-green-800 border-green-300' },
      conflict_detected: { icon: AlertTriangle, text: 'Conflict', classes: 'bg-red-100 text-red-800 border-red-300' },
      failed: { icon: AlertTriangle, text: 'Failed', classes: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    const badge = badges[status] || badges.failed;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const statsCards = [
    {
      title: 'Total Verifications',
      value: verifications.length,
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Review',
      value: verifications.filter(v => v.status === 'pending' || v.status === 'processing').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Conflicts Detected',
      value: verifications.filter(v => v.status === 'conflict_detected').length,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Cleared',
      value: verifications.filter(v => v.status === 'clear').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading copyright management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Copyright Management
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage all copyright verifications and clearances across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by release title or artist name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="clear">Clear</option>
                <option value="conflict_detected">Conflict Detected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verifications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Verifications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVerifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No verifications found
                    </td>
                  </tr>
                ) : (
                  filteredVerifications.map((verification) => (
                    <tr key={verification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {verification.releases?.title || 'Unknown Release'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {verification.user_profiles?.artist_name ||
                           verification.releases?.artist_name ||
                           'Unknown Artist'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(verification.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {verification.confidence_score ?
                            `${(verification.confidence_score * 100).toFixed(0)}%` :
                            'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verification.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/copyright/${verification.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clearances Summary */}
        {clearances.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Clearances</h2>
            <p className="text-gray-600 mb-4">
              {clearances.length} clearance{clearances.length !== 1 ? 's' : ''} in progress
            </p>
            <button
              onClick={() => router.push('/admin/copyright/clearances')}
              className="text-blue-600 hover:text-blue-900 font-medium"
            >
              View All Clearances →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
