import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

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

export default requireRole('super_admin')(handler);
