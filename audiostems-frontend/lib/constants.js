// Release Status Constants
export const RELEASE_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  IN_REVIEW: 'in_review', // Alias for compatibility
  APPROVAL_REQUIRED: 'approval_required',
  APPROVALS: 'approvals', // Alias for compatibility
  COMPLETED: 'completed',
  LIVE: 'live',
  DISTRIBUTED: 'distributed',
  ARCHIVED: 'archived'
};

// Status Labels Mapping
export const RELEASE_STATUS_LABELS = {
  [RELEASE_STATUSES.DRAFT]: 'Draft',
  [RELEASE_STATUSES.SUBMITTED]: 'Submitted',
  [RELEASE_STATUSES.UNDER_REVIEW]: 'In Review',
  [RELEASE_STATUSES.IN_REVIEW]: 'In Review',
  [RELEASE_STATUSES.APPROVAL_REQUIRED]: 'Approvals',
  [RELEASE_STATUSES.APPROVALS]: 'Approvals',
  [RELEASE_STATUSES.COMPLETED]: 'Completed',
  [RELEASE_STATUSES.LIVE]: 'Live',
  [RELEASE_STATUSES.DISTRIBUTED]: 'Distributed',
  [RELEASE_STATUSES.ARCHIVED]: 'Archived'
};

// Status Colors Mapping
export const RELEASE_STATUS_COLORS = {
  [RELEASE_STATUSES.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [RELEASE_STATUSES.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [RELEASE_STATUSES.UNDER_REVIEW]: 'bg-amber-100 text-amber-800',
  [RELEASE_STATUSES.IN_REVIEW]: 'bg-amber-100 text-amber-800',
  [RELEASE_STATUSES.APPROVAL_REQUIRED]: 'bg-orange-100 text-orange-800',
  [RELEASE_STATUSES.APPROVALS]: 'bg-orange-100 text-orange-800',
  [RELEASE_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [RELEASE_STATUSES.LIVE]: 'bg-purple-100 text-purple-800',
  [RELEASE_STATUSES.DISTRIBUTED]: 'bg-indigo-100 text-indigo-800',
  [RELEASE_STATUSES.ARCHIVED]: 'bg-gray-100 text-gray-800'
};

// Genre Constants
export const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'R&B',
  'Country',
  'Electronic',
  'Jazz',
  'Classical',
  'Folk',
  'Reggae',
  'Blues',
  'Alternative',
  'Indie',
  'Funk',
  'Soul',
  'Gospel',
  'World',
  'Latin',
  'Ambient',
  'House',
  'Techno',
  'Drum & Bass',
  'Dubstep',
  'Trap',
  'Lo-fi'
];

// Release Type Constants
export const RELEASE_TYPES = [
  'Single',
  'EP',
  'Album',
  'Compilation',
  'Live',
  'Remix',
  'Mixtape',
  'Soundtrack'
];

// User Role Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  DISTRIBUTION_PARTNER: 'distribution_partner',
  LABEL_ADMIN: 'label_admin',
  ARTIST: 'artist'
};

// User Status Constants
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Approval Status Constants
export const APPROVAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Helper Functions
export const getStatusLabel = (status) => {
  return RELEASE_STATUS_LABELS[status] || status;
};

export const getStatusColor = (status) => {
  return RELEASE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status) => {
  // Returns appropriate icon component name for the status
  const iconMap = {
    [RELEASE_STATUSES.DRAFT]: 'FileText',
    [RELEASE_STATUSES.SUBMITTED]: 'Send',
    [RELEASE_STATUSES.UNDER_REVIEW]: 'Eye',
    [RELEASE_STATUSES.IN_REVIEW]: 'Eye',
    [RELEASE_STATUSES.APPROVAL_REQUIRED]: 'CheckCircle',
    [RELEASE_STATUSES.APPROVALS]: 'CheckCircle',
    [RELEASE_STATUSES.COMPLETED]: 'Check',
    [RELEASE_STATUSES.LIVE]: 'Play',
    [RELEASE_STATUSES.DISTRIBUTED]: 'Play',
    [RELEASE_STATUSES.ARCHIVED]: 'X'
  };
  return iconMap[status] || 'FileText';
};

export const isStatusEditableByArtist = (status) => {
  return [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED].includes(status);
};

export const isStatusControlledByDistributionPartner = (status) => {
  return [
    RELEASE_STATUSES.UNDER_REVIEW, 
    RELEASE_STATUSES.IN_REVIEW,
    RELEASE_STATUSES.APPROVAL_REQUIRED, 
    RELEASE_STATUSES.APPROVALS,
    RELEASE_STATUSES.COMPLETED, 
    RELEASE_STATUSES.LIVE
  ].includes(status);
};

export const isStatusRequiringApproval = (status) => {
  return status === RELEASE_STATUSES.APPROVAL_REQUIRED || status === RELEASE_STATUSES.APPROVALS;
};