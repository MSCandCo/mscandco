// Test save without auth for debugging
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
    const { artistId, releaseData, milestonesData } = req.body;

    console.log('🧪 Test save request:', { artistId, releaseData, milestonesData });

    // Store analytics data in chartmetric_data column
    const analyticsData = {
      latestRelease: releaseData,
      milestones: milestonesData,
      lastUpdated: new Date().toISOString(),
      type: 'manual_analytics'
    };

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ 
        chartmetric_data: analyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select();

    if (error) {
      console.error('❌ Test save error:', error);
      return res.status(500).json({ error: 'Failed to save analytics', details: error.message });
    }

    console.log('✅ Test save successful:', updated?.[0]?.id);

    return res.status(200).json({
      success: true,
      message: 'Test save successful',
      data: updated?.[0]
    });

  } catch (error) {
    console.error('Test save error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
