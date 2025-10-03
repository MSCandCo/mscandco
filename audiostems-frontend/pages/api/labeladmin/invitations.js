import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);

  // req.user and req.userRole are automatically attached by middleware

  const label_admin_id = req.user.id;
  
  const { data, error } = await supabase
    .from('artist_invitations')
    .select('*')
    .eq('label_admin_id', label_admin_id)
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ invitations: data });
}

export default requireAuth(handler);
