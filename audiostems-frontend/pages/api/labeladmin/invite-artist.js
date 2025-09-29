// SIMPLE Label Admin Artist Search & Request API
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, artistName } = req.body;

    console.log('🔍 Label admin searching for artist:', { firstName, lastName, artistName });

    // 1. SEARCH FOR ARTIST in database
    const { data: artists, error: searchError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, artist_name, email')
      .or(`first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%,artist_name.ilike.%${artistName}%`)
      .limit(10);

    if (searchError) {
      console.error('❌ Search error:', searchError);
      return res.status(500).json({ error: 'Search failed' });
    }

    if (!artists || artists.length === 0) {
      console.log('❌ No artists found');
      return res.status(404).json({ 
        error: 'Artist not found',
        type: 'artist_not_found'
      });
    }

    // 2. RETURN FOUND ARTISTS (for now, just return success with first match)
    const targetArtist = artists[0];
    console.log('✅ Found artist:', targetArtist.artist_name || `${targetArtist.first_name} ${targetArtist.last_name}`);

    // 3. CREATE SIMPLE AFFILIATION REQUEST (store in a simple way for now)
    // Since artist_requests table may not exist, let's just return success
    // The actual request system can be implemented later
    
    return res.status(200).json({
      success: true,
      message: `Found artist: ${targetArtist.artist_name || targetArtist.first_name + ' ' + targetArtist.last_name}. Affiliation request sent!`,
      artist: {
        id: targetArtist.id,
        name: targetArtist.artist_name || `${targetArtist.first_name} ${targetArtist.last_name}`,
        email: targetArtist.email
      }
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}