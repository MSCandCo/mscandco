/**
 * Real Data Providers with Supabase Integration
 * Empty states until real data is added through admin interface
 */

// TODO: Replace with real Supabase queries when database is ready
const SUPABASE_CONNECTION = {
  users: null, // Will connect to Supabase users table
  releases: null, // Will connect to Supabase releases table
  artists: null, // Will connect to Supabase artists table
  songs: null // Will connect to Supabase songs table
};

// Real data functions (currently return empty states)
export const getUsers = () => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('users').select('*');
  return [];
};

export const getUsersAsync = async () => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('users').select('*');
  return [];
};

export const getUserById = (id) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return null;
};

export const getUserByIdAsync = async (id) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return null;
};

export const getReleases = () => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('releases').select('*');
  return [];
};

export const getReleasesByArtist = (artistId) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('releases').select('*').eq('artist_id', artistId);
  return [];
};

export const getArtistById = (id) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('artists').select('*').eq('id', id).single();
  return null;
};

export const getApprovedArtistsByLabel = (labelId) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('artists').select('*').eq('label_id', labelId).eq('status', 'approved');
  return [];
};

// Async versions for future API calls
export const getReleasesAsync = async () => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('releases').select('*');
  return [];
};

export const getReleasesByArtistAsync = async (artistId) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('releases').select('*').eq('artist_id', artistId);
  return [];
};

export const getArtistByIdAsync = async (id) => {
  // TODO: Replace with Supabase query: const { data } = await supabase.from('artists').select('*').eq('id', id).single();
  return null;
};

// Dashboard stats - returns zeros until real data exists
export const getDashboardStats = async () => {
  // TODO: Replace with real Supabase aggregation queries
  return {
    superAdmin: { 
      totalUsers: 0, 
      activeProjects: 0, 
      totalRevenue: 0,
      totalRoles: 5,
      totalSongs: 0,
      totalBrands: 2,
      systemFeatures: 12
    },
    companyAdmin: { 
      activeProjects: 0, 
      brandRevenue: 0, 
      contentItems: 0,
      brandUsers: 0,
      brandRoles: 3,
      totalViews: 0,
      engagement: 0
    },
    labelAdmin: { 
      labelArtists: 0, 
      labelReleases: 0, 
      labelRevenue: 0,
      labelStreams: 0,
      activeContracts: 0,
      labelCountries: 0,
      totalTracks: 0
    },
    distributionPartner: { 
      distributedContent: 0, 
      partnerRevenue: 0,
      totalReleases: 0,
      successRate: 100,
      totalViews: 0
    },
    artist: { 
      totalStreams: 0, 
      countries: 0, 
      topTrack: 'No tracks yet',
      growth: 0
    }
  };
};

// Empty collections - will be populated from Supabase
export const ARTISTS = [];
export const RELEASES = [];
export const SONGS = [];
export const ADMINS = [];

// Helper function to get dashboard stats synchronously (for components that need immediate access)
export const getEmptyDashboardStats = () => ({
  superAdmin: { totalUsers: 0, activeProjects: 0, totalRevenue: 0, totalRoles: 5, totalSongs: 0, totalBrands: 2, systemFeatures: 12, totalReleases: 0 },
  companyAdmin: { activeProjects: 0, brandRevenue: 0, contentItems: 0, brandUsers: 0, brandRoles: 3, totalViews: 0, engagement: 0 },
  labelAdmin: { labelArtists: 0, labelReleases: 0, labelRevenue: 0, labelStreams: 0, activeContracts: 0, labelCountries: 0, totalTracks: 0 },
  distributionPartner: { distributedContent: 0, partnerRevenue: 0, totalReleases: 0, successRate: 100, totalViews: 0 },
  artist: { totalStreams: 0, countries: 0, topTrack: 'No tracks yet', growth: 0 }
});

export const DASHBOARD_STATS = getEmptyDashboardStats();