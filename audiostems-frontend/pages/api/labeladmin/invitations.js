import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);
  
  const label_admin_id = '12345678-1234-5678-9012-123456789012'; // Your label admin ID
  
  const { data, error } = await supabase
    .from('artist_invitations')
    .select('*')
    .eq('label_admin_id', label_admin_id)
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ invitations: data });
}
