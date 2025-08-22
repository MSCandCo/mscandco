import { createClient } from '@supabase/supabase-js';
import chartmetricEnhanced from '@/lib/chartmetric-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { artist_name, spotify_url, apple_music_url, chartmetric_id } = req.body;

    // Validate input
    if (!artist_name && !spotify_url && !chartmetric_id) {
      return res.status(400).json({ 
        error: 'Please provide artist name, Spotify URL, or Chartmetric ID' 
      });
    }

    let linkingResult;

    // If Chartmetric ID is provided directly
    if (chartmetric_id) {
      linkingResult = {
        success: true,
        artist: {
          chartmetric_id: chartmetric_id,
          name: artist_name,
          verified: true
        }
      };
    } else {
      // Search for artist in Chartmetric
      linkingResult = await chartmetricEnhanced.searchAndLinkArtist(artist_name, spotify_url);
    }

    if (!linkingResult.success) {
      return res.status(404).json({ 
        error: 'Artist not found in Chartmetric database',
        suggestion: 'Please check the artist name or Spotify URL and try again'
      });
    }

    // If multiple matches, return them for user selection
    if (linkingResult.matches) {
      return res.status(200).json({
        success: true,
        multiple_matches: true,
        matches: linkingResult.matches,
        message: 'Multiple artists found. Please select the correct one.'
      });
    }

    // Link the artist to user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        chartmetric_artist_id: linkingResult.artist.chartmetric_id,
        spotify_artist_id: linkingResult.artist.spotify_id,
        apple_music_artist_id: linkingResult.artist.apple_id,
        youtube_artist_id: linkingResult.artist.youtube_id,
        chartmetric_verified: linkingResult.artist.verified,
        chartmetric_linked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error linking artist profile:', updateError);
      return res.status(500).json({ error: 'Failed to link artist profile' });
    }

    // Get initial analytics data
    const initialAnalytics = await getArtistSpecificAnalytics(user.id, linkingResult.artist.chartmetric_id);

    return res.status(200).json({
      success: true,
      message: 'Artist profile successfully linked to Chartmetric',
      artist: linkingResult.artist,
      profile: updatedProfile,
      initial_analytics: initialAnalytics.success ? initialAnalytics.data : null,
      next_steps: [
        'Analytics data is now available in your dashboard',
        'Social footprint tracking is active',
        'Real-time streaming metrics enabled'
      ]
    });

  } catch (error) {
    console.error('Error in link-artist API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
