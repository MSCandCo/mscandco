import { getUserPermissions } from '@/lib/permissions';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    let user = null;

    console.log('🔑 /api/user/permissions - Request received');
    console.log('🔑 Authorization header present?', !!req.headers.authorization);
    console.log('🔑 Cookie header present?', !!req.headers.cookie);

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      console.log('🔑 Attempting auth with Bearer token (length:', token.length, ')');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: { user: tokenUser }, error } = await supabaseClient.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
        console.log('✅ Auth successful via Bearer token:', user.id);
      } else {
        console.log('❌ Bearer token auth failed:', error?.message);
      }
    }

    // Fall back to cookie-based session
    if (!user) {
      console.log('🔑 Attempting auth via cookies...');
      const supabase = createPagesServerClient({ req, res });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        console.log('❌ Cookie auth failed:', error?.message || 'No session');
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      user = session.user;
      console.log('✅ Auth successful via cookies:', user.id);
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

    // Add cache headers for Safari and other browsers
    // Cache for 5 minutes (300 seconds) to match client-side cache
    res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    res.setHeader('CDN-Cache-Control', 'private, max-age=300');
    res.setHeader('Vary', 'Authorization, Cookie');

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


