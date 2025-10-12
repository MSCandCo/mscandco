import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  const { id } = req.query;
  const userId = req.user?.id;

  console.log('Release update API called:', { id, method: req.method, userId });

  if (req.method === 'PUT') {
    try {
      // Get the release to verify ownership
      const { data: release, error: fetchError } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return res.status(404).json({ error: 'Release not found' });
      }

      if (!release) {
        return res.status(404).json({ error: 'Release not found' });
      }

      if (release.artist_id !== userId) {
        console.error('Authorization failed:', { releaseArtistId: release.artist_id, userId });
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Update the release
      const { data, error } = await supabase
        .from('releases')
        .update({
          ...req.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log('Release updated successfully:', data);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error updating release:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
