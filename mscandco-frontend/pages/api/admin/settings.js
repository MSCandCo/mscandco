import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;

    console.log('📋 Fetching settings for user:', userId);

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        display_name,
        phone,
        company_name,
        position,
        role,
        timezone,
        language_preference,
        date_format,
        notification_settings,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch profile',
        details: profileError.message
      });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log('✅ Settings fetched successfully');

    return res.status(200).json(profile);

  } catch (error) {
    console.error('❌ Error in settings API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requireAuth(handler);
