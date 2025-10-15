import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  try {
    const user = req.user;

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

export default requirePermission(['distribution:settings:access'])(handler);
