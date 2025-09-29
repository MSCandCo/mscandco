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

    // 3. CREATE AFFILIATION REQUEST in database
    const { message, labelPercentage = 15.0 } = req.body; // Default 15% for label
    
    // Get the actual label admin ID from the database
    const { data: labelAdmin, error: labelError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'labeladmin@mscandco.com')
      .single();

    if (labelError || !labelAdmin) {
      console.error('❌ Label admin not found in database:', labelError);
      return res.status(500).json({ 
        error: 'Label admin profile not found',
        details: labelError?.message
      });
    }

    console.log('✅ Found label admin:', labelAdmin.id);

    const { data: newRequest, error: insertError } = await supabase
      .from('artist_invitations')
      .insert({
        label_admin_id: labelAdmin.id,
        artist_id: targetArtist.id,
        artist_first_name: firstName,
        artist_last_name: lastName,
        artist_search_name: artistName,
        personal_message: message || `MSC & Co would like to partner with you as our label with ${labelPercentage}% revenue sharing.`,
        label_split_percentage: labelPercentage,
        artist_split_percentage: 100 - labelPercentage,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating affiliation request:', insertError);
      console.error('❌ Detailed error:', JSON.stringify(insertError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to create affiliation request',
        details: insertError.message
      });
    }

    console.log('✅ Affiliation request created:', newRequest.id);
    
    return res.status(200).json({
      success: true,
      message: `Affiliation request sent to ${targetArtist.artist_name || targetArtist.first_name + ' ' + targetArtist.last_name}!`,
      request: {
        id: newRequest.id,
        artistName: targetArtist.artist_name || `${targetArtist.first_name} ${targetArtist.last_name}`,
        artistEmail: targetArtist.email,
        labelPercentage: labelPercentage,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}