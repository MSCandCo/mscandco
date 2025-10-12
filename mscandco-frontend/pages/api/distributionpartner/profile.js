import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware

  if (req.method === 'GET') {
    // Fetch distribution partner profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(profile);
  }

  if (req.method === 'PUT') {
    // Update distribution partner profile
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
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Distribution Partner profiles don't manage releases directly
    console.log('✅ Distribution Partner profile updated');

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireRole('distribution_partner')(handler);