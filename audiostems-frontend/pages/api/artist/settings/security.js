import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get security data from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('two_factor_enabled')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: {
          twoFactorEnabled: data?.two_factor_enabled || false,
          loginHistory: [] // TODO: Implement login history tracking
        }
      });
    }

    if (req.method === 'POST') {
      const { action, currentPassword, newPassword } = req.body;

      if (action === 'change_password') {
        // Change password using Supabase auth
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          throw error;
        }

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in security API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
