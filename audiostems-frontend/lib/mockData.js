// 🎯 MSC & CO PLATFORM - SINGLE SOURCE OF TRUTH
// Centralized Mock Data System - All dashboards use this data
// NEVER duplicate this data in individual components

import { RELEASE_STATUSES, GENRES, RELEASE_TYPES } from './constants';

// 📊 PLATFORM-WIDE STATISTICS (Auto-calculated from base data)
const calculatePlatformStats = () => {
  const totalArtists = ARTISTS.length;
  const activeArtists = ARTISTS.filter(a => a.status === 'active').length;
  const totalReleases = RELEASES.length;
  const totalStreams = RELEASES.reduce((sum, r) => sum + (r.streams || 0), 0);
  const totalEarnings = RELEASES.reduce((sum, r) => sum + (r.earnings || 0), 0);
  
  return {
    // Auto-calculated global stats
    platform: {
      totalUsers: 1247,
      totalArtists,
      activeArtists,
      totalReleases,
      totalStreams,
      totalEarnings,
      totalBrands: 2,
      systemFeatures: 15
    }
  };
};

// 🎬 VIDEO CONTENT (Shared across all dashboards)
export const MOCK_VIDEOS = {
  featured: {
    id: 'video-001',
    title: 'Urban Beat - Official Music Video',
    url: '/videos/urban-beat.mp4',
    views: '125K',
    likes: '8.5K',
    releaseDate: '2024-09-15',
    performance: 'trending',
    streams: '125,000',
    revenue: '£8,750'
  },
  latest: {
    id: 'video-002', 
    title: 'Urban Beat (Club Remix) - Behind the Studio',
    url: '/videos/urban-beat-remix.mp4',
    views: '45K',
    likes: '3.2K',
    releaseDate: '2025-01-15',
    performance: 'new',
    streams: '12,500',
    revenue: '£2,800'
  },
  upcoming: {
    id: 'video-003',
    title: 'Movie Epic Soundtrack - Teaser Trailer',
    url: '/videos/movie-soundtrack-teaser.mp4',
    views: '8.9K',
    likes: '567',
    releaseDate: '2025-04-05',
    performance: 'upcoming',
    expectedStreams: 'TBD',
    status: 'Under Review'
  }
};

// MAIN ARTISTS DATABASE
export const ARTISTS = [
  {
    id: 'yhwh_msc',
    name: 'YHWH MSC',
    email: 'yhwh@mscandco.com',
    role: 'artist',
    brand: 'YHWH MSC',
    status: 'active',
    lastLogin: '2024-01-16T09:20:00Z',
    primaryGenre: 'Hip Hop',
    genres: ['Hip Hop', 'Classical', 'Electronic'],
    releases: 8,
    totalStreams: 125000,
    totalRevenue: 8750,
    topTrack: 'Urban Beat',
    label: 'MSC & Co',
    permissions: ['releases', 'earnings', 'analytics']
  },
  {
    id: 'global_superstar',
    name: 'Global Superstar',
    email: 'global.superstar@majorlabel.com',
    role: 'artist',
    brand: 'Major Label Music',
    status: 'active',
    lastLogin: '2024-01-15T14:30:00Z',
    primaryGenre: 'Pop',
    genres: ['Pop'],
    releases: 1,
    totalStreams: 2800000,
    totalRevenue: 25400,
    topTrack: 'Hit Single #1',
    label: 'Major Label Music',
    permissions: ['releases', 'earnings', 'analytics']
  },
  {
    id: 'seoul_stars',
    name: 'Seoul Stars',
    email: 'contact@seoulstars.kr',
    role: 'artist',
    brand: 'K-Entertainment',
    status: 'active',
    lastLogin: '2024-01-16T08:45:00Z',
    primaryGenre: 'Pop',
    genres: ['Pop'],
    releases: 1,
    totalStreams: 4500000,
    totalRevenue: 31200,
    topTrack: 'Starlight',
    label: 'K-Entertainment',
    permissions: ['releases', 'earnings', 'analytics']
  },
  {
    id: 'rock_legends',
    name: 'Rock Legends',
    email: 'management@rocklegends.com',
    role: 'artist',
    brand: 'Live Music Records',
    status: 'active',
    lastLogin: '2024-01-14T16:20:00Z',
    primaryGenre: 'Rock',
    genres: ['Rock'],
    releases: 1,
    totalStreams: 1200000,
    totalRevenue: 18750,
    topTrack: 'Opening Anthem (Live)',
    label: 'Live Music Records',
    permissions: ['releases', 'earnings', 'analytics']
  },
  {
    id: 'dj_phoenix',
    name: 'DJ Phoenix',
    email: 'dj.phoenix@digitalbeats.com',
    role: 'artist',
    brand: 'Digital Beats',
    status: 'pending',
    lastLogin: '2024-01-12T12:00:00Z',
    primaryGenre: 'Electronic',
    genres: ['Electronic'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'Digital Sunrise',
    label: 'Digital Beats',
    permissions: ['releases']
  },
  {
    id: 'carlos_mendez',
    name: 'Carlos Mendez',
    email: 'carlos@latinbeats.com',
    role: 'artist',
    brand: 'Latin Beats Records',
    status: 'active',
    lastLogin: '2024-01-15T13:20:00Z',
    primaryGenre: 'Latin',
    genres: ['Latin'],
    releases: 1,
    totalStreams: 280000,
    totalRevenue: 5600,
    topTrack: 'Fuego',
    label: 'Latin Beats Records',
    permissions: ['releases', 'earnings', 'analytics']
  },
  {
    id: 'emma_rodriguez',
    name: 'Emma Rodriguez',
    email: 'emma@indiesounds.com',
    role: 'artist',
    brand: 'Indie Sounds',
    status: 'pending',
    lastLogin: '2024-01-10T10:15:00Z',
    primaryGenre: 'Pop',
    genres: ['Pop'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'New Dreams',
    label: 'Indie Sounds',
    permissions: ['releases']
  },
  {
    id: 'marcus_williams',
    name: 'Marcus Williams Quartet',
    email: 'marcus@jazzheritage.com',
    role: 'artist',
    brand: 'Jazz Heritage',
    status: 'inactive',
    lastLogin: '2024-01-05T14:30:00Z',
    primaryGenre: 'Jazz',
    genres: ['Jazz'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'City Nights',
    label: 'Jazz Heritage',
    permissions: ['releases']
  },
  {
    id: 'basement_band',
    name: 'The Basement Band',
    email: 'basement@undergroundrecords.com',
    role: 'artist',
    brand: 'Underground Records',
    status: 'pending',
    lastLogin: '2024-01-11T19:45:00Z',
    primaryGenre: 'Rock',
    genres: ['Rock'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'Basement Blues',
    label: 'Underground Records',
    permissions: ['releases']
  },
  {
    id: 'film_composer',
    name: 'Film Composer Orchestra',
    email: 'composer@cinematicmusic.com',
    role: 'artist',
    brand: 'Cinematic Music',
    status: 'pending',
    lastLogin: '2024-01-08T11:30:00Z',
    primaryGenre: 'Classical',
    genres: ['Classical'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'Main Theme',
    label: 'Cinematic Music',
    permissions: ['releases']
  },
  {
    id: 'nashville_dreams',
    name: 'Nashville Dreams',
    email: 'nashville@countrymusic.com',
    role: 'artist',
    brand: 'Country Music Nashville',
    status: 'inactive',
    lastLogin: '2024-01-10T14:15:00Z',
    primaryGenre: 'Country',
    genres: ['Country'],
    releases: 1,
    totalStreams: 0,
    totalRevenue: 0,
    topTrack: 'Back Home',
    label: 'Country Music Nashville',
    permissions: ['releases']
  }
];

// MAIN RELEASES DATABASE
export const RELEASES = [
  // YHWH MSC releases
  {
    id: 1,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-01-15',
    expectedReleaseDate: '2025-03-01',
    assets: 3,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-01-15',
    cover: '🎵',
    feedback: 'Great urban sound, needs minor adjustments',
    marketingPlan: 'Social media campaign, playlist pitching',
    musicFiles: ['urban_beat_01.wav', 'street_rhythm_02.wav', 'city_lights_03.wav'],
    artworkFile: 'urban_beats_cover.jpg',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686', bpm: '140', songKey: 'C Minor' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687', bpm: '135', songKey: 'F Minor' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688', bpm: '145', songKey: 'A Minor' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Additional Production', name: 'Beat Maker' }
    ],
    publishingNotes: 'Urban hip hop collection with strong beats'
  },
  {
    id: 16,
    projectName: 'Urban Beat (Remix Package)',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'Remix',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.COMPLETED,
    submissionDate: '2024-10-01',
    expectedReleaseDate: '2025-01-15',
    assets: 3,
    earnings: 2800,
    streams: 125000,
    lastUpdated: '2024-10-01',
    cover: '🎵',
    feedback: 'Remix package completed - ready for release',
    marketingPlan: 'DJ promotion, club distribution, streaming features',
    musicFiles: ['urban_beat_club_remix.wav', 'urban_beat_ambient_remix.wav', 'urban_beat_trap_remix.wav'],
    artworkFile: 'urban_beat_remix_cover.jpg',
    trackListing: [
      { title: 'Urban Beat (Club Remix)', duration: '5:45', isrc: 'USRC12345734', bpm: '128', songKey: 'C Minor' },
      { title: 'Urban Beat (Ambient Remix)', duration: '4:20', isrc: 'USRC12345735', bpm: '85', songKey: 'C Minor' },
      { title: 'Urban Beat (Trap Remix)', duration: '3:50', isrc: 'USRC12345736', bpm: '140', songKey: 'C Minor' }
    ],
    credits: [
      { role: 'Original Artist', name: 'YHWH MSC' },
      { role: 'Remix Producer', name: 'DJ ElectroMaster' },
      { role: 'Additional Remix', name: 'Ambient Artist' }
    ],
    publishingNotes: 'Official remixes by top electronic producers'
  },
  {
    id: 18,
    projectName: 'Movie Epic Soundtrack',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'Cinematic Music',
    releaseType: 'Soundtrack',
    genre: 'Classical',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-11-20',
    expectedReleaseDate: '2025-04-05',
    assets: 4,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-11-20',
    cover: '🎼',
    feedback: 'Under review - coordinating with film release schedule',
    marketingPlan: 'Film promotion tie-in, classical radio, streaming features',
    musicFiles: ['main_theme.wav', 'battle_scene.wav', 'love_theme.wav', 'end_credits.wav'],
    artworkFile: 'movie_soundtrack_cover.jpg',
    trackListing: [
      { title: 'Main Theme', duration: '3:20', isrc: 'USRC12345740', bpm: '72', songKey: 'D Major' },
      { title: 'Battle Scene', duration: '4:55', isrc: 'USRC12345741', bpm: '140', songKey: 'C Minor' },
      { title: 'Love Theme', duration: '3:40', isrc: 'USRC12345742', bpm: '60', songKey: 'F Major' },
      { title: 'End Credits', duration: '5:30', isrc: 'USRC12345743', bpm: '76', songKey: 'G Major' }
    ],
    credits: [
      { role: 'Composer', name: 'YHWH MSC' },
      { role: 'Orchestrator', name: 'Film Music Pro' }
    ],
    publishingNotes: 'Epic orchestral soundtrack for major motion picture'
  },
  {
    id: 22,
    projectName: 'Future Sounds EP',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Electronic',
    status: RELEASE_STATUSES.DRAFT,
    submissionDate: null,
    expectedReleaseDate: '2025-08-15',
    assets: 2,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-12-10',
    cover: '🎧',
    feedback: '',
    marketingPlan: 'To be determined',
    musicFiles: ['future_sound_01.wav', 'digital_dream.wav'],
    artworkFile: 'future_sounds_draft_cover.jpg',
    trackListing: [
      { title: 'Future Sound', duration: '4:15', isrc: 'USRC12345751', bpm: '128', songKey: 'C Major' },
      { title: 'Digital Dream', duration: '3:45', isrc: 'USRC12345752', bpm: '132', songKey: 'A Minor' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Sound Design', name: 'YHWH MSC' }
    ],
    publishingNotes: 'Experimental electronic sounds with futuristic themes'
  },
  {
    id: 23,
    projectName: 'Classic Hits Single',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.LIVE,
    submissionDate: '2024-06-01',
    expectedReleaseDate: '2024-09-15',
    assets: 1,
    earnings: 8750,
    streams: 125000,
    lastUpdated: '2024-09-15',
    cover: '🔥',
    feedback: 'Successfully released and performing well',
    marketingPlan: 'Hip hop radio, streaming playlists, social media',
    musicFiles: ['classic_hit.wav'],
    artworkFile: 'classic_hit_cover.jpg',
    trackListing: [
      { title: 'Classic Hit', duration: '3:35', isrc: 'USRC12345753', bpm: '95', songKey: 'G Minor' }
    ],
    credits: [
      { role: 'Artist', name: 'YHWH MSC' },
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    publishingNotes: 'Classic YHWH MSC sound with modern production'
  },
  {
    id: 24,
    projectName: 'Collaborative Single',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Pop',
    status: RELEASE_STATUSES.APPROVAL_REQUIRED,
    submissionDate: '2024-11-01',
    expectedReleaseDate: '2025-02-14',
    assets: 1,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-11-01',
    cover: '💝',
    feedback: 'Technical requirements met - awaiting artist approval for final release',
    marketingPlan: 'Valentine\'s Day promotion, pop radio, streaming features',
    musicFiles: ['collaborative_single.wav'],
    artworkFile: 'collaborative_cover.jpg',
    trackListing: [
      { title: 'Together Forever', duration: '3:22', isrc: 'USRC12345754', bpm: '110', songKey: 'C Major' }
    ],
    credits: [
      { role: 'Lead Vocals', name: 'YHWH MSC' },
      { role: 'Featured Artist', name: 'Guest Singer' },
      { role: 'Producer', name: 'Pop Producer' }
    ],
    publishingNotes: 'Romantic collaboration for Valentine\'s Day release'
  },

  // Additional YHWH MSC releases for complete status coverage
  {
    id: 25,
    projectName: 'Electronic Dreams Single',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Electronic',
    status: RELEASE_STATUSES.SUBMITTED,
    submissionDate: '2024-12-01',
    expectedReleaseDate: '2025-04-20',
    assets: 1,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-12-01',
    cover: '⚡',
    feedback: 'Submitted for review - awaiting distribution partner assessment',
    marketingPlan: 'Electronic music blogs, streaming playlists, social media',
    musicFiles: ['electronic_dreams.wav'],
    artworkFile: 'electronic_dreams_cover.jpg',
    trackListing: [
      { title: 'Electronic Dreams', duration: '4:05', isrc: 'USRC12345755', bpm: '126', songKey: 'F# Minor' }
    ],
    credits: [
      { role: 'Artist', name: 'YHWH MSC' },
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Sound Design', name: 'Synth Master' }
    ],
    publishingNotes: 'Electronic single with cutting-edge production'
  },
  {
    id: 26,
    projectName: 'Acoustic Sessions',
    artist: 'YHWH MSC',
    artistId: 'yhwh_msc',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Acoustic',
    status: RELEASE_STATUSES.DRAFT,
    submissionDate: null,
    expectedReleaseDate: '2025-06-30',
    assets: 1,
    earnings: 0,
    streams: 0,
    lastUpdated: '2024-12-05',
    cover: '🎸',
    feedback: '',
    marketingPlan: 'To be determined',
    musicFiles: ['acoustic_sessions_demo.wav'],
    artworkFile: null,
    trackListing: [
      { title: 'Acoustic Sessions', duration: '3:55', isrc: 'USRC12345756', bpm: '75', songKey: 'D Major' }
    ],
    credits: [
      { role: 'Artist', name: 'YHWH MSC' },
      { role: 'Songwriter', name: 'YHWH MSC' }
    ],
    publishingNotes: 'Raw acoustic performance - work in progress'
  },

  // Other artists' releases
  {
    id: 15,
    projectName: 'Chart Topper Hits',
    artist: 'Global Superstar',
    artistId: 'global_superstar',
    label: 'Major Label Music',
    releaseType: 'Compilation',
    genre: 'Pop',
    status: RELEASE_STATUSES.LIVE,
    submissionDate: '2024-08-01',
    expectedReleaseDate: '2024-12-01',
    assets: 3,
    earnings: 25400,
    streams: 2800000,
    lastUpdated: '2024-12-01',
    trackListing: [
      { title: 'Hit Single #1', duration: '3:25', isrc: 'USRC12345731', bpm: '120', songKey: 'C Major' },
      { title: 'Radio Favorite', duration: '3:18', isrc: 'USRC12345732', bpm: '128', songKey: 'G Major' },
      { title: 'Dance Floor Anthem', duration: '3:35', isrc: 'USRC12345733', bpm: '132', songKey: 'F Major' }
    ]
  },
  {
    id: 20,
    projectName: 'K-Pop Sensation',
    artist: 'Seoul Stars',
    artistId: 'seoul_stars',
    label: 'K-Entertainment',
    releaseType: 'EP',
    genre: 'Pop',
    status: RELEASE_STATUSES.LIVE,
    submissionDate: '2024-09-15',
    expectedReleaseDate: '2024-12-10',
    assets: 3,
    earnings: 31200,
    streams: 4500000,
    lastUpdated: '2024-12-10',
    trackListing: [
      { title: 'Starlight', duration: '3:15', isrc: 'USRC12345745', bpm: '128', songKey: 'C Major' },
      { title: 'Electric Love', duration: '3:42', isrc: 'USRC12345746', bpm: '120', songKey: 'G Major' },
      { title: 'Dream On', duration: '3:58', isrc: 'USRC12345747', bpm: '125', songKey: 'F Major' }
    ]
  },
  {
    id: 17,
    projectName: 'Madison Square Garden Live',
    artist: 'Rock Legends',
    artistId: 'rock_legends',
    label: 'Live Music Records',
    releaseType: 'Live Album',
    genre: 'Rock',
    status: RELEASE_STATUSES.LIVE,
    submissionDate: '2024-09-01',
    expectedReleaseDate: '2024-11-25',
    assets: 3,
    earnings: 18750,
    streams: 1200000,
    lastUpdated: '2024-11-25',
    trackListing: [
      { title: 'Opening Anthem (Live)', duration: '4:30', isrc: 'USRC12345737', bpm: '120', songKey: 'E Major' },
      { title: 'Classic Hit (Live)', duration: '5:15', isrc: 'USRC12345738', bpm: '115', songKey: 'A Major' },
      { title: 'Encore Performance (Live)', duration: '6:45', isrc: 'USRC12345739', bpm: '110', songKey: 'D Major' }
    ]
  },
  {
    id: 19,
    projectName: 'Reggaeton Fuego',
    artist: 'Carlos Mendez',
    artistId: 'carlos_mendez',
    label: 'Latin Beats Records',
    releaseType: 'Single',
    genre: 'Latin',
    status: RELEASE_STATUSES.COMPLETED,
    submissionDate: '2024-11-01',
    expectedReleaseDate: '2025-01-30',
    assets: 1,
    earnings: 5600,
    streams: 280000,
    lastUpdated: '2024-11-01',
    trackListing: [
      { title: 'Fuego', duration: '3:28', isrc: 'USRC12345744', bpm: '95', songKey: 'A Minor' }
    ]
  }
];

// STREAMING PLATFORMS DATA
export const STREAMING_PLATFORMS = {
  spotify: { 
    name: 'Spotify', 
    streams: 3247893, 
    revenue: 12991.57, 
    growth: 23.4, 
    color: '#1DB954',
    royaltyRate: 0.004,
    marketShare: 32.1
  },
  apple: { 
    name: 'Apple Music', 
    streams: 2789456, 
    revenue: 11789.23, 
    growth: 18.7, 
    color: '#000000',
    royaltyRate: 0.0042,
    marketShare: 15.8
  },
  youtube: { 
    name: 'YouTube Music', 
    streams: 1123456, 
    revenue: 3456.78, 
    growth: 15.7, 
    color: '#FF0000',
    royaltyRate: 0.003,
    marketShare: 12.6
  },
  amazon: { 
    name: 'Amazon Music', 
    streams: 567890, 
    revenue: 2345.67, 
    growth: 12.8, 
    color: '#FF9900',
    royaltyRate: 0.004,
    marketShare: 8.5
  },
  deezer: { 
    name: 'Deezer', 
    streams: 345678, 
    revenue: 1234.56, 
    growth: 9.2, 
    color: '#FEAA2D',
    royaltyRate: 0.0035,
    marketShare: 4.5
  },
  tidal: { 
    name: 'TIDAL', 
    streams: 89012, 
    revenue: 469.12, 
    growth: 6.8, 
    color: '#000000',
    royaltyRate: 0.0125,
    marketShare: 1.2
  },
  soundcloud: { 
    name: 'SoundCloud', 
    streams: 234567, 
    revenue: 567.89, 
    growth: 11.3, 
    color: '#FF5500',
    royaltyRate: 0.0024,
    marketShare: 2.8
  },
  other: { 
    name: 'Other Platforms', 
    streams: 456789, 
    revenue: 1234.56, 
    growth: 8.9, 
    color: '#6B7280',
    royaltyRate: 0.0033,
    marketShare: 22.5,
    description: 'Aggregated data from 20+ smaller streaming services',
    platforms: ['Bandcamp', 'Audiomack', 'Napster', 'iHeartRadio', 'Pandora', 'JioSaavn', 'Anghami', 'KKBox', 'QQ Music', 'NetEase Cloud Music', 'Boomplay', 'Resso', 'Yandex Music', 'VK Music', 'Gaana', 'Wynk Music', 'Hungama Music', 'MelOn', 'Genie Music', 'Bugs Music', 'FLO']
  }
};

// ADMIN USERS
export const ADMIN_USERS = [
  {
    id: 1,
    email: 'superadmin@mscandco.com',
    name: 'Super Admin User',
    role: 'super_admin',
    brand: 'MSC & Co',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    releases: 0,
    totalStreams: 0,
    permissions: ['all']
  },
  {
    id: 2,
    email: 'companyadmin@mscandco.com',
    name: 'Company Admin User',
    role: 'company_admin',
    brand: 'MSC & Co',
    status: 'active',
    lastLogin: '2024-01-14T15:45:00Z',
    releases: 0,
    totalStreams: 0,
    permissions: ['user_management', 'content_oversight']
  },
  {
    id: 3,
    email: 'distributor@codegroup.com',
    name: 'Code Group Distribution',
    role: 'distribution_partner',
    brand: 'Code Group',
    status: 'active',
    lastLogin: '2024-01-16T11:15:00Z',
    releases: 21,
    totalStreams: 15000000,
    permissions: ['release_management', 'analytics', 'reports']
  }
];

// 🧮 CALCULATED DASHBOARD STATISTICS
// Auto-computed from base data - NEVER hardcode these values
export const getDashboardStats = () => {
  const stats = calculatePlatformStats();
  
  const yhwhReleases = getReleasesByArtist('yhwh_msc');
  const yhwhEarnings = yhwhReleases.reduce((sum, r) => sum + (r.earnings || 0), 0);
  const yhwhStreams = yhwhReleases.reduce((sum, r) => sum + (r.streams || 0), 0);
  
  return {
    // Artist stats (YHWH MSC focused)
    artist: {
      totalReleases: yhwhReleases.length,
      totalStreams: yhwhStreams,
      totalEarnings: yhwhEarnings,
      activeProjects: yhwhReleases.filter(r => 
        [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED, RELEASE_STATUSES.UNDER_REVIEW].includes(r.status)
      ).length,
      thisMonthEarnings: Math.round(yhwhEarnings * 0.32), // 32% this month
      lastMonthEarnings: Math.round(yhwhEarnings * 0.68), // 68% last month  
      heldEarnings: yhwhEarnings,
      platforms: 7,
      countries: 45,
      topTrack: 'Urban Beat',
      growth: 15, // %
      socialFootprint: yhwhStreams
    },
    
    // Platform-wide stats
    platform: stats.platform,
    
    // Distribution Partner stats
    distributionPartner: {
      distributedContent: stats.platform.totalReleases,
      partnerRevenue: Math.round(stats.platform.totalEarnings * 1.5), // Distribution markup
      activePartners: stats.platform.activeArtists,
      successRate: 94, // %
      totalReleases: stats.platform.totalReleases,
      totalViews: stats.platform.totalStreams,
      totalArtists: stats.platform.activeArtists,
      completedDistributions: getLiveReleases().length
    },
    
    // Admin stats (auto-calculated)
    admin: {
      totalUsers: stats.platform.totalUsers,
      activeProjects: stats.platform.totalReleases,
      totalRevenue: stats.platform.totalEarnings,
      totalBrands: stats.platform.totalBrands,
      totalSongs: stats.platform.totalReleases,
      totalRoles: 5,
      systemFeatures: stats.platform.systemFeatures
    },
    
    // Super Admin stats (platform-wide oversight)
    superAdmin: {
      totalUsers: stats.platform.totalUsers,
      activeProjects: stats.platform.totalReleases,
      totalRevenue: stats.platform.totalEarnings,
      totalBrands: stats.platform.totalBrands,
      totalSongs: stats.platform.totalReleases,
      totalRoles: 5,
      systemFeatures: stats.platform.systemFeatures,
      totalArtists: stats.platform.totalArtists,
      activeArtists: stats.platform.activeArtists,
      totalStreams: stats.platform.totalStreams,
      platformHealth: 98, // %
      systemUptime: 99.9 // %
    },
    
    // Company Admin stats
    companyAdmin: {
      brandUsers: Math.round(stats.platform.totalUsers * 0.4),
      activeProjects: Math.round(stats.platform.totalReleases * 0.6),
      brandRevenue: Math.round(stats.platform.totalEarnings * 0.7),
      contentItems: stats.platform.totalReleases,
      totalViews: stats.platform.totalStreams,
      engagement: 78, // %
      brandRoles: 3
    },
    
    // Label admin stats
    labelAdmin: {
      labelArtists: ARTISTS.filter(a => a.status === 'active' && a.label.includes('MSC')).length,
      labelReleases: RELEASES.filter(r => r.label.includes('MSC')).length,
      labelRevenue: RELEASES.filter(r => r.label.includes('MSC')).reduce((sum, r) => sum + (r.earnings || 0), 0),
      activeContracts: ARTISTS.filter(a => a.status === 'active').length,
      labelStreams: RELEASES.filter(r => r.label.includes('MSC')).reduce((sum, r) => sum + (r.streams || 0), 0),
      labelCountries: 28,
      labelProjects: RELEASES.filter(r => r.label.includes('MSC')).length
    }
  };
};

// ⚡ UTILITY FUNCTIONS 
export const getArtistById = (id) => ARTISTS.find(artist => artist.id === id);
export const getReleasesByArtist = (artistId) => RELEASES.filter(release => release.artistId === artistId);
export const getReleasesByStatus = (status) => RELEASES.filter(release => release.status === status);
export const getReleasesByLabel = (label) => RELEASES.filter(release => release.label === label);
export const getActiveArtists = () => ARTISTS.filter(artist => artist.status === 'active');
export const getLiveReleases = () => RELEASES.filter(release => release.status === RELEASE_STATUSES.LIVE);
export const getTotalStreams = () => RELEASES.reduce((total, release) => total + (release.streams || 0), 0);
export const getTotalRevenue = () => RELEASES.reduce((total, release) => total + (release.earnings || 0), 0);

// 📦 BACKWARDS COMPATIBILITY (will be removed in next cleanup)
export const DASHBOARD_STATS = getDashboardStats();

export default {
  ARTISTS,
  RELEASES,
  STREAMING_PLATFORMS,
  ADMIN_USERS,
  MOCK_VIDEOS,
  getDashboardStats,
  getArtistById,
  getReleasesByArtist,
  getReleasesByStatus,
  getReleasesByLabel,
  getActiveArtists,
  getLiveReleases,
  getTotalStreams,
  getTotalRevenue
};