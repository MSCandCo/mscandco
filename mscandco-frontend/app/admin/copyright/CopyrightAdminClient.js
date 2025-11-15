'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Search, Filter, Download,
  Eye, XCircle, FileText, TrendingUp, BarChart3, RefreshCw, ExternalLink,
  FileCheck, Ban, AlertCircle, Zap
} from 'lucide-react';

export default function CopyrightAdminClient({ user }) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [activeTab, setActiveTab] = useState('verifications');
  const [verifications, setVerifications] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [dmcaTakedowns, setDmcaTakedowns] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    pendingVerifications: 0,
    conflictsDetected: 0,
    clearedVerifications: 0,
    pendingClearances: 0,
    activeDmca: 0,
    totalRegistrations: 0,
    activeMonitoring: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Fetch all data
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, activeTab]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from API route (single source of truth)
      const response = await fetch('/api/admin/copyright/data', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch copyright data');
      }

      const { verifications, clearances, dmcaTakedowns, registrations, monitoring } = result.data;

      // Set all data
      setVerifications(verifications || []);
      setClearances(clearances || []);
      setDmcaTakedowns(dmcaTakedowns || []);
      setRegistrations(registrations || []);
      setMonitoring(monitoring || []);

      // Calculate stats
      await fetchStats(verifications || [], clearances || [], dmcaTakedowns || [], registrations || [], monitoring || []);
    } catch (error) {
      console.error('Error fetching copyright data:', error);
      // Set empty arrays on error
      setVerifications([]);
      setClearances([]);
      setDmcaTakedowns([]);
      setRegistrations([]);
      setMonitoring([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (verificationsData, clearancesData, dmcaData, registrationsData, monitoringData) => {
    try {
      // Calculate stats from fetched data (no database queries needed)
      const totalVerifications = verificationsData.length;
      const pendingVerifications = verificationsData.filter(v => 
        v.verification_status === 'pending' || v.verification_status === 'processing'
      ).length;
      const conflictsDetected = verificationsData.filter(v => 
        v.verification_status === 'conflict_detected' || v.verification_status === 'potential_conflict'
      ).length;
      const clearedVerifications = verificationsData.filter(v => 
        v.verification_status === 'clear'
      ).length;

      // Clearances stats
      const pendingClearances = clearancesData.filter(c => 
        c.approval_status === 'pending'
      ).length;

      // DMCA stats
      const activeDmca = dmcaData.filter(d => 
        d.status === 'submitted' || d.status === 'in_progress'
      ).length;

      // Registrations stats
      const totalRegistrations = registrationsData.length;

      // Monitoring stats
      const activeMonitoring = monitoringData.filter(m => 
        !m.is_resolved
      ).length;

      setStats({
        totalVerifications: totalVerifications || 0,
        pendingVerifications: pendingVerifications || 0,
        conflictsDetected: conflictsDetected || 0,
        clearedVerifications: clearedVerifications || 0,
        pendingClearances: pendingClearances || 0,
        activeDmca: activeDmca || 0,
        totalRegistrations: totalRegistrations || 0,
        activeMonitoring: activeMonitoring || 0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Admin actions
  const updateVerificationStatus = async (verificationId, newStatus, notes = '') => {
    try {
      const response = await fetch('/api/admin/copyright/update-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ verificationId, newStatus, notes })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update verification');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update verification');
      }

      // Refresh data after update
      await fetchAllData();
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Failed to update verification status');
    }
  };

  const updateClearanceStatus = async (clearanceId, newStatus, notes = '') => {
    try {
      const response = await fetch('/api/admin/copyright/update-clearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ clearanceId, newStatus, notes })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update clearance');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update clearance');
      }

      // Refresh data after update
      await fetchAllData();
    } catch (error) {
      console.error('Error updating clearance:', error);
      alert('Failed to update clearance status');
    }
  };

  // Filter functions
  const getFilteredVerifications = () => {
    return verifications.filter(v => {
      const matchesSearch = !searchTerm ||
        v.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || v.verification_status === statusFilter;
      
      const matchesSeverity = severityFilter === 'all' || 
        (severityFilter === 'critical' && v.conflict_severity === 'critical') ||
        (severityFilter === 'high' && v.conflict_severity === 'high') ||
        (severityFilter === 'medium' && v.conflict_severity === 'medium') ||
        (severityFilter === 'low' && v.conflict_severity === 'low');

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  };

  const getFilteredClearances = () => {
    return clearances.filter(c => {
      const matchesSearch = !searchTerm ||
        c.original_work_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || c.approval_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      processing: { icon: Clock, text: 'Processing', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
      clear: { icon: CheckCircle, text: 'Clear', classes: 'bg-green-100 text-green-800 border-green-300' },
      conflict_detected: { icon: AlertTriangle, text: 'Conflict', classes: 'bg-red-100 text-red-800 border-red-300' },
      potential_conflict: { icon: AlertCircle, text: 'Potential', classes: 'bg-orange-100 text-orange-800 border-orange-300' },
      manual_review_required: { icon: FileText, text: 'Review', classes: 'bg-purple-100 text-purple-800 border-purple-300' },
      failed: { icon: XCircle, text: 'Failed', classes: 'bg-gray-100 text-gray-800 border-gray-300' },
      approved: { icon: CheckCircle, text: 'Approved', classes: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { icon: XCircle, text: 'Rejected', classes: 'bg-red-100 text-red-800 border-red-300' },
      expired: { icon: Clock, text: 'Expired', classes: 'bg-gray-100 text-gray-800 border-gray-300' },
      submitted: { icon: FileCheck, text: 'Submitted', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
      in_progress: { icon: Clock, text: 'In Progress', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      completed: { icon: CheckCircle, text: 'Completed', classes: 'bg-green-100 text-green-800 border-green-300' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    if (!severity) return null;
    
    const badges = {
      critical: { text: 'Critical', classes: 'bg-red-100 text-red-800 border-red-300' },
      high: { text: 'High', classes: 'bg-orange-100 text-orange-800 border-orange-300' },
      medium: { text: 'Medium', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      low: { text: 'Low', classes: 'bg-blue-100 text-blue-800 border-blue-300' }
    };
    
    const badge = badges[severity] || badges.low;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <PageLoading message="Loading copyright management..." />;
  }

  const statsCards = [
    {
      title: 'Total Verifications',
      value: stats.totalVerifications,
      icon: Shield,
      color: 'bg-blue-500',
      tab: 'verifications'
    },
    {
      title: 'Pending Review',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'bg-yellow-500',
      tab: 'verifications'
    },
    {
      title: 'Conflicts Detected',
      value: stats.conflictsDetected,
      icon: AlertTriangle,
      color: 'bg-red-500',
      tab: 'verifications'
    },
    {
      title: 'Cleared',
      value: stats.clearedVerifications,
      icon: CheckCircle,
      color: 'bg-green-500',
      tab: 'verifications'
    },
    {
      title: 'Pending Clearances',
      value: stats.pendingClearances,
      icon: FileCheck,
      color: 'bg-purple-500',
      tab: 'clearances'
    },
    {
      title: 'Active DMCA',
      value: stats.activeDmca,
      icon: Ban,
      color: 'bg-orange-500',
      tab: 'dmca'
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      icon: FileText,
      color: 'bg-indigo-500',
      tab: 'registrations'
    },
    {
      title: 'Active Monitoring',
      value: stats.activeMonitoring,
      icon: Zap,
      color: 'bg-pink-500',
      tab: 'monitoring'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Copyright Management
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                Comprehensive oversight of all copyright verifications, clearances, DMCA takedowns, and registrations
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(stat.tab)}
                className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left ${
                  activeTab === stat.tab ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-xl 2xl:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'verifications', label: 'Verifications', count: verifications.length },
                { id: 'clearances', label: 'Clearances', count: clearances.length },
                { id: 'dmca', label: 'DMCA Takedowns', count: dmcaTakedowns.length },
                { id: 'registrations', label: 'Registrations', count: registrations.length },
                { id: 'monitoring', label: 'Monitoring', count: monitoring.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusFilter('all'); // Reset status filter when switching tabs
                    setSeverityFilter('all'); // Reset severity filter when switching tabs
                  }}
                  className={`px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by release, artist, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'verifications' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="clear">Clear</option>
                    <option value="potential_conflict">Potential Conflict</option>
                    <option value="conflict_detected">Conflict Detected</option>
                    <option value="manual_review_required">Manual Review Required</option>
                    <option value="failed">Failed</option>
                  </>
                )}
                {activeTab === 'clearances' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </>
                )}
                {activeTab === 'dmca' && (
                  <>
                    <option value="submitted">Submitted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
                {activeTab === 'registrations' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </>
                )}
                {activeTab === 'monitoring' && (
                  <>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                  </>
                )}
              </select>
            </div>
            {activeTab === 'verifications' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'verifications' && (
          <VerificationsTable
            verifications={getFilteredVerifications()}
            onUpdateStatus={updateVerificationStatus}
            getStatusBadge={getStatusBadge}
            getSeverityBadge={getSeverityBadge}
            router={router}
          />
        )}

        {activeTab === 'clearances' && (
          <ClearancesTable
            clearances={getFilteredClearances()}
            onUpdateStatus={updateClearanceStatus}
            getStatusBadge={getStatusBadge}
            router={router}
          />
        )}

        {activeTab === 'dmca' && (
          <DmcaTable
            takedowns={dmcaTakedowns.filter(t => {
              const matchesSearch = !searchTerm ||
                t.copyright_registrations?.work_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
              return matchesSearch && matchesStatus;
            })}
            getStatusBadge={getStatusBadge}
            router={router}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsTable
            registrations={registrations.filter(r => {
              const matchesSearch = !searchTerm ||
                r.work_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'all' || 
                (r.status && r.status === statusFilter) ||
                (statusFilter === 'active' && !r.status) ||
                (statusFilter === 'pending' && !r.status);
              return matchesSearch && matchesStatus;
            })}
            router={router}
          />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringTable
            monitoring={monitoring.filter(m => {
              const matchesSearch = !searchTerm ||
                m.copyright_registrations?.work_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.platform?.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && !m.is_resolved) ||
                (statusFilter === 'resolved' && m.is_resolved) ||
                (m.status && m.status === statusFilter);
              return matchesSearch && matchesStatus;
            })}
            getStatusBadge={getStatusBadge}
            router={router}
          />
        )}
      </div>
    </div>
  );
}

// Verifications Table Component
function VerificationsTable({ verifications, onUpdateStatus, getStatusBadge, getSeverityBadge, router }) {
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Copyright Verifications</h2>
        <span className="text-sm text-gray-500">{verifications.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Release</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Artist</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Confidence</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Severity</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Date</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {verifications.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No verifications found
                </td>
              </tr>
            ) : (
              verifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {verification.releases?.title || 'Unknown Release'}
                    </div>
                    {verification.releases?.status && (
                      <div className="text-xs text-gray-500">{verification.releases.status}</div>
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {verification.user_profiles?.artist_name || 'Unknown Artist'}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{verification.user_profiles?.email}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(verification.verification_status)}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.confidence_score ? `${verification.confidence_score}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(verification.conflict_severity)}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/admin/copyright/verification/${verification.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {verification.verification_status !== 'clear' && (
                        <button
                          onClick={() => setSelectedVerification(verification.id)}
                          className="text-green-600 hover:text-green-900 whitespace-nowrap"
                        >
                          Mark Clear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Action Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Verification Status</h3>
            <textarea
              placeholder="Optional notes..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(selectedVerification, 'clear', actionNotes);
                  setSelectedVerification(null);
                  setActionNotes('');
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Mark as Clear
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(selectedVerification, 'manual_review_required', actionNotes);
                  setSelectedVerification(null);
                  setActionNotes('');
                }}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Require Review
              </button>
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setActionNotes('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Clearances Table Component
function ClearancesTable({ clearances, onUpdateStatus, getStatusBadge, router }) {
  const [selectedClearance, setSelectedClearance] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Copyright Clearances</h2>
        <span className="text-sm text-gray-500">{clearances.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Original Work</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Release</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Type</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">License Holder</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Date</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clearances.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No clearances found
                </td>
              </tr>
            ) : (
              clearances.map((clearance) => (
                <tr key={clearance.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {clearance.original_work_title}
                    </div>
                    <div className="text-xs text-gray-500">{clearance.original_artist}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {clearance.releases?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{clearance.clearance_type}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(clearance.approval_status)}
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[200px]">{clearance.license_holder || 'N/A'}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(clearance.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/admin/copyright/clearance/${clearance.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {clearance.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedClearance(clearance.id);
                            }}
                            className="text-green-600 hover:text-green-900 whitespace-nowrap"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClearance(clearance.id);
                            }}
                            className="text-red-600 hover:text-red-900 whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Action Modal */}
      {selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Clearance Status</h3>
            <textarea
              placeholder="Optional notes..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(selectedClearance, 'approved', actionNotes);
                  setSelectedClearance(null);
                  setActionNotes('');
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(selectedClearance, 'rejected', actionNotes);
                  setSelectedClearance(null);
                  setActionNotes('');
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedClearance(null);
                  setActionNotes('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// DMCA Table Component
function DmcaTable({ takedowns, getStatusBadge, router }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">DMCA Takedown Requests</h2>
        <span className="text-sm text-gray-500">{takedowns.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Copyrighted Work</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Platform</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Infringing URL</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Submitted</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {takedowns.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No DMCA takedowns found
                </td>
              </tr>
            ) : (
              takedowns.map((takedown) => (
                <tr key={takedown.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {takedown.copyright_registrations?.work_title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{takedown.platform}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <a
                      href={takedown.infringing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      View URL
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(takedown.status)}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(takedown.submitted_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/copyright/dmca/${takedown.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Registrations Table Component
function RegistrationsTable({ registrations, router }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Copyright Registrations</h2>
        <span className="text-sm text-gray-500">{registrations.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Work Title</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Type</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Artist</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Registration Date</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No registrations found
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.work_title}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{registration.work_type || 'N/A'}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {registration.user_profiles?.artist_name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.registration_date ? new Date(registration.registration_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/copyright/registration/${registration.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Monitoring Table Component
function MonitoringTable({ monitoring, router }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Copyright Monitoring</h2>
        <span className="text-sm text-gray-500">{monitoring.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Monitored Work</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Platform</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Detected URL</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Confidence</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Detected</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monitoring.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No monitoring results found
                </td>
              </tr>
            ) : (
              monitoring.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.copyright_registrations?.work_title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{item.platform || 'N/A'}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    {item.detected_url ? (
                      <a
                        href={item.detected_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                      >
                        View URL
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.confidence_score ? `${item.confidence_score}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.detected_at ? new Date(item.detected_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_resolved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.is_resolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/copyright/monitoring/${item.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

