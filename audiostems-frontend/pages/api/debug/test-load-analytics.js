// Test loading analytics data without auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const userId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry Taylor

    console.log('📊 Test loading analytics data for user:', userId);

    // Fetch analytics data from user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('chartmetric_data, first_name, last_name, artist_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('⚠️ Error loading profile:', error);
      return res.status(500).json({ error: error.message });
    }

    const analyticsData = profile?.chartmetric_data;
    console.log('📦 Raw analytics data:', analyticsData);

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

    console.log('✅ Analytics data loaded:', {
      hasLatestRelease: !!analyticsData.latestRelease,
      milestonesCount: milestonesWithRelativeDates.length,
      lastUpdated: analyticsData.lastUpdated
    });

    return res.status(200).json({
      success: true,
      data: {
        latestRelease: analyticsData.latestRelease,
        milestones: milestonesWithRelativeDates,
        advancedData: analyticsData.advancedData, // Include advanced data
        sectionVisibility: analyticsData.sectionVisibility, // Include visibility settings
        lastUpdatedTimestamps: analyticsData.lastUpdatedTimestamps, // Include manual timestamps
        lastUpdated: analyticsData.lastUpdated,
        source: 'manual_admin_system'
      },
      message: 'Analytics data loaded successfully'
    });

  } catch (error) {
    console.error('Test load error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function calculateRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
