// Admin routes for releases management
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  try {
    // req.user and req.userRole are automatically attached by middleware

    if (req.method === 'GET') {
      // Get latest release for artist
      const { artistId } = req.query;
      
      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID required' });
      }

      const { data: release, error } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artistId)
        .eq('is_live', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      return res.json({
        success: true,
        data: release || null
      });
    }

    if (req.method === 'POST') {
      // Create new release
      const {
        artistId,
        title,
        artist,
        featuring,
        releaseDate,
        releaseType,
        audioFileUrl,
        coverImageUrl,
        isLive
      } = req.body;

      // If setting as live, unset other live releases
      if (isLive) {
        await supabase
          .from('releases')
          .update({ is_live: false })
          .eq('artist_id', artistId);
      }

      const { data: release, error } = await supabase
        .from('releases')
        .insert({
          artist_id: artistId,
          title: title || '',
          artist: artist || '',
          featuring: featuring || null,
          release_date: releaseDate || null,
          release_type: releaseType || '',
          audio_file_url: audioFileUrl || null,
          cover_image_url: coverImageUrl || null,
          is_live: isLive || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating release:', error);
        return res.status(500).json({ error: 'Failed to create release', details: error.message });
      }

      console.log('✅ Release created:', release.id);
      return res.json({
        success: true,
        data: release,
        message: 'Release created successfully'
      });
    }

    if (req.method === 'PUT') {
      // Update existing release
      const { id } = req.query;
      const updateData = req.body;

      const { data: release, error } = await supabase
        .from('releases')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update release', details: error.message });
      }

      return res.json({
        success: true,
        data: release,
        message: 'Release updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Releases API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export default requirePermission('release:view:any')(handler);