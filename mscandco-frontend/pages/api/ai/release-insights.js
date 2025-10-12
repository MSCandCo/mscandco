import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check user's subscription for AI access level
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', req.user.id)
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
      user_id: req.user.id,
      message: "AI insights are not yet configured. This endpoint is ready for real AI service integration."
    });

  } catch (error) {
    console.error('Error in AI insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler)