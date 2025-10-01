// COMBINED ANALYTICS FOR ALL LABEL ARTISTS
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);
  
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Get all accepted artists for this label admin
    const { data: relationships, error } = await supabase
      .from('artist_label_relationships')
      .select(`
        artist_id,
        artist:user_profiles!artist_id(
          analytics_data,
          first_name,
          last_name,
          artist_name
        )
      `)
      .eq('label_admin_id', user.id)
      .eq('status', 'active');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch artists' });
    }

    // Aggregate analytics across all artists
    const combinedAnalytics = {
      total_streams: 0,
      monthly_listeners: 0,
      total_revenue: 0,
      growth_rate: 0,
      platform_stats: {},
      top_countries: [],
      milestones: [],
      artist_count: relationships.length
    };

    let validAnalyticsCount = 0;

    relationships.forEach(rel => {
      const analytics = rel.artist?.analytics_data || {};
      
      if (Object.keys(analytics).length > 0) {
        validAnalyticsCount++;
        
        // Sum numeric values
        combinedAnalytics.total_streams += analytics.total_streams || 0;
        combinedAnalytics.monthly_listeners += analytics.monthly_listeners || 0;
        combinedAnalytics.total_revenue += analytics.total_revenue || 0;
        
        // Combine platform stats
        if (analytics.platform_stats) {
          Object.entries(analytics.platform_stats).forEach(([platform, stats]) => {
            if (!combinedAnalytics.platform_stats[platform]) {
              combinedAnalytics.platform_stats[platform] = { streams: 0 };
            }
            combinedAnalytics.platform_stats[platform].streams += stats.streams || 0;
          });
        }
        
        // Collect milestones
        if (analytics.milestones && Array.isArray(analytics.milestones)) {
          combinedAnalytics.milestones.push(...analytics.milestones.map(milestone => ({
            ...milestone,
            artist: rel.artist.artist_name || `${rel.artist.first_name} ${rel.artist.last_name}`
          })));
        }
      }
    });

    // Calculate average growth rate
    if (validAnalyticsCount > 0) {
      const totalGrowthRate = relationships.reduce((sum, rel) => {
        return sum + (rel.artist?.analytics_data?.growth_rate || 0);
      }, 0);
      combinedAnalytics.growth_rate = Math.round(totalGrowthRate / validAnalyticsCount);
    }

    // Sort milestones by date
    combinedAnalytics.milestones.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Combined analytics for ${relationships.length} artists`);

    return res.json({
      success: true,
      analytics: combinedAnalytics
    });

  } catch (error) {
    console.error('❌ Combined analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
