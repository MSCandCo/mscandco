// Get latest release for artist
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID required' });
    }

    if (req.method === 'GET') {
      console.log('📊 Fetching latest release for artist:', artistId);

      const { data: release, error } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artistId)
        .eq('is_live', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('❌ Database error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      console.log('📦 Latest release:', release ? `Found: ${release.title}` : 'Not found');

      return res.json({
        success: true,
        data: release || null
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Latest release API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
