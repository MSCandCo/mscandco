// Platform stats API for specific release
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { releaseId } = req.query;

    if (!releaseId) {
      return res.status(400).json({ error: 'Release ID required' });
    }

    if (req.method === 'GET') {
      // Get platform stats for release
      const { data: stats, error } = await supabase
        .from('platform_stats')
        .select('*')
        .eq('release_id', releaseId)
        .order('position');

      if (error) {
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      return res.json({
        success: true,
        data: stats || []
      });
    }

    if (req.method === 'POST') {
      // Create platform stats
      const { platforms } = req.body;

      if (!platforms || !Array.isArray(platforms)) {
        return res.status(400).json({ error: 'Platforms array required' });
      }

      // Delete existing stats for this release
      await supabase
        .from('platform_stats')
        .delete()
        .eq('release_id', releaseId);

      // Insert new stats
      const { data: stats, error } = await supabase
        .from('platform_stats')
        .insert(platforms.map((platform, index) => ({
          release_id: releaseId,
          platform_name: platform.name || '',
          value: platform.streams || platform.value || '',
          percentage: platform.change || platform.percentage || '',
          position: index + 1
        })))
        .select();

      if (error) {
        console.error('❌ Error creating platform stats:', error);
        return res.status(500).json({ error: 'Failed to create platform stats', details: error.message });
      }

      return res.json({
        success: true,
        data: stats,
        message: 'Platform stats created successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Platform stats API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
