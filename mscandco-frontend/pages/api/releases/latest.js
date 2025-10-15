import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to fetch latest releases for homepage display
 * Returns releases with genre-based distribution:
 * - 30% Gospel
 * - 20% CCM (Contemporary Christian Music)
 * - 20% UK Gospel/Christian
 * - 20% Nigerian Gospel/Christian
 * - 10% Rest of Africa Gospel/Christian
 */

// Genre mapping for distribution
const GENRE_CATEGORIES = {
  GOSPEL: ['Gospel', 'Gospel Music', 'Traditional Gospel'],
  CCM: ['CCM', 'Contemporary Christian', 'Christian Contemporary', 'Christian Pop', 'Christian Rock'],
  UK_GOSPEL: ['UK Gospel', 'UK Christian', 'British Gospel', 'British Christian'],
  NIGERIAN_GOSPEL: ['Nigerian Gospel', 'Nigerian Christian', 'Afro Gospel', 'African Gospel'],
  AFRICAN_GOSPEL: ['African Christian', 'South African Gospel', 'Ghanaian Gospel', 'African Worship']
};

function categorizeGenre(genre, subgenre, country) {
  const genreLower = (genre || '').toLowerCase();
  const subgenreLower = (subgenre || '').toLowerCase();
  const countryLower = (country || '').toLowerCase();

  // Check for UK Gospel/Christian
  if (countryLower.includes('uk') || countryLower.includes('united kingdom') || countryLower.includes('british')) {
    if (genreLower.includes('gospel') || genreLower.includes('christian')) {
      return 'UK_GOSPEL';
    }
  }

  // Check for Nigerian Gospel/Christian
  if (countryLower.includes('nigeria') || genreLower.includes('afro') || genreLower.includes('afrobeat')) {
    if (genreLower.includes('gospel') || genreLower.includes('christian')) {
      return 'NIGERIAN_GOSPEL';
    }
  }

  // Check for other African countries
  const africanCountries = ['ghana', 'south africa', 'kenya', 'uganda', 'tanzania', 'zimbabwe'];
  if (africanCountries.some(c => countryLower.includes(c))) {
    if (genreLower.includes('gospel') || genreLower.includes('christian')) {
      return 'AFRICAN_GOSPEL';
    }
  }

  // Check for CCM
  if (genreLower.includes('ccm') || genreLower.includes('contemporary christian') ||
      (genreLower.includes('christian') && (genreLower.includes('pop') || genreLower.includes('rock')))) {
    return 'CCM';
  }

  // Check for traditional Gospel
  if (genreLower.includes('gospel')) {
    return 'GOSPEL';
  }

  return 'OTHER';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Create Supabase client with service role for server-side access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch latest releases that are live/published
    const { data: releases, error } = await supabase
      .from('releases')
      .select(`
        id,
        title,
        artist_name,
        artwork_url,
        genre,
        subgenre,
        status,
        release_date,
        created_at
      `)
      .in('status', ['live', 'published', 'approved'])
      .order('release_date', { ascending: false })
      .limit(100); // Fetch more to ensure we have enough in each category

    if (error) {
      console.error('Error fetching releases:', error);
      return res.status(200).json({
        success: false,
        error: 'Failed to fetch releases',
        data: []
      });
    }

    // Categorize releases by genre
    const categorized = {
      GOSPEL: [],
      CCM: [],
      UK_GOSPEL: [],
      NIGERIAN_GOSPEL: [],
      AFRICAN_GOSPEL: [],
      OTHER: []
    };

    (releases || []).forEach(release => {
      if (!release.artwork_url || release.artwork_url === '/placeholder-artwork.jpg') {
        return; // Skip releases without valid artwork
      }

      const category = categorizeGenre(release.genre, release.subgenre, null);
      categorized[category].push({
        id: release.id,
        title: release.title || 'Untitled',
        artist: release.artist_name || 'Unknown Artist',
        thumbnail: release.artwork_url,
        genre: release.genre || 'Music',
        youtubeUrl: null,
        source: 'database'
      });
    });

    // Calculate target counts for 20 total releases
    const totalTarget = 20;
    const distribution = {
      GOSPEL: Math.round(totalTarget * 0.30), // 6 releases (30%)
      CCM: Math.round(totalTarget * 0.20),    // 4 releases (20%)
      UK_GOSPEL: Math.round(totalTarget * 0.20), // 4 releases (20%)
      NIGERIAN_GOSPEL: Math.round(totalTarget * 0.20), // 4 releases (20%)
      AFRICAN_GOSPEL: Math.round(totalTarget * 0.10)  // 2 releases (10%)
    };

    // Build the final release list with proper distribution
    const finalReleases = [];

    Object.keys(distribution).forEach(category => {
      const count = distribution[category];
      const available = categorized[category];
      const toAdd = available.slice(0, count);
      finalReleases.push(...toAdd);
      console.log(`✅ Added ${toAdd.length}/${count} ${category} releases`);
    });

    console.log(`✅ Fetched ${finalReleases.length} releases with genre distribution for homepage`);

    return res.status(200).json({
      success: true,
      data: finalReleases,
      count: finalReleases.length,
      distribution: {
        gospel: categorized.GOSPEL.length,
        ccm: categorized.CCM.length,
        uk_gospel: categorized.UK_GOSPEL.length,
        nigerian_gospel: categorized.NIGERIAN_GOSPEL.length,
        african_gospel: categorized.AFRICAN_GOSPEL.length
      }
    });

  } catch (error) {
    console.error('Unexpected error in /api/releases/latest:', error);
    return res.status(200).json({
      success: false,
      error: 'Internal server error',
      data: []
    });
  }
}
