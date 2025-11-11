import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const release_id = searchParams.get('release_id');

    // Get all pitches for user
    let pitchQuery = supabase
      .from('playlist_pitches')
      .select(`
        *,
        playlists(name, followers, platform),
        releases(title, artist_name, spotify_url)
      `)
      .eq('user_id', user.id);

    if (campaign_id) {
      pitchQuery = pitchQuery.eq('campaign_id', campaign_id);
    }

    if (release_id) {
      pitchQuery = pitchQuery.eq('release_id', release_id);
    }

    const { data: pitches, error: pitchError } = await pitchQuery;

    if (pitchError) throw pitchError;

    // Calculate comprehensive analytics
    const analytics = {
      overview: calculateOverview(pitches),
      funnel: calculateFunnel(pitches),
      roi: await calculateROI(pitches, supabase, user.id),
      top_playlists: getTopPlaylists(pitches),
      response_times: calculateResponseTimes(pitches),
      best_performing: getBestPerforming(pitches),
      recommendations: generateRecommendations(pitches),
    };

    return NextResponse.json({ success: true, analytics });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateOverview(pitches) {
  const total = pitches.length;
  const sent = pitches.filter(p => p.status === 'sent' || p.status === 'opened' || p.status === 'replied').length;
  const opened = pitches.filter(p => p.opened_at).length;
  const replied = pitches.filter(p => p.replied_at).length;
  const accepted = pitches.filter(p => p.status === 'accepted').length;
  const rejected = pitches.filter(p => p.status === 'rejected').length;

  return {
    total_pitches: total,
    sent: sent,
    opened: opened,
    replied: replied,
    accepted: accepted,
    rejected: rejected,
    pending: total - sent,
    open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    reply_rate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    acceptance_rate: sent > 0 ? Math.round((accepted / sent) * 100) : 0,
    rejection_rate: sent > 0 ? Math.round((rejected / sent) * 100) : 0,
  };
}

function calculateFunnel(pitches) {
  const total = pitches.length;
  const sent = pitches.filter(p => ['sent', 'opened', 'replied', 'accepted', 'rejected'].includes(p.status)).length;
  const opened = pitches.filter(p => p.opened_at).length;
  const replied = pitches.filter(p => p.replied_at).length;
  const accepted = pitches.filter(p => p.status === 'accepted').length;

  return {
    stages: [
      {
        name: 'Pitches Created',
        count: total,
        percentage: 100,
        drop_off: 0,
      },
      {
        name: 'Emails Sent',
        count: sent,
        percentage: total > 0 ? Math.round((sent / total) * 100) : 0,
        drop_off: total - sent,
      },
      {
        name: 'Emails Opened',
        count: opened,
        percentage: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        drop_off: sent - opened,
      },
      {
        name: 'Curators Replied',
        count: replied,
        percentage: opened > 0 ? Math.round((replied / opened) * 100) : 0,
        drop_off: opened - replied,
      },
      {
        name: 'Playlists Accepted',
        count: accepted,
        percentage: replied > 0 ? Math.round((accepted / replied) * 100) : 0,
        drop_off: replied - accepted,
      },
    ],
    conversion_rate: total > 0 ? Math.round((accepted / total) * 100) : 0,
  };
}

async function calculateROI(pitches, supabase, userId) {
  const acceptedPitches = pitches.filter(p => p.status === 'accepted');

  // Calculate estimated streams from accepted playlists
  let totalEstimatedStreams = 0;
  let totalActualStreams = 0;

  for (const pitch of acceptedPitches) {
    // Estimate: 3% of playlist followers will stream
    const estimatedStreams = Math.round((pitch.playlists?.followers || 0) * 0.03);
    totalEstimatedStreams += estimatedStreams;

    // Get actual streaming data if available
    if (pitch.streaming_impact) {
      totalActualStreams += pitch.streaming_impact.streams || 0;
    }
  }

  // Calculate revenue (£0.003 per stream average)
  const streamValue = 0.003;
  const estimatedRevenue = totalEstimatedStreams * streamValue;
  const actualRevenue = totalActualStreams * streamValue;

  // Calculate cost (time/effort estimate)
  const timePerPitch = 5; // minutes
  const hourlyRate = 20; // £20/hour (opportunity cost)
  const estimatedCost = (pitches.length * timePerPitch / 60) * hourlyRate;

  return {
    estimated_streams: totalEstimatedStreams,
    actual_streams: totalActualStreams,
    estimated_revenue_gbp: Math.round(estimatedRevenue * 100) / 100,
    actual_revenue_gbp: Math.round(actualRevenue * 100) / 100,
    estimated_cost_gbp: Math.round(estimatedCost * 100) / 100,
    roi_percentage: estimatedCost > 0
      ? Math.round(((estimatedRevenue - estimatedCost) / estimatedCost) * 100)
      : 0,
    accepted_playlists: acceptedPitches.length,
    total_playlist_reach: acceptedPitches.reduce((sum, p) => sum + (p.playlists?.followers || 0), 0),
    avg_streams_per_playlist: acceptedPitches.length > 0
      ? Math.round(totalEstimatedStreams / acceptedPitches.length)
      : 0,
  };
}

function getTopPlaylists(pitches) {
  return pitches
    .filter(p => p.status === 'accepted' && p.playlists)
    .sort((a, b) => (b.playlists.followers || 0) - (a.playlists.followers || 0))
    .slice(0, 10)
    .map(p => ({
      playlist_name: p.playlists.name,
      curator_name: p.curator_name,
      followers: p.playlists.followers,
      platform: p.playlists.platform,
      added_date: p.accepted_at,
      estimated_streams: Math.round((p.playlists.followers || 0) * 0.03),
    }));
}

function calculateResponseTimes(pitches) {
  const responseTimes = pitches
    .filter(p => p.sent_at && p.replied_at)
    .map(p => {
      const sent = new Date(p.sent_at);
      const replied = new Date(p.replied_at);
      return Math.floor((replied - sent) / (1000 * 60 * 60 * 24)); // Days
    });

  if (responseTimes.length === 0) {
    return {
      avg_response_days: null,
      fastest_response_days: null,
      slowest_response_days: null,
      median_response_days: null,
    };
  }

  responseTimes.sort((a, b) => a - b);

  return {
    avg_response_days: Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length),
    fastest_response_days: responseTimes[0],
    slowest_response_days: responseTimes[responseTimes.length - 1],
    median_response_days: responseTimes[Math.floor(responseTimes.length / 2)],
  };
}

function getBestPerforming(pitches) {
  // Group by playlist platform
  const byPlatform = {};

  pitches.forEach(pitch => {
    const platform = pitch.playlists?.platform || 'unknown';
    if (!byPlatform[platform]) {
      byPlatform[platform] = {
        total: 0,
        accepted: 0,
        opened: 0,
        replied: 0,
      };
    }

    byPlatform[platform].total++;
    if (pitch.status === 'accepted') byPlatform[platform].accepted++;
    if (pitch.opened_at) byPlatform[platform].opened++;
    if (pitch.replied_at) byPlatform[platform].replied++;
  });

  // Calculate rates
  const platformStats = Object.entries(byPlatform).map(([platform, stats]) => ({
    platform,
    total_pitches: stats.total,
    acceptance_rate: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
    open_rate: stats.total > 0 ? Math.round((stats.opened / stats.total) * 100) : 0,
    reply_rate: stats.total > 0 ? Math.round((stats.replied / stats.total) * 100) : 0,
  }));

  // Best day of week to send
  const byDayOfWeek = {};
  pitches.filter(p => p.sent_at).forEach(pitch => {
    const day = new Date(pitch.sent_at).getDay();
    if (!byDayOfWeek[day]) {
      byDayOfWeek[day] = { sent: 0, opened: 0, accepted: 0 };
    }
    byDayOfWeek[day].sent++;
    if (pitch.opened_at) byDayOfWeek[day].opened++;
    if (pitch.status === 'accepted') byDayOfWeek[day].accepted++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDay = Object.entries(byDayOfWeek)
    .map(([day, stats]) => ({
      day: dayNames[parseInt(day)],
      acceptance_rate: stats.sent > 0 ? Math.round((stats.accepted / stats.sent) * 100) : 0,
    }))
    .sort((a, b) => b.acceptance_rate - a.acceptance_rate)[0];

  return {
    by_platform: platformStats,
    best_day_to_send: bestDay || null,
  };
}

function generateRecommendations(pitches) {
  const recommendations = [];

  const overview = calculateOverview(pitches);

  // Open rate recommendations
  if (overview.open_rate < 20 && pitches.length >= 10) {
    recommendations.push({
      type: 'warning',
      category: 'Email Subject',
      title: 'Low Open Rate',
      message: 'Your open rate is below 20%. Try improving your email subject lines to be more compelling and personalized.',
      action: 'A/B test different subject lines',
    });
  }

  // Reply rate recommendations
  if (overview.reply_rate < 10 && overview.open_rate > 30) {
    recommendations.push({
      type: 'warning',
      category: 'Email Content',
      title: 'Low Reply Rate Despite Good Opens',
      message: 'Curators are opening your emails but not responding. Consider making your pitch more concise and including clearer calls-to-action.',
      action: 'Revise email template',
    });
  }

  // Acceptance rate recommendations
  if (overview.acceptance_rate < 5 && overview.reply_rate > 10) {
    recommendations.push({
      type: 'warning',
      category: 'Playlist Targeting',
      title: 'Low Acceptance Rate',
      message: 'You\'re getting replies but few acceptances. This might indicate you\'re targeting playlists that don\'t match your music style well.',
      action: 'Use ML search to find better-matched playlists',
    });
  }

  // Volume recommendations
  if (pitches.length < 20) {
    recommendations.push({
      type: 'info',
      category: 'Campaign Volume',
      title: 'Increase Pitch Volume',
      message: 'With only a small number of pitches, it\'s hard to gain traction. Aim for 50-100 targeted pitches per release.',
      action: 'Create more targeted campaigns',
    });
  }

  // Success recommendations
  if (overview.acceptance_rate > 15) {
    recommendations.push({
      type: 'success',
      category: 'Performance',
      title: 'Great Acceptance Rate!',
      message: `Your ${overview.acceptance_rate}% acceptance rate is excellent. Continue using your current approach and scale up your campaigns.`,
      action: 'Scale to more playlists',
    });
  }

  // Follow-up recommendations
  const noFollowups = pitches.filter(p =>
    p.sent_at &&
    !p.replied_at &&
    !p.followup_sent &&
    (Date.now() - new Date(p.sent_at)) > 7 * 24 * 60 * 60 * 1000 // 7 days
  ).length;

  if (noFollowups > 5) {
    recommendations.push({
      type: 'info',
      category: 'Follow-ups',
      title: 'Enable Auto Follow-ups',
      message: `You have ${noFollowups} pitches with no response that could benefit from follow-up emails.`,
      action: 'Enable automatic follow-ups in campaign settings',
    });
  }

  return recommendations;
}
