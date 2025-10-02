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

  console.log('👤 Company Admin profile API for:', user.email);

  if (req.method === 'GET') {
    // Fetch company admin profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    console.log('✅ Company Admin profile loaded from database');
    return res.status(200).json(profile);
  }

  if (req.method === 'PUT') {
    // Update company admin profile
    const updates = req.body;
    
    console.log('💾 Updating Company Admin profile:', updates);
    
    // Email field is locked (must match login email) - remove from updates
    delete updates.email;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Company Admin profiles don't manage releases directly
    console.log('✅ Company Admin profile updated');
    
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}