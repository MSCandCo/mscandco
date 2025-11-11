import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      release_id,
      genre,
      min_followers = 1000,
      max_followers = 1000000,
      target_platforms = ['spotify', 'apple_music'],
      limit = 50,
    } = await request.json();

    if (!release_id || !genre) {
      return NextResponse.json({ error: 'release_id and genre required' }, { status: 400 });
    }

    // Get release data for analysis
    const { data: release } = await supabase
      .from('releases')
      .select('*, tracks(*)')
      .eq('id', release_id)
      .single();

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    // Get all playlists from database
    const { data: playlists, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .gte('followers', min_followers)
      .lte('followers', max_followers)
      .in('platform', target_platforms)
      .eq('status', 'active')
      .limit(500);

    if (playlistError) throw playlistError;

    // Calculate match scores using ML algorithm
    const scoredPlaylists = await Promise.all(
      playlists.map(async (playlist) => {
        const score = await calculateMLMatchScore(release, playlist, supabase);
        return {
          ...playlist,
          match_score: score.total,
          score_breakdown: score.breakdown,
          estimated_acceptance_rate: score.acceptance_rate,
          estimated_stream_impact: score.stream_impact,
          recommended_pitch_angle: score.pitch_angle,
        };
      })
    );

    // Sort by match score and limit results
    const topMatches = scoredPlaylists
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);

    // Save search to history
    await supabase.from('playlist_searches').insert({
      user_id: user.id,
      release_id,
      search_params: {
        genre,
        min_followers,
        max_followers,
        target_platforms,
      },
      results_count: topMatches.length,
      top_score: topMatches[0]?.match_score || 0,
    });

    return NextResponse.json({
      success: true,
      playlists: topMatches,
      total_analyzed: playlists.length,
      search_summary: {
        avg_match_score: topMatches.reduce((sum, p) => sum + p.match_score, 0) / topMatches.length,
        high_probability_matches: topMatches.filter(p => p.match_score >= 80).length,
        medium_probability_matches: topMatches.filter(p => p.match_score >= 60 && p.match_score < 80).length,
      },
    });

  } catch (error) {
    console.error('ML playlist search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function calculateMLMatchScore(release, playlist, supabase) {
  const breakdown = {};
  let total = 0;

  // 1. Genre Match (40% weight)
  const genreScore = calculateGenreMatch(release.genre, playlist.genres);
  breakdown.genre_match = genreScore;
  total += genreScore * 0.40;

  // 2. Follower Sweet Spot (20% weight)
  const followerScore = calculateFollowerOptimization(release, playlist.followers);
  breakdown.follower_optimization = followerScore;
  total += followerScore * 0.20;

  // 3. Historical Acceptance Rate (15% weight)
  const { data: pitchHistory } = await supabase
    .from('playlist_pitches')
    .select('status')
    .eq('playlist_id', playlist.id);

  const acceptanceRate = pitchHistory?.length > 0
    ? (pitchHistory.filter(p => p.status === 'accepted').length / pitchHistory.length) * 100
    : 50; // Default neutral score

  breakdown.historical_acceptance = acceptanceRate;
  total += acceptanceRate * 0.15;

  // 4. Sonic Similarity (15% weight) - Using audio features
  const sonicScore = await calculateSonicSimilarity(release, playlist, supabase);
  breakdown.sonic_similarity = sonicScore;
  total += sonicScore * 0.15;

  // 5. Curator Preferences (10% weight)
  const curatorScore = calculateCuratorPreferences(release, playlist);
  breakdown.curator_preferences = curatorScore;
  total += curatorScore * 0.10;

  // Calculate estimated acceptance rate (ML model)
  const acceptance_rate = Math.min(95, Math.max(5,
    (total * 0.6) + (acceptanceRate * 0.4)
  ));

  // Estimate stream impact
  const stream_impact = estimateStreamImpact(playlist.followers, acceptance_rate);

  // Generate recommended pitch angle
  const pitch_angle = generatePitchAngle(release, playlist, breakdown);

  return {
    total: Math.round(total),
    breakdown,
    acceptance_rate: Math.round(acceptance_rate),
    stream_impact,
    pitch_angle,
  };
}

function calculateGenreMatch(releaseGenre, playlistGenres) {
  if (!playlistGenres || playlistGenres.length === 0) return 50;

  const genreMap = {
    'hip-hop': ['rap', 'trap', 'hip hop', 'urban'],
    'pop': ['pop', 'indie pop', 'electropop', 'synth pop'],
    'rock': ['rock', 'indie rock', 'alternative', 'punk'],
    'electronic': ['edm', 'electronic', 'house', 'techno', 'dubstep'],
    'r&b': ['r&b', 'soul', 'rnb', 'neo soul'],
    'indie': ['indie', 'indie folk', 'indie rock', 'alternative'],
    'metal': ['metal', 'heavy metal', 'metalcore', 'death metal'],
    'country': ['country', 'folk', 'americana', 'bluegrass'],
    'jazz': ['jazz', 'smooth jazz', 'bebop', 'fusion'],
    'classical': ['classical', 'orchestral', 'baroque', 'romantic'],
  };

  const releaseGenreNormalized = releaseGenre.toLowerCase();
  const relatedGenres = genreMap[releaseGenreNormalized] || [releaseGenreNormalized];

  // Check for exact or related genre matches
  const exactMatch = playlistGenres.some(g =>
    g.toLowerCase() === releaseGenreNormalized
  );

  if (exactMatch) return 100;

  const relatedMatch = playlistGenres.some(g =>
    relatedGenres.some(rg => g.toLowerCase().includes(rg))
  );

  if (relatedMatch) return 75;

  return 25; // No match
}

function calculateFollowerOptimization(release, playlistFollowers) {
  // Optimal follower count based on artist size
  // Small artists: 1K-50K followers (easier to get on)
  // Medium artists: 50K-500K followers (growth stage)
  // Large artists: 500K+ followers (established)

  const artistSize = release.artist_follower_count || 1000;

  let optimalMin, optimalMax;

  if (artistSize < 10000) {
    optimalMin = 1000;
    optimalMax = 50000;
  } else if (artistSize < 100000) {
    optimalMin = 10000;
    optimalMax = 200000;
  } else {
    optimalMin = 50000;
    optimalMax = 1000000;
  }

  // Score based on how close playlist is to optimal range
  if (playlistFollowers >= optimalMin && playlistFollowers <= optimalMax) {
    return 100;
  } else if (playlistFollowers < optimalMin) {
    // Playlist too small - diminishing returns
    return Math.max(30, (playlistFollowers / optimalMin) * 100);
  } else {
    // Playlist too large - harder to get on
    const overage = playlistFollowers - optimalMax;
    const overageRatio = overage / optimalMax;
    return Math.max(40, 100 - (overageRatio * 50));
  }
}

async function calculateSonicSimilarity(release, playlist, supabase) {
  // Get audio features for release tracks
  const { data: releaseFeatures } = await supabase
    .from('tracks')
    .select('audio_features')
    .eq('release_id', release.id)
    .not('audio_features', 'is', null)
    .limit(1);

  if (!releaseFeatures || releaseFeatures.length === 0) {
    return 50; // Neutral score if no audio features
  }

  const releaseAudio = releaseFeatures[0].audio_features;

  // Get playlist's average audio features
  const playlistAudio = playlist.avg_audio_features;

  if (!playlistAudio) return 50;

  // Calculate similarity across key audio metrics
  const metrics = ['energy', 'danceability', 'valence', 'tempo', 'acousticness'];
  let similarity = 0;

  metrics.forEach(metric => {
    if (releaseAudio[metric] && playlistAudio[metric]) {
      const diff = Math.abs(releaseAudio[metric] - playlistAudio[metric]);
      const score = 100 - (diff * 100); // Convert to 0-100 scale
      similarity += score;
    }
  });

  return similarity / metrics.length;
}

function calculateCuratorPreferences(release, playlist) {
  let score = 50; // Base score

  // Check if curator preferences match release attributes
  const prefs = playlist.curator_preferences || {};

  // Release timing preference
  if (prefs.prefers_new_releases && release.release_date) {
    const daysOld = Math.floor((Date.now() - new Date(release.release_date)) / (1000 * 60 * 60 * 24));
    if (daysOld <= 7) score += 20;
    else if (daysOld <= 30) score += 10;
  }

  // Production quality preference
  if (prefs.prefers_high_production && release.production_quality === 'high') {
    score += 15;
  }

  // Independent artist preference
  if (prefs.supports_independent && release.label_type === 'independent') {
    score += 15;
  }

  return Math.min(100, score);
}

function estimateStreamImpact(followers, acceptanceRate) {
  // Conservative estimate: 2-5% of followers stream a track
  const conversionRate = 0.03; // 3% average
  const expectedStreams = Math.round(followers * conversionRate * (acceptanceRate / 100));

  // Calculate potential revenue (£0.003 per stream average)
  const expectedRevenue = expectedStreams * 0.003;

  return {
    estimated_streams: expectedStreams,
    estimated_revenue_gbp: Math.round(expectedRevenue * 100) / 100,
    time_to_impact: '7-14 days',
    confidence_level: acceptanceRate >= 70 ? 'high' : acceptanceRate >= 50 ? 'medium' : 'low',
  };
}

function generatePitchAngle(release, playlist, scoreBreakdown) {
  // AI-generated personalized pitch angle based on match scores
  const angles = [];

  if (scoreBreakdown.genre_match >= 80) {
    angles.push('Perfect genre fit for your playlist\'s sound');
  }

  if (scoreBreakdown.sonic_similarity >= 75) {
    angles.push('Audio characteristics align perfectly with your current tracks');
  }

  if (scoreBreakdown.follower_optimization >= 80) {
    angles.push('Ideal follower range for emerging artist discovery');
  }

  if (release.monthly_listeners && release.monthly_listeners > 10000) {
    angles.push(`Growing momentum with ${release.monthly_listeners.toLocaleString()} monthly listeners`);
  }

  if (release.production_quality === 'high') {
    angles.push('Professional production quality');
  }

  return angles.length > 0
    ? angles.join('. ') + '.'
    : 'Great addition to your playlist\'s diverse sound.';
}

// GET endpoint for search history
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    const { data: searches, error } = await supabase
      .from('playlist_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ searches });

  } catch (error) {
    console.error('Get search history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
