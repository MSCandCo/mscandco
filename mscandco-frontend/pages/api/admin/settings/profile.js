import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      display_name,
      phone,
      company_name,
      position,
      timezone,
      language_preference,
      date_format
    } = req.body;

    console.log('📝 Updating profile for user:', userId);

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        first_name,
        last_name,
        display_name,
        phone,
        company_name,
        position,
        timezone,
        language_preference,
        date_format,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return res.status(500).json({
        error: 'Failed to update profile',
        details: error.message
      });
    }

    console.log('✅ Profile updated successfully');

    return res.status(200).json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('❌ Error in profile update API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requireAuth(handler);
