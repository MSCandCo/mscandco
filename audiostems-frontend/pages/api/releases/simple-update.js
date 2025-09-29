// Simple release update API
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      id,
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
      // Store complete form data
      ...formData
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Release ID is required' });
    }

    console.log('✏️ Simple update request:', { id, releaseTitle, primaryArtist, releaseType });

    // Update the release in database
    const { data: release, error } = await supabase
      .from('releases')
      .update({
        artist_name: primaryArtist || 'Unknown Artist',
        title: releaseTitle,
        release_type: 'single', // Keep as lowercase
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
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database update error:', error);
      return res.status(500).json({ 
        error: 'Failed to update release', 
        details: error.message 
      });
    }

    console.log('✅ Release updated successfully:', release.id);
    
    return res.json({
      success: true,
      data: release,
      message: 'Release updated successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
