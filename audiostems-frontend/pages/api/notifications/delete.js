import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405);
  
  const { user, error } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { notification_id } = req.body;

  const { error: deleteError } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notification_id)
    .eq('user_id', user.id); // Security: only delete own notifications

  if (deleteError) return res.status(500).json({ error: deleteError.message });

  return res.json({ success: true });
}
