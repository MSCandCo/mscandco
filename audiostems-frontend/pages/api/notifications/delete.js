import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405);

  // req.user and req.userRole are automatically attached by middleware
  const user = req.user;

  const { notification_id } = req.body;

  const { error: deleteError } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notification_id)
    .eq('user_id', user.id); // Security: only delete own notifications

  if (deleteError) return res.status(500).json({ error: deleteError.message });

  return res.json({ success: true });
}

export default requireAuth()(handler);
