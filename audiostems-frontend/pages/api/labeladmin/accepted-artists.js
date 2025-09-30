// ACCEPTED ARTISTS API - Shows artists that accepted label partnerships
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // PROPER AUTHENTICATION - No hardcoded IDs
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('👥 Fetching accepted artists for label admin:', user.id);

    const { data, error: fetchError } = await supabase
      .from('artist_label_relationships')
      .select(`
        *,
        artist:user_profiles!artist_id(id, first_name, last_name, artist_name, email)
      `)
      .eq('label_admin_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching accepted artists:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    console.log(`✅ Found ${data.length} accepted artists`);

    // Format the response
    const formattedArtists = data.map(relationship => ({
      id: relationship.id,
      artistId: relationship.artist.id,
      artistName: relationship.artist.artist_name || `${relationship.artist.first_name} ${relationship.artist.last_name}`,
      artistEmail: relationship.artist.email,
      labelSplit: relationship.label_split_percentage,
      artistSplit: relationship.artist_split_percentage,
      joinDate: relationship.created_at,
      status: relationship.status
    }));

    return res.json({ 
      success: true,
      artists: formattedArtists 
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
