import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side API routes to bypass RLS
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('API Key Debug:', {
  hasServiceKey: !!serviceKey,
  serviceKeyPrefix: serviceKey?.substring(0, 20),
  usingKey: serviceKey ? 'SERVICE_ROLE' : 'ANON'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKey || anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the category from query params (optional)
    const { category } = req.query;

    let query = supabase
      .from('navigation_menus')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching navigation menus:', error);
      return res.status(500).json({ error: 'Failed to fetch navigation menus' });
    }

    // Group by category
    const menusByCategory = data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      menus: menusByCategory,
      flatMenus: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
