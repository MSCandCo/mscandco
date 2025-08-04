// 🏢 MSC & CO PLATFORM - UNIVERSAL MOCK DATABASE
// Production-Ready Central Data System
// This acts as the single source of truth for ALL user roles and scenarios

import { RELEASE_STATUSES, GENRES, RELEASE_TYPES } from './constants.js';

// 🎯 USER STATUS LOGIC
// Users are INACTIVE if they meet ANY of these criteria:
// 1. No releases AND minimal earnings (< $1000)
// 2. Haven't logged in for more than 6 months
// 3. Account creation without any activity for 3+ months
const determineUserStatus = (user) => {
  // Admin roles are always active
  if (['super_admin', 'company_admin', 'distribution_partner', 'label_admin'].includes(user.role)) {
    return 'active';
  }
  
  const now = new Date();
  const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
  const joinDate = new Date(user.joinDate);
  
  // Calculate time since last login (in days)
  const daysSinceLastLogin = lastLoginDate 
    ? Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24))
    : Math.floor((now - joinDate) / (1000 * 60 * 60 * 24)); // Use join date if no login
  
  // Calculate days since joining
  const daysSinceJoining = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
  
  // For artists: check multiple inactive criteria
  if (user.role === 'artist') {
    const hasNoReleases = !user.totalReleases || user.totalReleases === 0;
    const hasMinimalEarnings = !user.totalRevenue || user.totalRevenue < 1000;
    const hasNotLoggedInRecently = daysSinceLastLogin > 180; // 6 months
    const isNewAccountWithNoActivity = daysSinceJoining > 90 && hasNoReleases && hasMinimalEarnings; // 3 months with no activity
    
    // Inactive if: (no releases AND minimal earnings) OR haven't logged in for 6+ months OR new account with no activity
    return (hasNoReleases && hasMinimalEarnings) || hasNotLoggedInRecently || isNewAccountWithNoActivity ? 'inactive' : 'active';
  }
  
  return 'active';
};

// 🔧 DATABASE CONFIGURATION
const DB_CONFIG = {
  version: '2.0.0',
  lastUpdated: '2025-01-03',
  environment: 'production-ready-mock',
  totalUsers: 1247,
  totalLabels: 15,
  totalPlatforms: 12
};

// 🏷️ LABELS & ORGANIZATIONS
export const LABELS = [
  {
    id: 'yhwh_msc',
    name: 'YHWH MSC',
    type: 'independent',
    status: 'active',
    founded: '2020-03-15',
    country: 'United Kingdom',
    primaryGenres: ['Hip Hop', 'Classical', 'Electronic'],
    totalArtists: 3,
    totalReleases: 12,
    totalStreams: 8750000,
    totalRevenue: 245000,
    contactEmail: 'admin@yhwhmsc.com',
    address: 'London, UK'
  },
  {
    id: 'major_label_music',
    name: 'Major Label Music',
    type: 'major',
    status: 'active',
    founded: '1995-01-01',
    country: 'United States',
    primaryGenres: ['Pop', 'Rock', 'Hip Hop'],
    totalArtists: 8,
    totalReleases: 45,
    totalStreams: 125000000,
    totalRevenue: 2500000,
    contactEmail: 'contact@majorlabel.com',
    address: 'Los Angeles, CA, USA'
  },
  {
    id: 'k_entertainment',
    name: 'K-Entertainment',
    type: 'independent',
    status: 'active',
    founded: '2018-06-10',
    country: 'South Korea',
    primaryGenres: ['K-Pop', 'Pop', 'Electronic'],
    totalArtists: 5,
    totalReleases: 22,
    totalStreams: 45000000,
    totalRevenue: 850000,
    contactEmail: 'info@kentertainment.kr',
    address: 'Seoul, South Korea'
  },
  {
    id: 'indie_collective',
    name: 'Indie Collective',
    type: 'independent',
    status: 'pending_approval',
    founded: '2023-11-01',
    country: 'Canada',
    primaryGenres: ['Indie', 'Alternative', 'Folk'],
    totalArtists: 2,
    totalReleases: 3,
    totalStreams: 125000,
    totalRevenue: 8500,
    contactEmail: 'hello@indiecollective.ca',
    address: 'Toronto, ON, Canada'
  }
];

// 👥 COMPREHENSIVE USER DATABASE
export const USERS = [
  // SUPER ADMIN
  {
    id: 'super_admin_001',
    email: 'superadmin@mscandco.com',
    name: 'Sarah Williams',
    role: 'super_admin',
    brand: 'MSC & Co',
    status: 'active', // Admin roles always active
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T08:30:00Z',
    joinDate: '2020-01-01',
    phone: '+44 20 7946 0001',
    address: 'London, UK',
    permissions: ['all'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: true
  },
  
  // COMPANY ADMIN
  {
    id: 'company_admin_001',
    email: 'companyadmin@mscandco.com',
    name: 'Michael Chen',
    role: 'company_admin',
    brand: 'MSC & Co',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T07:45:00Z',
    joinDate: '2020-03-15',
    phone: '+44 20 7946 0002',
    address: 'London, UK',
    permissions: ['user_management', 'content_oversight', 'analytics'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: true
  },

  // DISTRIBUTION PARTNER
  {
    id: 'distribution_partner_001',
    email: 'distribution@mscandco.com',
    name: 'Jennifer Rodriguez',
    role: 'distribution_partner',
    brand: 'MSC & Co Distribution',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T09:15:00Z',
    joinDate: '2020-02-01',
    phone: '+44 20 7946 0003',
    address: 'London, UK',
    permissions: ['release_management', 'distribution', 'platform_sync'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: true
  },

  // LABEL ADMINS
  {
    id: 'label_admin_yhwh',
    email: 'admin@yhwhmsc.com',
    name: 'David Thompson',
    role: 'label_admin',
    brand: 'YHWH MSC',
    labelId: 'yhwh_msc',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T06:20:00Z',
    joinDate: '2020-03-15',
    phone: '+44 20 7946 0010',
    address: 'London, UK',
    permissions: ['label_management', 'artist_oversight', 'releases'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'label_admin_major',
    email: 'contact@majorlabel.com',
    name: 'Ashley Johnson',
    role: 'label_admin',
    brand: 'Major Label Music',
    labelId: 'major_label_music',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-02T22:30:00Z',
    joinDate: '2021-01-10',
    phone: '+1 310 555 0020',
    address: 'Los Angeles, CA, USA',
    permissions: ['label_management', 'artist_oversight', 'releases'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: true
  },
  {
    id: 'label_admin_k_ent',
    email: 'info@kentertainment.kr',
    name: 'Kim Min-jun',
    role: 'label_admin',
    brand: 'K-Entertainment',
    labelId: 'k_entertainment',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T01:45:00Z',
    joinDate: '2021-06-15',
    phone: '+82 2 555 0030',
    address: 'Seoul, South Korea',
    permissions: ['label_management', 'artist_oversight', 'releases'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'label_admin_indie',
    email: 'hello@indiecollective.ca',
    name: 'Emma Wilson',
    role: 'label_admin',
    brand: 'Indie Collective',
    labelId: 'indie_collective',
    status: 'active', // Simplified to active/inactive only
    approvalStatus: 'approved',
    lastLogin: '2025-01-02T18:20:00Z',
    joinDate: '2023-11-01',
    phone: '+1 416 555 0040',
    address: 'Toronto, ON, Canada',
    permissions: ['releases'],
    avatar: null,
    isVerified: false,
    twoFactorEnabled: false
  },

  // ARTISTS - ACTIVE & APPROVED
  {
    id: 'artist_yhwh_msc',
    email: 'yhwh@yhwhmsc.com',
    name: 'YHWH MSC',
    displayName: 'YHWH MSC',
    role: 'artist',
    brand: 'YHWH MSC',
    labelId: 'yhwh_msc',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T10:30:00Z',
    joinDate: '2020-04-01',
    phone: '+44 7555 123001',
    address: 'London, UK',
    primaryGenre: 'Hip Hop',
    genres: ['Hip Hop', 'Classical', 'Electronic'],
    bio: 'Multi-genre artist blending hip hop with classical and electronic elements.',
    totalReleases: 8,
    totalStreams: 8750000,
    totalRevenue: 245000,
    topTrack: 'Urban Beat',
    socialMedia: {
      instagram: '@yhwhmsc',
      twitter: '@yhwhmsc',
      spotify: 'yhwhmsc',
      youtube: 'YHWHMSCOfficial'
    },
    permissions: ['releases', 'earnings', 'analytics', 'roster'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  },
  {
    id: 'artist_global_superstar',
    email: 'global.superstar@majorlabel.com',
    name: 'Global Superstar',
    displayName: 'Global Superstar',
    role: 'artist',
    brand: 'Major Label Music',
    labelId: 'major_label_music',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-02T20:15:00Z',
    joinDate: '2021-02-15',
    phone: '+1 310 555 1001',
    address: 'Los Angeles, CA, USA',
    primaryGenre: 'Pop',
    genres: ['Pop', 'Dance'],
    bio: 'Chart-topping pop sensation with global appeal.',
    totalReleases: 3,
    totalStreams: 125000000,
    totalRevenue: 2500000,
    topTrack: 'Worldwide Hit',
    socialMedia: {
      instagram: '@globalstar',
      twitter: '@globalstar',
      spotify: 'globalstar',
      youtube: 'GlobalStarVEVO'
    },
    permissions: ['releases', 'earnings', 'analytics', 'roster'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: true
  },
  {
    id: 'artist_seoul_stars',
    email: 'contact@seoulstars.kr',
    name: 'Seoul Stars',
    displayName: 'Seoul Stars',
    role: 'artist',
    brand: 'K-Entertainment',
    labelId: 'k_entertainment',
    status: 'active',
    approvalStatus: 'approved',
    lastLogin: '2025-01-03T02:30:00Z',
    joinDate: '2021-07-01',
    phone: '+82 10 1234 5678',
    address: 'Seoul, South Korea',
    primaryGenre: 'K-Pop',
    genres: ['K-Pop', 'Pop', 'Electronic'],
    bio: 'Rising K-Pop group with international recognition.',
    totalReleases: 5,
    totalStreams: 45000000,
    totalRevenue: 850000,
    topTrack: 'Starlight Dreams',
    socialMedia: {
      instagram: '@seoulstars_official',
      twitter: '@seoulstars',
      spotify: 'seoulstars',
      youtube: 'SeoulStarsOfficial'
    },
    permissions: ['releases', 'earnings', 'analytics', 'roster'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  },

  // ARTISTS - PENDING APPROVAL
  {
    id: 'artist_indie_folk',
    email: 'maya.forest@email.com',
    name: 'Maya Forest',
    displayName: 'Maya Forest',
    role: 'artist',
    brand: 'Indie Collective',
    labelId: 'indie_collective',
    status: 'active', // Simplified to active/inactive only
    approvalStatus: 'approved',
    lastLogin: '2025-01-02T19:45:00Z',
    joinDate: '2023-11-15',
    phone: '+1 416 555 2001',
    address: 'Toronto, ON, Canada',
    primaryGenre: 'Folk',
    genres: ['Folk', 'Indie', 'Acoustic'],
    bio: 'Indie folk artist with deep, meaningful lyrics.',
    totalReleases: 0,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: null,
    socialMedia: {
      instagram: '@mayaforest',
      twitter: '@mayaforest',
      spotify: 'mayaforest',
      youtube: 'MayaForestMusic'
    },
    permissions: ['releases'],
    avatar: null,
    isVerified: false,
    twoFactorEnabled: false
  },
  {
    id: 'artist_electronic_dream',
    email: 'alex.synth@email.com',
    name: 'Alex Synth',
    displayName: 'Electronic Dream',
    role: 'artist',
    brand: 'K-Entertainment',
    labelId: 'k_entertainment',
    status: 'active', // Simplified to active/inactive only
    approvalStatus: 'approved',
    lastLogin: '2025-01-01T15:20:00Z',
    joinDate: '2024-12-01',
    phone: '+82 10 9876 5432',
    address: 'Busan, South Korea',
    primaryGenre: 'Electronic',
    genres: ['Electronic', 'Ambient', 'Synthwave'],
    bio: 'Electronic music producer creating atmospheric soundscapes.',
    totalReleases: 0,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: null,
    socialMedia: {
      instagram: '@electronicdream',
      twitter: '@alexsynth',
      spotify: 'electronicdream',
      youtube: 'ElectronicDreamMusic'
    },
    permissions: ['releases'],
    avatar: null,
    isVerified: false,
    twoFactorEnabled: false
  },

  // ARTISTS - REJECTED
  {
    id: 'artist_rejected_demo',
    email: 'demo.artist@email.com',
    name: 'Demo Artist',
    displayName: 'Demo Artist',
    role: 'artist',
    brand: 'Major Label Music',
    labelId: 'major_label_music',
    status: 'inactive', // Low earnings artist - inactive
    approvalStatus: 'approved',
    lastLogin: '2024-12-20T14:30:00Z',
    joinDate: '2024-12-15',
    phone: '+1 555 999 0000',
    address: 'Nashville, TN, USA',
    primaryGenre: 'Country',
    genres: ['Country'],
    bio: 'Country artist seeking label representation.',
    totalReleases: 0,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: null,
    rejectionReason: 'Does not align with current label direction',
    rejectedDate: '2024-12-22T10:00:00Z',
    socialMedia: {
      instagram: '@demoartist',
      twitter: '@demoartist',
      spotify: 'demoartist',
      youtube: 'DemoArtistOfficial'
    },
    permissions: [],
    avatar: null,
    isVerified: false,
    twoFactorEnabled: false
  },
  
  // TEST CASE: ARTIST WITH RELEASES BUT HASN'T LOGGED IN FOR 6+ MONTHS
  {
    id: 'artist_dormant_star',
    email: 'dormant.star@email.com',
    name: 'Dormant Star',
    displayName: 'Dormant Star',
    role: 'artist',
    brand: 'Major Label Music',
    labelId: 'major_label_music',
    status: 'inactive', // Should be inactive due to old login despite having releases
    approvalStatus: 'approved',
    lastLogin: '2024-05-01T12:00:00Z', // Over 8 months ago = inactive
    joinDate: '2019-01-01',
    phone: '+1 323 555 8888',
    address: 'Hollywood, CA, USA',
    primaryGenre: 'R&B',
    genres: ['R&B', 'Soul'],
    bio: 'R&B artist who stopped logging in despite successful releases.',
    totalReleases: 5, // Has releases
    totalStreams: 2500000,
    totalRevenue: 85000, // Has earnings
    topTrack: 'Soulful Melody',
    socialMedia: {
      instagram: '@dormantstar',
      twitter: '@dormantstar',
      spotify: 'dormantstar',
      youtube: 'DormantStarMusic'
    },
    permissions: ['releases', 'earnings', 'analytics'],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  },

  // TEST CASE: NEW ARTIST WHO JOINED 4 MONTHS AGO WITH NO ACTIVITY
  {
    id: 'artist_new_inactive',
    email: 'new.inactive@email.com',
    name: 'New Inactive',
    displayName: 'New Inactive',
    role: 'artist',
    brand: 'Indie Collective',
    labelId: 'indie_collective',
    status: 'inactive', // Should be inactive: new account (4 months) with no releases/earnings
    approvalStatus: 'approved',
    lastLogin: '2024-09-01T12:00:00Z', // 4 months ago with no activity = inactive
    joinDate: '2024-09-01', // Joined 4 months ago
    phone: '+1 555 111 2222',
    address: 'Austin, TX, USA',
    primaryGenre: 'Folk',
    genres: ['Folk', 'Indie'],
    bio: 'New artist who signed up but never released anything.',
    totalReleases: 0, // No releases
    totalStreams: 0,
    totalRevenue: 0, // No earnings
    topTrack: null,
    socialMedia: {
      instagram: '@newinactive',
      twitter: '@newinactive',
      spotify: 'newinactive',
      youtube: 'NewInactiveMusic'
    },
    permissions: [],
    avatar: null,
    isVerified: false,
    twoFactorEnabled: false
  },

  // ARTISTS - INACTIVE
  {
    id: 'artist_inactive',
    email: 'former.star@email.com',
    name: 'Former Star',
    displayName: 'Former Star',
    role: 'artist',
    brand: 'Major Label Music',
    labelId: 'major_label_music',
    status: 'inactive', // No releases and minimal earnings
    approvalStatus: 'approved',
    lastLogin: '2024-06-15T12:00:00Z',
    joinDate: '2019-05-01',
    phone: '+1 310 555 7777',
    address: 'Los Angeles, CA, USA',
    primaryGenre: 'Rock',
    genres: ['Rock', 'Alternative'],
    bio: 'New artist with no releases yet.',
    totalReleases: 0, // No releases = inactive
    totalStreams: 0,
    totalRevenue: 0, // No earnings = inactive
    topTrack: 'Old Hit Song',
    socialMedia: {
      instagram: '@formerstar',
      twitter: '@formerstar',
      spotify: 'formerstar',
      youtube: 'FormerStarRock'
    },
    permissions: [],
    avatar: null,
    isVerified: true,
    twoFactorEnabled: false
  }
];

// 🎵 COMPREHENSIVE RELEASES DATABASE
export const RELEASES = [
  // LIVE RELEASES
  {
    id: 'release_001',
    projectName: 'Urban Beat',
    artist: 'YHWH MSC',
    artistId: 'artist_yhwh_msc',
    labelId: 'yhwh_msc',
    status: RELEASE_STATUSES.LIVE,
    releaseDate: '2024-01-15',
    submittedDate: '2023-12-01',
    approvedDate: '2023-12-15',
    publishedDate: '2024-01-15',
    genre: 'Hip Hop',
    subGenres: ['Conscious Hip Hop', 'UK Hip Hop'],
    releaseType: 'Single',
    totalTracks: 1,
    duration: '03:45',
    isrc: 'GBUM72400001',
    upc: '123456789012',
    label: 'YHWH MSC',
    distributor: 'MSC & Co',
    territories: ['Worldwide'],
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer'],
    streams: 3250000,
    downloads: 25000,
    revenue: 89750,
    royaltyRate: 0.85,
    trackListing: [
      {
        title: 'Urban Beat',
        duration: '03:45',
        isrc: 'GBUM72400001',
        writers: ['YHWH MSC', 'Producer Name'],
        producers: ['Producer Name'],
        featured: [],
        explicit: false
      }
    ],
    artwork: {
      url: '/artwork/urban-beat.jpg',
      format: 'JPEG',
      dimensions: '3000x3000',
      fileSize: '2.4MB'
    },
    metadata: {
      copyright: '℗ 2024 YHWH MSC',
      publishingRights: '© 2024 YHWH MSC Publishing',
      lyrics: 'Available',
      language: 'English',
      mood: 'Energetic',
      tempo: 'Fast'
    },
    performance: {
      peakPosition: 15,
      weeksOnChart: 12,
      totalPlaylists: 1250,
      savesRate: 0.65,
      skipRate: 0.12,
      completionRate: 0.78
    },
    marketing: {
      hasVideoContent: true,
      promotionalCampaign: 'Urban Culture Focus',
      socialMediaReach: 450000,
      pressFeatures: 8
    }
  },
  {
    id: 'release_002',
    projectName: 'Worldwide Hit',
    artist: 'Global Superstar',
    artistId: 'artist_global_superstar',
    labelId: 'major_label_music',
    status: RELEASE_STATUSES.LIVE,
    releaseDate: '2024-03-01',
    submittedDate: '2024-01-15',
    approvedDate: '2024-02-01',
    publishedDate: '2024-03-01',
    genre: 'Pop',
    subGenres: ['Dance Pop', 'Commercial Pop'],
    releaseType: 'Single',
    totalTracks: 1,
    duration: '03:28',
    isrc: 'USUM72400002',
    upc: '123456789013',
    label: 'Major Label Music',
    distributor: 'MSC & Co',
    territories: ['Worldwide'],
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal'],
    streams: 85000000,
    downloads: 750000,
    revenue: 1850000,
    royaltyRate: 0.75,
    trackListing: [
      {
        title: 'Worldwide Hit',
        duration: '03:28',
        isrc: 'USUM72400002',
        writers: ['Global Superstar', 'Hit Writer', 'Super Producer'],
        producers: ['Super Producer', 'Co-Producer'],
        featured: [],
        explicit: false
      }
    ],
    artwork: {
      url: '/artwork/worldwide-hit.jpg',
      format: 'JPEG',
      dimensions: '3000x3000',
      fileSize: '3.1MB'
    },
    metadata: {
      copyright: '℗ 2024 Major Label Music',
      publishingRights: '© 2024 Global Publishing Co.',
      lyrics: 'Available',
      language: 'English',
      mood: 'Uplifting',
      tempo: 'Medium'
    },
    performance: {
      peakPosition: 1,
      weeksOnChart: 24,
      totalPlaylists: 8500,
      savesRate: 0.78,
      skipRate: 0.08,
      completionRate: 0.85
    },
    marketing: {
      hasVideoContent: true,
      promotionalCampaign: 'Global Launch',
      socialMediaReach: 12000000,
      pressFeatures: 45
    }
  },

  // RELEASES IN APPROVAL STAGE
  {
    id: 'release_003',
    projectName: 'Starlight Dreams EP',
    artist: 'Seoul Stars',
    artistId: 'artist_seoul_stars',
    labelId: 'k_entertainment',
    status: RELEASE_STATUSES.APPROVAL_REQUIRED,
    releaseDate: '2025-02-14',
    submittedDate: '2024-12-15',
    reviewStartDate: '2024-12-20',
    genre: 'K-Pop',
    subGenres: ['K-Pop', 'Electronic Pop'],
    releaseType: 'EP',
    totalTracks: 5,
    duration: '18:42',
    isrc: null,
    upc: null,
    label: 'K-Entertainment',
    distributor: 'MSC & Co',
    territories: ['Worldwide'],
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Melon', 'Genie'],
    streams: 0,
    downloads: 0,
    revenue: 0,
    royaltyRate: 0.80,
    trackListing: [
      {
        title: 'Starlight Dreams',
        duration: '03:45',
        writers: ['Seoul Stars', 'K-Writer'],
        producers: ['K-Producer'],
        featured: [],
        explicit: false
      },
      {
        title: 'Neon Nights',
        duration: '03:28',
        writers: ['Seoul Stars', 'K-Writer', 'Co-Writer'],
        producers: ['K-Producer'],
        featured: [],
        explicit: false
      },
      {
        title: 'Dancing Universe',
        duration: '04:12',
        writers: ['Seoul Stars'],
        producers: ['K-Producer', 'Electronic Master'],
        featured: [],
        explicit: false
      },
      {
        title: 'Heart Signal',
        duration: '03:33',
        writers: ['Seoul Stars', 'Ballad Writer'],
        producers: ['Ballad Producer'],
        featured: [],
        explicit: false
      },
      {
        title: 'Tomorrow\'s Light',
        duration: '03:44',
        writers: ['Seoul Stars', 'K-Writer'],
        producers: ['K-Producer'],
        featured: [],
        explicit: false
      }
    ],
    artwork: {
      url: '/artwork/starlight-dreams.jpg',
      format: 'JPEG',
      dimensions: '3000x3000',
      fileSize: '2.8MB'
    },
    metadata: {
      copyright: '℗ 2025 K-Entertainment',
      publishingRights: '© 2025 K-Entertainment Publishing',
      lyrics: 'Available',
      language: 'Korean/English',
      mood: 'Upbeat',
      tempo: 'Various'
    },
    approvalNotes: [
      {
        timestamp: '2024-12-20T10:00:00Z',
        reviewer: 'Jennifer Rodriguez',
        note: 'Artwork review completed - approved',
        status: 'approved'
      },
      {
        timestamp: '2024-12-22T14:30:00Z',
        reviewer: 'Jennifer Rodriguez',
        note: 'Metadata review completed - minor corrections needed for track 3',
        status: 'pending'
      }
    ]
  },

  // RELEASES UNDER REVIEW
  {
    id: 'release_004',
    projectName: 'Classical Fusion Symphony',
    artist: 'YHWH MSC',
    artistId: 'artist_yhwh_msc',
    labelId: 'yhwh_msc',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    releaseDate: '2025-03-01',
    submittedDate: '2025-01-02',
    reviewStartDate: '2025-01-03',
    genre: 'Classical',
    subGenres: ['Orchestral Hip Hop', 'Modern Classical'],
    releaseType: 'Album',
    totalTracks: 12,
    duration: '68:45',
    isrc: null,
    upc: null,
    label: 'YHWH MSC',
    distributor: 'MSC & Co',
    territories: ['UK', 'EU', 'US', 'Canada'],
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal'],
    streams: 0,
    downloads: 0,
    revenue: 0,
    royaltyRate: 0.85,
    trackListing: [
      {
        title: 'Symphony Opening',
        duration: '05:24',
        writers: ['YHWH MSC', 'Orchestra Composer'],
        producers: ['Classical Producer'],
        featured: ['London Symphony Orchestra'],
        explicit: false
      },
      {
        title: 'Urban Classical Movement I',
        duration: '06:12',
        writers: ['YHWH MSC', 'Orchestra Composer'],
        producers: ['Classical Producer', 'Hip Hop Producer'],
        featured: [],
        explicit: false
      }
      // Additional tracks would be here...
    ],
    artwork: {
      url: '/artwork/classical-fusion.jpg',
      format: 'JPEG',
      dimensions: '3000x3000',
      fileSize: '4.2MB'
    },
    metadata: {
      copyright: '℗ 2025 YHWH MSC',
      publishingRights: '© 2025 YHWH MSC Publishing',
      lyrics: 'Partial',
      language: 'Instrumental/English',
      mood: 'Epic',
      tempo: 'Various'
    },
    reviewNotes: [
      {
        timestamp: '2025-01-03T09:00:00Z',
        reviewer: 'Jennifer Rodriguez',
        note: 'Initial review started - comprehensive album requiring detailed analysis',
        status: 'in_progress'
      }
    ]
  },

  // SUBMITTED RELEASES
  {
    id: 'release_005',
    projectName: 'Electronic Atmosphere',
    artist: 'Electronic Dream',
    artistId: 'artist_electronic_dream',
    labelId: 'k_entertainment',
    status: RELEASE_STATUSES.SUBMITTED,
    releaseDate: '2025-04-15',
    submittedDate: '2025-01-03',
    genre: 'Electronic',
    subGenres: ['Ambient', 'Synthwave', 'Chillwave'],
    releaseType: 'Single',
    totalTracks: 1,
    duration: '05:33',
    isrc: null,
    upc: null,
    label: 'K-Entertainment',
    distributor: 'MSC & Co',
    territories: ['Worldwide'],
    platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Bandcamp'],
    streams: 0,
    downloads: 0,
    revenue: 0,
    royaltyRate: 0.80,
    trackListing: [
      {
        title: 'Electronic Atmosphere',
        duration: '05:33',
        writers: ['Alex Synth'],
        producers: ['Alex Synth'],
        featured: [],
        explicit: false
      }
    ],
    artwork: {
      url: '/artwork/electronic-atmosphere.jpg',
      format: 'JPEG',
      dimensions: '3000x3000',
      fileSize: '1.9MB'
    },
    metadata: {
      copyright: '℗ 2025 K-Entertainment',
      publishingRights: '© 2025 Alex Synth',
      lyrics: 'N/A',
      language: 'Instrumental',
      mood: 'Chill',
      tempo: 'Slow'
    }
  },

  // DRAFT RELEASES
  {
    id: 'release_006',
    projectName: 'Folk Stories',
    artist: 'Maya Forest',
    artistId: 'artist_indie_folk',
    labelId: 'indie_collective',
    status: RELEASE_STATUSES.DRAFT,
    releaseDate: null,
    submittedDate: null,
    genre: 'Folk',
    subGenres: ['Indie Folk', 'Acoustic'],
    releaseType: 'Single',
    totalTracks: 1,
    duration: '04:22',
    isrc: null,
    upc: null,
    label: 'Indie Collective',
    distributor: 'MSC & Co',
    territories: ['North America'],
    platforms: ['Spotify', 'Apple Music', 'Bandcamp'],
    streams: 0,
    downloads: 0,
    revenue: 0,
    royaltyRate: 0.90,
    trackListing: [
      {
        title: 'Folk Stories',
        duration: '04:22',
        writers: ['Maya Forest'],
        producers: ['Indie Producer'],
        featured: [],
        explicit: false
      }
    ],
    artwork: {
      url: null,
      format: null,
      dimensions: null,
      fileSize: null
    },
    metadata: {
      copyright: null,
      publishingRights: null,
      lyrics: 'Available',
      language: 'English',
      mood: 'Contemplative',
      tempo: 'Slow'
    }
  }
];

// 🎼 COMPREHENSIVE SONGS/TRACKS DATABASE
export const SONGS = RELEASES.flatMap(release => 
  release.trackListing?.map((track, index) => ({
    id: `${release.id}_track_${index + 1}`,
    releaseId: release.id,
    artist: release.artist,
    artistId: release.artistId,
    labelId: release.labelId,
    title: track.title,
    duration: track.duration,
    isrc: track.isrc || null,
    writers: track.writers || [],
    producers: track.producers || [],
    featured: track.featured || [],
    explicit: track.explicit || false,
    trackNumber: index + 1,
    genre: release.genre,
    subGenres: release.subGenres || [],
    status: release.status,
    releaseDate: release.releaseDate,
    streams: release.status === RELEASE_STATUSES.LIVE ? Math.floor(release.streams * (0.8 + Math.random() * 0.4)) : 0,
    downloads: release.status === RELEASE_STATUSES.LIVE ? Math.floor(release.downloads * (0.7 + Math.random() * 0.6)) : 0,
    revenue: release.status === RELEASE_STATUSES.LIVE ? Math.floor(release.revenue * (0.6 + Math.random() * 0.8)) : 0,
    platforms: release.platforms || [],
    royaltyRate: release.royaltyRate || 0.70,
    performance: release.performance ? {
      savesRate: release.performance.savesRate * (0.8 + Math.random() * 0.4),
      skipRate: release.performance.skipRate * (0.5 + Math.random() * 1.5),
      completionRate: release.performance.completionRate * (0.8 + Math.random() * 0.4)
    } : null
  })) || []
);

// 🎯 STREAMING PLATFORMS
export const STREAMING_PLATFORMS = [
  {
    id: 'spotify',
    name: 'Spotify',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 145000000,
    totalRevenue: 1850000,
    royaltyRate: 0.004,
    averagePayoutPer1000: 4.00,
    marketShare: 0.32,
    territories: ['Worldwide'],
    features: ['playlists', 'radio', 'podcasts'],
    reportingDelay: '2-3 days'
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 85000000,
    totalRevenue: 1200000,
    royaltyRate: 0.006,
    averagePayoutPer1000: 6.00,
    marketShare: 0.18,
    territories: ['Worldwide'],
    features: ['lossless', 'spatial_audio'],
    reportingDelay: '1-2 days'
  },
  {
    id: 'youtube_music',
    name: 'YouTube Music',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 65000000,
    totalRevenue: 520000,
    royaltyRate: 0.003,
    averagePayoutPer1000: 3.00,
    marketShare: 0.15,
    territories: ['Worldwide'],
    features: ['music_videos', 'user_uploads'],
    reportingDelay: '3-5 days'
  },
  {
    id: 'amazon_music',
    name: 'Amazon Music',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 35000000,
    totalRevenue: 420000,
    royaltyRate: 0.005,
    averagePayoutPer1000: 5.00,
    marketShare: 0.12,
    territories: ['US', 'UK', 'EU', 'CA', 'AU'],
    features: ['alexa_integration', 'hd_audio'],
    reportingDelay: '2-4 days'
  },
  {
    id: 'deezer',
    name: 'Deezer',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 15000000,
    totalRevenue: 180000,
    royaltyRate: 0.004,
    averagePayoutPer1000: 4.50,
    marketShare: 0.04,
    territories: ['EU', 'LATAM', 'MENA'],
    features: ['hifi', 'flow'],
    reportingDelay: '2-3 days'
  },
  {
    id: 'tidal',
    name: 'Tidal',
    type: 'streaming',
    status: 'active',
    region: 'global',
    totalStreams: 8000000,
    totalRevenue: 120000,
    royaltyRate: 0.008,
    averagePayoutPer1000: 8.00,
    marketShare: 0.02,
    territories: ['US', 'UK', 'EU', 'APAC'],
    features: ['master_quality', 'exclusive_content'],
    reportingDelay: '1-2 days'
  }
];

// 🎬 CONTENT & MEDIA
export const MEDIA_CONTENT = {
  videos: [
    {
      id: 'video_001',
      title: 'Urban Beat - Official Music Video',
      artist: 'YHWH MSC',
      artistId: 'artist_yhwh_msc',
      releaseId: 'release_001',
      type: 'music_video',
      duration: '03:45',
      url: '/videos/urban-beat-mv.mp4',
      thumbnailUrl: '/thumbnails/urban-beat.jpg',
      uploadDate: '2024-01-15',
      views: 2850000,
      likes: 125000,
      comments: 8500,
      shares: 15000,
      platforms: ['YouTube', 'Vimeo', 'TikTok'],
      status: 'live',
      monetization: true,
      contentId: 'UB_MV_001'
    },
    {
      id: 'video_002',
      title: 'Worldwide Hit - Dance Performance',
      artist: 'Global Superstar',
      artistId: 'artist_global_superstar',
      releaseId: 'release_002',
      type: 'performance',
      duration: '04:12',
      url: '/videos/worldwide-hit-performance.mp4',
      thumbnailUrl: '/thumbnails/worldwide-hit-performance.jpg',
      uploadDate: '2024-03-15',
      views: 15000000,
      likes: 850000,
      comments: 45000,
      shares: 125000,
      platforms: ['YouTube', 'Instagram', 'TikTok'],
      status: 'live',
      monetization: true,
      contentId: 'WH_PERF_001'
    }
  ],
  playlists: [
    {
      id: 'playlist_001',
      name: 'MSC Rising Stars',
      description: 'Featuring the best new talent from MSC & Co',
      curator: 'MSC & Co Editorial',
      trackCount: 25,
      followers: 45000,
      totalStreams: 1250000,
      lastUpdated: '2025-01-02',
      tracks: ['release_001_track_1', 'release_002_track_1'],
      platform: 'spotify',
      isOfficial: true
    }
  ]
};

// 📊 ANALYTICS & PERFORMANCE DATA
export const ANALYTICS_DATA = {
  platformPerformance: {
    spotify: {
      totalStreams: 145000000,
      totalRevenue: 1850000,
      growth30d: 12.5,
      growth7d: 3.2,
      topTracks: ['release_002_track_1', 'release_001_track_1'],
      topArtists: ['artist_global_superstar', 'artist_yhwh_msc']
    },
    appleMusic: {
      totalStreams: 85000000,
      totalRevenue: 1200000,
      growth30d: 8.7,
      growth7d: 2.1,
      topTracks: ['release_002_track_1', 'release_001_track_1'],
      topArtists: ['artist_global_superstar', 'artist_seoul_stars']
    }
  },
  territoryPerformance: {
    'US': { streams: 85000000, revenue: 1250000, growth: 15.2 },
    'UK': { streams: 45000000, revenue: 680000, growth: 8.7 },
    'KR': { streams: 35000000, revenue: 420000, growth: 25.1 },
    'CA': { streams: 15000000, revenue: 180000, growth: 12.3 },
    'DE': { streams: 12000000, revenue: 165000, growth: 6.8 }
  }
};

// 🔄 DATA ACCESS FUNCTIONS
export const getUsers = () => USERS;
export const getLabels = () => LABELS;
export const getReleases = () => RELEASES;
export const getSongs = () => SONGS;
export const getPlatforms = () => STREAMING_PLATFORMS;
export const getAnalytics = () => ANALYTICS_DATA;

export const getUserById = (id) => USERS.find(user => user.id === id);
export const getUsersByRole = (role) => USERS.filter(user => user.role === role);
export const getUsersByStatus = (status) => USERS.filter(user => user.status === status);
export const getUsersByLabel = (labelId) => USERS.filter(user => user.labelId === labelId);
export const getUserStatus = determineUserStatus; // Export status logic for consistency

export const getLabelById = (id) => LABELS.find(label => label.id === id);
export const getActiveLabels = () => LABELS.filter(label => label.status === 'active');

export const getReleasesByArtist = (artistId) => RELEASES.filter(release => release.artistId === artistId);
export const getReleasesByStatus = (status) => RELEASES.filter(release => release.status === status);
export const getReleasesByLabel = (labelId) => RELEASES.filter(release => release.labelId === labelId);

export const getSongsByArtist = (artistId) => SONGS.filter(song => song.artistId === artistId);
export const getSongsByRelease = (releaseId) => SONGS.filter(song => song.releaseId === releaseId);

export const getStats = () => ({
  totalUsers: USERS.length,
  totalArtists: USERS.filter(u => u.role === 'artist').length,
  activeArtists: USERS.filter(u => u.role === 'artist' && u.status === 'active').length,
  totalLabels: LABELS.length,
  activeLabels: LABELS.filter(l => l.status === 'active').length,
  totalReleases: RELEASES.length,
  liveReleases: RELEASES.filter(r => r.status === RELEASE_STATUSES.LIVE).length,
  totalSongs: SONGS.length,
  totalStreams: RELEASES.reduce((sum, r) => sum + (r.streams || 0), 0),
  totalRevenue: RELEASES.reduce((sum, r) => sum + (r.revenue || 0), 0)
});

// 🛡️ PERMISSION & FILTERING FUNCTIONS
export const getFilteredDataForRole = (userRole, userId = null) => {
  const user = userId ? getUserById(userId) : null;
  
  switch (userRole) {
    case 'super_admin':
      return {
        users: getUsers(),
        labels: getLabels(),
        releases: getReleases(),
        songs: getSongs(),
        analytics: getAnalytics()
      };
    
    case 'company_admin':
      return {
        users: getUsersByRole('artist').concat(getUsersByRole('label_admin')),
        labels: getActiveLabels(),
        releases: getReleases(),
        songs: getSongs(),
        analytics: getAnalytics()
      };
    
    case 'distribution_partner':
      return {
        releases: getReleases(),
        songs: getSongs(),
        analytics: getAnalytics(),
        users: getUsersByRole('artist')
      };
    
    case 'label_admin':
      const labelId = user?.labelId;
      if (!labelId) return { users: [], releases: [], songs: [], labels: [] };
      
      return {
        users: getUsersByLabel(labelId).filter(u => u.role === 'artist'),
        releases: getReleasesByLabel(labelId),
        songs: SONGS.filter(s => s.labelId === labelId),
        labels: [getLabelById(labelId)].filter(Boolean)
      };
    
    case 'artist':
      const artistId = user?.id;
      if (!artistId) return { releases: [], songs: [], analytics: null };
      
      return {
        releases: getReleasesByArtist(artistId),
        songs: getSongsByArtist(artistId),
        analytics: {
          streams: SONGS.filter(s => s.artistId === artistId).reduce((sum, s) => sum + s.streams, 0),
          revenue: SONGS.filter(s => s.artistId === artistId).reduce((sum, s) => sum + s.revenue, 0)
        }
      };
    
    default:
      return { users: [], releases: [], songs: [], labels: [] };
  }
};

export default {
  DB_CONFIG,
  USERS,
  LABELS,
  RELEASES,
  SONGS,
  STREAMING_PLATFORMS,
  MEDIA_CONTENT,
  ANALYTICS_DATA,
  getFilteredDataForRole,
  getStats
};