import { performancePricing, recordingPricing } from "@/pages/pricing";
import { COMPANY_INFO } from "@/lib/brand-config";
import { FileText, Send, Eye, Check, CheckCircle, Play } from 'lucide-react';

// Company and platform constants
export const COMPANY_NAME = COMPANY_INFO.name;
export const COMPANY_DESCRIPTION = COMPANY_INFO.description;
export const COMPANY_WEBSITE = COMPANY_INFO.website;
export const COMPANY_EMAIL = COMPANY_INFO.email;

// Product constants
export const PRODUCT_BY_ID = {
  "prod_NXu2gPbDeF7xH3": {
    name: "Performance Basic",
  },
  "prod_NXu5LW8r6jKbc1": {
    name: "Performance Standard",
  },
  "prod_NYBiJqWIBiBgFf": {
    name: "Performance Premium",
  },
};

export const getStripeProductById = (productId) => {
  return [...performancePricing, ...recordingPricing].find(
    (product) => product.stripeId === productId
  );
};

// Standardized status options for the entire application
export const RELEASE_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVAL_REQUIRED: 'approval_required',
  COMPLETED: 'completed',
  LIVE: 'live'
};

export const RELEASE_STATUS_LABELS = {
  [RELEASE_STATUSES.DRAFT]: 'Draft',
  [RELEASE_STATUSES.SUBMITTED]: 'Submitted',
  [RELEASE_STATUSES.UNDER_REVIEW]: 'Under Review',
  [RELEASE_STATUSES.APPROVAL_REQUIRED]: 'Approval Required',
  [RELEASE_STATUSES.COMPLETED]: 'Completed',
  [RELEASE_STATUSES.LIVE]: 'Live'
};

export const RELEASE_STATUS_COLORS = {
  [RELEASE_STATUSES.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [RELEASE_STATUSES.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [RELEASE_STATUSES.UNDER_REVIEW]: 'bg-amber-100 text-amber-800',
  [RELEASE_STATUSES.APPROVAL_REQUIRED]: 'bg-orange-100 text-orange-800',
  [RELEASE_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [RELEASE_STATUSES.LIVE]: 'bg-purple-100 text-purple-800'
};

// Standardized genre options for the entire application
export const GENRES = [
  'Acoustic',
  'Alternative',
  'Ambient',
  'Blues',
  'Classical',
  'Country',
  'Dance',
  'Electronic',
  'Experimental',
  'Folk',
  'Funk',
  'Gospel',
  'Hip Hop',
  'House',
  'Indie',
  'Jazz',
  'Latin',
  'Metal',
  'Pop',
  'Punk',
  'R&B',
  'Reggae',
  'Rock',
  'Soul',
  'Techno',
  'World'
];

// Release types
export const RELEASE_TYPES = [
  'Single',
  'EP',
  'Album',
  'Mixtape',
  'Compilation',
  'Remix',
  'Live Album',
  'Soundtrack'
];

// Standardized streaming platforms for the entire application
export const STREAMING_PLATFORMS = {
  SPOTIFY: 'spotify',
  APPLE_MUSIC: 'apple_music',
  YOUTUBE_MUSIC: 'youtube_music',
  AMAZON_MUSIC: 'amazon_music',
  DEEZER: 'deezer',
  TIDAL: 'tidal',
  SOUNDCLOUD: 'soundcloud',
  OTHER: 'other_platforms'
};

export const STREAMING_PLATFORM_LABELS = {
  [STREAMING_PLATFORMS.SPOTIFY]: 'Spotify',
  [STREAMING_PLATFORMS.APPLE_MUSIC]: 'Apple Music',
  [STREAMING_PLATFORMS.YOUTUBE_MUSIC]: 'YouTube Music',
  [STREAMING_PLATFORMS.AMAZON_MUSIC]: 'Amazon Music',
  [STREAMING_PLATFORMS.DEEZER]: 'Deezer',
  [STREAMING_PLATFORMS.TIDAL]: 'TIDAL',
  [STREAMING_PLATFORMS.SOUNDCLOUD]: 'SoundCloud',
  [STREAMING_PLATFORMS.OTHER]: 'Other Platforms'
};

export const STREAMING_PLATFORM_COLORS = {
  [STREAMING_PLATFORMS.SPOTIFY]: '#1DB954',
  [STREAMING_PLATFORMS.APPLE_MUSIC]: '#FA243C',
  [STREAMING_PLATFORMS.YOUTUBE_MUSIC]: '#FF0000',
  [STREAMING_PLATFORMS.AMAZON_MUSIC]: '#FF9900',
  [STREAMING_PLATFORMS.DEEZER]: '#FEAA2D',
  [STREAMING_PLATFORMS.TIDAL]: '#000000',
  [STREAMING_PLATFORMS.SOUNDCLOUD]: '#FF3300',
  [STREAMING_PLATFORMS.OTHER]: '#6B7280'
};

export const OTHER_PLATFORMS_DESCRIPTION = 'Includes Pandora, iHeartRadio, Napster, Audiomack, Bandcamp, JioSaavn, Anghami, Boomplay, NetEase, QQ Music, KKBox, Joox, Yandex Music, VK Music, Gaana, Wynk, Saavn, Hungama, TikTok Music, Instagram Music, Facebook Music, and 15+ other streaming services worldwide';

export const OTHER_PLATFORMS_LIST = [
  'Pandora', 'iHeartRadio', 'Napster', 'Audiomack', 'Bandcamp', 
  'JioSaavn', 'Anghami', 'Boomplay', 'NetEase', 'QQ Music', 
  'KKBox', 'Joox', 'Yandex Music', 'VK Music', 'Gaana', 
  'Wynk', 'Saavn', 'Hungama', 'TikTok Music', 'Instagram Music', 
  'Facebook Music', 'Shazam', 'MusicMatch', 'Last.fm', 'Groove Music'
];

// Helper function to get status label
export const getStatusLabel = (status) => {
  return RELEASE_STATUS_LABELS[status] || status;
};

// Helper function to get status color
export const getStatusColor = (status) => {
  return RELEASE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status icon
export const getStatusIcon = (status) => {
  switch (status) {
    case RELEASE_STATUSES.DRAFT:
      return <FileText className="w-4 h-4" />;
    case RELEASE_STATUSES.SUBMITTED:
      return <Send className="w-4 h-4" />;
    case RELEASE_STATUSES.UNDER_REVIEW:
      return <Eye className="w-4 h-4" />;
    case RELEASE_STATUSES.APPROVAL_REQUIRED:
      return <Check className="w-4 h-4" />;
    case RELEASE_STATUSES.COMPLETED:
      return <CheckCircle className="w-4 h-4" />;
    case RELEASE_STATUSES.LIVE:
      return <Play className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

// Helper function to check if status is editable by artist
export const isStatusEditableByArtist = (status) => {
  return [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED, RELEASE_STATUSES.APPROVAL_REQUIRED].includes(status);
};

// Helper function to check if status is controlled by distribution partner
export const isStatusControlledByDistributionPartner = (status) => {
  return [RELEASE_STATUSES.UNDER_REVIEW, RELEASE_STATUSES.APPROVAL_REQUIRED, RELEASE_STATUSES.COMPLETED, RELEASE_STATUSES.LIVE].includes(status);
};

// Helper function to check if status requires artist approval
export const isStatusRequiringApproval = (status) => {
  return status === RELEASE_STATUSES.APPROVAL_REQUIRED;
};

// Helper function to check if status is editable by label admin
export const isStatusEditableByLabelAdmin = (status) => {
  // Label admins have broader permissions than artists but not full distribution partner control
  return [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED, RELEASE_STATUSES.UNDER_REVIEW, RELEASE_STATUSES.APPROVAL_REQUIRED].includes(status);
};
