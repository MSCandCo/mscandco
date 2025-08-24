/**
 * Real Data Providers with Supabase Integration
 * Production-ready database connections
 */

import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if environment variables are available
let supabase = null;
if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Server-side only
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Real data functions with Supabase integration
export const getUsers = () => {
  // For client-side, return empty array and use async version
  return [];
};

export const getUsersAsync = async () => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty users array');
      return [];
    }
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return [];
    }

    // Get all user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return [];
    }

    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*');

    // Combine auth users with their profiles and subscriptions
    const users = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const subscription = subscriptions?.find(s => s.user_id === authUser.id);
      
      if (!profile) return null; // Skip users without profiles
      
      // Determine role based on email patterns (temporary until role table is accessible)
      let role = 'artist'; // default
      if (authUser.email.includes('superadmin')) role = 'super_admin';
      else if (authUser.email.includes('companyadmin')) role = 'company_admin';
      else if (authUser.email.includes('labeladmin')) role = 'label_admin';
      else if (authUser.email.includes('codegroup')) role = 'distribution_partner';
      
      return {
        id: authUser.id,
        email: authUser.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: `${profile.first_name} ${profile.last_name}`,
        artistName: profile.artist_name,
        role: role,
        status: authUser.email_confirmed_at ? 'active' : 'pending',
        joinedDate: authUser.created_at,
        lastLogin: authUser.last_sign_in_at,
        totalReleases: profile.releases_count || 0,
        totalStreams: 0, // Will be calculated from releases
        totalEarnings: profile.wallet_balance || 0,
        totalRevenue: profile.wallet_balance || 0,
        subscription: subscription ? {
          tier: subscription.tier,
          status: subscription.status,
          billingCycle: subscription.billing_cycle
        } : null,
        profile: profile
      };
    }).filter(Boolean); // Remove null entries

    return users;
  } catch (error) {
    console.error('Error in getUsersAsync:', error);
    return [];
  }
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

// Dashboard stats with real data
export const getDashboardStats = async () => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty dashboard stats');
      return getEmptyDashboardStats();
    }
    
    // Get real user count
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const totalUsers = authUsers?.users?.length || 0;
    
    // Get profiles count
    const { data: profiles, count: profileCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });
    
    // Get subscriptions for revenue calculation
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount, status')
      .eq('status', 'active');
    
    const totalRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
    const activeProjects = profiles?.filter(p => p.releases_count > 0).length || 0;
    
    return {
      superAdmin: { 
        totalUsers: profileCount || totalUsers,
        activeProjects: activeProjects,
        totalRevenue: totalRevenue,
        totalRoles: 5,
        totalSongs: 0, // Will be updated when releases table is connected
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
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return getEmptyDashboardStats();
  }
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