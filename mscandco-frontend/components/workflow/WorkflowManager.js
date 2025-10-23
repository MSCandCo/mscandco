'use client'

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Edit3, 
  MessageSquare, 
  Users, 
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';

const WorkflowManager = ({ 
  release, 
  userRole, 
  onStatusChange, 
  onChangeRequest,
  onApproveRequest 
}) => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newChangeRequest, setNewChangeRequest] = useState({
    type: 'metadata',
    field: '',
    currentValue: '',
    requestedValue: '',
    reason: ''
  });
  const [showChangeRequestForm, setShowChangeRequestForm] = useState(false);

  // Workflow steps definition
  const workflowSteps = [
    {
      id: 'artist_creation',
      label: 'Artist Creation',
      description: 'Artist creates and edits release',
      roles: ['artist', 'label_admin'],
      status: 'draft',
      editingAllowed: true
    },
    {
      id: 'label_review',
      label: 'Label Review',
      description: 'Label Admin reviews submission',
      roles: ['label_admin'],
      status: 'submitted',
      editingAllowed: false
    },
    {
      id: 'distribution_review',
      label: 'Distribution Review',
      description: 'Distribution Partner processes release',
      roles: ['distribution_partner'],
      status: 'in_review',
      editingAllowed: false
    },
    {
      id: 'completion',
      label: 'Completion',
      description: 'Release sent to DSPs',
      roles: ['distribution_partner'],
      status: 'completed',
      editingAllowed: false
    },
    {
      id: 'live',
      label: 'Live',
      description: 'Release is live on platforms',
      roles: [],
      status: 'live',
      editingAllowed: false
    }
  ];

  // Get current workflow step
  const getCurrentStep = () => {
    return workflowSteps.find(step => step.status === release?.status) || workflowSteps[0];
  };

  // Check if user can perform actions
  const canUserEdit = () => {
    const currentStep = getCurrentStep();
    return currentStep.editingAllowed && currentStep.roles.includes(userRole);
  };

  const canUserAdvanceWorkflow = () => {
    const currentStep = getCurrentStep();
    return currentStep.roles.includes(userRole) || 
           ['company_admin', 'super_admin'].includes(userRole);
  };

  const canUserRequestChanges = () => {
    return ['artist', 'label_admin'].includes(userRole) && 
           !canUserEdit() && 
           ['in_review', 'completed', 'live'].includes(release?.status);
  };

  // Get next possible statuses
  const getNextStatuses = () => {
    const currentStatus = release?.status || 'draft';
    
    if (userRole === 'artist' || userRole === 'label_admin') {
      if (currentStatus === 'draft') return ['submitted'];
      return [];
    }
    
    if (userRole === 'distribution_partner') {
      if (currentStatus === 'submitted') return ['in_review', 'change_requested'];
      if (currentStatus === 'in_review') return ['completed', 'change_requested'];
      if (currentStatus === 'completed') return ['live'];
      return [];
    }
    
    if (['company_admin', 'super_admin'].includes(userRole)) {
      return ['draft', 'submitted', 'in_review', 'completed', 'live', 'change_requested'];
    }
    
    return [];
  };

  // Load change requests
  useEffect(() => {
    if (release?.id) {
      loadChangeRequests();
    }
  }, [release?.id]);

  const loadChangeRequests = async () => {
    try {
      // This would be an API call to fetch change requests
      setChangeRequests([]);
    } catch (error) {
      console.error('Error loading change requests:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRequestSubmit = async () => {
    if (!newChangeRequest.field || !newChangeRequest.reason) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onChangeRequest(newChangeRequest);
      setNewChangeRequest({
        type: 'metadata',
        field: '',
        currentValue: '',
        requestedValue: '',
        reason: ''
      });
      setShowChangeRequestForm(false);
      loadChangeRequests();
    } catch (error) {
      console.error('Error submitting change request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-4 w-4" />;
      case 'submitted': return <Send className="h-4 w-4" />;
      case 'in_review': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'live': return <CheckCircle className="h-4 w-4" />;
      case 'change_requested': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'in_review': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'live': return 'text-green-600 bg-green-100';
      case 'change_requested': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!release) {
    return null;
  }

  const currentStep = getCurrentStep();
  const nextStatuses = getNextStatuses();

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Release Workflow</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
            {getStatusIcon(release.status)}
            <span className="ml-1">{release.status?.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const isActive = step.status === release.status;
              const isCompleted = workflowSteps.findIndex(s => s.status === release.status) > index;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : 
                     isActive ? <Clock className="h-4 w-4" /> :
                     <div className="w-2 h-2 bg-current rounded-full" />}
                  </div>
                  <div className="text-xs text-center mt-2">
                    <div className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{step.description}</div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 absolute" style={{ 
                      left: `${((index + 1) / workflowSteps.length) * 100 - 2}%`,
                      top: '16px'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{currentStep.label}</h4>
              <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>Managed by: {currentStep.roles.join(', ') || 'System'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Editing: {canUserEdit() ? 
                  <span className="text-green-600 font-medium">Allowed</span> : 
                  <span className="text-red-600 font-medium">Restricted</span>
                }
              </div>
              {release.artistCanEdit !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  Artist can edit: {release.artistCanEdit ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(canUserAdvanceWorkflow() || canUserRequestChanges()) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Available Actions</h4>
          
          <div className="space-y-3">
            {/* Status Change Actions */}
            {nextStatuses.length > 0 && canUserAdvanceWorkflow() && (
              <div className="flex flex-wrap gap-3">
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === 'live' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      status === 'completed' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                      status === 'change_requested' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      getStatusIcon(status)
                    )}
                    <span className="ml-1">
                      Move to {status.replace('_', ' ').toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Change Request Action */}
            {canUserRequestChanges() && (
              <button
                onClick={() => setShowChangeRequestForm(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Change Request Form */}
      {showChangeRequestForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Request Changes</h4>
            <button
              onClick={() => setShowChangeRequestForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type
                </label>
                <select
                  value={newChangeRequest.type}
                  onChange={(e) => setNewChangeRequest(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="metadata">Metadata Change</option>
                  <option value="artwork">Artwork Change</option>
                  <option value="audio">Audio Change</option>
                  <option value="credits">Credits Change</option>
                  <option value="urgent">Urgent Change</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field to Change
                </label>
                <input
                  type="text"
                  value={newChangeRequest.field}
                  onChange={(e) => setNewChangeRequest(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="e.g., Release Title, Artist Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="text"
                value={newChangeRequest.currentValue}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, currentValue: e.target.value }))}
                placeholder="What is the current value?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Value
              </label>
              <input
                type="text"
                value={newChangeRequest.requestedValue}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, requestedValue: e.target.value }))}
                placeholder="What should it be changed to?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Change *
              </label>
              <textarea
                value={newChangeRequest.reason}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please explain why this change is needed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowChangeRequestForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRequestSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Requests History */}
      {changeRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Change Requests</h4>
          
          <div className="space-y-3">
            {changeRequests.map((request, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{request.field}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>From:</strong> {request.currentValue}</p>
                  <p><strong>To:</strong> {request.requestedValue}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
