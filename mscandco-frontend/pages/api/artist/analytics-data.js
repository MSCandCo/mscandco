// Analytics Data API - Fetches from user_profiles analytics_data field
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const userId = req.user.id;
    console.log('Fetching analytics data for user:', userId);

    // Fetch analytics data from user_profiles (using analytics_data column)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('analytics_data, first_name, last_name, artist_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('⚠️ Error loading profile:', error);
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No analytics data found'
      });
    }

    const analyticsData = profile?.analytics_data;
    console.log('Analytics data for', profile?.first_name, ':', analyticsData ? 'Found' : 'Not found');

    if (!analyticsData || analyticsData.type !== 'manual_analytics') {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No analytics data found'
      });
    }

    // Calculate relative dates for milestones
    const milestones = analyticsData.milestones || [];
    const milestonesWithRelativeDates = milestones.map(milestone => ({
      ...milestone,
      relativeDate: milestone.date ? calculateRelativeDate(milestone.date) : 'Recently'
    }));

    console.log('Analytics data loaded:', {
      hasLatestRelease: !!analyticsData.latestRelease,
      milestonesCount: milestonesWithRelativeDates.length,
      lastUpdated: analyticsData.lastUpdated
    });

    // Return data in format expected by CleanAnalyticsDisplay
    return res.status(200).json({
      success: true,
      data: {
        latestRelease: analyticsData.latestRelease,
        milestones: milestonesWithRelativeDates,
        sectionVisibility: analyticsData.sectionVisibility || {},
        advancedData: analyticsData.advancedData || {},
        lastUpdated: analyticsData.lastUpdated || new Date().toISOString(),
        source: 'manual_admin_system'
      },
      message: 'Analytics data loaded successfully'
    });

  } catch (error) {
    console.error('Analytics data API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper function to calculate relative dates
function calculateRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

// Protect with analytics:view:own permission
export default requirePermission('analytics:view:own')(handler);