// INDIVIDUAL ARTIST ANALYTICS FOR LABEL ADMIN
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);
  
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) return res.status(401).json({ error: 'Not authenticated' });

  const { artist_id } = req.query;
  
  if (!artist_id) {
    return res.status(400).json({ error: 'Artist ID required' });
  }

  try {
    // Verify this artist is managed by this label admin
    const { data: relationship } = await supabase
      .from('artist_label_relationships')
      .select('id')
      .eq('label_admin_id', user.id)
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
