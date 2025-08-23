import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { 
  Play, Clock, CheckCircle, AlertCircle, Archive, 
  Filter, Calendar, Timer, RefreshCw, Activity
} from 'lucide-react';
import { Card, Badge } from 'flowbite-react';
import moment from 'moment';
import { getUserRole } from '@/lib/user-utils';
import { formatNumber as globalFormatNumber } from '@/lib/number-utils';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';
import { 
  generateWorkflowData, 
  getWorkflowAnalytics, 
  formatDuration as serviceDuration,
  getCurrentElapsedTime 
} from '@/lib/workflowService';

// Generate workflow data from Universal Database
const mockWorkflowData = generateWorkflowData();


// Status configuration with colors and icons
const statusConfig = {
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-200 text-gray-800', 
    icon: Play, 
    description: 'Initial creation phase' 
  },
  submitted: { 
    label: 'Submitted', 
    color: 'bg-blue-200 text-blue-800', 
    icon: Clock, 
    description: 'Waiting for review pickup' 
  },
  in_review: { 
    label: 'In Review', 
    color: 'bg-yellow-200 text-yellow-800', 
    icon: RefreshCw, 
    description: 'Distribution partner reviewing' 
  },
  approvals: { 
    label: 'Approvals', 
    color: 'bg-purple-200 text-purple-800', 
    icon: AlertCircle, 
    description: 'Final approval process' 
  },
  live: { 
    label: 'Live', 
    color: 'bg-green-200 text-green-800', 
    icon: CheckCircle, 
    description: 'Released to platforms' 
  }
};

export default function WorkflowVisualization() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    showWarning,
    closeNotificationModal
  } = useModals();

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'company_admin' && role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Filter workflows based on status and archive state
  const filteredWorkflows = useMemo(() => {
    return mockWorkflowData.filter(workflow => {
      const statusMatch = selectedFilter === 'all' || workflow.currentStatus === selectedFilter;
      const archiveMatch = showArchived ? workflow.archived : !workflow.archived;
      return statusMatch && archiveMatch;
    });
  }, [selectedFilter, showArchived]);

  // Calculate time since last status change
  const getTimeSinceLastUpdate = (workflow) => {
    const lastStatus = workflow.statusHistory[workflow.statusHistory.length - 1];
    return moment().diff(moment(lastStatus.timestamp), 'hours');
  };

  // Use global formatNumber utility
  const formatNumber = globalFormatNumber;

  // Format duration in human readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
    }
    if (minutes < 10080) { // Less than 7 days
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const mins = minutes % 60;
      let result = `${days} ${days === 1 ? 'day' : 'days'}`;
      if (hours > 0) result += ` ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      if (mins > 0) result += ` ${mins} minutes`;
      return result;
    }
    if (minutes < 43200) { // Less than 30 days (approximately 1 month)
      const weeks = Math.floor(minutes / 10080);
      const days = Math.floor((minutes % 10080) / 1440);
      let result = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      if (days > 0) result += ` ${days} ${days === 1 ? 'day' : 'days'}`;
      return result;
    }
    if (minutes < 525600) { // Less than 365 days (1 year)
      const months = Math.floor(minutes / 43200);
      const weeks = Math.floor((minutes % 43200) / 10080);
      let result = `${months} ${months === 1 ? 'month' : 'months'}`;
      if (weeks > 0) result += ` ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      return result;
    }
    // Over a year
    const years = Math.floor(minutes / 525600);
    const months = Math.floor((minutes % 525600) / 43200);
    let result = `${years} ${years === 1 ? 'year' : 'years'}`;
    if (months > 0) result += ` ${months} ${months === 1 ? 'month' : 'months'}`;
    return result;
  };

  // Get current status duration
  const getCurrentStatusDuration = (workflow) => {
    if (workflow.currentStatus === 'live') return 'Completed';
    return getTimeSinceLastUpdate(workflow);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleArchiveWorkflow = (workflowId) => {
    // In a real app, this would make an API call
    console.log('Archive workflow:', workflowId);
    // For demo purposes, we'll just show a success message
    showSuccess(`Workflow #${workflowId} has been archived successfully!`, 'Archive Complete');
  };

  const WorkflowDiagram = ({ workflow }) => {
    const allStatuses = ['draft', 'submitted', 'in_review', 'approvals', 'live'];
    const currentIndex = allStatuses.indexOf(workflow.currentStatus);

    return (
      <Card className="mb-6 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{workflow.title}</h3>
            <p className="text-sm text-gray-600">{workflow.artist} • {workflow.label}</p>
            <p className="text-xs text-gray-500">
              Submitted: {moment(workflow.submittedDate).format('MMM DD, YYYY HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={workflow.priority === 'high' ? 'red' : workflow.priority === 'medium' ? 'yellow' : 'gray'}>
              {workflow.priority} priority
            </Badge>
            {workflow.archived && (
              <Badge color="gray">
                <Archive className="w-3 h-3 mr-1" />
                Archived
              </Badge>
            )}
            {!workflow.archived && workflow.currentStatus === 'live' && (
              <button
                onClick={() => handleArchiveWorkflow(workflow.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
              >
                <Archive className="w-3 h-3" />
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Horizontal Workflow Diagram */}
        <div className="relative py-8">
          {/* Circles Row - Fixed Height and Position */}
          <div className="flex items-start justify-between relative mb-8">
            {allStatuses.map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={status} className="flex flex-col items-center relative z-10 flex-1">
                  {/* Enhanced Status Node with animations - Fixed Position */}
                  <div className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 transform
                    ${isActive 
                      ? isCurrent 
                        ? 'bg-blue-600 text-white border-blue-300 shadow-xl scale-110 animate-pulse' 
                        : 'bg-green-600 text-white border-green-300 shadow-lg'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }
                  `}>
                    <Icon className="w-6 h-6" />
                    
                    {/* Completion checkmark for finished steps */}
                    {isActive && !isCurrent && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Current step indicator */}
                    {isCurrent && workflow.currentStatus !== 'live' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <Timer className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Status Label - Fixed Height */}
                  <div className="mt-4 text-center w-full px-2 h-20 flex flex-col justify-start">
                    <p className={`text-sm font-medium mb-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3">
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content Row - Separate from Circles */}
          <div className="flex items-start justify-between relative">
            {allStatuses.map((status, index) => {
              const config = statusConfig[status];
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const historyItem = workflow.statusHistory.find(h => h.status === status);

              return (
                <div key={`content-${status}`} className="flex flex-col items-center relative z-10 flex-1 px-2">
                  <div className="min-h-[80px] flex flex-col justify-center w-full">
                    {historyItem && (
                      <div className="bg-white rounded-lg p-2 shadow-sm border mb-2">
                        <p className="text-xs text-gray-600 font-medium">
                          {moment(historyItem.timestamp).format('MMM DD')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {moment(historyItem.timestamp).format('HH:mm')}
                        </p>
                        {historyItem.duration > 0 && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            ⏱️ {formatDuration(historyItem.duration)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {isCurrent && workflow.currentStatus !== 'live' && (
                      <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                        <p className="text-xs text-orange-700 font-medium flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(getCurrentStatusDuration(workflow) * 60)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Status Description with more details */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium mb-1">
                📍 Current Status: {statusConfig[workflow.currentStatus].description}
              </p>
              {workflow.currentStatus !== 'live' && (
                <p className="text-sm text-gray-600">
                  ⏰ Time in current status: {formatDuration(getCurrentStatusDuration(workflow) * 60)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Total workflow time: {formatDuration(workflow.statusHistory.reduce((sum, h) => sum + (h.duration || 0), 0))}
              </p>
            </div>
            
            {/* Progress Percentage */}
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                {allStatuses.length > 1 ? Math.round((currentIndex / (allStatuses.length - 1)) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${allStatuses.length > 1 ? (currentIndex / (allStatuses.length - 1)) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout>
      <SEO pageTitle="Release Workflow Visualization" />
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Release Workflow Visualization</h1>
              <p className="text-gray-600 mt-2">Track release progression from draft to live</p>
            </div>
          </div>

          {/* Enhanced Filters and Actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                </div>
                
                {['all', ...Object.keys(statusConfig)].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedFilter(status)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${selectedFilter === status 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {status === 'all' ? 'All Workflows' : statusConfig[status].label}
                    <span className="ml-2 text-xs">
                      ({mockWorkflowData.filter(w => 
                        (status === 'all' || w.currentStatus === status) && 
                        (showArchived ? w.archived : !w.archived)
                      ).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${showArchived 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Archive className="w-4 h-4" />
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>

                {!showArchived && (
                  <button
                    onClick={() => {
                      const completedWorkflows = mockWorkflowData.filter(w => w.currentStatus === 'live' && !w.archived);
                      if (completedWorkflows.length > 0) {
                        const count = completedWorkflows.length;
                        showSuccess(`${count} workflows have been archived successfully!`, 'Bulk Archive Complete');
                      } else {
                        showWarning('No completed workflows to archive.', 'Archive Notice');
                      }
                    }}
                    className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Bulk Archive Completed
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-blue-600">
                    {mockWorkflowData.filter(w => !w.archived).length}
                  </p>
                  <p className="text-xs text-blue-700">Active</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-yellow-600">
                    {mockWorkflowData.filter(w => w.currentStatus === 'in_review' && !w.archived).length}
                  </p>
                  <p className="text-xs text-yellow-700">In Review</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-purple-600">
                    {mockWorkflowData.filter(w => w.currentStatus === 'approvals' && !w.archived).length}
                  </p>
                  <p className="text-xs text-purple-700">Approvals</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-green-600">
                    {mockWorkflowData.filter(w => w.currentStatus === 'live' && !w.archived).length}
                  </p>
                  <p className="text-xs text-green-700">Live</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-gray-600">
                    {mockWorkflowData.filter(w => w.archived).length}
                  </p>
                  <p className="text-xs text-gray-700">Archived</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Diagrams */}
          <div className="space-y-6">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <WorkflowDiagram key={workflow.id} workflow={workflow} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No workflows found for the selected filter.</p>
              </Card>
            )}
          </div>

          {/* Performance Analytics */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Performance Analytics</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(Math.round(mockWorkflowData.reduce((sum, w) => sum + w.formCompletionTime, 0) / mockWorkflowData.length))}min
                </p>
                <p className="text-sm text-gray-600">Avg Form Time</p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatNumber(Math.round(mockWorkflowData.reduce((sum, w) => {
                    const reviewTime = w.statusHistory.find(s => s.status === 'in_review')?.duration || 0;
                    return sum + reviewTime;
                  }, 0) / mockWorkflowData.length / 60))}h
                </p>
                <p className="text-sm text-gray-600">Avg Review Time</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(Math.round(mockWorkflowData.reduce((sum, w) => {
                    const approvalTime = w.statusHistory.find(s => s.status === 'approvals')?.duration || 0;
                    return sum + approvalTime;
                  }, 0) / mockWorkflowData.length / 60))}h
                </p>
                <p className="text-sm text-gray-600">Avg Approval Time</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(mockWorkflowData.length > 0 ? Math.round((mockWorkflowData.filter(w => w.currentStatus === 'live').length / mockWorkflowData.length) * 100) : 0)}%
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>

            {/* Efficiency Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">🚨 Attention Needed</h4>
                  <p className="text-sm text-red-600">
                    {mockWorkflowData.filter(w => {
                      const currentTime = getTimeSinceLastUpdate(w);
                      return currentTime > 48 && w.currentStatus !== 'live' && !w.archived;
                    }).length} workflows stuck for 48+ hours
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Review Queue</h4>
                  <p className="text-sm text-yellow-600">
                    {mockWorkflowData.filter(w => w.currentStatus === 'in_review' && !w.archived).length} releases waiting for review
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Ready to Archive</h4>
                  <p className="text-sm text-green-600">
                    {mockWorkflowData.filter(w => w.currentStatus === 'live' && !w.archived).length} completed releases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branded Modals */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </MainLayout>
  );
}