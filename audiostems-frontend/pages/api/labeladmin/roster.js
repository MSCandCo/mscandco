import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const labelAdminId = req.user.id;
    const labelAdminEmail = req.user.email;

    console.log('Loading roster for label admin:', labelAdminEmail);

    // First, get all accepted artists for this label admin
    const acceptedArtistsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'}/api/labeladmin/accepted-artists`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    if (!acceptedArtistsResponse.ok) {
      throw new Error('Failed to load accepted artists');
    }

    const { artists: acceptedArtists } = await acceptedArtistsResponse.json();
    const artistIds = acceptedArtists.map(artist => artist.artistId);

    if (artistIds.length === 0) {
      return res.status(200).json({
        success: true,
        roster: [],
        count: 0
      });
    }

    // Get all releases from connected artists
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, title, artist_id, contributors, created_at')
      .in('artist_id', artistIds);

    if (releasesError) {
      console.error('Error loading releases:', releasesError);
      return res.status(500).json({ error: 'Failed to load releases' });
    }

    // Extract all contributors from all releases
    const contributorMap = new Map();

    releases?.forEach(release => {
      if (release.contributors && Array.isArray(release.contributors)) {
        release.contributors.forEach(contributor => {
          const contributorKey = `${contributor.name}-${contributor.email || contributor.type}`;
          
          if (contributorMap.has(contributorKey)) {
            // Add this release to existing contributor
            const existing = contributorMap.get(contributorKey);
            existing.releases.push({
              id: release.id,
              title: release.title,
              artist_id: release.artist_id,
              created_at: release.created_at
            });
            // Update last active date
            if (new Date(release.created_at) > new Date(existing.last_active)) {
              existing.last_active = release.created_at;
            }
          } else {
            // Create new contributor entry
            contributorMap.set(contributorKey, {
              id: contributor.id || `${contributorKey}-${Date.now()}`,
              name: contributor.name,
              email: contributor.email,
              phone: contributor.phone,
              type: contributor.type || contributor.role || 'contributor',
              role: contributor.role || contributor.type || 'contributor',
              isni: contributor.isni,
              avatar: contributor.avatar,
              created_at: release.created_at,
              last_active: release.created_at,
              releases: [{
                id: release.id,
                title: release.title,
                artist_id: release.artist_id,
                created_at: release.created_at
              }]
            });
          }
        });
      }
    });

    // Convert map to array and sort by name
    const roster = Array.from(contributorMap.values()).sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );

    // Add artist information to releases
    const artistMap = new Map(acceptedArtists.map(artist => [artist.artistId, artist]));
    
    roster.forEach(contributor => {
      contributor.releases = contributor.releases.map(release => ({
        ...release,
        artist_name: artistMap.get(release.artist_id)?.artistName || 'Unknown Artist'
      }));
    });

    console.log(`Found ${roster.length} unique contributors from ${releases?.length || 0} releases`);

    return res.status(200).json({
      success: true,
      roster,
      count: roster.length,
      releases_count: releases?.length || 0,
      artists_count: artistIds.length
    });

  } catch (error) {
    console.error('Error fetching roster:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default requirePermission('roster:view:own')(handler);
