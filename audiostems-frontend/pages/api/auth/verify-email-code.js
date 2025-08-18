import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Get user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check verification code
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('code', code)
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verificationData) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification code',
        details: verificationError?.message 
      });
    }

    // Mark code as used
    const { error: updateCodeError } = await supabase
      .from('email_verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', verificationData.id);

    if (updateCodeError) {
      console.error('Error marking code as used:', updateCodeError);
    }

    // Update user profile to mark email as verified
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({ 
        email_verified: true,
        registration_stage: 'backup_codes_setup'
      })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Error updating user profile:', updateProfileError);
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    // Update auth user email_confirmed_at
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateAuthError) {
      console.error('Error updating auth user:', updateAuthError);
    }

    res.status(200).json({ 
      message: 'Email verified successfully',
      nextStep: 'backup_codes_setup'
    });

  } catch (error) {
    console.error('Error verifying email code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
