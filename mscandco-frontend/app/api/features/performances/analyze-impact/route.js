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

    const { performance_id } = await request.json();

    if (!performance_id) {
      return NextResponse.json({ error: 'performance_id required' }, { status: 400 });
    }

    // Get performance details
    const { data: performance } = await supabase
      .from('live_performances')
      .select('*')
      .eq('id', performance_id)
      .eq('user_id', user.id)
      .single();

    if (!performance) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
    }

    const eventDate = new Date(performance.event_date);
    const now = new Date();
    const daysSinceShow = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));

    // Only analyze if show has happened and at least 1 day has passed
    if (daysSinceShow < 1) {
      return NextResponse.json({
        error: 'Show must have occurred at least 1 day ago for impact analysis',
      }, { status: 400 });
    }

    // Get baseline metrics (captured before show)
    const { data: baseline } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('performance_id', performance_id)
      .eq('metric_type', 'baseline')
      .single();

    // Capture current metrics (post-show)
    const postShowMetrics = await capturePostShowMetrics(
      user.id,
      performance.city,
      supabase
    );

    // Calculate impact
    const impact = calculateStreamingImpact(baseline, postShowMetrics, daysSinceShow);

    // Save post-show metrics
    await supabase.from('performance_metrics').insert({
      performance_id,
      user_id: user.id,
      metric_type: 'post_show',
      streams_count: postShowMetrics.streams,
      followers_count: postShowMetrics.followers,
      playlist_adds: postShowMetrics.playlist_adds,
      captured_at: new Date().toISOString(),
    });

    // Update performance with impact data
    await supabase
      .from('live_performances')
      .update({
        streaming_impact: impact,
        impact_analyzed_at: new Date().toISOString(),
      })
      .eq('id', performance_id);

    // Calculate financial performance
    const financials = await calculateFinancialPerformance(performance, supabase);

    // Generate insights and recommendations
    const insights = generatePerformanceInsights(
      impact,
      financials,
      performance.city
    );

    return NextResponse.json({
      success: true,
      performance_id,
      days_since_show: daysSinceShow,
      baseline: baseline,
      post_show: postShowMetrics,
      impact,
      financials,
      insights,
    });

  } catch (error) {
    console.error('Analyze impact error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function capturePostShowMetrics(userId, city, supabase) {
  // Get current streaming stats
  const { data: artist } = await supabase
    .from('user_profiles')
    .select('spotify_stats, apple_music_stats')
    .eq('id', userId)
    .single();

  const spotifyStats = artist?.spotify_stats || {};

  // Get city-specific metrics
  const { data: cityMetrics } = await supabase
    .from('geographic_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('city', city)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    streams: spotifyStats.monthly_listeners || 0,
    followers: spotifyStats.followers || 0,
    playlist_adds: spotifyStats.playlist_reach || 0,
    city_specific_streams: cityMetrics?.monthly_streams || 0,
  };
}

function calculateStreamingImpact(baseline, postShow, daysSinceShow) {
  if (!baseline) {
    return {
      error: 'No baseline metrics available',
    };
  }

  // Calculate percentage changes
  const streamsBump = calculatePercentageChange(
    baseline.streams_count,
    postShow.streams
  );

  const followersBump = calculatePercentageChange(
    baseline.followers_count,
    postShow.followers
  );

  const playlistBump = calculatePercentageChange(
    baseline.playlist_adds,
    postShow.playlist_adds
  );

  const cityStreamsBump = calculatePercentageChange(
    baseline.city_specific_streams,
    postShow.city_specific_streams
  );

  // Determine impact level
  let impactLevel;
  if (streamsBump >= 100) impactLevel = 'exceptional';
  else if (streamsBump >= 50) impactLevel = 'high';
  else if (streamsBump >= 25) impactLevel = 'moderate';
  else if (streamsBump >= 10) impactLevel = 'low';
  else impactLevel = 'minimal';

  // Calculate estimated revenue increase
  const additionalStreams = postShow.streams - baseline.streams_count;
  const estimatedRevenue = additionalStreams * 0.003; // £0.003 per stream

  return {
    impact_level: impactLevel,
    days_analyzed: daysSinceShow,
    streaming: {
      baseline: baseline.streams_count,
      post_show: postShow.streams,
      change: postShow.streams - baseline.streams_count,
      change_percentage: streamsBump,
    },
    followers: {
      baseline: baseline.followers_count,
      post_show: postShow.followers,
      change: postShow.followers - baseline.followers_count,
      change_percentage: followersBump,
    },
    playlist_adds: {
      baseline: baseline.playlist_adds,
      post_show: postShow.playlist_adds,
      change: postShow.playlist_adds - baseline.playlist_adds,
      change_percentage: playlistBump,
    },
    city_specific: {
      baseline: baseline.city_specific_streams || 0,
      post_show: postShow.city_specific_streams,
      change: postShow.city_specific_streams - (baseline.city_specific_streams || 0),
      change_percentage: cityStreamsBump,
    },
    estimated_revenue_increase_gbp: Math.round(estimatedRevenue * 100) / 100,
  };
}

function calculatePercentageChange(baseline, current) {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - baseline) / baseline) * 100);
}

async function calculateFinancialPerformance(performance, supabase) {
  // Get ticket sales data
  const { data: ticketSales } = await supabase
    .from('performance_ticket_sales')
    .select('*')
    .eq('performance_id', performance.id);

  let totalTicketRevenue = 0;
  let totalTicketsSold = 0;

  if (ticketSales && ticketSales.length > 0) {
    ticketSales.forEach(sale => {
      totalTicketRevenue += sale.amount;
      totalTicketsSold += sale.quantity;
    });
  } else {
    // Estimate from ticket tiers
    performance.ticket_tiers?.forEach(tier => {
      const soldPercentage = 0.70; // Assume 70% sold
      const sold = Math.round((tier.quantity || 0) * soldPercentage);
      totalTicketsSold += sold;
      totalTicketRevenue += sold * (tier.price || 0);
    });
  }

  // Get merch sales at venue
  const { data: merchSales } = await supabase
    .from('merchandise_orders')
    .select('total_amount')
    .eq('performance_id', performance.id);

  const merchRevenue = merchSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

  // Calculate costs
  const costs = {
    venue_rental: 500, // Example fixed costs
    sound_lights: 300,
    travel: 200,
    crew: 400,
    marketing: 150,
    total: 1550,
  };

  // Calculate profit
  const totalRevenue = totalTicketRevenue + merchRevenue;
  const netProfit = totalRevenue - costs.total;
  const roi = costs.total > 0 ? ((netProfit / costs.total) * 100) : 0;

  return {
    ticket_revenue: Math.round(totalTicketRevenue * 100) / 100,
    tickets_sold: totalTicketsSold,
    average_ticket_price:
      totalTicketsSold > 0
        ? Math.round((totalTicketRevenue / totalTicketsSold) * 100) / 100
        : 0,
    merch_revenue: Math.round(merchRevenue * 100) / 100,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_costs: costs.total,
    cost_breakdown: costs,
    net_profit: Math.round(netProfit * 100) / 100,
    roi_percentage: Math.round(roi * 100) / 100,
  };
}

function generatePerformanceInsights(impact, financials, city) {
  const insights = [];

  // Streaming impact insights
  if (impact.impact_level === 'exceptional' || impact.impact_level === 'high') {
    insights.push({
      type: 'success',
      category: 'Streaming Impact',
      title: 'Strong Streaming Bump',
      message: `Your ${city} show generated a ${impact.streaming.change_percentage}% increase in streams. This is ${impact.impact_level} impact!`,
      recommendation: `Consider booking more shows in ${city} or nearby cities where fans are clearly engaged.`,
    });
  } else if (impact.impact_level === 'minimal') {
    insights.push({
      type: 'warning',
      category: 'Streaming Impact',
      title: 'Low Streaming Impact',
      message: `Only ${impact.streaming.change_percentage}% streaming increase detected.`,
      recommendation:
        'Focus on pre-show promotion, encourage fans to stream your music, and capture video content to share post-show.',
    });
  }

  // Financial insights
  if (financials.roi_percentage > 50) {
    insights.push({
      type: 'success',
      category: 'Financial Performance',
      title: 'Profitable Show',
      message: `Generated £${financials.net_profit} profit with ${financials.roi_percentage}% ROI.`,
      recommendation: 'Replicate this model for future shows in similar markets.',
    });
  } else if (financials.roi_percentage < 0) {
    insights.push({
      type: 'warning',
      category: 'Financial Performance',
      title: 'Loss on Show',
      message: `Lost £${Math.abs(financials.net_profit)} on this performance.`,
      recommendation:
        'Review costs, increase ticket prices, or focus on smaller/free venues until fanbase grows.',
    });
  }

  // City-specific insights
  if (impact.city_specific?.change_percentage > 150) {
    insights.push({
      type: 'success',
      category: 'Market Penetration',
      title: `Strong ${city} Market`,
      message: `City-specific streams increased by ${impact.city_specific.change_percentage}%.`,
      recommendation: `${city} is a key market. Plan return shows and targeted social media campaigns for this area.`,
    });
  }

  // Follower growth insights
  if (impact.followers.change > 50) {
    insights.push({
      type: 'success',
      category: 'Fan Growth',
      title: 'New Followers Gained',
      message: `+${impact.followers.change} new followers after this show.`,
      recommendation:
        'Engage these new followers with social media content and exclusive offers.',
    });
  }

  // Playlist impact
  if (impact.playlist_adds.change > 10) {
    insights.push({
      type: 'success',
      category: 'Playlist Impact',
      title: 'Playlist Momentum',
      message: `+${impact.playlist_adds.change} playlist adds detected.`,
      recommendation:
        'Capitalize on this momentum by pitching to more playlists while your visibility is high.',
    });
  }

  return insights;
}
