import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  
  console.log('Searching for artist:', q);
  
  if (!q || q.length < 2) {
    return res.json({ artists: [] });
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'artist')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Found artists:', data);
    
    // Format results
    const artists = data.map(a => ({
      id: a.id,
      name: `${a.first_name} ${a.last_name}`,
      email: a.email
    }));

    return res.json({ artists });
  } catch (error) {
    console.error('Search failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler)