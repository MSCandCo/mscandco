// INDIVIDUAL ARTIST ANALYTICS FOR LABEL ADMIN
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);

  // req.user and req.userRole are automatically attached by middleware

  const { artist_id } = req.query;
  
  if (!artist_id) {
    return res.status(400).json({ error: 'Artist ID required' });
  }

  try {
    // Verify this artist is managed by this label admin
    const { data: relationship } = await supabase
      .from('artist_label_relationships')
      .select('id')
      .eq('label_admin_id', req.user.id)
      .eq('artist_id', artist_id)
      .eq('status', 'active')
      .single();

    if (!relationship) {
      return res.status(403).json({ error: 'You do not manage this artist' });
    }

    // Get artist's analytics data
    const { data: artistProfile, error } = await supabase
      .from('user_profiles')
      .select('analytics_data, first_name, last_name, artist_name')
      .eq('id', artist_id)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch artist analytics' });
    }

    const analytics = artistProfile.analytics_data || {};
    
    return res.json({
      success: true,
      artist: {
        name: artistProfile.artist_name || `${artistProfile.first_name} ${artistProfile.last_name}`,
        id: artist_id
      },
      analytics: analytics
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Protect with analytics:view:label permission (label admin read access)
export default requirePermission('analytics:view:label')(handler);
