// Simple release save API that works with existing database structure
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
    const {
      releaseTitle,
      primaryArtist,
      releaseType,
      genre,
      releaseDate,
      songTitle
    } = req.body;

    console.log('💾 Simple save request:', { releaseTitle, primaryArtist, releaseType });

    // Insert into releases table with required fields
    const { data: release, error } = await supabase
      .from('releases')
      .insert({
        artist_id: '0a060de5-1c94-4060-a1c2-860224fc348d',
        artist_name: primaryArtist || 'Unknown Artist',
        title: releaseTitle,
        release_type: 'single',
        release_date: releaseDate ? new Date(releaseDate).toISOString().split('T')[0] : null,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to create release', 
        details: error.message 
      });
    }

    console.log('✅ Release saved successfully:', release.id);
    
    return res.json({
      success: true,
      data: release,
      message: 'Release saved to draft successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
