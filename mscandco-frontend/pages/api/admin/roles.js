import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get user from auth header
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Verify user with token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check if user has admin permissions (super_admin or admin role)
  const userRole = user.user_metadata?.role
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  try {
    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, description, is_system_role')
      .order('name', { ascending: true })

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
      return res.status(500).json({ error: 'Failed to fetch roles' })
    }

    return res.status(200).json({ roles })

  } catch (err) {
    console.error('Error in roles API:', err)
    return res.status(500).json({ error: err.message })
  }
}
