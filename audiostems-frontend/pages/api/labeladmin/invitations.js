import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);
  
  // PROPER AUTHENTICATION - No hardcoded IDs
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const label_admin_id = user.id;
  
  const { data, error } = await supabase
    .from('artist_invitations')
    .select('*')
    .eq('label_admin_id', label_admin_id)
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ invitations: data });
}
