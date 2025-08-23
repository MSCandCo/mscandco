import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Check user's subscription for AI access level
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single();

    const aiAccessLevel = subscription?.tier?.includes('pro') ? 'premium' : 'basic';

    const { release_data, analysis_type = 'basic' } = req.body;

    // Return empty insights structure - ready for real AI integration
    const insights = {
      timing_insights: {
        optimal_release_date: null,
        confidence_score: 0,
        reasoning: "AI insights not yet configured. Please contact support for AI features.",
        seasonal_factors: [],
        market_conditions: {}
      },
      revenue_insights: {
        projected_revenue: {
          first_week: 0,
          first_month: 0,
          first_year: 0
        },
        success_probability: 0,
        market_potential: "low",
        recommendations: []
      },
      generated_content: null,
      strategic_recommendations: [],
      chartmetric_data: null
    };

    return res.status(200).json({
      success: true,
      insights,
      access_level: aiAccessLevel,
      generated_at: new Date().toISOString(),
      user_id: user.id,
      message: "AI insights are not yet configured. This endpoint is ready for real AI service integration."
    });

  } catch (error) {
    console.error('Error in AI insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}