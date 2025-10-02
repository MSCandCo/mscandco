import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    // Fetch custom admin profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json(profile);
  }

  if (req.method === 'PUT') {
    // Update custom admin profile
    const updates = req.body;
    
    // Remove locked fields that shouldn't be directly updated
    delete updates.first_name;
    delete updates.last_name;
    delete updates.email;
    delete updates.date_of_birth;
    delete updates.nationality;
    delete updates.country;
    delete updates.city;
    delete updates.phone;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // SINGLE SOURCE OF TRUTH: Mark all admin's managed content for cache refresh
    await supabase
      .from('releases')
      .update({ cache_updated_at: null })
      .eq('custom_admin_id', user.id);

    console.log('🔄 Custom Admin content marked for cache refresh');
    
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
