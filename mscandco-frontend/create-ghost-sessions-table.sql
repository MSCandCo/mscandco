-- ========================================
-- CREATE GHOST SESSIONS TABLE
-- ========================================

-- Create ghost_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS ghost_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  magic_link TEXT NOT NULL,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ghost_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_users_full_access" ON ghost_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON ghost_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON ghost_sessions;
DROP POLICY IF EXISTS "allow_service_role_all" ON ghost_sessions;

-- Create comprehensive policies
CREATE POLICY "authenticated_users_full_access" ON ghost_sessions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON ghost_sessions TO authenticated;
GRANT ALL ON ghost_sessions TO service_role;
GRANT ALL ON ghost_sessions TO anon;
