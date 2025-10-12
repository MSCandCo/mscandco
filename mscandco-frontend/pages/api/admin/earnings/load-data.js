// Manual Earnings Load API - Same concept as Analytics
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware

    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    console.log('📥 Loading earnings data for artist:', artistId);

    // Load existing data from user_profiles using service role (bypasses RLS)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('earnings_data')
      .eq('id', artistId)
      .maybeSingle(); // Use maybeSingle instead of single to handle missing rows

    if (error) {
      console.error('❌ Error loading profile:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load earnings data',
        details: error.message 
      });
    }

    // If no profile exists, return empty data
    if (!profile) {
      console.log('⚠️ No profile found for artist:', artistId);
      return res.json({
        success: true,
        data: null
      });
    }

    console.log('✅ Earnings data loaded successfully for artist:', artistId);

    return res.json({
      success: true,
      data: profile?.earnings_data || null
    });

  } catch (error) {
    console.error('Load earnings data API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load earnings data',
      details: error.message
    });
  }
}

// V2 Permission: Requires read permission for earnings management
export default requirePermission('finance:earnings_management:read')(handler);
