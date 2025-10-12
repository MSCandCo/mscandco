import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    console.log('🔐 Processing password change for user:', userId);

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get user's email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: current_password
    });

    if (signInError) {
      console.error('❌ Current password verification failed:', signInError.message);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: new_password }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return res.status(500).json({
        error: 'Failed to update password',
        details: updateError.message
      });
    }

    console.log('✅ Password updated successfully');

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in password change API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

export default requireAuth(handler);
