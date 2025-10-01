// REMOVE ARTIST FROM LABEL ROSTER
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405);
  
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) return res.status(401).json({ error: 'Not authenticated' });

  const { relationship_id } = req.body;

  if (!relationship_id) {
    return res.status(400).json({ error: 'Relationship ID required' });
  }

  try {
    console.log('🗑️ Removing artist from roster:', relationship_id);

    // Get the relationship to get artist_id
    const { data: relationship, error: fetchError } = await supabase
      .from('artist_label_relationships')
      .select('artist_id')
      .eq('id', relationship_id)
      .eq('label_admin_id', user.id) // Security: only remove own relationships
      .single();

    if (fetchError || !relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Update relationship status to inactive
    const { error: updateError } = await supabase
      .from('artist_label_relationships')
      .update({ status: 'inactive' })
      .eq('id', relationship_id)
      .eq('label_admin_id', user.id);

    if (updateError) {
      console.error('❌ Error updating relationship:', updateError);
      return res.status(500).json({ error: 'Failed to remove artist' });
    }

    // Remove label_admin_id from releases
    const { data: updatedReleases, error: releaseError } = await supabase
      .from('releases')
      .update({ label_admin_id: null })
      .eq('artist_id', relationship.artist_id)
      .eq('label_admin_id', user.id)
      .select('id');

    if (!releaseError && updatedReleases?.length > 0) {
      console.log(`✅ Unlinked ${updatedReleases.length} releases from label`);
    }

    console.log('✅ Artist removed from roster successfully');

    return res.json({ 
      success: true,
      message: 'Artist removed from roster successfully'
    });

  } catch (error) {
    console.error('❌ Remove artist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
