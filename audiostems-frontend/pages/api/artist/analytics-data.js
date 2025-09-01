// New Analytics Data API - Fetches from manual admin data instead of Chartmetric
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('📊 Fetching manual analytics data for user:', userId);

    // Fetch all analytics data from database
    const [
      releasesResult,
      milestonesResult,
      rankingsResult,
      careerSnapshotResult,
      demographicsResult,
      platformPerformanceResult
    ] = await Promise.allSettled([
      supabase.from('artist_releases').select('*').eq('artist_id', userId).eq('is_live', true).single(),
      supabase.from('artist_milestones').select('*').eq('artist_id', userId).order('milestone_date', { ascending: false }),
      supabase.from('artist_rankings').select('*').eq('artist_id', userId).single(),
      supabase.from('artist_career_snapshot').select('*').eq('artist_id', userId).single(),
      supabase.from('artist_demographics').select('*').eq('artist_id', userId).single(),
      supabase.from('artist_platform_performance').select('*').eq('artist_id', userId).single()
    ]);

    // Process results
    const latestRelease = releasesResult.status === 'fulfilled' && releasesResult.value.data ? releasesResult.value.data : null;
    const milestones = milestonesResult.status === 'fulfilled' && milestonesResult.value.data ? milestonesResult.value.data : [];
    const rankings = rankingsResult.status === 'fulfilled' && rankingsResult.value.data ? rankingsResult.value.data : null;
    const careerSnapshot = careerSnapshotResult.status === 'fulfilled' && careerSnapshotResult.value.data ? careerSnapshotResult.value.data : null;
    const demographics = demographicsResult.status === 'fulfilled' && demographicsResult.value.data ? demographicsResult.value.data : null;
    const platformPerformance = platformPerformanceResult.status === 'fulfilled' && platformPerformanceResult.value.data ? platformPerformanceResult.value.data : null;

    // Calculate relative dates for milestones
    const milestonesWithRelativeDates = milestones.map(milestone => ({
      ...milestone,
      relativeDate: calculateRelativeDate(milestone.milestone_date)
    }));

    // Construct analytics response
    const analytics = {
      // Latest release data
      latestRelease: latestRelease ? {
        title: latestRelease.title,
        artist: latestRelease.artist,
        featuring: latestRelease.featuring,
        releaseDate: latestRelease.release_date,
        type: latestRelease.release_type,
        audioFile: latestRelease.audio_file_url,
        coverImage: latestRelease.cover_image_url,
        platforms: latestRelease.platforms || []
      } : null,

      // Milestones data
      milestones: milestonesWithRelativeDates,

      // Rankings data
      rankings: rankings ? {
        country_rank: rankings.country_rank,
        global_rank: rankings.global_rank,
        primary_genre_rank: rankings.primary_genre_rank,
        secondary_genre_rank: rankings.secondary_genre_rank,
        tertiary_genre_rank: rankings.tertiary_genre_rank,
        momentum_score: rankings.momentum_score,
        continent_rank: rankings.continent_rank
      } : null,

      // Career snapshot data
      careerSnapshot: careerSnapshot ? {
        career_stage: careerSnapshot.career_stage,
        recent_momentum: careerSnapshot.recent_momentum,
        network_strength: careerSnapshot.network_strength,
        social_engagement: careerSnapshot.social_engagement
      } : null,

      // Demographics data
      demographics: demographics ? {
        social_footprint: demographics.social_footprint,
        primary_market: demographics.primary_market,
        secondary_market: demographics.secondary_market,
        primary_gender: demographics.primary_gender,
        primary_age: demographics.primary_age,
        countries: demographics.countries || []
      } : null,

      // Platform performance data
      platformPerformance: platformPerformance ? {
        platforms: platformPerformance.platforms || []
      } : null,

      // Metadata
      fetchedAt: new Date().toISOString(),
      dataSource: 'manual_admin',
      userId
    };

    console.log('✅ Manual analytics data compiled:', {
      hasLatestRelease: !!latestRelease,
      milestonesCount: milestones.length,
      hasRankings: !!rankings,
      hasCareerSnapshot: !!careerSnapshot,
      hasDemographics: !!demographics,
      hasPlatformPerformance: !!platformPerformance
    });

    return res.json({
      success: true,
      data: analytics,
      message: 'Manual analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Manual analytics API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
}

// Helper function to calculate relative dates
function calculateRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}
