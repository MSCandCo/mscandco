// Check what columns exist in user_profiles
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // SECURITY: Disable debug endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    // Get a user profile to see available columns
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const sampleProfile = profiles?.[0];
    const availableColumns = sampleProfile ? Object.keys(sampleProfile) : [];

    console.log('📋 Available user_profiles columns:', availableColumns);

    return res.status(200).json({
      success: true,
      availableColumns,
      sampleProfile
    });

  } catch (error) {
    console.error('Error checking columns:', error);
    return res.status(500).json({ error: error.message });
  }
}
