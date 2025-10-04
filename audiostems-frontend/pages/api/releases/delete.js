// Delete release API
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({ error: 'Release ID is required' });
  }

  try {
    console.log('🗑️ Deleting release:', id);

    // Get the release to verify ownership
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (release.artist_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this release' });
    }

    // Only allow deleting drafts and submitted releases
    if (!['draft', 'submitted'].includes(release.status)) {
      return res.status(400).json({ error: 'Can only delete draft or submitted releases' });
    }

    // Delete the release
    const { error: deleteError } = await supabase
      .from('releases')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Database delete error:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete release',
        details: deleteError.message
      });
    }

    console.log('✅ Release deleted successfully:', id);

    return res.json({
      success: true,
      message: 'Release deleted successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requireAuth(handler);
