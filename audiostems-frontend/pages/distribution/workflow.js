import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { 
  Play, Clock, CheckCircle, AlertCircle, Archive, 
  Filter, Calendar, Timer, RefreshCw
} from 'lucide-react';
import { Card, Badge } from 'flowbite-react';
import moment from 'moment';
import { getUserRole } from '@/lib/auth0-config';

// Mock workflow data with detailed timing
const mockWorkflowData = [
  {
    id: 1,
    title: 'Urban Beat',
    artist: 'YHWH MSC',
    label: 'YHWH MSC',
    submittedDate: '2024-01-16T10:30:00Z',
    currentStatus: 'live',
    statusHistory: [
      { status: 'draft', timestamp: '2024-01-16T09:00:00Z', duration: 90 }, // 1.5 hours
      { status: 'submitted', timestamp: '2024-01-16T10:30:00Z', duration: 60 }, // 1 hour
      { status: 'in_review', timestamp: '2024-01-16T11:30:00Z', duration: 1440 }, // 24 hours
      { status: 'approvals', timestamp: '2024-01-17T11:30:00Z', duration: 720 }, // 12 hours
      { status: 'live', timestamp: '2024-01-17T23:30:00Z', duration: 0 }
    ],
    archived: false,
    priority: 'high'
  },
  {
    id: 2,
    title: 'Starlight',
    artist: 'Seoul Stars',
    label: 'Urban Sounds',
    submittedDate: '2024-01-15T14:20:00Z',
    currentStatus: 'approvals',
    statusHistory: [
      { status: 'draft', timestamp: '2024-01-15T12:00:00Z', duration: 140 }, // 2.3 hours
      { status: 'submitted', timestamp: '2024-01-15T14:20:00Z', duration: 45 }, // 45 minutes
      { status: 'in_review', timestamp: '2024-01-15T15:05:00Z', duration: 2160 }, // 36 hours
      { status: 'approvals', timestamp: '2024-01-16T15:05:00Z', duration: 480 } // 8 hours so far
    ],
    archived: false,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Hit Single #1',
    artist: 'Global Superstar',
    label: 'YHWH MSC',
    submittedDate: '2024-01-14T09:15:00Z',
    currentStatus: 'in_review',
    statusHistory: [
      { status: 'draft', timestamp: '2024-01-14T08:30:00Z', duration: 45 }, // 45 minutes
      { status: 'submitted', timestamp: '2024-01-14T09:15:00Z', duration: 30 }, // 30 minutes
      { status: 'in_review', timestamp: '2024-01-14T09:45:00Z', duration: 3600 } // 60 hours so far
    ],
    archived: false,
    priority: 'high'
  },
  {
    id: 4,
    title: 'Street Rhythm',
    artist: 'YHWH MSC',
    label: 'YHWH MSC',
    submittedDate: '2024-01-10T16:45:00Z',
    currentStatus: 'live',
    statusHistory: [
      { status: 'draft', timestamp: '2024-01-10T15:30:00Z', duration: 75 },
      { status: 'submitted', timestamp: '2024-01-10T16:45:00Z', duration: 90 },
      { status: 'in_review', timestamp: '2024-01-10T18:15:00Z', duration: 1320 }, // 22 hours
      { status: 'approvals', timestamp: '2024-01-11T16:15:00Z', duration: 600 }, // 10 hours
      { status: 'live', timestamp: '2024-01-12T02:15:00Z', duration: 0 }
    ],
    archived: true,
    priority: 'medium'
  },
  {
    id: 5,
    title: 'Opening Anthem',
    artist: 'Rock Legends',
    label: 'Urban Sounds',
    submittedDate: '2024-01-13T11:20:00Z',
    currentStatus: 'submitted',
    statusHistory: [
      { status: 'draft', timestamp: '2024-01-13T10:30:00Z', duration: 50 },
      { status: 'submitted', timestamp: '2024-01-13T11:20:00Z', duration: 4320 } // 72 hours so far
    ],
    archived: false,
    priority: 'low'
  }
];

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
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

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

  // Format duration in human readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) return `${hours}h ${remainingMinutes}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
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

  const WorkflowDiagram = ({ workflow }) => {
    const allStatuses = ['draft', 'submitted', 'in_review', 'approvals', 'live'];
    const currentIndex = allStatuses.indexOf(workflow.currentStatus);

    return (
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-start mb-4">
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
          </div>
        </div>

        {/* Horizontal Workflow Diagram */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {allStatuses.map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const historyItem = workflow.statusHistory.find(h => h.status === status);

              return (
                <div key={status} className="flex flex-col items-center relative">
                  {/* Status Node */}
                  <div className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    ${isActive 
                      ? isCurrent 
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200' 
                        : 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }
                    transition-all duration-300
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Status Label */}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {config.label}
                    </p>
                    {historyItem && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          {moment(historyItem.timestamp).format('MMM DD HH:mm')}
                        </p>
                        {historyItem.duration > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            {formatDuration(historyItem.duration)}
                          </p>
                        )}
                      </div>
                    )}
                    {isCurrent && workflow.currentStatus !== 'live' && (
                      <div className="mt-1">
                        <p className="text-xs text-orange-600 font-medium flex items-center justify-center">
                          <Timer className="w-3 h-3 mr-1" />
                          {getCurrentStatusDuration(workflow)}h
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < allStatuses.length - 1 && (
                    <div className={`
                      absolute top-6 left-6 w-24 h-0.5 
                      ${index < currentIndex ? 'bg-green-600' : 'bg-gray-200'}
                      transition-all duration-300
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Description */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Current Status:</strong> {statusConfig[workflow.currentStatus].description}
          </p>
          {workflow.currentStatus !== 'live' && (
            <p className="text-sm text-gray-600 mt-1">
              Time in current status: {getCurrentStatusDuration(workflow)} hours
            </p>
          )}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            
            {['all', ...Object.keys(statusConfig)].map(status => (
              <button
                key={status}
                onClick={() => setSelectedFilter(status)}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-colors
                  ${selectedFilter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {status === 'all' ? 'All' : statusConfig[status].label}
              </button>
            ))}

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1
                ${showArchived 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Archive className="w-3 h-3" />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
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

          {/* Summary Stats */}
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700">Total Active</h3>
              <p className="text-2xl font-bold text-blue-600">
                {mockWorkflowData.filter(w => !w.archived).length}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700">In Review</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {mockWorkflowData.filter(w => w.currentStatus === 'in_review' && !w.archived).length}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700">Pending Approval</h3>
              <p className="text-2xl font-bold text-purple-600">
                {mockWorkflowData.filter(w => w.currentStatus === 'approvals' && !w.archived).length}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-700">Completed</h3>
              <p className="text-2xl font-bold text-green-600">
                {mockWorkflowData.filter(w => w.currentStatus === 'live').length}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}