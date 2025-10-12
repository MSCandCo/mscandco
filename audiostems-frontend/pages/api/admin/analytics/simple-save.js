// Simple analytics save using existing accessible tables
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const { artistId, releaseData, milestonesData, advancedData, sectionVisibility, lastUpdated, type } = req.body;

    console.log('💾 Simple save request:', { artistId, type, releaseData, milestonesData, advancedData, sectionVisibility, lastUpdated });

    // Get existing data first to merge with new data
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('analytics_data')
      .eq('id', artistId)
      .single();

    const existingData = existingProfile?.analytics_data || {};

    // Store analytics data in analytics_data column (existing JSONB column)
    const analyticsData = {
      ...existingData,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
      type: 'manual_analytics'
    };

    // Update basic data if provided
    if (releaseData) {
      analyticsData.latestRelease = releaseData;
    }
    // Only update milestones if explicitly provided (not null or empty from Advanced save)
    if (milestonesData !== null && milestonesData !== undefined) {
      analyticsData.milestones = milestonesData;
    }

    // Update advanced data if provided
    if (advancedData) {
      analyticsData.advancedData = advancedData;
    }

    // Update visibility settings if provided
    if (sectionVisibility) {
      analyticsData.sectionVisibility = sectionVisibility;
    }

    // Update last updated timestamp if provided (single datetime for both Basic and Advanced)
    if (lastUpdated) {
      analyticsData.lastUpdated = lastUpdated; // Single timestamp for display
    }

    console.log('📦 Final analytics data to save:', analyticsData);

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

// V2 Permission: Requires create permission for analytics management
export default requirePermission('analytics:analytics_management:create')(handler);
