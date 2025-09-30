// DEBUG: Check affiliation requests in database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    console.log('🔍 Debug: Checking affiliation_requests table...');

    // Check what's in the new artist_invitations table
    const { data: requests, error } = await supabase
      .from('artist_invitations')
      .select('*');

    if (error) {
      console.error('❌ Debug error:', error);
      return res.json({ 
        error: error.message,
        tables: 'Error accessing affiliation_requests table'
      });
    }

    // Also check user profiles for debugging
    const { data: labelAdmins, error: labelError } = await supabase
      .from('user_profiles')
      .select('id, email, role, first_name, last_name')
      .eq('email', 'labeladmin@mscandco.com');

    const { data: artists, error: artistError } = await supabase
      .from('user_profiles')
      .select('id, email, role, first_name, last_name, artist_name')
      .eq('email', 'info@htay.co.uk');

    console.log('✅ Debug results:', {
      requestsCount: requests?.length || 0,
      labelAdminsCount: labelAdmins?.length || 0,
      artistsCount: artists?.length || 0
    });

    return res.json({
      success: true,
      artist_invitations: requests || [],
      label_admins: labelAdmins || [],
      artists: artists || [],
      summary: {
        total_invitations: requests?.length || 0,
        pending_invitations: requests?.filter(r => r.status === 'pending').length || 0,
        accepted_invitations: requests?.filter(r => r.status === 'accepted').length || 0
      }
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return res.json({ 
      error: 'Debug API failed',
      details: error.message
    });
  }
}
