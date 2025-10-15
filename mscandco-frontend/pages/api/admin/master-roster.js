import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📋 Fetching master roster of all contributors...');

    // Fetch all user profiles with their auth data
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        artist_name,
        display_name,
        label_name,
        email,
        role,
        company_name,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching user profiles:', profilesError);
      return res.status(500).json({
        error: 'Failed to fetch user profiles',
        details: profilesError.message
      });
    }

    console.log(`✅ Found ${profiles.length} total contributors`);

    // Build a map of user IDs to their full names for source lookup
    const userMap = {};
    profiles.forEach(profile => {
      // Construct full name based on role and available fields
      let fullName = '';
      if (profile.role === 'artist' && profile.artist_name) {
        fullName = profile.artist_name;
      } else if (profile.role === 'label_admin' && profile.label_name) {
        fullName = profile.label_name;
      } else if (profile.display_name) {
        fullName = profile.display_name;
      } else if (profile.first_name || profile.last_name) {
        fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
      userMap[profile.id] = fullName || profile.email;
    });

    // Enrich profiles with source information
    const enrichedProfiles = profiles.map(profile => {
      // Construct full name for this profile
      let fullName = '';
      if (profile.role === 'artist' && profile.artist_name) {
        fullName = profile.artist_name;
      } else if (profile.role === 'label_admin' && profile.label_name) {
        fullName = profile.label_name;
      } else if (profile.display_name) {
        fullName = profile.display_name;
      } else if (profile.first_name || profile.last_name) {
        fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      return {
        id: profile.id,
        full_name: fullName || 'N/A',
        email: profile.email,
        role: profile.role,
        company_name: profile.company_name || 'N/A',
        source: 'Direct Signup',
        source_user_id: null,
        joined_date: profile.created_at,
        last_updated: profile.updated_at
      };
    });

    // Calculate summary statistics
    const summary = {
      total_contributors: enrichedProfiles.length,
      by_role: enrichedProfiles.reduce((acc, profile) => {
        const role = profile.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {}),
      invited_users: enrichedProfiles.filter(p => p.source_user_id).length,
      direct_signups: enrichedProfiles.filter(p => !p.source_user_id).length,
      by_source: enrichedProfiles.reduce((acc, profile) => {
        const source = profile.source;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {})
    };

    console.log('📊 Master roster summary:', summary);

    return res.status(200).json({
      success: true,
      contributors: enrichedProfiles,
      summary
    });

  } catch (error) {
    console.error('❌ Error in master roster API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// V2 Permission: Requires read permission for master roster
export default requirePermission('users_access:master_roster:read')(handler);
