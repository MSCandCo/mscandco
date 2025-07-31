import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaEye, FaEdit, FaCheckCircle, FaPlay, FaFileText, FaFilter, FaSearch, FaTimes, FaDownload, FaClock, FaAlertCircle } from 'react-icons/fa';
import { Eye, Edit, CheckCircle, Play, FileText, Filter, Search, Download, Clock, AlertCircle } from 'lucide-react';
import { downloadSingleReleaseExcel, downloadMultipleReleasesExcel } from '../../lib/excel-utils';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS, GENRES, RELEASE_TYPES, getStatusLabel, getStatusColor, getStatusIcon } from '../../lib/constants';
import * as XLSX from 'xlsx';

// Excel download functions using template
const downloadReleaseExcel = async (release) => {
  try {
    await downloadSingleReleaseExcel(release);
  } catch (error) {
    console.error('Error downloading release:', error);
    alert('Error downloading release data. Please try again.');
  }
};

// Bulk download function using template
const downloadAllReleasesExcel = async (releases) => {
  try {
    await downloadMultipleReleasesExcel(releases);
  } catch (error) {
    console.error('Error downloading releases:', error);
    alert('Error downloading releases data. Please try again.');
  }
};

// Mock data for distribution partner
const mockAllReleases = [
  {
    id: 1,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-01-15',
    expectedReleaseDate: '2024-03-01',
    assets: '3 tracks, artwork',
    feedback: 'Great urban sound, needs minor adjustments',
    marketingPlan: 'Social media campaign, playlist pitching',
    publishingNotes: 'Urban hip hop collection with strong beats',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686', bpm: '140', songKey: 'C Minor' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687', bpm: '135', songKey: 'F Minor' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688', bpm: '145', songKey: 'A Minor' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Additional Production', name: 'Beat Maker' }
    ],
    // Comprehensive metadata
    songTitle: 'Urban Beat',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC',
    phoneticPronunciation: 'YAH-WAY EM-ES-SEE',
    stylised: 'YHWH MSC',
    akaFka: 'YHWH',
    artistType: 'Solo Artist',
    productTitle: 'Urban Beats Collection',
    altTitle: 'Urban Collection',
    trackPosition: '1',
    featuringArtists: 'None',
    backgroundVocalists: 'None',
    duration: '3:30',
    explicit: 'No',
    version: 'Original',
    bpm: '140',
    songKey: 'C Minor',
    moodDescription: 'Dark, urban, energetic',
    tags: 'hip hop, urban, beats, dark',
    lyrics: 'Urban beats in the city...',
    fileType: '.wav',
    audioFileName: 'urban_beat_01.wav',
    coverFileName: 'urban_beats_cover.jpg',
    language: 'English',
    vocalType: 'Rap',
    subGenre: 'Trap',
    catalogueNo: 'MSC001',
    format: 'Digital',
    productType: 'EP',
    barcode: '1234567890123',
    tunecode: 'TC123456',
    iceWorkKey: 'IWK123456',
    iswc: 'T-123456789-0',
    isrc: 'USRC12345686',
    upc: '123456789012',
    bowiPreviouslyReleased: 'No',
    previousReleaseDate: null,
    recordingCountry: 'United States',
    preReleaseDate: '2024-02-15',
    preReleaseUrl: 'https://prerelease.example.com',
    releaseDate: '2024-03-01',
    releaseUrl: 'https://release.example.com',
    releaseLabel: 'MSC & Co',
    distributionCompany: 'Code Group',
    copyrightYear: '2024',
    copyrightOwner: 'YHWH MSC',
    pLine: '℗ 2024 MSC & Co Records',
    cLine: '© 2024 MSC & Co Records',
    composerAuthor: 'YHWH MSC',
    role: 'Composer, Lyricist',
    pro: 'ASCAP',
    caeIpi: '123456789',
    publishing: 'MSC Publishing',
    publisherIpi: '987654321',
    publishingAdmin: 'MSC Publishing Admin',
    publishingAdminIpi: '456789123',
    mechanical: 'Harry Fox Agency',
    bmiWorkNumber: 'BM123456789',
    ascapWorkNumber: 'AW123456789',
    isni: '0000000123456789',
    subPublisher: 'None',
    publishingType: 'Administration',
    territory: 'Worldwide',
    executiveProducer: 'YHWH MSC',
    producer: 'YHWH MSC',
    mixingEngineer: 'Studio Pro',
    masteringEngineer: 'Master Lab',
    coProducer: 'Beat Maker',
    assistantProducer: 'None',
    engineerEditing: 'Studio Pro',
    masteringStudio: 'Master Lab',
    recordingEngineer: 'Studio Pro',
    additionalProduction: 'Beat Maker',
    recordingStudio: 'MSC Studio',
    keyboards: 'None',
    programming: 'YHWH MSC',
    bass: 'None',
    drums: 'None',
    guitars: 'None',
    organ: 'None',
    percussion: 'None',
    strings: 'None',
    additionalInstrumentation: 'None',
    designArtDirection: 'MSC Design',
    management: 'MSC Management',
    bookingAgent: 'MSC Booking',
    pressContact: 'press@msc.com',
    primaryContactEmail: 'contact@msc.com',
    artistEmail: 'artist@msc.com',
    primaryContactNumber: '+1-555-123-4567',
    secondaryContactNumber: '+1-555-987-6543',
    wikipedia: 'https://wikipedia.org/yhwh-msc',
    socialMediaLink: 'https://instagram.com/yhwhmsc',
    shazam: 'https://shazam.com/yhwh-msc',
    tiktok: 'https://tiktok.com/@yhwhmsc',
    instagram: 'https://instagram.com/yhwhmsc',
    genius: 'https://genius.com/yhwh-msc',
    allMusic: 'https://allmusic.com/yhwh-msc',
    discogs: 'https://discogs.com/yhwh-msc',
    musicbrainz: 'https://musicbrainz.org/yhwh-msc',
    imdb: 'https://imdb.com/yhwh-msc',
    jaxsta: 'https://jaxsta.com/yhwh-msc',
    website: 'https://yhwhmsc.com',
    youtube: 'https://youtube.com/yhwhmsc',
    youtubeMusic: 'https://music.youtube.com/yhwh-msc',
    knowledgePanel: 'https://google.com/yhwh-msc',
    tourDates: 'https://tour.yhwhmsc.com',
    spotifyUri: 'spotify:artist:123456789',
    appleId: '123456789',
    digitalAssetsFolder: '/assets/urban_beats',
    metadataApproved: 'Yes',
    initials: 'YM',
    submittedToStores: 'Yes',
    luminate: 'Submitted',
    mediabase: 'Submitted',
    notes: 'Urban hip hop collection with strong commercial potential'
  },
  {
    id: 2,
    projectName: 'Rock Anthem',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Rock',
    status: RELEASE_STATUSES.SUBMITTED,
    submissionDate: '2024-01-10',
    expectedReleaseDate: '2024-02-15',
    assets: '1 track, artwork',
    feedback: 'Strong rock sound, ready for distribution',
    marketingPlan: 'Radio promotion, streaming focus',
    publishingNotes: 'Powerful rock anthem',
    trackListing: [
      { title: 'Rock Anthem', duration: '4:20', isrc: 'USRC12345689', bpm: '120', songKey: 'E Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    // Comprehensive metadata
    songTitle: 'Rock Anthem',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC',
    phoneticPronunciation: 'YAH-WAY EM-ES-SEE',
    stylised: 'YHWH MSC',
    akaFka: 'YHWH',
    artistType: 'Solo Artist',
    productTitle: 'Rock Anthem',
    altTitle: 'Anthem',
    trackPosition: '1',
    featuringArtists: 'None',
    backgroundVocalists: 'Studio Choir',
    duration: '4:20',
    explicit: 'No',
    version: 'Original',
    bpm: '120',
    songKey: 'E Major',
    moodDescription: 'Energetic, powerful, anthemic',
    tags: 'rock, anthem, powerful, energetic',
    lyrics: 'This is our rock anthem...',
    fileType: '.wav',
    audioFileName: 'rock_anthem_01.wav',
    coverFileName: 'rock_anthem_cover.jpg',
    language: 'English',
    vocalType: 'Rock',
    subGenre: 'Alternative Rock',
    catalogueNo: 'MSC002',
    format: 'Digital',
    productType: 'Single',
    barcode: '1234567890124',
    tunecode: 'TC123457',
    iceWorkKey: 'IWK123457',
    iswc: 'T-123456789-1',
    isrc: 'USRC12345689',
    upc: '123456789013',
    bowiPreviouslyReleased: 'No',
    previousReleaseDate: null,
    recordingCountry: 'United States',
    preReleaseDate: '2024-02-01',
    preReleaseUrl: 'https://prerelease.example.com/rock',
    releaseDate: '2024-02-15',
    releaseUrl: 'https://release.example.com/rock',
    releaseLabel: 'MSC & Co',
    distributionCompany: 'Code Group',
    copyrightYear: '2024',
    copyrightOwner: 'YHWH MSC',
    pLine: '℗ 2024 MSC & Co Records',
    cLine: '© 2024 MSC & Co Records',
    composerAuthor: 'YHWH MSC',
    role: 'Composer, Lyricist',
    pro: 'ASCAP',
    caeIpi: '123456789',
    publishing: 'MSC Publishing',
    publisherIpi: '987654321',
    publishingAdmin: 'MSC Publishing Admin',
    publishingAdminIpi: '456789123',
    mechanical: 'Harry Fox Agency',
    bmiWorkNumber: 'BM123456790',
    ascapWorkNumber: 'AW123456790',
    isni: '0000000123456790',
    subPublisher: 'None',
    publishingType: 'Administration',
    territory: 'Worldwide',
    executiveProducer: 'YHWH MSC',
    producer: 'YHWH MSC',
    mixingEngineer: 'Studio Pro',
    masteringEngineer: 'Master Lab',
    coProducer: 'None',
    assistantProducer: 'None',
    engineerEditing: 'Studio Pro',
    masteringStudio: 'Master Lab',
    recordingEngineer: 'Studio Pro',
    additionalProduction: 'None',
    recordingStudio: 'MSC Studio',
    keyboards: 'YHWH MSC',
    programming: 'None',
    bass: 'Studio Bassist',
    drums: 'Studio Drummer',
    guitars: 'Studio Guitarist',
    organ: 'None',
    percussion: 'Studio Percussionist',
    strings: 'None',
    additionalInstrumentation: 'Studio Orchestra',
    designArtDirection: 'MSC Design',
    management: 'MSC Management',
    bookingAgent: 'MSC Booking',
    pressContact: 'press@msc.com',
    primaryContactEmail: 'contact@msc.com',
    artistEmail: 'artist@msc.com',
    primaryContactNumber: '+1-555-123-4567',
    secondaryContactNumber: '+1-555-987-6543',
    wikipedia: 'https://wikipedia.org/yhwh-msc',
    socialMediaLink: 'https://instagram.com/yhwhmsc',
    shazam: 'https://shazam.com/yhwh-msc',
    tiktok: 'https://tiktok.com/@yhwhmsc',
    instagram: 'https://instagram.com/yhwhmsc',
    genius: 'https://genius.com/yhwh-msc',
    allMusic: 'https://allmusic.com/yhwh-msc',
    discogs: 'https://discogs.com/yhwh-msc',
    musicbrainz: 'https://musicbrainz.org/yhwh-msc',
    imdb: 'https://imdb.com/yhwh-msc',
    jaxsta: 'https://jaxsta.com/yhwh-msc',
    website: 'https://yhwhmsc.com',
    youtube: 'https://youtube.com/yhwhmsc',
    youtubeMusic: 'https://music.youtube.com/yhwh-msc',
    knowledgePanel: 'https://google.com/yhwh-msc',
    tourDates: 'https://tour.yhwhmsc.com',
    spotifyUri: 'spotify:artist:123456789',
    appleId: '123456789',
    digitalAssetsFolder: '/assets/rock_anthem',
    metadataApproved: 'Yes',
    initials: 'YM',
    submittedToStores: 'Yes',
    luminate: 'Submitted',
    mediabase: 'Submitted',
    notes: 'Powerful rock anthem with strong commercial appeal'
  }
];

// Mock data for edit requests and amendments
const mockEditRequests = [
  {
    id: 101,
    projectName: 'Completed Album',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Album',
    genre: 'Electronic',
    originalStatus: 'completed',
    requestType: 'edit_request',
    requestDate: '2024-01-20',
    requestReason: 'Artist wants to update track titles and add new artwork',
    requestDetails: 'Need to change track names and upload new cover art',
    status: 'pending_review',
    trackListing: [
      { title: 'Completed Track 1', duration: '4:20', isrc: 'USRC12345689', bpm: '125', songKey: 'G Major' },
      { title: 'Completed Track 2', duration: '3:55', isrc: 'USRC12345690', bpm: '130', songKey: 'A Minor' },
      { title: 'Completed Track 3', duration: '4:10', isrc: 'USRC12345691', bpm: '140', songKey: 'C Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    publishingNotes: 'Successfully completed album - requesting updates'
  },
  {
    id: 102,
    projectName: 'Live Single',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Pop',
    originalStatus: 'live',
    requestType: 'edit_request',
    requestDate: '2024-01-18',
    requestReason: 'Artist wants to update metadata and add new credits',
    requestDetails: 'Need to update artist name spelling and add new producer credit',
    status: 'pending_review',
    trackListing: [
      { title: 'Live Single Track', duration: '3:45', isrc: 'USRC12345692', bpm: '110', songKey: 'D Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Mastering Engineer', name: 'Master Lab' }
    ],
    publishingNotes: 'Live single performing well - requesting metadata updates'
  },
  {
    id: 103,
    projectName: 'Urban Beats Collection',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Hip Hop',
    originalStatus: 'under_review',
    requestType: 'amendment',
    requestDate: '2024-01-22',
    requestReason: 'Artist submitted additional tracks and updated artwork',
    requestDetails: 'Added 2 new tracks and updated cover art design',
    status: 'pending_review',
    trackListing: [
      { title: 'Urban Beat', duration: '3:30', isrc: 'USRC12345686' },
      { title: 'Street Rhythm', duration: '4:15', isrc: 'USRC12345687' },
      { title: 'City Lights', duration: '3:45', isrc: 'USRC12345688' },
      { title: 'New Track 1', duration: '3:20', isrc: 'USRC12345693', bpm: '150', songKey: 'B Minor' },
      { title: 'New Track 2', duration: '4:05', isrc: 'USRC12345694', bpm: '138', songKey: 'E Minor' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Additional Production', name: 'Beat Maker' }
    ],
    publishingNotes: 'Urban hip hop collection - added new tracks'
  },
  {
    id: 3,
    projectName: 'Acoustic Dreams',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Acoustic',
    status: RELEASE_STATUSES.DRAFT,
    submissionDate: null,
    expectedReleaseDate: '2025-04-01',
    assets: '1 track, artwork',
    feedback: '',
    marketingPlan: 'To be determined',
    publishingNotes: 'Solo acoustic performance',
    trackListing: [
      { title: 'Acoustic Dreams', duration: '4:20', isrc: 'USRC12345689', bpm: '90', songKey: 'G Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Songwriter', name: 'YHWH MSC' }
    ],
    songTitle: 'Acoustic Dreams',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 4,
    projectName: 'Electronic Fusion EP',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'EP',
    genre: 'Electronic',
    status: RELEASE_STATUSES.APPROVAL_REQUIRED,
    submissionDate: '2024-01-20',
    expectedReleaseDate: '2025-05-01',
    assets: '4 tracks, artwork',
    feedback: 'Changes requested by artist - pending approval',
    marketingPlan: 'Digital release with social media campaign',
    publishingNotes: 'Electronic fusion with hip hop elements',
    trackListing: [
      { title: 'Digital Waves', duration: '3:45', isrc: 'USRC12345690', bpm: '128', songKey: 'C Major' },
      { title: 'Synth Dreams', duration: '4:12', isrc: 'USRC12345691', bpm: '132', songKey: 'A Minor' },
      { title: 'Bass Drop', duration: '3:30', isrc: 'USRC12345692', bpm: '140', songKey: 'E Minor' },
      { title: 'Future Sounds', duration: '4:05', isrc: 'USRC12345693', bpm: '135', songKey: 'F Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Sound Engineer', name: 'Audio Pro' }
    ],
    songTitle: 'Digital Waves',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 5,
    projectName: 'Summer Vibes',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Single',
    genre: 'Pop',
    status: RELEASE_STATUSES.COMPLETED,
    submissionDate: '2024-01-05',
    expectedReleaseDate: '2024-02-15',
    assets: '1 track, artwork',
    feedback: 'Approved and ready for distribution',
    marketingPlan: 'Summer playlist campaign',
    publishingNotes: 'Upbeat summer track',
    trackListing: [
      { title: 'Summer Vibes', duration: '3:45', isrc: 'USRC12345678', bpm: '120', songKey: 'C Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Songwriter', name: 'YHWH MSC' }
    ],
    songTitle: 'Summer Vibes',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 6,
    projectName: 'Midnight Sessions',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Album',
    genre: 'R&B',
    status: RELEASE_STATUSES.LIVE,
    submissionDate: '2023-12-15',
    expectedReleaseDate: '2024-01-20',
    assets: '8 tracks, artwork',
    feedback: 'Successfully distributed and live on all platforms',
    marketingPlan: 'Full album promotion campaign',
    publishingNotes: 'Late night R&B collection',
    trackListing: [
      { title: 'Midnight Intro', duration: '2:15', isrc: 'USRC12345682', bpm: '85', songKey: 'A Minor' },
      { title: 'Late Night Groove', duration: '4:30', isrc: 'USRC12345683', bpm: '90', songKey: 'C Major' },
      { title: 'City Lights', duration: '3:55', isrc: 'USRC12345684', bpm: '88', songKey: 'F Major' }
    ],
    credits: [
      { role: 'Producer', name: 'YHWH MSC' },
      { role: 'Songwriter', name: 'YHWH MSC' },
      { role: 'Mix Engineer', name: 'Studio Pro' }
    ],
    songTitle: 'Midnight Intro',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 7,
    projectName: 'Greatest Hits Collection',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Compilation',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.COMPLETED,
    submissionDate: '2024-02-01',
    expectedReleaseDate: '2024-04-01',
    assets: '12 tracks, artwork',
    feedback: 'Compilation ready for release',
    marketingPlan: 'Best of collection marketing campaign',
    publishingNotes: 'Collection of top performing tracks',
    trackListing: [
      { title: 'Urban Beat (Remastered)', duration: '3:30', isrc: 'USRC12345700', bpm: '140', songKey: 'C Minor' },
      { title: 'Summer Vibes (Remastered)', duration: '4:00', isrc: 'USRC12345701', bpm: '120', songKey: 'G Major' }
    ],
    credits: [
      { role: 'Compilation Producer', name: 'YHWH MSC' },
      { role: 'Mastering Engineer', name: 'Audio Pro' }
    ],
    songTitle: 'Urban Beat (Remastered)',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 8,
    projectName: 'Urban Beat (Remix Package)',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Remix',
    genre: 'Electronic',
    status: RELEASE_STATUSES.UNDER_REVIEW,
    submissionDate: '2024-02-15',
    expectedReleaseDate: '2024-05-01',
    assets: '5 remixes, artwork',
    feedback: 'Exciting remix package under review',
    marketingPlan: 'Electronic music promotion focus',
    publishingNotes: 'Official remixes by top electronic producers',
    trackListing: [
      { title: 'Urban Beat (Club Remix)', duration: '6:30', isrc: 'USRC12345710', bpm: '128', songKey: 'C Minor' },
      { title: 'Urban Beat (Ambient Remix)', duration: '4:45', isrc: 'USRC12345711', bpm: '85', songKey: 'C Minor' }
    ],
    credits: [
      { role: 'Original Artist', name: 'YHWH MSC' },
      { role: 'Remix Producer', name: 'DJ Electronic' }
    ],
    songTitle: 'Urban Beat (Club Remix)',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 9,
    projectName: 'Live at Madison Square',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Live Album',
    genre: 'Hip Hop',
    status: RELEASE_STATUSES.SUBMITTED,
    submissionDate: '2024-03-01',
    expectedReleaseDate: '2024-06-01',
    assets: '15 live tracks, concert footage',
    feedback: 'High-quality live recording submitted for review',
    marketingPlan: 'Concert experience marketing',
    publishingNotes: 'Full live concert recording from Madison Square Garden',
    trackListing: [
      { title: 'Urban Beat (Live)', duration: '4:15', isrc: 'USRC12345720', bpm: '142', songKey: 'C Minor' },
      { title: 'Summer Vibes (Live)', duration: '5:30', isrc: 'USRC12345721', bpm: '122', songKey: 'G Major' }
    ],
    credits: [
      { role: 'Live Performance', name: 'YHWH MSC' },
      { role: 'Live Recording Engineer', name: 'Concert Audio' }
    ],
    songTitle: 'Urban Beat (Live)',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  },
  {
    id: 10,
    projectName: 'Movie Score: Urban Dreams',
    artist: 'YHWH MSC',
    label: 'MSC & Co',
    releaseType: 'Soundtrack',
    genre: 'Ambient',
    status: RELEASE_STATUSES.DRAFT,
    submissionDate: '2024-03-15',
    expectedReleaseDate: '2024-08-01',
    assets: '20 instrumental tracks, movie artwork',
    feedback: 'Film soundtrack in development phase',
    marketingPlan: 'Movie tie-in promotional campaign',
    publishingNotes: 'Original soundtrack for Urban Dreams feature film',
    trackListing: [
      { title: 'Opening Credits', duration: '2:30', isrc: 'USRC12345730', bpm: '70', songKey: 'D Minor' },
      { title: 'City Chase Scene', duration: '3:45', isrc: 'USRC12345731', bpm: '110', songKey: 'A Minor' }
    ],
    credits: [
      { role: 'Composer', name: 'YHWH MSC' },
      { role: 'Orchestrator', name: 'Film Music Pro' }
    ],
    songTitle: 'Opening Credits',
    companyName: 'MSC & Co Records',
    legalName: 'YHWH MSC',
    artistName: 'YHWH MSC'
  }
];

export default function DistributionPartnerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState('all-releases');
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showReleaseDetails, setShowReleaseDetails] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [releaseTypeFilter, setReleaseTypeFilter] = useState('all');
  
  // Convert mockAllReleases to state for dynamic updates
  const [allReleases, setAllReleases] = useState(mockAllReleases);
  
  // ISRC editing state
  const [editingIsrc, setEditingIsrc] = useState(null); // { releaseId, trackIndex }
  const [tempIsrc, setTempIsrc] = useState('');
  
  // ISRC editing functions
  const startEditingIsrc = (releaseId, trackIndex, currentIsrc) => {
    setEditingIsrc({ releaseId, trackIndex });
    setTempIsrc(currentIsrc);
  };
  
  const saveIsrc = () => {
    if (!editingIsrc || !tempIsrc.trim()) return;
    
    // Update the release data
    setAllReleases(prevReleases => 
      prevReleases.map(release => {
        if (release.id === editingIsrc.releaseId) {
          // Update the track listing
          const updatedTrackListing = release.trackListing.map((track, index) => {
            if (index === editingIsrc.trackIndex) {
              return { ...track, isrc: tempIsrc.trim() };
            }
            return track;
          });
          
          return { ...release, trackListing: updatedTrackListing };
        }
        return release;
      })
    );
    
    // Update editingRelease if it's the same release being edited
    if (editingRelease && editingRelease.id === editingIsrc.releaseId) {
      setEditingRelease(prevEditingRelease => ({
        ...prevEditingRelease,
        trackListing: prevEditingRelease.trackListing.map((track, index) => {
          if (index === editingIsrc.trackIndex) {
            return { ...track, isrc: tempIsrc.trim() };
          }
          return track;
        })
      }));
    }
    
    // Update selectedRelease if it's the same release being edited
    if (selectedRelease && selectedRelease.id === editingIsrc.releaseId) {
      setSelectedRelease(prevSelectedRelease => ({
        ...prevSelectedRelease,
        trackListing: prevSelectedRelease.trackListing.map((track, index) => {
          if (index === editingIsrc.trackIndex) {
            return { ...track, isrc: tempIsrc.trim() };
          }
          return track;
        })
      }));
    }
    
    console.log('ISRC updated:', tempIsrc, 'for release:', editingIsrc.releaseId, 'track:', editingIsrc.trackIndex);
    setEditingIsrc(null);
    setTempIsrc('');
  };
  
  const cancelEditingIsrc = () => {
    setEditingIsrc(null);
    setTempIsrc('');
  };
  const [uploadedData, setUploadedData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john.doe@codegroup.com'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  const [showProfileModal, setShowProfileModal] = useState(false);

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Memoize displayed releases based on hovered status for Release Board
  const displayedReleasesForBoard = useMemo(() => {
    return hoveredStatus 
      ? allReleases.filter(release => release.status === hoveredStatus)
      : allReleases;
  }, [hoveredStatus, allReleases]);

  // Profile handlers
  const handleProfileSave = () => {
    setProfileData({ ...editProfileData });
    setIsEditingProfile(false);
    // Here you would typically save to an API
    console.log('Saving profile:', editProfileData);
  };

  const handleProfileCancel = () => {
    setEditProfileData({ ...profileData });
    setIsEditingProfile(false);
  };

  // Sync edit data when profile data changes
  useEffect(() => {
    setEditProfileData({ ...profileData });
  }, [profileData]);

  // Check for profile query parameter and open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('profile') === 'open') {
      setShowProfileModal(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check for tab query parameter and switch to appropriate tab
    const tabParam = urlParams.get('tab');
    if (tabParam && ['all-releases', 'sync-board', 'edit-requests'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);



  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'distribution_partner') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter releases based on search and filters
  const filteredReleases = allReleases.filter(release => {
    const matchesSearch = release.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesReleaseType = releaseTypeFilter === 'all' || release.releaseType === releaseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesReleaseType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const handleStatusChange = (releaseId, newStatus) => {
    // In a real app, this would update the database
    console.log(`Changing release ${releaseId} status to ${newStatus}`);
  };

  // Helper function to calculate total assets across all releases
  const getTotalAssets = (releases) => {
    return releases.reduce((total, release) => {
      return total + (release.trackListing ? release.trackListing.length : 0);
    }, 0);
  };

  const renderAllReleases = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {Object.entries(RELEASE_STATUSES).map(([key, value]) => (
                <option key={value} value={value}>{getStatusLabel(value)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Release Type</label>
            <select
              value={releaseTypeFilter}
              onChange={(e) => setReleaseTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Release Types</option>
              {RELEASE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setReleaseTypeFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Releases with Individual Tables */}
      <div className="space-y-8">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-white rounded-lg shadow-sm border">
            {/* Release Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-900">{release.projectName}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                      {getStatusIcon(release.status)}
                      <span className="ml-1">{getStatusLabel(release.status)}</span>
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{release.artist}</span> • {release.releaseType} • {release.genre} • {release.trackListing.length} tracks
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Submitted: {release.submissionDate} • Expected Release: {release.expectedReleaseDate}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadReleaseExcel(release)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    title="Download all assets for this release"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Release</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingRelease(release);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    title="Edit release metadata"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Release</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Assets Table for this Release */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BPM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISRC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {release.trackListing.map((track, trackIndex) => (
                    <tr key={trackIndex} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-bold">
                          {trackIndex + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{track.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.bpm || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.songKey || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingIsrc?.releaseId === release.id && editingIsrc?.trackIndex === trackIndex ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempIsrc}
                              onChange={(e) => setTempIsrc(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm font-mono w-32"
                              placeholder="USRC12345678"
                              maxLength="12"
                            />
                            <button
                              onClick={saveIsrc}
                              className="text-green-600 hover:text-green-800"
                              title="Save ISRC"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditingIsrc}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 group">
                            <span className="font-mono">{track.isrc}</span>
                            <button
                              onClick={() => startEditingIsrc(release.id, trackIndex, track.isrc)}
                              className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity"
                              title="Edit ISRC"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRelease(release);
                              setShowReleaseDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Asset Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRelease(release);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Asset Metadata"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSyncBoard = () => {
    const statusItems = [
      { status: RELEASE_STATUSES.DRAFT, label: getStatusLabel(RELEASE_STATUSES.DRAFT), count: allReleases.filter(r => r.status === RELEASE_STATUSES.DRAFT).length, color: 'bg-yellow-500', icon: FileText },
      { status: RELEASE_STATUSES.SUBMITTED, label: getStatusLabel(RELEASE_STATUSES.SUBMITTED), count: allReleases.filter(r => r.status === RELEASE_STATUSES.SUBMITTED).length, color: 'bg-blue-500', icon: FileText },
      { status: RELEASE_STATUSES.UNDER_REVIEW, label: getStatusLabel(RELEASE_STATUSES.UNDER_REVIEW), count: allReleases.filter(r => r.status === RELEASE_STATUSES.UNDER_REVIEW).length, color: 'bg-amber-500', icon: Eye },
      { status: RELEASE_STATUSES.APPROVAL_REQUIRED, label: getStatusLabel(RELEASE_STATUSES.APPROVAL_REQUIRED), count: allReleases.filter(r => r.status === RELEASE_STATUSES.APPROVAL_REQUIRED).length, color: 'bg-orange-500', icon: AlertCircle },
      { status: RELEASE_STATUSES.COMPLETED, label: getStatusLabel(RELEASE_STATUSES.COMPLETED), count: allReleases.filter(r => r.status === RELEASE_STATUSES.COMPLETED).length, color: 'bg-green-500', icon: CheckCircle },
      { status: RELEASE_STATUSES.LIVE, label: getStatusLabel(RELEASE_STATUSES.LIVE), count: allReleases.filter(r => r.status === RELEASE_STATUSES.LIVE).length, color: 'bg-purple-500', icon: Play }
    ];

    const getReleaseTypeColor = (type) => {
      switch (type) {
        case 'Single': return 'bg-blue-100 text-blue-800';
        case 'EP': return 'bg-green-100 text-green-800';
        case 'Album': return 'bg-purple-100 text-purple-800';
        case 'Mixtape': return 'bg-orange-100 text-orange-800';
        case 'Compilation': return 'bg-indigo-100 text-indigo-800';
        case 'Remix': return 'bg-pink-100 text-pink-800';
        case 'Live Album': return 'bg-red-100 text-red-800';
        case 'Soundtrack': return 'bg-teal-100 text-teal-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getGenreColor = (genre) => {
      switch (genre) {
        case 'Hip Hop': return 'bg-red-100 text-red-800';
        case 'Electronic': return 'bg-blue-100 text-blue-800';
        case 'Rock': return 'bg-yellow-100 text-yellow-800';
        case 'Pop': return 'bg-pink-100 text-pink-800';
        case 'R&B': return 'bg-purple-100 text-purple-800';
        case 'Jazz': return 'bg-indigo-100 text-indigo-800';
        case 'Country': return 'bg-green-100 text-green-800';
        case 'Classical': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-8">
        {/* Status Overview Cards */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Release Status Overview</h2>
            {hoveredStatus && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-blue-600 font-medium">
                  Filtering by: {getStatusLabel(hoveredStatus)}
                </div>
                <button
                  onClick={() => setHoveredStatus(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statusItems.map((item) => (
              <div 
                key={item.status} 
                className={`bg-white rounded-lg shadow p-6 text-center relative cursor-pointer transition-all duration-200 ${
                  hoveredStatus === item.status 
                    ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50 scale-105' 
                    : 'hover:shadow-lg hover:scale-105'
                }`}
                onMouseEnter={() => setHoveredStatus(item.status)}
              >
                <div className={`w-16 h-16 ${item.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500 mt-1">releases</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Releases - Releases needing attention */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Priority Releases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReleasesForBoard
              .filter(release => [RELEASE_STATUSES.DRAFT, RELEASE_STATUSES.SUBMITTED, RELEASE_STATUSES.UNDER_REVIEW, RELEASE_STATUSES.APPROVAL_REQUIRED].includes(release.status))
              .map((release) => (
                <div key={release.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">🎵</div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                        {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.projectName}</h3>
                    <p className="text-gray-600 mb-3">{release.artist}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.releaseType)}`}>
                        {release.releaseType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(release.genre)}`}>
                        {release.genre}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <p>📁 {release.trackListing.length} tracks</p>
                      <p>📅 Expected: {release.expectedReleaseDate}</p>
                      <p>📊 Assets: {release.assets}</p>
                      {release.feedback && (
                        <p className="text-amber-600">💬 {release.feedback.substring(0, 50)}...</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRelease(release);
                          setShowReleaseDetails(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setEditingRelease(release);
                          setShowEditModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {displayedReleasesForBoard
                .filter(release => release.status === RELEASE_STATUSES.COMPLETED || release.status === RELEASE_STATUSES.LIVE)
                .slice(0, 5)
                .map((release) => (
                  <div key={release.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🎵</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{release.projectName}</h4>
                        <p className="text-sm text-gray-500">{release.artist} • {release.releaseType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                        {getStatusIcon(release.status)} {getStatusLabel(release.status)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedRelease(release);
                          setShowReleaseDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditRequests = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">
                {mockEditRequests.filter(r => r.status === 'pending_review').length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Edit Requests</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockEditRequests.filter(r => r.requestType === 'edit_request').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amendments</p>
              <p className="text-2xl font-bold text-green-600">
                {mockEditRequests.filter(r => r.requestType === 'amendment').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Edit Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Edit Requests & Amendments ({mockEditRequests.length})</h3>
            <button
              onClick={() => downloadAllReleasesExcel(mockEditRequests)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download All</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEditRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.projectName}</div>
                      <div className="text-sm text-gray-500">{request.releaseType} • {request.genre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.requestType === 'edit_request' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.requestType === 'edit_request' ? 'Edit Request' : 'Amendment'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.originalStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      request.originalStatus === 'live' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {request.originalStatus ? request.originalStatus.replace('_', ' ') : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRelease(request);
                          setShowReleaseDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Approving edit request:', request.id);
                          alert('Edit request approved and will be processed.');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Request"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Rejecting edit request:', request.id);
                          alert('Edit request rejected.');
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Request"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReleaseExcel(request)}
                        className="text-green-600 hover:text-green-900"
                        title="Download Release Data"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Excel upload handler
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('processing');
    
    try {
      const data = await readExcelFile(file);
      if (data && data.length > 0) {
        // Use the first row of data to populate the form
        const releaseData = data[0];
        setUploadedData(releaseData);
        setUploadStatus('success');
        
        // Update the editing release with the uploaded data
        const updatedRelease = { ...editingRelease, ...releaseData };
        setEditingRelease(updatedRelease);
        
        // Show success message
        alert('Excel data uploaded successfully! Form fields have been populated.');
      } else {
        setUploadStatus('error');
        alert('No valid data found in the Excel file. Please ensure the file follows the correct template format.');
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setUploadStatus('error');
      alert('Error processing Excel file. Please ensure the file follows the correct template format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Read Excel file function
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'));
            return;
          }
          
          // Extract headers and data
          const headers = jsonData[0];
          const dataRows = jsonData.slice(1);
          
          // Convert to object format
          const processedData = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index];
              }
            });
            return obj;
          });
          
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Distribution Partner Dashboard</h1>
                <p className="text-sm text-gray-500">Manage and review all releases</p>
              </div>

            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all-releases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-releases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Releases
              </button>
              <button
                onClick={() => setActiveTab('sync-board')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sync-board'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Release Board
              </button>
              <button
                onClick={() => setActiveTab('edit-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit Requests
              </button>

            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'all-releases' && renderAllReleases()}
          {activeTab === 'sync-board' && renderSyncBoard()}
          {activeTab === 'edit-requests' && renderEditRequests()}
        </div>

        {/* Release Details Modal */}
        {showReleaseDetails && selectedRelease && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Release Details - {selectedRelease.projectName}</h3>
                <button
                  onClick={() => {
                    setShowReleaseDetails(false);
                    setSelectedRelease(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.projectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Song Title</label>
                      <p className="text-sm text-gray-900">{selectedRelease.songTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.artistName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Legal Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.legalName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Label</label>
                      <p className="text-sm text-gray-900">{selectedRelease.label}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Type</label>
                      <p className="text-sm text-gray-900">{selectedRelease.releaseType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genre</label>
                      <p className="text-sm text-gray-900">{selectedRelease.genre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sub Genre</label>
                      <p className="text-sm text-gray-900">{selectedRelease.subGenre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRelease.status)}`}>
                        {getStatusIcon(selectedRelease.status)}
                        <span className="ml-1">{selectedRelease.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Title</label>
                      <p className="text-sm text-gray-900">{selectedRelease.productTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alt Title</label>
                      <p className="text-sm text-gray-900">{selectedRelease.altTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number of Tracks</label>
                      <p className="text-sm text-gray-900">{selectedRelease.trackListing.length}</p>
                    </div>
                  </div>
                </div>

                {/* Artist Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Artist Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Type</label>
                      <p className="text-sm text-gray-900">{selectedRelease.artistType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stylised</label>
                      <p className="text-sm text-gray-900">{selectedRelease.stylised}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">AKA/FKA</label>
                      <p className="text-sm text-gray-900">{selectedRelease.akaFka}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phonetic Pronunciation</label>
                      <p className="text-sm text-gray-900">{selectedRelease.phoneticPronunciation}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Featuring Artists</label>
                      <p className="text-sm text-gray-900">{selectedRelease.featuringArtists}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Background Vocalists</label>
                      <p className="text-sm text-gray-900">{selectedRelease.backgroundVocalists}</p>
                    </div>
                  </div>
                </div>

                {/* Audio Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Audio Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <p className="text-sm text-gray-900">{selectedRelease.duration}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BPM</label>
                      <p className="text-sm text-gray-900">{selectedRelease.bpm}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Song Key</label>
                      <p className="text-sm text-gray-900">{selectedRelease.songKey}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Version</label>
                      <p className="text-sm text-gray-900">{selectedRelease.version}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Explicit</label>
                      <p className="text-sm text-gray-900">{selectedRelease.explicit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <p className="text-sm text-gray-900">{selectedRelease.language}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vocal Type</label>
                      <p className="text-sm text-gray-900">{selectedRelease.vocalType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">File Type</label>
                      <p className="text-sm text-gray-900">{selectedRelease.fileType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Audio File Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.audioFileName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cover File Name</label>
                      <p className="text-sm text-gray-900">{selectedRelease.coverFileName}</p>
                    </div>
                  </div>
                </div>

                {/* Creative Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Creative Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mood Description (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.moodDescription || ''}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.tags}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Lyrics (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.lyrics}
                        rows={4}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Product Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Format (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.format}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Type (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.productType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catalogue No. (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.catalogueNo}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Barcode (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.barcode}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tunecode (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.tunecode}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ICE Work Key (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.iceWorkKey}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISWC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.iswc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISRC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.isrc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UPC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.upc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Release Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Release Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BOWI Previously Released</label>
                      <p className="text-sm text-gray-900">{selectedRelease.bowiPreviouslyReleased}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Release Date</label>
                      <p className="text-sm text-gray-900">{selectedRelease.previousReleaseDate || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Country</label>
                      <p className="text-sm text-gray-900">{selectedRelease.recordingCountry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pre-Release Date</label>
                      <p className="text-sm text-gray-900">{selectedRelease.preReleaseDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pre-Release URL</label>
                      <p className="text-sm text-gray-900">{selectedRelease.preReleaseUrl}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Date</label>
                      <p className="text-sm text-gray-900">{selectedRelease.releaseDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release URL</label>
                      <p className="text-sm text-gray-900">{selectedRelease.releaseUrl}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Label</label>
                      <p className="text-sm text-gray-900">{selectedRelease.releaseLabel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Distribution Company</label>
                      <p className="text-sm text-gray-900">{selectedRelease.distributionCompany}</p>
                    </div>
                  </div>
                </div>

                {/* Copyright Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Copyright Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Copyright Year</label>
                      <p className="text-sm text-gray-900">{selectedRelease.copyrightYear}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Copyright Owner</label>
                      <p className="text-sm text-gray-900">{selectedRelease.copyrightOwner}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">℗ P Line</label>
                      <p className="text-sm text-gray-900">{selectedRelease.pLine}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">© C Line</label>
                      <p className="text-sm text-gray-900">{selectedRelease.cLine}</p>
                    </div>
                  </div>
                </div>

                {/* Publishing Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Publishing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Composer / Author</label>
                      <p className="text-sm text-gray-900">{selectedRelease.composerAuthor}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="text-sm text-gray-900">{selectedRelease.role}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PRO</label>
                      <p className="text-sm text-gray-900">{selectedRelease.pro}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CAE/IPI</label>
                      <p className="text-sm text-gray-900">{selectedRelease.caeIpi}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publishing}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publisher IPI</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publisherIpi}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Admin</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publishingAdmin}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Admin IPI</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publishingAdminIpi}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mechanical</label>
                      <p className="text-sm text-gray-900">{selectedRelease.mechanical}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BMI Work #</label>
                      <p className="text-sm text-gray-900">{selectedRelease.bmiWorkNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ASCAP Work #</label>
                      <p className="text-sm text-gray-900">{selectedRelease.ascapWorkNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISNI</label>
                      <p className="text-sm text-gray-900">{selectedRelease.isni}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sub-Publisher</label>
                      <p className="text-sm text-gray-900">{selectedRelease.subPublisher}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Type</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publishingType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Territory</label>
                      <p className="text-sm text-gray-900">{selectedRelease.territory}</p>
                    </div>
                  </div>
                </div>

                {/* Production Credits */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Production Credits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Executive Producer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.executiveProducer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Producer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.producer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mixing Engineer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.mixingEngineer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Engineer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.masteringEngineer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Co-Producer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.coProducer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assistant Producer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.assistantProducer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Engineer / Editing</label>
                      <p className="text-sm text-gray-900">{selectedRelease.engineerEditing}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Studio</label>
                      <p className="text-sm text-gray-900">{selectedRelease.masteringStudio}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Engineer</label>
                      <p className="text-sm text-gray-900">{selectedRelease.recordingEngineer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Production</label>
                      <p className="text-sm text-gray-900">{selectedRelease.additionalProduction}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Studio</label>
                      <p className="text-sm text-gray-900">{selectedRelease.recordingStudio}</p>
                    </div>
                  </div>
                </div>

                {/* Instrumentation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Instrumentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keyboards</label>
                      <p className="text-sm text-gray-900">{selectedRelease.keyboards}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Programming</label>
                      <p className="text-sm text-gray-900">{selectedRelease.programming}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bass</label>
                      <p className="text-sm text-gray-900">{selectedRelease.bass}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Drums</label>
                      <p className="text-sm text-gray-900">{selectedRelease.drums}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guitars</label>
                      <p className="text-sm text-gray-900">{selectedRelease.guitars}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organ</label>
                      <p className="text-sm text-gray-900">{selectedRelease.organ}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Percussion</label>
                      <p className="text-sm text-gray-900">{selectedRelease.percussion}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Strings</label>
                      <p className="text-sm text-gray-900">{selectedRelease.strings}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Instrumentation</label>
                      <p className="text-sm text-gray-900">{selectedRelease.additionalInstrumentation}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Design / Art Direction</label>
                      <p className="text-sm text-gray-900">{selectedRelease.designArtDirection}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Management</label>
                      <p className="text-sm text-gray-900">{selectedRelease.management}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking Agent</label>
                      <p className="text-sm text-gray-900">{selectedRelease.bookingAgent}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Press Contact</label>
                      <p className="text-sm text-gray-900">{selectedRelease.pressContact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact Email</label>
                      <p className="text-sm text-gray-900">{selectedRelease.primaryContactEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Email</label>
                      <p className="text-sm text-gray-900">{selectedRelease.artistEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact #</label>
                      <p className="text-sm text-gray-900">{selectedRelease.primaryContactNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secondary Contact #</label>
                      <p className="text-sm text-gray-900">{selectedRelease.secondaryContactNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Digital Links */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Digital Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wikipedia</label>
                      <p className="text-sm text-gray-900">{selectedRelease.wikipedia}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Social Media</label>
                      <p className="text-sm text-gray-900">{selectedRelease.socialMediaLink}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shazam</label>
                      <p className="text-sm text-gray-900">{selectedRelease.shazam}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">TikTok</label>
                      <p className="text-sm text-gray-900">{selectedRelease.tiktok}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instagram</label>
                      <p className="text-sm text-gray-900">{selectedRelease.instagram}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genius</label>
                      <p className="text-sm text-gray-900">{selectedRelease.genius}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">AllMusic</label>
                      <p className="text-sm text-gray-900">{selectedRelease.allMusic}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discogs</label>
                      <p className="text-sm text-gray-900">{selectedRelease.discogs}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Musicbrainz</label>
                      <p className="text-sm text-gray-900">{selectedRelease.musicbrainz}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMDb</label>
                      <p className="text-sm text-gray-900">{selectedRelease.imdb}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jaxsta</label>
                      <p className="text-sm text-gray-900">{selectedRelease.jaxsta}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <p className="text-sm text-gray-900">{selectedRelease.website}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">YouTube</label>
                      <p className="text-sm text-gray-900">{selectedRelease.youtube}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">YouTube Music</label>
                      <p className="text-sm text-gray-900">{selectedRelease.youtubeMusic}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Knowledge Panel</label>
                      <p className="text-sm text-gray-900">{selectedRelease.knowledgePanel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tour Dates</label>
                      <p className="text-sm text-gray-900">{selectedRelease.tourDates}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spotify URI</label>
                      <p className="text-sm text-gray-900">{selectedRelease.spotifyUri}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apple ID</label>
                      <p className="text-sm text-gray-900">{selectedRelease.appleId}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Technical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Digital Assets Folder</label>
                      <p className="text-sm text-gray-900">{selectedRelease.digitalAssetsFolder}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Metadata Approved</label>
                      <p className="text-sm text-gray-900">{selectedRelease.metadataApproved}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Initials</label>
                      <p className="text-sm text-gray-900">{selectedRelease.initials}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted to Stores?</label>
                      <p className="text-sm text-gray-900">{selectedRelease.submittedToStores}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Luminate</label>
                      <p className="text-sm text-gray-900">{selectedRelease.luminate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mediabase</label>
                      <p className="text-sm text-gray-900">{selectedRelease.mediabase}</p>
                    </div>
                  </div>
                </div>

                {/* Track Listing */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Track Listing</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ISRC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRelease.trackListing.map((track, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900 font-medium">{index + 1}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{track.title}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{track.duration}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {editingIsrc?.releaseId === selectedRelease.id && editingIsrc?.trackIndex === index ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    value={tempIsrc}
                                    onChange={(e) => setTempIsrc(e.target.value)}
                                    className="px-1 py-1 border border-gray-300 rounded text-xs font-mono w-28"
                                    placeholder="USRC12345678"
                                    maxLength="12"
                                  />
                                  <button
                                    onClick={saveIsrc}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                    title="Save ISRC"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEditingIsrc}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="Cancel"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 group">
                                  <span className="font-mono text-xs">{track.isrc}</span>
                                  <button
                                    onClick={() => startEditingIsrc(selectedRelease.id, index, track.isrc)}
                                    className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity text-xs"
                                    title="Edit ISRC"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Credits */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Credits</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRelease.credits.map((credit, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{credit.role}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{credit.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Feedback</label>
                      <p className="text-sm text-gray-900">{selectedRelease.feedback}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marketing Plan</label>
                      <p className="text-sm text-gray-900">{selectedRelease.marketingPlan}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Notes</label>
                      <p className="text-sm text-gray-900">{selectedRelease.publishingNotes}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900">{selectedRelease.notes}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => downloadReleaseExcel(selectedRelease)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReleaseDetails(false);
                      setSelectedRelease(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Modal */}
        {showEditModal && editingRelease && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative mx-auto p-0 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
              {/* Header - Fixed at top */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Release Metadata - {editingRelease?.projectName || 'Release'}</h3>
                    <div className="flex items-center space-x-3 mt-3">
                      {/* Excel Upload Feature */}
                      <div className="relative">
                        <input
                          type="file"
                          id="excel-upload"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleExcelUpload(e)}
                          className="hidden"
                        />
                        <label
                          htmlFor="excel-upload"
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                            uploadStatus === 'processing' 
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                              : uploadStatus === 'success'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : uploadStatus === 'error'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {uploadStatus === 'processing' ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : uploadStatus === 'success' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Uploaded
                            </>
                          ) : uploadStatus === 'error' ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Error
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Upload Excel
                            </>
                          )}
                        </label>
                        {uploadedData && (
                          <div className="absolute top-full left-0 mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Data loaded from Excel
                          </div>
                        )}
                      </div>
                      
                      {/* Download Template Button */}
                      <button
                        onClick={() => {
                          // Download a template Excel file for the current release
                          downloadSingleReleaseExcel(editingRelease);
                        }}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        title="Download Excel template for this release"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </button>
                      
                      {/* Clear Uploaded Data Button */}
                      {uploadedData && (
                        <button
                          onClick={() => {
                            setUploadedData(null);
                            setUploadStatus(null);
                            // Reset the editing release to original data
                            setEditingRelease(allReleases.find(r => r.id === editingRelease?.id));
                            alert('Uploaded data cleared. Form reset to original values.');
                          }}
                          className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <FaTimes className="w-4 h-4 mr-2" />
                          Clear Data
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Close Button - Top Right */}
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRelease(null);
                      setUploadedData(null);
                      setUploadStatus(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-4"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Excel Upload Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Excel Upload Instructions</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>• Click "Download Template" to get the correct Excel format for this release</p>
                    <p>• Use the "Upload Excel" button to import metadata from an Excel file</p>
                    <p>• The Excel file should follow the same template format as downloaded files</p>
                    <p>• First row should contain headers, second row should contain your data</p>
                    <p>• Only editable fields will be populated from the Excel file</p>
                    <p>• Supported formats: .xlsx, .xls</p>
                    <p>• Use "Clear Data" to reset the form to original values</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 px-6 py-4">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.projectName}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genre (Editable)</label>
                      <select
                        defaultValue={editingRelease?.genre}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {GENRES.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Type (Editable)</label>
                      <select
                        defaultValue={editingRelease?.releaseType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {RELEASE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Song Title (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.songTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.companyName || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Legal Name (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.legalName || editingRelease.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Name (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Title (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.projectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Track Position (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.trackPosition || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Featuring Artists (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.featuringArtists || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Background Vocalists (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.backgroundVocalists || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Audio Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Audio Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.duration}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BPM (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.bpm}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Song Key (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.songKey}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Version (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.version}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Explicit (Editable)</label>
                      <select
                        defaultValue={editingRelease?.explicit}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.language || 'English'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vocal Type (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.vocalType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">File Type (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.fileType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Audio File Name (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.audioFileName || 'To be set by DP'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cover File Name (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.coverFileName || 'To be set by DP'}</p>
                    </div>
                  </div>
                </div>

                {/* Creative Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Creative Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mood Description (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.moodDescription || ''}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.tags}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Lyrics (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.lyrics}
                        rows={4}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Product Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Format (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.format}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Type (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.productType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catalogue No. (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.catalogueNo}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Barcode (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.barcode}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tunecode (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.tunecode}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ICE Work Key (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.iceWorkKey}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISWC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.iswc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISRC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.isrc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UPC (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.upc}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Release Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Release Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BOWI Previously Released (Editable)</label>
                      <select
                        defaultValue={editingRelease?.bowiPreviouslyReleased}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Release Date (Editable)</label>
                      <input
                        type="date"
                        defaultValue={editingRelease?.previousReleaseDate}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Country (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.recordingCountry}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pre-Release Date (Editable)</label>
                      <input
                        type="date"
                        defaultValue={editingRelease?.preReleaseDate}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pre-Release URL (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.preReleaseUrl}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Date (Editable)</label>
                      <input
                        type="date"
                        defaultValue={editingRelease?.releaseDate}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release URL (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.releaseUrl}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Release Label (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.releaseLabel}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Distribution Company (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.distributionCompany || 'YHWH MSC'}</p>
                    </div>
                  </div>
                </div>

                {/* Copyright Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Copyright Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Copyright Year (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.copyrightYear || new Date().getFullYear()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Copyright Owner (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.copyrightOwner || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">℗ P Line (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.pLine}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">© C Line (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.cLine}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Publishing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Composer / Author (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.composerAuthor || editingRelease.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.role}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PRO (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.pro}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CAE/IPI (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.caeIpi}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.publishing || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publisher IPI (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.publisherIpi || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Admin (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.publishingAdmin || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Admin IPI (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.publishingAdminIpi || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mechanical (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.mechanical}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BMI Work # (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.bmiWorkNumber}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ASCAP Work # (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.ascapWorkNumber}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISNI (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.isni}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sub-Publisher (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.subPublisher}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Type (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.publishingType}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Territory (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.territory}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Production Credits */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Production Credits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Executive Producer (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.executiveProducer || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Producer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.producer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mixing Engineer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.mixingEngineer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Engineer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.masteringEngineer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Co-Producer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.coProducer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assistant Producer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.assistantProducer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Engineer / Editing (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.engineerEditing}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Studio (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.masteringStudio}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Engineer (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.recordingEngineer}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Production (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.additionalProduction}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Studio (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.recordingStudio}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Instrumentation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Instrumentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keyboards (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.keyboards}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Programming (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.programming}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bass (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.bass}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Drums (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.drums}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guitars (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.guitars}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organ (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.organ}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Percussion (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.percussion}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Strings (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.strings}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Instrumentation (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.additionalInstrumentation}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Design / Art Direction (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.designArtDirection || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Management (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.management}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking Agent (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.bookingAgent}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Press Contact (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.pressContact}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact Email (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.primaryContactEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Email (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.artistEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact # (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.primaryContactNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secondary Contact # (Read Only)</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.secondaryContactNumber || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Digital Links */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Digital Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wikipedia (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.wikipedia}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Social Media (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.socialMediaLink}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shazam (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.shazam}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">TikTok (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.tiktok}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instagram (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.instagram}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genius (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.genius}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">AllMusic (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.allMusic}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discogs (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.discogs}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Musicbrainz (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.musicbrainz}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMDb (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.imdb}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jaxsta (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.jaxsta}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.website}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">YouTube (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.youtube}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">YouTube Music (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.youtubeMusic}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Knowledge Panel (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.knowledgePanel}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tour Dates (Editable)</label>
                      <input
                        type="url"
                        defaultValue={editingRelease?.tourDates}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spotify URI (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.spotifyUri}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apple ID (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.appleId}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Technical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Digital Assets Folder (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.digitalAssetsFolder}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Metadata Approved (Editable)</label>
                      <select
                        defaultValue={editingRelease?.metadataApproved}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Initials (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.initials}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted to Stores? (Editable)</label>
                      <select
                        defaultValue={editingRelease?.submittedToStores}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Luminate (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.luminate}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mediabase (Editable)</label>
                      <input
                        type="text"
                        defaultValue={editingRelease?.mediabase}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Track Listing */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Track Listing</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ISRC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingRelease?.trackListing?.map((track, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900 font-medium">{index + 1}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{track.title}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{track.duration}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {editingIsrc?.releaseId === editingRelease.id && editingIsrc?.trackIndex === index ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    value={tempIsrc}
                                    onChange={(e) => setTempIsrc(e.target.value)}
                                    className="px-1 py-1 border border-gray-300 rounded text-xs font-mono w-28"
                                    placeholder="USRC12345678"
                                    maxLength="12"
                                  />
                                  <button
                                    onClick={saveIsrc}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                    title="Save ISRC"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEditingIsrc}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="Cancel"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 group">
                                  <span className="font-mono text-xs">{track.isrc}</span>
                                  <button
                                    onClick={() => startEditingIsrc(editingRelease.id, index, track.isrc)}
                                    className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity text-xs"
                                    title="Edit ISRC"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Credits */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Credits</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingRelease?.credits?.map((credit, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{credit.role}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{credit.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Feedback (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.feedback}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marketing Plan (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.marketingPlan}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publishing Notes (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.publishingNotes}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes (Editable)</label>
                      <textarea
                        defaultValue={editingRelease?.notes}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Metadata - Read Only */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Metadata (Read Only)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Composer / Author</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.composer || editingRelease.artist}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Executive Producer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.executiveProducer || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Producer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.producer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mixing Engineer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.mixingEngineer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Engineer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.masteringEngineer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Co-Producer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.coProducer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assistant Producer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.assistantProducer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Engineer / Editing</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.engineer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mastering Studio</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.masteringStudio || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Engineer</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.recordingEngineer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Production</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.additionalProduction || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recording Studio</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.recordingStudio || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keyboards</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.keyboards || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Programming</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.programming || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bass</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.bass || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Drums</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.drums || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guitars</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.guitars || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organ</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.organ || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Percussion</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.percussion || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Strings</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.strings || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Instrumentation</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.additionalInstrumentation || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Design/Art Direction</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.designArtDirection || 'YHWH MSC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Management</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.management || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking Agent</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.bookingAgent || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Press Contact</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.pressContact || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact Email</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.primaryContactEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Artist Email</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.artistEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Contact #</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.primaryContactNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secondary Contact #</label>
                      <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded">{editingRelease?.secondaryContactNumber || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Save changes logic would go here
                      console.log('Saving changes to release:', editingRelease?.id);
                      setShowEditModal(false);
                      setEditingRelease(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRelease(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setIsEditingProfile(false);
                    setEditProfileData({ ...profileData });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Content */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleProfileSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleProfileCancel}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editProfileData.firstName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profileData.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editProfileData.lastName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profileData.lastName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={editProfileData.email}
                          onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Company Information</h4>
                      <p className="text-sm text-gray-600">Code Group</p>
                      <p className="text-sm text-gray-600">Distribution Partner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 