// Artist releases API - fetch releases for authenticated artist
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artistId } = req.query;
    
    // Default to Henry's ID if not provided
    const targetArtistId = artistId || '0a060de5-1c94-4060-a1c2-860224fc348d';
    
    console.log('📋 Fetching releases for artist:', targetArtistId);

    // Fetch releases from database
    const { data: releases, error } = await supabase
      .from('releases')
      .select('*')
      .eq('artist_id', targetArtistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching releases:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch releases', 
        details: error.message 
      });
    }

    console.log(`✅ Found ${releases.length} releases for artist ${targetArtistId}`);
    
    // Transform database format to expected format
    const transformedReleases = releases.map(release => ({
      id: release.id,
      title: release.title,
      artist: release.artist_name,
      releaseType: release.release_type,
      status: release.status || 'draft',
      submissionDate: release.submission_date,
      approvalDate: release.approval_date,
      releaseDate: release.release_date,
      genre: release.genre,
      subgenre: release.subgenre,
      upc: release.upc,
      artwork: release.artwork_url,
      createdAt: release.created_at,
      updatedAt: release.updated_at,
      // Include complete database record for editing
      ...release
    }));

    return res.json(transformedReleases);

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
