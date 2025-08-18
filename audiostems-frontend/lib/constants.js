// Release Status Constants
export const RELEASE_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVALS: 'approvals',
  COMPLETED: 'completed',
  LIVE: 'live',
  DISTRIBUTED: 'distributed',
  ARCHIVED: 'archived'
};

// Legacy aliases for backward compatibility
export const LEGACY_STATUS_ALIASES = {
  UNDER_REVIEW: 'in_review',
  APPROVAL_REQUIRED: 'approvals'
};

// Status Labels Mapping
export const RELEASE_STATUS_LABELS = {
  [RELEASE_STATUSES.DRAFT]: 'Draft',
  [RELEASE_STATUSES.SUBMITTED]: 'Submitted',
  [RELEASE_STATUSES.IN_REVIEW]: 'In Review',
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
  [RELEASE_STATUSES.IN_REVIEW]: 'bg-amber-100 text-amber-800',
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
  'Mixtape',
  'Compilation',
  'Remix',
  'Live',
  'Soundtrack',
  'Instrumental',
  'Acapella',
  'Demo',
  'Bootleg',
  'Split',
  'Cover',
  'Reissue',
  'Deluxe Edition'
];

// Vocal Type Constants
export const VOCAL_TYPES = [
  'Lead Vocals',
  'Backing Vocals', 
  'Harmony',
  'Rap',
  'Spoken Word',
  'Instrumental'
];

// Song Key Constants
export const SONG_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

// Language Constants
export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 
  'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Russian', 'Other'
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
  // Status icons disabled - return empty string to show only status labels
  return '';
};

export const isStatusEditableByArtist = (status) => {
  return [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED].includes(status);
};

export const isStatusControlledByDistributionPartner = (status) => {
  return [
    RELEASE_STATUSES.IN_REVIEW,
    RELEASE_STATUSES.APPROVALS,
    RELEASE_STATUSES.COMPLETED, 
    RELEASE_STATUSES.LIVE
  ].includes(status);
};

export const isStatusRequiringApproval = (status) => {
  return status === RELEASE_STATUSES.APPROVALS;
};