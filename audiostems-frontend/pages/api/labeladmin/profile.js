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
    // Fetch label admin profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json(profile);
  }

  if (req.method === 'PUT') {
    // Update label admin profile
    const updates = req.body;
    
    console.log('👤 Label Admin profile API - Updating profile for:', user.email);
    console.log('📋 Updates received:', updates);
    
    // Remove locked fields that shouldn't be directly updated (keep only personal info locked)
    delete updates.first_name;
    delete updates.last_name;
    delete updates.email;
    delete updates.date_of_birth;
    delete updates.nationality;
    delete updates.country;
    delete updates.city;
    delete updates.phone;
    
    // Remove audit data - don't save to database
    delete updates._audit;
    
    console.log('📝 Final updates after filtering:', updates);

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database update error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Profile updated successfully in database');

    // SINGLE SOURCE OF TRUTH: Mark all label's releases for cache refresh
    try {
      await supabase
        .from('releases')
        .update({ cache_updated_at: null })
        .eq('label_admin_id', user.id);
      console.log('🔄 Label Admin releases marked for cache refresh');
    } catch (cacheError) {
      console.error('Cache refresh error:', cacheError);
    }
    
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}