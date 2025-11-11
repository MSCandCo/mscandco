import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * ENTERPRISE FEATURES MCP TOOLS
 * Complete toolset for all 7 enterprise features
 */

// ============================================================================
// FEATURE 1: AI ARTWORK GENERATION TOOLS
// ============================================================================

export const generateArtworkEnterpriseSchema = z.object({
  prompt: z.string().describe('Description of the artwork to generate'),
  style: z.enum([
    'abstract',
    'realistic',
    'minimalist',
    'vintage',
    'modern',
    'psychedelic',
    'surreal',
    'grunge',
  ]).describe('Artistic style'),
  color_scheme: z.enum([
    'vibrant',
    'dark',
    'pastel',
    'monochrome',
    'warm',
    'cool',
    'neon',
    'earth',
  ]).describe('Color palette'),
  release_id: z.string().optional().describe('Release to associate with'),
  generate_variations: z.boolean().default(true).describe('Generate 4 variations'),
});

export async function generateArtworkEnterprise(args: z.infer<typeof generateArtworkEnterpriseSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/artwork/generate-enterprise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Artwork generation failed');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `✅ Generated ${data.generations.length} artwork(s)!\n\n` +
          `Primary Image: ${data.generations[0].image_url}\n` +
          `Variations: ${data.generations.length - 1}\n` +
          `Credits Used: ${data.credits_used}\n` +
          `Credits Remaining: ${data.credits_remaining}\n\n` +
          `All images include smart crops for Instagram, Spotify, YouTube, Facebook, and Twitter.`,
      },
    ],
  };
}

// ============================================================================
// FEATURE 2: PLAYLIST PITCHING TOOLS
// ============================================================================

export const searchPlaylistsMLSchema = z.object({
  release_id: z.string().describe('Release ID to pitch'),
  genre: z.string().describe('Music genre'),
  min_followers: z.number().default(1000).describe('Minimum playlist followers'),
  max_followers: z.number().default(100000).describe('Maximum playlist followers'),
  target_platforms: z.array(z.enum(['spotify', 'apple_music', 'youtube', 'tidal']))
    .default(['spotify'])
    .describe('Target streaming platforms'),
});

export async function searchPlaylistsML(args: z.infer<typeof searchPlaylistsMLSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/playlists/search-ml`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Playlist search failed');
  }

  const topPlaylists = data.playlists.slice(0, 10);

  return {
    content: [
      {
        type: 'text' as const,
        text: `🎯 Found ${data.playlists.length} matching playlists!\n\n` +
          `Top 10 Matches:\n` +
          topPlaylists.map((p: any, i: number) =>
            `${i + 1}. ${p.name} (${p.followers.toLocaleString()} followers)\n` +
            `   Match Score: ${p.match_score}% | Acceptance: ${p.estimated_acceptance_rate}%\n` +
            `   Est. Streams: ${p.estimated_stream_impact.estimated_streams.toLocaleString()}`
          ).join('\n\n') +
          `\n\nUse create_pitch_campaign to start pitching!`,
      },
    ],
  };
}

export const createPitchCampaignSchema = z.object({
  name: z.string().describe('Campaign name'),
  release_id: z.string().describe('Release to pitch'),
  playlist_ids: z.array(z.string()).describe('Playlist IDs to pitch to'),
  send_immediately: z.boolean().default(true).describe('Send emails immediately'),
});

export async function createPitchCampaign(args: z.infer<typeof createPitchCampaignSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/playlists/campaigns-auto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Campaign creation failed');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `📧 Campaign Created!\n\n` +
          `Name: ${data.campaign.name}\n` +
          `Total Pitches: ${data.summary.total}\n` +
          `Sent: ${data.summary.sent}\n` +
          `Failed: ${data.summary.failed}\n` +
          `Pending: ${data.summary.pending}\n\n` +
          `Campaign is active! Track progress in the dashboard.`,
      },
    ],
  };
}

export const getPlaylistROISchema = z.object({
  campaign_id: z.string().optional().describe('Specific campaign ID'),
});

export async function getPlaylistROI(args: z.infer<typeof getPlaylistROISchema>) {
  const url = args.campaign_id
    ? `${process.env.PLATFORM_URL}/api/features/playlists/analytics?campaign_id=${args.campaign_id}`
    : `${process.env.PLATFORM_URL}/api/features/playlists/analytics`;

  const response = await fetch(url);
  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Analytics fetch failed');
  }

  const { analytics } = data;

  return {
    content: [
      {
        type: 'text' as const,
        text: `📊 Playlist Pitching Analytics\n\n` +
          `Overview:\n` +
          `- Total Pitches: ${analytics.overview.total_pitches}\n` +
          `- Open Rate: ${analytics.overview.open_rate}%\n` +
          `- Reply Rate: ${analytics.overview.reply_rate}%\n` +
          `- Acceptance Rate: ${analytics.overview.acceptance_rate}%\n\n` +
          `ROI:\n` +
          `- Estimated Streams: ${analytics.roi.estimated_streams.toLocaleString()}\n` +
          `- Estimated Revenue: £${analytics.roi.estimated_revenue_gbp}\n` +
          `- Total Reach: ${analytics.roi.total_playlist_reach.toLocaleString()} followers\n` +
          `- ROI: ${analytics.roi.roi_percentage}%\n\n` +
          `${analytics.recommendations.length} recommendations available.`,
      },
    ],
  };
}

// ============================================================================
// FEATURE 3: SOCIAL MEDIA AUTOMATION TOOLS
// ============================================================================

export const generateSocialCaptionSchema = z.object({
  platforms: z.array(z.enum(['instagram', 'twitter', 'tiktok', 'facebook', 'youtube']))
    .describe('Target platforms'),
  release_id: z.string().optional().describe('Release to promote'),
  content_type: z.enum([
    'release_announcement',
    'behind_the_scenes',
    'milestone',
    'engagement',
  ]).default('release_announcement').describe('Type of content'),
  tone: z.enum(['professional', 'casual', 'energetic', 'mysterious'])
    .default('professional')
    .describe('Tone of voice'),
  include_hashtags: z.boolean().default(true).describe('Include hashtags'),
});

export async function generateSocialCaption(args: z.infer<typeof generateSocialCaptionSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/social/ai-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Caption generation failed');
  }

  let result = '✍️ AI-Generated Captions:\n\n';

  for (const [platform, content] of Object.entries(data.content)) {
    const c = content as any;
    result += `📱 ${platform.toUpperCase()}:\n${c.caption}\n\n`;
    result += `Characters: ${c.character_count} | Within Limit: ${c.within_limit ? '✅' : '❌'}\n`;
    result += `CTA: ${c.call_to_action}\n\n`;
  }

  result += `Hashtags: ${data.hashtags.join(' ')}\n\n`;
  result += `Best Times to Post:\n`;

  for (const [platform, times] of Object.entries(data.best_times)) {
    const t = times as any[];
    result += `${platform}: ${t[0].day} at ${t[0].time}\n`;
  }

  return {
    content: [{ type: 'text' as const, text: result }],
  };
}

export const scheduleSocialPostSchema = z.object({
  platforms: z.array(z.enum(['instagram', 'twitter', 'tiktok', 'facebook', 'youtube']))
    .describe('Platforms to post to'),
  caption: z.string().describe('Post caption'),
  media_urls: z.array(z.string()).optional().describe('Media URLs'),
  scheduled_time: z.string().optional().describe('ISO timestamp for scheduling'),
  post_immediately: z.boolean().default(false).describe('Post now vs schedule'),
});

export async function scheduleSocialPost(args: z.infer<typeof scheduleSocialPostSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/social/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Post scheduling failed');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `📅 Post Scheduled!\n\n` +
          `Platforms: ${args.platforms.join(', ')}\n` +
          `Total Posts: ${data.summary.total}\n` +
          `Publishing: ${data.summary.publishing}\n` +
          `Scheduled: ${data.summary.scheduled}\n` +
          `Failed: ${data.summary.failed}\n\n` +
          `${args.post_immediately ? 'Posts are being published now!' : 'Posts scheduled successfully!'}`,
      },
    ],
  };
}

// ============================================================================
// FEATURE 4: FAN ENGAGEMENT TOOLS
// ============================================================================

export const predictFanChurnSchema = z.object({
  fan_ids: z.array(z.string()).optional().describe('Specific fan IDs (or all fans)'),
  threshold: z.number().default(0.7).describe('Churn probability threshold (0-1)'),
});

export async function predictFanChurn(args: z.infer<typeof predictFanChurnSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/fans/predict-churn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Churn prediction failed');
  }

  const highRisk = data.predictions.filter((p: any) => p.churn_risk === 'high');

  return {
    content: [
      {
        type: 'text' as const,
        text: `⚠️ Churn Prediction Analysis\n\n` +
          `Total Analyzed: ${data.total_analyzed}\n` +
          `At Risk (≥${args.threshold * 100}%): ${data.at_risk_count} (${data.at_risk_percentage}%)\n\n` +
          `Risk Breakdown:\n` +
          `- High Risk: ${data.summary.high_risk}\n` +
          `- Medium Risk: ${data.summary.medium_risk}\n` +
          `- Low Risk: ${data.summary.low_risk}\n\n` +
          `Top 5 High-Risk Fans:\n` +
          highRisk.slice(0, 5).map((p: any, i: number) =>
            `${i + 1}. ${p.fan_name || p.fan_email} (${Math.round(p.churn_probability * 100)}%)\n` +
            `   Key Factor: ${p.key_factors[0]?.factor}\n` +
            `   Action: ${p.recommended_actions[0]?.action}`
          ).join('\n\n'),
      },
    ],
  };
}

export const calculateFanLTVSchema = z.object({
  fan_ids: z.array(z.string()).optional().describe('Specific fan IDs (or all fans)'),
});

export async function calculateFanLTV(args: z.infer<typeof calculateFanLTVSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/fans/calculate-ltv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'LTV calculation failed');
  }

  const topFans = data.calculations.slice(0, 10);

  return {
    content: [
      {
        type: 'text' as const,
        text: `💰 Fan Lifetime Value (LTV) Analysis\n\n` +
          `Total Fans: ${data.summary.total_fans}\n` +
          `Total LTV: £${data.summary.total_lifetime_value.toFixed(2)}\n` +
          `Average LTV: £${data.summary.avg_lifetime_value.toFixed(2)}\n` +
          `High-Value Fans (>£100): ${data.summary.high_value_fans}\n\n` +
          `Top 10 Fans by LTV:\n` +
          topFans.map((c: any, i: number) =>
            `${i + 1}. ${c.fan_name || c.fan_email}\n` +
            `   Total LTV: £${c.total_ltv.toFixed(2)}\n` +
            `   Segment: ${c.value_segment}\n` +
            `   Historical: £${c.historical_value.toFixed(2)} | Predicted: £${c.predicted_value.toFixed(2)}`
          ).join('\n\n'),
      },
    ],
  };
}

// ============================================================================
// FEATURE 5: LIVE PERFORMANCE TOOLS
// ============================================================================

export const createPerformanceSchema = z.object({
  event_name: z.string().describe('Event/show name'),
  venue_name: z.string().describe('Venue name'),
  city: z.string().describe('City'),
  country: z.string().default('United Kingdom').describe('Country'),
  event_date: z.string().describe('Event date (ISO format)'),
  show_time: z.string().optional().describe('Show start time (HH:MM)'),
  ticket_tiers: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })).optional().describe('Ticket tiers'),
  use_ticketmaster: z.boolean().default(false).describe('Create Ticketmaster event'),
  use_eventbrite: z.boolean().default(false).describe('Create Eventbrite event'),
});

export async function createPerformance(args: z.infer<typeof createPerformanceSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/performances/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Performance creation failed');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `🎤 Performance Created!\n\n` +
          `Event: ${data.performance.event_name}\n` +
          `Venue: ${data.performance.venue_name}\n` +
          `Date: ${new Date(data.performance.event_date).toLocaleDateString()}\n` +
          `City: ${data.performance.city}\n\n` +
          `Baseline Metrics Captured:\n` +
          `- Streams: ${data.baseline_metrics.streams.toLocaleString()}\n` +
          `- Followers: ${data.baseline_metrics.followers.toLocaleString()}\n` +
          `- City Streams: ${data.baseline_metrics.city_specific_streams.toLocaleString()}\n\n` +
          `${data.performance.ticketmaster_url ? `Ticketmaster: ${data.performance.ticketmaster_url}\n` : ''}` +
          `${data.performance.eventbrite_url ? `Eventbrite: ${data.performance.eventbrite_url}\n` : ''}` +
          `\nAnalyze impact after the show with analyze_show_impact!`,
      },
    ],
  };
}

export const analyzeShowImpactSchema = z.object({
  performance_id: z.string().describe('Performance ID to analyze'),
});

export async function analyzeShowImpact(args: z.infer<typeof analyzeShowImpactSchema>) {
  const response = await fetch(`${process.env.PLATFORM_URL}/api/features/performances/analyze-impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Impact analysis failed');
  }

  const { impact, financials, insights } = data;

  return {
    content: [
      {
        type: 'text' as const,
        text: `📈 Show Impact Analysis (${data.days_since_show} days after)\n\n` +
          `Impact Level: ${impact.impact_level.toUpperCase()}\n\n` +
          `Streaming Impact:\n` +
          `- Baseline: ${impact.streaming.baseline.toLocaleString()}\n` +
          `- Post-Show: ${impact.streaming.post_show.toLocaleString()}\n` +
          `- Change: +${impact.streaming.change_percentage}% (+${impact.streaming.change.toLocaleString()})\n\n` +
          `Followers:\n` +
          `- Gained: +${impact.followers.change} (+${impact.followers.change_percentage}%)\n\n` +
          `Financial Performance:\n` +
          `- Ticket Revenue: £${financials.ticket_revenue}\n` +
          `- Merch Revenue: £${financials.merch_revenue}\n` +
          `- Total Revenue: £${financials.total_revenue}\n` +
          `- Net Profit: £${financials.net_profit}\n` +
          `- ROI: ${financials.roi_percentage}%\n\n` +
          `Key Insights:\n` +
          insights.map((i: any) => `${i.type === 'success' ? '✅' : '⚠️'} ${i.title}: ${i.message}`).join('\n'),
      },
    ],
  };
}

// ============================================================================
// FEATURE 6: MERCHANDISE TOOLS
// ============================================================================

export const createMerchProductSchema = z.object({
  name: z.string().describe('Product name'),
  product_type: z.enum(['t-shirt', 'hoodie', 'poster', 'mug', 'tote-bag'])
    .describe('Product type'),
  design_url: z.string().describe('Design image URL'),
  retail_price: z.number().describe('Retail price in GBP'),
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
  })).optional().describe('Product variants'),
  release_id: z.string().optional().describe('Associated release'),
  use_printful: z.boolean().default(true).describe('Use Printful for fulfillment'),
});

export async function createMerchProduct(args: z.infer<typeof createMerchProductSchema>) {
  if (args.use_printful) {
    // Create via Printful
    const response = await fetch(`${process.env.PLATFORM_URL}/api/features/merch/printful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_product',
        ...args,
      }),
    });

    const data = await response.json() as any;

    if (!data.success) {
      throw new Error(data.error || 'Product creation failed');
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `🛍️ Merch Product Created!\n\n` +
            `Name: ${data.product.name}\n` +
            `Type: ${data.product.product_type}\n` +
            `Price: £${data.product.retail_price}\n` +
            `Provider: Printful\n` +
            `Variants: ${data.product.variants?.length || 0}\n\n` +
            `Printful Sync Product ID: ${data.product.printful_sync_product_id}\n\n` +
            `Product is live and ready for orders!`,
        },
      ],
    };
  } else {
    // Create directly in database
    const response = await fetch(`${process.env.PLATFORM_URL}/api/features/merch/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });

    const data = await response.json() as any;

    if (!data.success) {
      throw new Error(data.error || 'Product creation failed');
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `🛍️ Merch Product Created!\n\n` +
            `Name: ${data.product.name}\n` +
            `Type: ${data.product.product_type}\n` +
            `Price: £${data.product.retail_price}\n\n` +
            `Profit Analysis:\n` +
            `- Base Cost: £${data.profit_analysis.base_cost}\n` +
            `- Profit Per Unit: £${data.profit_analysis.profit_per_unit}\n` +
            `- Margin: ${data.profit_analysis.profit_margin_percentage}%`,
        },
      ],
    };
  }
}

export const getMerchAnalyticsSchema = z.object({
  time_period: z.enum(['7d', '30d', '90d', 'all']).default('30d').describe('Analysis period'),
});

export async function getMerchAnalytics(args: z.infer<typeof getMerchAnalyticsSchema>) {
  const response = await fetch(
    `${process.env.PLATFORM_URL}/api/features/merch/products?limit=100`
  );

  const data = await response.json() as any;

  if (!data.success) {
    throw new Error(data.error || 'Analytics fetch failed');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `📊 Merchandise Analytics\n\n` +
          `Total Products: ${data.stats.total_products}\n` +
          `Total Value: £${data.stats.total_value.toFixed(2)}\n` +
          `Avg Profit Margin: ${data.stats.avg_profit_margin.toFixed(1)}%\n\n` +
          `Products by Type:\n` +
          Object.entries(data.stats.by_type)
            .map(([type, count]) => `- ${type}: ${count}`)
            .join('\n'),
      },
    ],
  };
}

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

export const enterpriseFeaturesTools = [
  {
    name: 'generate_artwork_enterprise',
    description: 'Generate AI artwork with DALL-E 3 including 4 variations, 8 styles, and smart crops for all platforms',
    inputSchema: zodToJsonSchema(generateArtworkEnterpriseSchema),
    execute: generateArtworkEnterprise,
  },
  {
    name: 'search_playlists_ml',
    description: 'Search for playlists using ML matching algorithm (scores based on genre, followers, sonic similarity, curator preferences)',
    inputSchema: zodToJsonSchema(searchPlaylistsMLSchema),
    execute: searchPlaylistsML,
  },
  {
    name: 'create_pitch_campaign',
    description: 'Create automated playlist pitching campaign with personalized emails and follow-ups',
    inputSchema: zodToJsonSchema(createPitchCampaignSchema),
    execute: createPitchCampaign,
  },
  {
    name: 'get_playlist_roi',
    description: 'Get ROI analytics for playlist pitching campaigns (streams, revenue, acceptance rates)',
    inputSchema: zodToJsonSchema(getPlaylistROISchema),
    execute: getPlaylistROI,
  },
  {
    name: 'generate_social_caption',
    description: 'Generate AI-powered platform-optimized social media captions for Instagram, TikTok, Twitter, Facebook, YouTube',
    inputSchema: zodToJsonSchema(generateSocialCaptionSchema),
    execute: generateSocialCaption,
  },
  {
    name: 'schedule_social_post',
    description: 'Schedule posts across multiple social media platforms simultaneously',
    inputSchema: zodToJsonSchema(scheduleSocialPostSchema),
    execute: scheduleSocialPost,
  },
  {
    name: 'predict_fan_churn',
    description: 'Predict which fans are likely to stop listening using ML (4-factor churn model)',
    inputSchema: zodToJsonSchema(predictFanChurnSchema),
    execute: predictFanChurn,
  },
  {
    name: 'calculate_fan_ltv',
    description: 'Calculate fan lifetime value (historical + 12-month prediction) with revenue breakdown',
    inputSchema: zodToJsonSchema(calculateFanLTVSchema),
    execute: calculateFanLTV,
  },
  {
    name: 'create_performance',
    description: 'Create live performance event with Ticketmaster/Eventbrite integration and baseline metrics capture',
    inputSchema: zodToJsonSchema(createPerformanceSchema),
    execute: createPerformance,
  },
  {
    name: 'analyze_show_impact',
    description: 'Analyze streaming impact and financial performance after a live show',
    inputSchema: zodToJsonSchema(analyzeShowImpactSchema),
    execute: analyzeShowImpact,
  },
  {
    name: 'create_merch_product',
    description: 'Create merchandise product with Printful integration for automated fulfillment',
    inputSchema: zodToJsonSchema(createMerchProductSchema),
    execute: createMerchProduct,
  },
  {
    name: 'get_merch_analytics',
    description: 'Get merchandise analytics including sales, profit margins, and product performance',
    inputSchema: zodToJsonSchema(getMerchAnalyticsSchema),
    execute: getMerchAnalytics,
  },
];
