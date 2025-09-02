// Simple analytics save using existing accessible tables
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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
      return res.status(401).json({ error: 'No authorization token' });
    }

    const decoded = jwt.decode(token);
    const userRole = decoded?.user_metadata?.role;
    
    if (!['super_admin', 'company_admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { artistId, releaseData, milestonesData, type } = req.body;

    console.log('💾 Simple save request:', { artistId, type, releaseData, milestonesData });

    // Store analytics data in user_profiles as JSON (temporary solution)
    const analyticsData = {
      latestRelease: releaseData,
      milestones: milestonesData,
      lastUpdated: new Date().toISOString(),
      updatedBy: decoded?.sub
    };

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ 
        analytics_data: analyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select();

    if (error) {
      console.error('❌ Save error:', error);
      return res.status(500).json({ error: 'Failed to save analytics', details: error.message });
    }

    console.log('✅ Analytics saved to user_profiles:', updated?.[0]?.id);

    return res.status(200).json({
      success: true,
      message: 'Analytics saved successfully',
      data: updated?.[0]
    });

  } catch (error) {
    console.error('Simple save error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
