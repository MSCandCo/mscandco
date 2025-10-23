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

  // Create ghost session record
  const { data: ghostSession, error: sessionError } = await supabase
    .from('ghost_sessions')
    .insert({
      admin_user_id: admin_id,
      target_user_id,
      magic_link: authData.properties.action_link,
      notes,
      is_active: true
    })
    .select()
    .single();

  if (sessionError) {
    console.error('Ghost session creation error:', sessionError);
  }

  console.log(`✅ Ghost login started: Admin ${admin_id} -> User ${target_user_id}`);

  return res.status(200).json({
    success: true,
    ghost_session: {
      id: ghostSession?.id,
      target_user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.artist_name || `${targetUser.first_name} ${targetUser.last_name}`.trim(),
        role: targetUser.role
      },
      magic_link: authData.properties.action_link,
      started_at: ghostSession?.started_at || new Date().toISOString()
    }
  });
}

async function endGhostSession(req, res) {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const { error } = await supabase
    .from('ghost_sessions')
    .update({
      ended_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', session_id)
    .eq('is_active', true);

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

  // Get active sessions
  const { data: sessions, error } = await supabase
    .from('ghost_sessions')
    .select('id, admin_user_id, target_user_id, started_at, ended_at, notes, is_active')
    .eq('admin_user_id', admin_id)
    .eq('is_active', true)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }

  // Fetch target user profiles for each session
  const targetUserIds = sessions.map(s => s.target_user_id);
  const { data: targetProfiles } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name, artist_name, role')
    .in('id', targetUserIds);

  // Merge profiles with sessions
  const sessionsWithUsers = sessions.map(session => ({
    ...session,
    target: targetProfiles?.find(p => p.id === session.target_user_id)
  }));

  return res.status(200).json({
    success: true,
    sessions: sessionsWithUsers
  });
}

// Only super admins with ghost_login permission can access
export default requirePermission('superadmin:ghost_login:access')(handler);
