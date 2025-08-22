import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Get user from Supabase session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userId = user.id;

    // Verify super admin role
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', userId)
      .single();

    if (!roleData || roleData.role_name !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { subscription_id, updates } = req.body;

    if (!subscription_id || !updates) {
      return res.status(400).json({ error: 'Subscription ID and updates required' });
    }

    // Update the subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        tier: updates.tier,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    res.status(200).json({ 
      success: true,
      subscription: data,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
