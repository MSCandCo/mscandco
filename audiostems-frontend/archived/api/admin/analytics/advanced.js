// Save advanced analytics data to database
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const {
      artistId,
      artistRanking,
      careerSnapshot,
      audienceSummary,
      topMarkets,
      topStatistics,
      topTracks,
      allReleases,
      platformPerformance
    } = req.body;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    console.log('💾 Saving advanced analytics for artist:', artistId);

    // Save Artist Rankings
    if (artistRanking?.length > 0) {
      await supabase
        .from('artist_rankings')
        .delete()
        .eq('artist_id', artistId);

      const { error: rankingError } = await supabase
        .from('artist_rankings')
        .insert(artistRanking.map(ranking => ({
          artist_id: artistId,
          ranking_type: ranking.title,
          ranking_value: ranking.value,
          created_at: new Date().toISOString()
        })));

      if (rankingError) {
        console.error('Error saving rankings:', rankingError);
      }
    }

    // Save Career Snapshot
    if (careerSnapshot?.length > 0) {
      await supabase
        .from('artist_career_snapshot')
        .delete()
        .eq('artist_id', artistId);

      const { error: careerError } = await supabase
        .from('artist_career_snapshot')
        .insert(careerSnapshot.map(stage => ({
          artist_id: artistId,
          stage_type: stage.title,
          stage_value: stage.value,
          created_at: new Date().toISOString()
        })));

      if (careerError) {
        console.error('Error saving career snapshot:', careerError);
      }
    }

    // Save Demographics (combines audience summary and top markets)
    const allDemographics = [
      ...audienceSummary.map(item => ({ type: 'audience', title: item.title, value: item.value })),
      ...topMarkets.map(item => ({ type: 'market', title: item.title, value: item.value })),
      ...topStatistics.map(item => ({ type: 'statistic', title: item.title, value: item.value }))
    ];

    if (allDemographics.length > 0) {
      await supabase
        .from('artist_demographics')
        .delete()
        .eq('artist_id', artistId);

      const { error: demoError } = await supabase
        .from('artist_demographics')
        .insert(allDemographics.map(demo => ({
          artist_id: artistId,
          demographic_type: demo.type,
          demographic_title: demo.title,
          demographic_value: demo.value,
          created_at: new Date().toISOString()
        })));

      if (demoError) {
        console.error('Error saving demographics:', demoError);
      }
    }

    // Save Platform Performance
    if (platformPerformance?.length > 0) {
      await supabase
        .from('artist_platform_performance')
        .delete()
        .eq('artist_id', artistId);

      const { error: platformError } = await supabase
        .from('artist_platform_performance')
        .insert(platformPerformance.map(platform => ({
          artist_id: artistId,
          platform_name: platform.platformTitle,
          metric_type: platform.metadataTitle,
          metric_value: platform.metadataStat,
          change_indicator: platform.tag,
          created_at: new Date().toISOString()
        })));

      if (platformError) {
        console.error('Error saving platform performance:', platformError);
      }
    }

    // Note: Top Tracks and All Releases would need separate tables and file upload handling
    // For now, we'll handle the core data that can be stored as JSON

    return res.status(200).json({
      success: true,
      message: 'Advanced analytics saved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving advanced analytics:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Protect with analytics:edit:any permission (admin write access)
export default requirePermission('analytics:edit:any')(handler);
