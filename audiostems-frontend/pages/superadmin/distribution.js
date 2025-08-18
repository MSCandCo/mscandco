import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Workflow, Archive, Filter, Clock, CheckCircle, 
  AlertCircle, Play, Pause, Eye, MoreHorizontal,
  Shield, Building2, Users, TrendingUp, Settings
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getReleases } from '@/lib/emptyData';
import { getUserRole } from '@/lib/user-utils';
import { RELEASE_STATUS_LABELS } from '@/lib/constants';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

export default function SuperAdminDistribution() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, analytics

  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    showWarning,
    closeNotificationModal
  } = useModals();

  // Get user role
  const userRole = getUserRole(user);

  // Check super admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, user, router]);

  // Get workflow data from ALL releases (Super Admin sees everything)
  const allReleases = getReleases();
  const workflows = allReleases.map(release => ({
    id: release.id,
    title: release.title,
    artist: release.artist,
    label: release.label || 'YHWH MSC',
    brand: release.brand || release.label || 'YHWH MSC',
    status: release.status,
    submittedDate: release.submittedDate || release.createdAt || '2023-12-01',
    currentStage: release.status,
    isArchived: release.isArchived || false,
    priority: release.priority || 'medium',
    distributionPartner: release.distributionPartner || 'Code Group',
    revenue: release.totalRevenue || 0,
    streams: release.totalStreams || 0
  }));

  // Get all unique brands/labels for filtering
  const brands = [...new Set(workflows.map(w => w.brand).filter(Boolean))];

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || workflow.brand === brandFilter;
    const matchesPriority = priorityFilter === 'all' || workflow.priority === priorityFilter;
    const matchesArchive = showArchived ? workflow.isArchived : !workflow.isArchived;
    return matchesStatus && matchesBrand && matchesPriority && matchesArchive;
  });

  // Calculate comprehensive workflow statistics
  const workflowStats = {
    total: workflows.length,
    active: workflows.filter(w => !w.isArchived && ['draft', 'submitted', 'in_review', 'approvals'].includes(w.status)).length,
    draft: workflows.filter(w => w.status === 'draft').length,
    submitted: workflows.filter(w => w.status === 'submitted').length,
    inReview: workflows.filter(w => w.status === 'in_review').length,
    approvals: workflows.filter(w => w.status === 'approvals').length,
    live: workflows.filter(w => ['live', 'distributed'].includes(w.status)).length,
    archived: workflows.filter(w => w.isArchived).length,
    highPriority: workflows.filter(w => w.priority === 'high').length,
    totalRevenue: workflows.reduce((sum, w) => sum + (w.revenue || 0), 0),
    totalStreams: workflows.reduce((sum, w) => sum + (w.streams || 0), 0)
  };

  // Enhanced workflow stages with performance metrics
  const workflowStages = [
    { 
      key: 'draft', 
      label: 'Draft', 
      icon: '📝', 
      color: 'bg-gray-100 text-gray-800',
      description: 'Initial creation phase',
      avgTime: '1h 28m',
      count: workflowStats.draft
    },
    { 
      key: 'submitted', 
      label: 'Submitted', 
      icon: '📤', 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Waiting for review pickup',
      avgTime: '1h 4m',
      count: workflowStats.submitted
    },
    { 
      key: 'in_review', 
      label: 'In Review', 
      icon: '🔍', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Distribution partner reviewing',
      avgTime: '23h 8m',
      count: workflowStats.inReview
    },
    { 
      key: 'approvals', 
      label: 'Approvals', 
      icon: '✅', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Final approval process',
      avgTime: '1d 7h 45m',
      count: workflowStats.approvals
    },
    { 
      key: 'live', 
      label: 'Live', 
      icon: '🚀', 
      color: 'bg-green-100 text-green-800',
      description: 'Released to platforms',
      avgTime: 'Live',
      count: workflowStats.live
    }
  ];

  const handleArchiveSingle = (workflowId) => {
    showSuccess('Workflow archived successfully by Super Admin');
  };

  const handleBulkArchive = () => {
    if (selectedWorkflows.length === 0) {
      showWarning('Please select workflows to archive');
      return;
    }
    showSuccess(`${selectedWorkflows.length} workflow(s) archived successfully by Super Admin`);
    setSelectedWorkflows([]);
  };

  const handlePriorityChange = (workflowId, newPriority) => {
    showSuccess(`Priority updated to ${newPriority} by Super Admin`);
  };

  const getStatusIcon = (status) => {
    const icons = {
      'draft': '📝',
      'submitted': '📤',
      'in_review': '🔍',
      'approvals': '✅',
      'live': '🚀',
      'distributed': '🚀'
    };
    return icons[status] || '❓';
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'in_review': 'bg-blue-100 text-blue-800',
      'approvals': 'bg-purple-100 text-purple-800',
      'live': 'bg-green-100 text-green-800',
      'distributed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'low': 'text-green-600 bg-green-50'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading distribution workflows...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Super Admin - Distribution Workflow Management"
        description="Global distribution workflow oversight and management"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Super Admin - Distribution Control Center</h1>
              </div>
              <p className="text-red-100 text-lg">
                Global workflow oversight across all brands and distribution partners
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-100">Active Workflows</div>
              <div className="text-2xl font-bold">{workflowStats.active}</div>
            </div>
          </div>
        </div>

        {/* Super Admin Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-3xl font-bold text-gray-900">{workflowStats.total}</p>
                <p className="text-sm text-gray-500">Across {brands.length} brands</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Workflow className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">{workflowStats.highPriority}</p>
                <p className="text-sm text-gray-500">Requires attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Releases</p>
                <p className="text-3xl font-bold text-green-600">{workflowStats.live}</p>
                <p className="text-sm text-gray-500">Currently distributed</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  £{(workflowStats.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-500">{(workflowStats.totalStreams / 1000).toFixed(0)}K streams</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Workflow Overview', icon: Workflow },
                { id: 'detailed', name: 'Detailed View', icon: Eye },
                { id: 'analytics', name: 'Performance Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`${
                    viewMode === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Workflow Overview */}
          {viewMode === 'overview' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Global Workflow Progress</h3>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Super Admin Control</span>
                </div>
              </div>

              {/* Enhanced Progress Visualization */}
              <div className="relative overflow-x-auto">
                <div className="flex items-start justify-between min-w-max px-8">
                  {workflowStages.map((stage, index) => (
                    <div key={stage.key} className="flex flex-col items-center relative mx-4">
                      {/* Count Badge */}
                      <div className={`mb-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        stage.count > 0 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {stage.count}
                      </div>

                      {/* Circle */}
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 shadow-lg ${
                        stage.count > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {stage.icon}
                      </div>
                      
                      {/* Stage Info */}
                      <div className="mt-4 text-center max-w-36">
                        <div className="font-bold text-gray-900 text-sm">{stage.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                        <div className="text-xs text-red-600 font-medium mt-2 bg-red-50 px-3 py-1 rounded-full">
                          Avg: {stage.avgTime}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">
                          {stage.count} workflows
                        </div>
                      </div>

                      {/* Enhanced Connector Arrow */}
                      {index < workflowStages.length - 1 && (
                        <div className="absolute top-16 left-28 flex items-center">
                          <div className="w-20 h-1 bg-gradient-to-r from-red-300 to-red-500 rounded-full"></div>
                          <div className="w-0 h-0 border-l-6 border-l-red-500 border-t-3 border-t-transparent border-b-3 border-b-transparent"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Enhanced Progress Meter */}
                <div className="mt-8 bg-gradient-to-r from-red-50 to-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">Platform-Wide Progress</span>
                                  <span className="text-2xl font-bold text-red-600">
                {workflowStats.total > 0 ? Math.round((workflowStats.live / workflowStats.total) * 100) : 0}%
              </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-purple-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${workflowStats.total > 0 ? Math.round((workflowStats.live / workflowStats.total) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 flex justify-between">
                    <span>Completion rate across all brands</span>
                    <span>{workflowStats.live} of {workflowStats.total} workflows live</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Filters and Actions for Detailed View */}
          {viewMode === 'detailed' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Status ({workflows.length})</option>
                    <option value="draft">Draft ({workflowStats.draft})</option>
                    <option value="submitted">Submitted ({workflowStats.submitted})</option>
                    <option value="in_review">In Review ({workflowStats.inReview})</option>
                    <option value="approvals">Approvals ({workflowStats.approvals})</option>
                    <option value="live">Live ({workflowStats.live})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Filter:</label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Filter:</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium ${
                      showArchived 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {showArchived ? 'Hide' : 'Show'} Archived
                  </button>
                </div>

                <div className="flex flex-col justify-end">
                  {selectedWorkflows.length > 0 && (
                    <button
                      onClick={handleBulkArchive}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Bulk Archive ({selectedWorkflows.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Workflows Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkflows(filteredWorkflows.filter(w => ['live', 'distributed'].includes(w.status)).map(w => w.id));
                              } else {
                                setSelectedWorkflows([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Release</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Artist</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWorkflows.map((workflow) => (
                        <tr key={workflow.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedWorkflows.includes(workflow.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWorkflows([...selectedWorkflows, workflow.id]);
                                } else {
                                  setSelectedWorkflows(selectedWorkflows.filter(id => id !== workflow.id));
                                }
                              }}
                              disabled={!['live', 'distributed'].includes(workflow.status)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{workflow.title || '---'}</div>
                            <div className="text-xs text-gray-500">ID: {workflow.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {workflow.artist || '---'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              <Building2 className="w-3 h-3 mr-1" />
                              {workflow.brand}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                              {getStatusIcon(workflow.status)} {RELEASE_STATUS_LABELS[workflow.status] || workflow.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={workflow.priority}
                              onChange={(e) => handlePriorityChange(workflow.id, e.target.value)}
                              className={`text-xs font-medium border-0 rounded-md px-2 py-1 ${getPriorityColor(workflow.priority)}`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            £{(workflow.revenue || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(workflow.submittedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Super Admin View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="Override Settings"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              {['live', 'distributed'].includes(workflow.status) && (
                                <button
                                  onClick={() => handleArchiveSingle(workflow.id)}
                                  className="text-orange-600 hover:text-orange-900 p-1 rounded"
                                  title="Archive"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredWorkflows.length === 0 && (
                  <div className="p-12 text-center">
                    <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                    <p className="text-gray-500">
                      Try adjusting your filters to find the workflows you're looking for.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Analytics View */}
          {viewMode === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completion Rate by Brand */}
                <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-6">
                  <h4 className="text-md font-bold text-gray-900 mb-4">Completion Rate by Brand</h4>
                  {brands.map(brand => {
                    const brandWorkflows = workflows.filter(w => w.brand === brand);
                    const completionRate = brandWorkflows.length > 0 
                      ? Math.round((brandWorkflows.filter(w => ['live', 'distributed'].includes(w.status)).length / brandWorkflows.length) * 100)
                      : 0;
                    
                    return (
                      <div key={brand} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{brand}</span>
                          <span className="text-red-600 font-bold">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-purple-500 h-2 rounded-full" 
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Revenue Performance */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                  <h4 className="text-md font-bold text-gray-900 mb-4">Revenue by Status</h4>
                  {['live', 'in_review', 'approvals', 'submitted'].map(status => {
                    const statusWorkflows = workflows.filter(w => w.status === status);
                    const statusRevenue = statusWorkflows.reduce((sum, w) => sum + (w.revenue || 0), 0);
                    
                    return (
                      <div key={status} className="flex justify-between items-center mb-3 p-2 bg-white rounded-lg">
                        <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-bold text-green-600">£{statusRevenue.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          type={notificationModal.type}
          title={notificationModal.title}
          message={notificationModal.message}
          onClose={closeNotificationModal}
        />
      </div>
    </MainLayout>
  );
}