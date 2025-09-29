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

// Genre Constants - Hierarchical structure matching screenshots
export const GENRES = [
  // Main category
  'African',
  // African sub-genres (using non-breaking spaces for proper indentation)
  '\u00A0\u00A0\u00A0\u00A0Afro house',
  '\u00A0\u00A0\u00A0\u00A0Afro-fusion', 
  '\u00A0\u00A0\u00A0\u00A0Afro-soul',
  '\u00A0\u00A0\u00A0\u00A0Afrobeats',
  '\u00A0\u00A0\u00A0\u00A0Afropop',
  '\u00A0\u00A0\u00A0\u00A0Amapiano',
  '\u00A0\u00A0\u00A0\u00A0Bongo Flava',
  '\u00A0\u00A0\u00A0\u00A0Highlife',
  '\u00A0\u00A0\u00A0\u00A0Maskandi',
  
  // Main categories
  'Alternative',
  'Ambient', 
  'Americana',
  'Big Band',
  'Blues',
  
  // Brazilian main category
  'Brazilian',
  // Brazilian sub-genres
  '\u00A0\u00A0\u00A0\u00A0Axé',
  '\u00A0\u00A0\u00A0\u00A0Baile Funk',
  '\u00A0\u00A0\u00A0\u00A0Bossa Nova', 
  '\u00A0\u00A0\u00A0\u00A0Chorinho',
  '\u00A0\u00A0\u00A0\u00A0Forró',
  '\u00A0\u00A0\u00A0\u00A0Frevo',
  '\u00A0\u00A0\u00A0\u00A0MPB',
  '\u00A0\u00A0\u00A0\u00A0Pagode',
  '\u00A0\u00A0\u00A0\u00A0Samba',
  '\u00A0\u00A0\u00A0\u00A0Sertanejo',
  
  "Children's Music",
  'Christian',
  'Classical Crossover',
  'Comedy',
  'Country',
  
  // Dance main category  
  'Dance',
  // Dance sub-genres
  '\u00A0\u00A0\u00A0\u00A0Pop',
  '\u00A0\u00A0\u00A0\u00A0Tropical House',
  
  'Dancehall',
  
  // Electronic main category
  'Electronic',
  // Electronic sub-genres  
  '\u00A0\u00A0\u00A0\u00A0140 / Deep Dubstep / Grime',
  '\u00A0\u00A0\u00A0\u00A0Bass / Club',
  '\u00A0\u00A0\u00A0\u00A0Bass House',
  '\u00A0\u00A0\u00A0\u00A0BH Funk',
  '\u00A0\u00A0\u00A0\u00A0Brazilian Funk',
  '\u00A0\u00A0\u00A0\u00A0Breaks / Breakbeat / UK Bass',
  '\u00A0\u00A0\u00A0\u00A0Carioca Funk',
  '\u00A0\u00A0\u00A0\u00A0Deep House',
  '\u00A0\u00A0\u00A0\u00A0DJ Tools',
  '\u00A0\u00A0\u00A0\u00A0Downtempo',
  '\u00A0\u00A0\u00A0\u00A0Drum & Bass',
  '\u00A0\u00A0\u00A0\u00A0Dubstep',
  '\u00A0\u00A0\u00A0\u00A0Electro (Classic / Detroit / Modern)',
  '\u00A0\u00A0\u00A0\u00A0Electronica',
  '\u00A0\u00A0\u00A0\u00A0Funky House',
  '\u00A0\u00A0\u00A0\u00A0Hard Dance / Hardcore',
  '\u00A0\u00A0\u00A0\u00A0Hard Techno',
  '\u00A0\u00A0\u00A0\u00A0House',
  '\u00A0\u00A0\u00A0\u00A0Indie Dance',
  '\u00A0\u00A0\u00A0\u00A0Jackin House',
  '\u00A0\u00A0\u00A0\u00A0Mainstage',
  '\u00A0\u00A0\u00A0\u00A0Mandelao Funk',
  '\u00A0\u00A0\u00A0\u00A0Melodic Funk',
  '\u00A0\u00A0\u00A0\u00A0Melodic House & Techno',
  '\u00A0\u00A0\u00A0\u00A0Minimal / Deep Tech',
  '\u00A0\u00A0\u00A0\u00A0Nu Disco / Disco',
  '\u00A0\u00A0\u00A0\u00A0Organic House',
  '\u00A0\u00A0\u00A0\u00A0Progressive House',
  '\u00A0\u00A0\u00A0\u00A0Psy-Trance',
  '\u00A0\u00A0\u00A0\u00A0Tech House',
  '\u00A0\u00A0\u00A0\u00A0Techno (Peak Time / Driving)',
  '\u00A0\u00A0\u00A0\u00A0Techno (Raw / Deep / Hypnotic)',
  '\u00A0\u00A0\u00A0\u00A0Trance',
  '\u00A0\u00A0\u00A0\u00A0Trap / Wave',
  '\u00A0\u00A0\u00A0\u00A0UK Garage / Bassline',
  
  'Fitness & Workout',
  'Folk',
  'French Pop',
  'German Folk', 
  'German Pop',
  'Gospel',
  'Heavy Metal',
  'Hip Hop/Rap',
  'Holiday',
  
  // Indian main category
  'Indian',
  // Indian sub-genres
  '\u00A0\u00A0\u00A0\u00A0Assamese',
  '\u00A0\u00A0\u00A0\u00A0Bengali', 
  '\u00A0\u00A0\u00A0\u00A0Bhangra',
  '\u00A0\u00A0\u00A0\u00A0Bhojpuri',
  '\u00A0\u00A0\u00A0\u00A0Bollywood',
  '\u00A0\u00A0\u00A0\u00A0Children Song',
  '\u00A0\u00A0\u00A0\u00A0Devotional & Spiritual',
  '\u00A0\u00A0\u00A0\u00A0Dialogue',
  '\u00A0\u00A0\u00A0\u00A0DJ',
  '\u00A0\u00A0\u00A0\u00A0Fusion',
  '\u00A0\u00A0\u00A0\u00A0Gazal',
  '\u00A0\u00A0\u00A0\u00A0Gujarati',
  '\u00A0\u00A0\u00A0\u00A0Haryanvi',
  '\u00A0\u00A0\u00A0\u00A0Hindi',
  '\u00A0\u00A0\u00A0\u00A0Indian - Folk',
  '\u00A0\u00A0\u00A0\u00A0Indigenous',
  '\u00A0\u00A0\u00A0\u00A0Kannada',
  '\u00A0\u00A0\u00A0\u00A0Konkani',
  '\u00A0\u00A0\u00A0\u00A0Malayalam',
  '\u00A0\u00A0\u00A0\u00A0Mappila',
  '\u00A0\u00A0\u00A0\u00A0Marathi',
  '\u00A0\u00A0\u00A0\u00A0Odia',
  '\u00A0\u00A0\u00A0\u00A0Poetry',
  '\u00A0\u00A0\u00A0\u00A0Pop & Fusion',
  '\u00A0\u00A0\u00A0\u00A0Punjabi',
  '\u00A0\u00A0\u00A0\u00A0Rabindra Sangeet',
  '\u00A0\u00A0\u00A0\u00A0Rajasthani',
  '\u00A0\u00A0\u00A0\u00A0Regional Indian',
  '\u00A0\u00A0\u00A0\u00A0Sanskrit',
  '\u00A0\u00A0\u00A0\u00A0Speech',
  '\u00A0\u00A0\u00A0\u00A0Sufi',
  '\u00A0\u00A0\u00A0\u00A0Tamil',
  '\u00A0\u00A0\u00A0\u00A0Telugu',
  '\u00A0\u00A0\u00A0\u00A0Traditional',
  '\u00A0\u00A0\u00A0\u00A0Urdu',
  
  'Instrumental',
  'J Pop',
  'Jazz',
  'K Pop',
  'Karaoke',
  
  // Latin main category
  'Latin',
  // Latin sub-genres
  '\u00A0\u00A0\u00A0\u00A0Baladas',
  '\u00A0\u00A0\u00A0\u00A0Boleros',
  '\u00A0\u00A0\u00A0\u00A0Caribbean',
  '\u00A0\u00A0\u00A0\u00A0Cuban',
  '\u00A0\u00A0\u00A0\u00A0Latin Hip-Hop',
  '\u00A0\u00A0\u00A0\u00A0Latin Trap',
  '\u00A0\u00A0\u00A0\u00A0Latin Urban',
  '\u00A0\u00A0\u00A0\u00A0Ranchera',
  '\u00A0\u00A0\u00A0\u00A0Regional Mexicano',
  '\u00A0\u00A0\u00A0\u00A0Salsa/Merengue',
  '\u00A0\u00A0\u00A0\u00A0Tango',
  '\u00A0\u00A0\u00A0\u00A0Tropical',
  
  'New Age',
  'Pop',
  'R&B/Soul',
  'Reggae',
  'Rock',
  'Singer/Songwriter',
  'Soundtrack',
  'Spoken Word',
  'Vocal',
  'World'
];

// Language Constants (88+ languages) - Alphabetical order with English first
export const LANGUAGES = [
  'English', // Keep at top
  'Acholi',
  'Afrikaans', 
  'Alur',
  'Amharic',
  'Arabic',
  'Assamese',
  'Bari',
  'Bengali',
  'Bulgarian',
  'Chinese (Cantonese)',
  'Chinese (Mandarin)',
  'Croatian',
  'Czech',
  'Danish',
  'Dholuo',
  'Dutch',
  'Embu',
  'Estonian',
  'Filipino',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Gujarati',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Igbo',
  'Indonesian',
  'Instrumental',
  'Italian',
  'Iteso',
  'Japanese',
  'Kamba',
  'Kalenjin',
  'Kakwa',
  'Kannada',
  'Kikuyu',
  'Kinyarwanda',
  'Kirundi',
  'Kisii',
  'Korean',
  'Kuku',
  'Kumam',
  'Langi',
  'Latvian',
  'Lithuanian',
  'Luhya',
  'Luganda',
  'Lugbara',
  'Luo',
  'Maasai',
  'Madi',
  'Malay',
  'Malayalam',
  'Marathi',
  'Meru',
  'Mundari',
  'No Vocals',
  'Norwegian',
  'Odia',
  'Oromo',
  'Persian (Farsi)',
  'Pojulu',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Samburu',
  'Sanskrit',
  'Serbian',
  'Slovak',
  'Slovenian',
  'Somali',
  'Spanish',
  'Swahili',
  'Swedish',
  'Tamil',
  'Telugu',
  'Teso',
  'Thai',
  'Tigrinya',
  'Turkana',
  'Turkish',
  'Urdu',
  'Vietnamese',
  'Xhosa',
  'Yoruba',
  'Zulu',
  'Multiple Languages', // Special - triggers text input
  'Other' // Special - triggers text input
];

// Asset Contributor Types
export const ASSET_CONTRIBUTOR_TYPES = [
  'Back Ground Vocalists',
  'Executive Producer',
  'Producer',
  'Mixing Engineer',
  'Mastering Engineer',
  'Co-Producer',
  'Assistant Producer',
  'Engineer',
  'Editing',
  'Mastering Studio',
  'Recording Engineer',
  'Additional Production',
  'Recording Studio',
  'Keyboards',
  'Programming',
  'Bass',
  'Drums',
  'Guitars',
  'Organ',
  'Percussion',
  'Strings',
  'Additional Instrumentation'
];

// Release Contributor Types
export const RELEASE_CONTRIBUTOR_TYPES = [
  'Design/Art Direction',
  'Management',
  'Booking Agent',
  'Press Contact',
  'Primary Contact Email',
  'Artist Email',
  'Primary Contact #',
  'Secondary Contact #'
];

// Social Media Types
export const SOCIAL_MEDIA_TYPES = [
  'Wikipedia',
  'Social Media Link',
  'Shazam',
  'TikTok',
  'Instagram',
  'Genius',
  'AllMusic',
  'Discogs',
  'Musicbrainz',
  'IMDb',
  'Jaxsta',
  'Website',
  'YouTube',
  'YouTube Music',
  'Knowledge Panel',
  'Tour Dates',
  'Spotify URI',
  'Apple ID'
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


// Artist Type Constants
export const ARTIST_TYPES = [
  'Solo Artist',
  'Band Group',
  'DJ',
  'Duo',
  'Orchestra',
  'Ensemble',
  'Collective',
  'Producer',
  'Composer',
  'Singer-Songwriter',
  'Rapper',
  'Instrumentalist',
  'Choir'
];

// Instrument Constants
export const INSTRUMENTS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Synthesizer',
  'Saxophone', 'Trumpet', 'Violin', 'Cello', 'Flute', 'Clarinet', 'Harmonica',
  'Banjo', 'Mandolin', 'Ukulele', 'Accordion', 'Organ', 'Harp', 'Percussion'
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

export const isStatusEditableByLabelAdmin = (status) => {
  return [
    RELEASE_STATUSES.DRAFT,
    RELEASE_STATUSES.SUBMITTED
  ].includes(status);
};