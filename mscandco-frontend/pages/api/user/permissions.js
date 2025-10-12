import { getUserPermissions } from '@/lib/permissions';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    let user = null;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: { user: tokenUser }, error } = await supabaseClient.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
      }
    }

    // Fall back to cookie-based session
    if (!user) {
      const supabase = createPagesServerClient({ req, res });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      user = session.user;
    }

    // Get user permissions using server-side function
    const permissions = await getUserPermissions(user.id, true); // Use service role

    // Extract permission names for client-side use
    const permissionNames = permissions.map(p => p.permission_name);

    console.log('📋 User permissions API response:', {
      user_id: user.id,
      user_email: user.email,
      permissions: permissionNames
    });

    res.status(200).json({
      success: true,
      permissions: permissionNames,
      user_id: user.id,
      user_email: user.email
    });

  } catch (error) {
    console.error('User permissions API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user permissions',
      details: error.message
    });
  }
}


