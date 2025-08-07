import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Workflow, Archive, Filter, Clock, CheckCircle, 
  AlertCircle, Play, Pause, Eye, MoreHorizontal
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getReleases } from '@/lib/emptyData';
import { getUserRole } from '@/lib/auth0-config';
import { RELEASE_STATUS_LABELS } from '@/lib/constants';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

export default function CompanyAdminDistribution() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);

  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    showWarning,
    closeNotificationModal
  } = useModals();

  // Get user role
  const userRole = getUserRole(user);

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

  // Get workflow data from releases
  const allReleases = getReleases();
  const workflows = allReleases.map(release => ({
    id: release.id,
    title: release.title,
    artist: release.artist,
    label: release.label || 'YHWH MSC',
    status: release.status,
    submittedDate: release.submittedDate || release.createdAt || '2023-12-01',
    currentStage: release.status,
    isArchived: release.isArchived || false,
    priority: release.priority || 'medium'
  }));

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesArchive = showArchived ? workflow.isArchived : !workflow.isArchived;
    return matchesStatus && matchesArchive;
  });

  // Calculate workflow statistics
  const workflowStats = {
    active: workflows.filter(w => !w.isArchived && ['draft', 'submitted', 'in_review', 'approvals'].includes(w.status)).length,
    inReview: workflows.filter(w => w.status === 'in_review').length,
    approvals: workflows.filter(w => w.status === 'approvals').length,
    live: workflows.filter(w => ['live', 'distributed'].includes(w.status)).length,
    archived: workflows.filter(w => w.isArchived).length
  };

  // Workflow stages with timing
  const workflowStages = [
    { 
      key: 'draft', 
      label: 'Draft', 
      icon: '📝', 
      color: 'bg-gray-100 text-gray-800',
      description: 'Initial creation phase',
      avgTime: '1 hour 28 minutes'
    },
    { 
      key: 'submitted', 
      label: 'Submitted', 
      icon: '📤', 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Waiting for review pickup',
      avgTime: '1 hour 4 minutes'
    },
    { 
      key: 'in_review', 
      label: 'In Review', 
      icon: '🔍', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Distribution partner reviewing',
      avgTime: '23 hours 8 minutes'
    },
    { 
      key: 'approvals', 
      label: 'Approvals', 
      icon: '✅', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Final approval process',
      avgTime: '1 day 7 hours 45 minutes'
    },
    { 
      key: 'live', 
      label: 'Live', 
      icon: '🚀', 
      color: 'bg-green-100 text-green-800',
      description: 'Released to platforms',
      avgTime: 'Dec 04 03:34'
    }
  ];

  const handleArchiveSingle = (workflowId) => {
    showSuccess('Workflow archived successfully');
  };

  const handleBulkArchive = () => {
    if (selectedWorkflows.length === 0) {
      showWarning('Please select workflows to archive');
      return;
    }
    showSuccess(`${selectedWorkflows.length} workflow(s) archived successfully`);
    setSelectedWorkflows([]);
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
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

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
        title="Release Workflow Visualization - Company Admin"
        description="Track release progression from draft to live"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Release Workflow Visualization</h1>
            <p className="text-gray-600 mt-2">Track release progression from draft to live</p>
          </div>
        </div>

        {/* Workflow Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Workflow Progress Overview</h3>
            <div className="text-sm text-gray-600">
              Average completion: <span className="font-semibold text-blue-600">89%</span>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="relative overflow-x-auto">
            {/* Workflow Stages */}
            <div className="flex items-start justify-between min-w-max px-8">
              {workflowStages.map((stage, index) => (
                <div key={stage.key} className="flex flex-col items-center relative mx-4">
                  {/* Count Badge (moved above circle) */}
                  <div className={`mb-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    workflowStats[stage.key] > 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {workflowStats[stage.key] || 0}
                  </div>

                  {/* Circle */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4 shadow-sm ${
                    workflowStats[stage.key] > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                  }`}>
                    {stage.icon}
                  </div>
                  
                  {/* Stage Info */}
                  <div className="mt-4 text-center max-w-32">
                    <div className="font-semibold text-gray-900 text-sm">{stage.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                    <div className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 px-2 py-1 rounded">
                      {stage.avgTime}
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  {index < workflowStages.length - 1 && (
                    <div className="absolute top-12 left-24 flex items-center">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-300 to-blue-500"></div>
                      <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Meter */}
            <div className="mt-8 bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-lg font-bold text-blue-600">89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" style={{ width: '89%' }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on average completion time across all workflows
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Workflows ({workflows.length})</option>
                  <option value="draft">Draft ({workflowStats.active})</option>
                  <option value="submitted">Submitted (1)</option>
                  <option value="in_review">In Review ({workflowStats.inReview})</option>
                  <option value="approvals">Approvals ({workflowStats.approvals})</option>
                  <option value="live">Live ({workflowStats.live})</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    showArchived 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {showArchived ? 'Hide' : 'Show'} Archived
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedWorkflows.length > 0 && (
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Bulk Archive Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Workflows Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        {workflow.label || 'YHWH MSC'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)} {RELEASE_STATUS_LABELS[workflow.status] || workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority} priority
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(workflow.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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