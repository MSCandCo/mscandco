import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Refreshing cache for label admin releases:', req.user.email);

    // Mark all label's releases for cache refresh
    const { data, error } = await supabase
      .from('releases')
      .update({ 
        cache_updated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('label_admin_id', req.user.id)
      .select('id, release_title');

    if (error) {
      console.error('Cache refresh error:', error);
      return res.status(500).json({ error: 'Failed to refresh cache' });
    }

    console.log('✅ Cache refresh completed for', data.length, 'label releases');
    
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

export default requireAuth(handler)