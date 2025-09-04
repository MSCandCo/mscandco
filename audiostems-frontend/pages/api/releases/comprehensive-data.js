// Comprehensive Releases API - Real Database Integration
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get requesting user info
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !requestingUser) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Get user role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to get user profile' });
    }

    const userRole = userProfile.role;
    console.log('🎵 Comprehensive releases API called by:', requestingUser.email, 'Role:', userRole);

    // Build query based on user role
    let query = supabase
      .from('releases')
      .select(`
        *,
        artist:user_profiles!releases_artist_id_fkey(
          id,
          first_name,
          last_name,
          artist_name,
          email,
          role
        ),
        label_admin:user_profiles!releases_label_admin_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `);

    // Filter based on user role
    switch (userRole) {
      case 'artist':
        query = query.eq('artist_id', requestingUser.id);
        break;
      case 'label_admin':
        query = query.eq('label_admin_id', requestingUser.id);
        break;
      case 'company_admin':
      case 'super_admin':
      case 'distribution_partner':
        // These roles can see all releases
        break;
      default:
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Add filters from query parameters
    const { status, genre, artist_id } = req.query;
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (genre && genre !== 'all') {
      query = query.eq('genre', genre);
    }
    
    if (artist_id) {
      query = query.eq('artist_id', artist_id);
    }

    // Execute query
    const { data: releases, error: releasesError } = await query.order('created_at', { ascending: false });

    if (releasesError) {
      console.error('Error fetching releases:', releasesError);
      return res.status(500).json({ error: 'Failed to fetch releases' });
    }

    // Enhance releases with computed fields
    const enhancedReleases = releases.map(release => ({
      ...release,
      // Display names
      artistDisplayName: release.artist?.artist_name || 
                        `${release.artist?.first_name || ''} ${release.artist?.last_name || ''}`.trim() ||
                        release.artist?.email,
      
      labelAdminDisplayName: release.label_admin ? 
                            `${release.label_admin.first_name || ''} ${release.label_admin.last_name || ''}`.trim() ||
                            release.label_admin.email : 'Independent',
      
      // Formatted dates
      releaseDateFormatted: release.release_date ? 
                           new Date(release.release_date).toLocaleDateString() : 'Not set',
      
      submissionDateFormatted: release.submission_date ? 
                              new Date(release.submission_date).toLocaleDateString() : 'Not submitted',
      
      // Status display
      statusDisplay: release.status.charAt(0).toUpperCase() + release.status.slice(1).replace('_', ' '),
      
      // Asset availability
      hasArtwork: !!release.artwork_url,
      hasAudio: !!release.audio_file_url,
      
      // Distribution readiness
      distributionReady: !!(
        release.artwork_url && 
        release.audio_file_url && 
        release.title && 
        release.artist_name && 
        release.release_date &&
        release.isrc
      ),
      
      // Platform stats summary
      totalStreams: release.platform_stats?.totalStreams || 0,
      totalRevenue: release.platform_stats?.totalRevenue || 0
    }));

    // Generate statistics
    const stats = {
      total: enhancedReleases.length,
      byStatus: {
        draft: enhancedReleases.filter(r => r.status === 'draft').length,
        submitted: enhancedReleases.filter(r => r.status === 'submitted').length,
        in_review: enhancedReleases.filter(r => r.status === 'in_review').length,
        approved: enhancedReleases.filter(r => r.status === 'approved').length,
        live: enhancedReleases.filter(r => r.status === 'live').length,
        rejected: enhancedReleases.filter(r => r.status === 'rejected').length
      },
      byType: {
        single: enhancedReleases.filter(r => r.release_type === 'single').length,
        ep: enhancedReleases.filter(r => r.release_type === 'ep').length,
        album: enhancedReleases.filter(r => r.release_type === 'album').length,
        compilation: enhancedReleases.filter(r => r.release_type === 'compilation').length
      },
      distributionReady: enhancedReleases.filter(r => r.distributionReady).length,
      totalStreams: enhancedReleases.reduce((sum, r) => sum + r.totalStreams, 0),
      totalRevenue: enhancedReleases.reduce((sum, r) => sum + r.totalRevenue, 0)
    };

    console.log('🎵 Real releases data loaded:', stats);

    return res.status(200).json({
      success: true,
      releases: enhancedReleases,
      stats,
      userRole,
      message: `Loaded ${enhancedReleases.length} releases with real database data`
    });

  } catch (error) {
    console.error('Comprehensive releases API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
