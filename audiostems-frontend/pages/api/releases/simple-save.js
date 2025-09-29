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
      songTitle,
      // Additional form data to preserve
      secondaryGenre,
      hasPreOrder,
      preOrderDate,
      previouslyReleased,
      previousReleaseDate,
      label,
      upc,
      sellWorldwide,
      territoryRestrictionType,
      territoryRestrictions,
      // Store complete form data as JSON for full persistence
      ...formData
    } = req.body;

    console.log('💾 Simple save request:', { releaseTitle, primaryArtist, releaseType });

    // Insert into releases table with both required fields and form data preservation
    const { data: release, error } = await supabase
      .from('releases')
      .insert({
        artist_id: '0a060de5-1c94-4060-a1c2-860224fc348d',
        artist_name: primaryArtist || 'Unknown Artist',
        title: releaseTitle,
        release_type: 'single',
        release_date: releaseDate ? new Date(releaseDate).toISOString().split('T')[0] : null,
        genre: genre || null,
        subgenre: secondaryGenre || null,
        upc: upc || null,
        territories: territoryRestrictions ? JSON.stringify({
          sellWorldwide,
          restrictionType: territoryRestrictionType,
          countries: territoryRestrictions
        }) : null,
        // Store complete form data in publishing_info for full persistence
        publishing_info: JSON.stringify(req.body),
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
