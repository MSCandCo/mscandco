// Get artists and label admins with proper role filtering
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin access
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const userInfo = jwt.decode(token);
    const userRole = userInfo?.user_metadata?.role;
    
    if (!['super_admin', 'company_admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all auth users
    const { data: authResult } = await supabase.auth.admin.listUsers();
    const authUsers = authResult?.users || [];

    // Get all user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, artist_name');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profiles' });
    }

    // Combine auth users with profiles and filter for artists and label admins
    const usersWithRoles = authUsers.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const role = authUser.user_metadata?.role || 'artist'; // Default to artist

      return {
        id: authUser.id,
        email: authUser.email,
        role: role,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        artist_name: profile?.artist_name || '',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      };
    });

    // Filter to only include artists and label admins
    const artistsAndLabelAdmins = usersWithRoles.filter(user => 
      ['artist', 'label_admin'].includes(user.role)
    );

    console.log(`📊 Found ${artistsAndLabelAdmins.length} artists/label admins out of ${authUsers.length} total users`);

    return res.status(200).json({
      success: true,
      users: artistsAndLabelAdmins,
      total: artistsAndLabelAdmins.length,
      breakdown: {
        artists: artistsAndLabelAdmins.filter(u => u.role === 'artist').length,
        labelAdmins: artistsAndLabelAdmins.filter(u => u.role === 'label_admin').length
      }
    });

  } catch (error) {
    console.error('Error fetching artists:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
