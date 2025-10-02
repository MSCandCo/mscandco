import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    console.log('🔄 Refreshing cache for artist releases:', user.email);

    // Mark all artist's releases for cache refresh
    const { data, error } = await supabase
      .from('releases')
      .update({ 
        cache_updated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('artist_id', user.id)
      .select('id, release_title');

    if (error) {
      console.error('Cache refresh error:', error);
      return res.status(500).json({ error: 'Failed to refresh cache' });
    }

    console.log('✅ Cache refresh completed for', data.length, 'releases');
    
    return res.status(200).json({ 
      success: true, 
      refreshed: data.length,
      releases: data 
    });

  } catch (error) {
    console.error('Cache refresh API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
