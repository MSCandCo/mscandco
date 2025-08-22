import { createClient } from '@supabase/supabase-js';
import chartmetricEnhanced, { getArtistSpecificAnalytics } from '@/lib/chartmetric-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's profile and Chartmetric linking
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_role_assignments!inner(role_name)
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if user has Chartmetric ID linked
    if (!profile.chartmetric_artist_id) {
      return res.status(200).json({
        success: false,
        error: 'No Chartmetric profile linked',
        message: 'Please link your Spotify/Apple Music profile to access analytics',
        link_required: true
      });
    }

    // Check subscription level for analytics access
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, advanced_analytics')
      .eq('user_id', user.id)
      .single();

    const hasChartmetricAccess = subscription?.plan === 'artist_pro' || 
                                profile.user_role_assignments.role_name === 'super_admin';

    if (!hasChartmetricAccess) {
      return res.status(200).json({
        success: false,
        error: 'Chartmetric access requires Artist Pro subscription',
        message: 'Upgrade to Artist Pro to unlock real-time analytics and social footprint tracking',
        upgrade_required: true,
        current_plan: subscription?.plan || 'no_subscription'
      });
    }

    // Get comprehensive analytics from Chartmetric
    const analytics = await getArtistSpecificAnalytics(user.id, profile.chartmetric_artist_id);

    if (!analytics.success) {
      return res.status(500).json({ 
        error: 'Failed to fetch Chartmetric data',
        details: analytics.error 
      });
    }

    // Store analytics in database for caching
    await supabase
      .from('user_profiles')
      .update({
        last_chartmetric_sync: new Date().toISOString(),
        chartmetric_data: analytics.data
      })
      .eq('id', user.id);

    return res.status(200).json({
      success: true,
      analytics: analytics.data,
      user_context: {
        user_id: user.id,
        artist_name: profile.artist_name,
        data_scope: 'artist_specific',
        access_level: 'pro_analytics',
        last_updated: new Date().toISOString()
      },
      chartmetric_info: {
        powered_by: 'Chartmetric API',
        data_freshness: 'real-time',
        coverage: 'comprehensive'
      }
    });

  } catch (error) {
    console.error('Error in Chartmetric artist analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
