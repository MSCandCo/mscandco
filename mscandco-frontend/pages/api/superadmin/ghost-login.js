import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'POST') {
      // Start ghost session
      return await startGhostSession(req, res);
    } else if (method === 'DELETE') {
      // End ghost session
      return await endGhostSession(req, res);
    } else if (method === 'GET') {
      // Get active ghost sessions
      return await getActiveSessions(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Error in ghost login API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function startGhostSession(req, res) {
  const { target_user_id, notes } = req.body;
  const admin_id = req.user?.id;

  if (!target_user_id) {
    return res.status(400).json({ error: 'target_user_id is required' });
  }

  // Check if target user exists
  const { data: targetUser, error: userError } = await supabase
    .from('user_profiles')
    .select('id, email, role, first_name, last_name, artist_name')
    .eq('id', target_user_id)
    .single();

  if (userError || !targetUser) {
    return res.status(404).json({ error: 'Target user not found' });
  }

  // Prevent ghosting into another super admin
  if (targetUser.role === 'super_admin') {
    return res.status(403).json({ error: 'Cannot ghost login to another super admin' });
  }

  // Create auth session for target user
  const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    }
  });

  if (authError) {
    console.error('Auth error:', authError);
    return res.status(500).json({ error: 'Failed to generate ghost session' });
  }

  // Log ghost session
  const { data: auditLog, error: auditError } = await supabase
    .from('ghost_login_audit')
    .insert({
      admin_id,
      target_user_id,
      session_token: authData.properties.hashed_token || 'unknown',
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'],
      notes
    })
    .select()
    .single();

  if (auditError) {
    console.error('Audit log error:', auditError);
  }

  console.log(`✅ Ghost login started: Admin ${admin_id} -> User ${target_user_id}`);

  return res.status(200).json({
    success: true,
    ghost_session: {
      id: auditLog?.id,
      target_user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.artist_name || `${targetUser.first_name} ${targetUser.last_name}`.trim(),
        role: targetUser.role
      },
      magic_link: authData.properties.action_link,
      started_at: new Date().toISOString()
    }
  });
}

async function endGhostSession(req, res) {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const { error } = await supabase
    .from('ghost_login_audit')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', session_id)
    .is('ended_at', null);

  if (error) {
    console.error('Error ending ghost session:', error);
    return res.status(500).json({ error: 'Failed to end ghost session' });
  }

  console.log(`✅ Ghost login ended: Session ${session_id}`);

  return res.status(200).json({
    success: true,
    message: 'Ghost session ended'
  });
}

async function getActiveSessions(req, res) {
  const admin_id = req.user?.id;

  const { data: sessions, error } = await supabase
    .from('ghost_login_audit')
    .select(`
      id,
      admin_id,
      target_user_id,
      started_at,
      ended_at,
      notes,
      target:target_user_id (
        email,
        first_name,
        last_name,
        artist_name,
        role
      )
    `)
    .eq('admin_id', admin_id)
    .is('ended_at', null)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }

  return res.status(200).json({
    success: true,
    sessions
  });
}

// Only super admins with ghost_login permission can access
export default requirePermission('superadmin:ghost_login:access')(handler);
