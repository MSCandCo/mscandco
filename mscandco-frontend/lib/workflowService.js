/**
 * Workflow Service for MSC & Co Distribution
 */

export const WORKFLOW_STATES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  LIVE: 'live'
};

export async function getWorkflowSteps() {
  return [
    { id: 1, name: 'Draft', status: WORKFLOW_STATES.DRAFT },
    { id: 2, name: 'Submitted', status: WORKFLOW_STATES.SUBMITTED },
    { id: 3, name: 'Under Review', status: WORKFLOW_STATES.UNDER_REVIEW },
    { id: 4, name: 'Approved', status: WORKFLOW_STATES.APPROVED },
    { id: 5, name: 'Live', status: WORKFLOW_STATES.LIVE }
  ];
}

export function getNextWorkflowState(currentState) {
  const transitions = {
    [WORKFLOW_STATES.DRAFT]: WORKFLOW_STATES.SUBMITTED,
    [WORKFLOW_STATES.SUBMITTED]: WORKFLOW_STATES.UNDER_REVIEW,
    [WORKFLOW_STATES.UNDER_REVIEW]: WORKFLOW_STATES.APPROVED,
    [WORKFLOW_STATES.APPROVED]: WORKFLOW_STATES.LIVE
  };
  return transitions[currentState] || currentState;
}
