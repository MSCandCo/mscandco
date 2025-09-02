// Test analytics database tables
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    console.log('🔍 Testing analytics database tables...');

    // Test artist_releases table
    const { data: releases, error: releasesError } = await supabase
      .from('artist_releases')
      .select('*')
      .limit(1);

    console.log('📦 artist_releases table:', { 
      exists: !releasesError, 
      error: releasesError?.message,
      sampleData: releases?.[0] 
    });

    // Test artist_milestones table
    const { data: milestones, error: milestonesError } = await supabase
      .from('artist_milestones')
      .select('*')
      .limit(1);

    console.log('🏆 artist_milestones table:', { 
      exists: !milestonesError, 
      error: milestonesError?.message,
      sampleData: milestones?.[0] 
    });

    // Test with a specific artist ID
    const testArtistId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry Taylor
    
    const { data: artistReleases, error: artistReleasesError } = await supabase
      .from('artist_releases')
      .select('*')
      .eq('artist_id', testArtistId);

    console.log('👤 Henry Taylor releases:', { 
      count: artistReleases?.length || 0,
      error: artistReleasesError?.message,
      data: artistReleases 
    });

    const { data: artistMilestones, error: artistMilestonesError } = await supabase
      .from('artist_milestones')
      .select('*')
      .eq('artist_id', testArtistId);

    console.log('👤 Henry Taylor milestones:', { 
      count: artistMilestones?.length || 0,
      error: artistMilestonesError?.message,
      data: artistMilestones 
    });

    return res.status(200).json({
      success: true,
      tables: {
        artist_releases: {
          exists: !releasesError,
          error: releasesError?.message,
          count: releases?.length || 0
        },
        artist_milestones: {
          exists: !milestonesError,
          error: milestonesError?.message,
          count: milestones?.length || 0
        }
      },
      henryTaylor: {
        releases: {
          count: artistReleases?.length || 0,
          data: artistReleases
        },
        milestones: {
          count: artistMilestones?.length || 0,
          data: artistMilestones
        }
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({ error: error.message });
  }
}
