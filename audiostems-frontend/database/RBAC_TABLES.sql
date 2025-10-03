-- ============================================================
-- RBAC TABLES MIGRATION
-- Creates required tables for Role-Based Access Control system
-- ============================================================

-- 1. USER ROLE ASSIGNMENTS TABLE
-- ============================================================
-- Stores role assignments for each user
-- Primary table for determining user permissions

CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one active role per user (can have historical inactive roles)
  CONSTRAINT unique_active_role_per_user UNIQUE (user_id, is_active)
    WHERE is_active = true

);

-- Indexes for user_role_assignments
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_name ON user_role_assignments(role_name);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_is_active ON user_role_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_assigned_at ON user_role_assignments(assigned_at DESC);

-- RLS for user_role_assignments
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own role
CREATE POLICY "Users can view own role" ON user_role_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles" ON user_role_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = auth.uid()
      AND ura.role_name = 'super_admin'
      AND ura.is_active = true
    )
  );

-- Super admins can insert/update roles
CREATE POLICY "Super admins can manage roles" ON user_role_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = auth.uid()
      AND ura.role_name = 'super_admin'
      AND ura.is_active = true
    )
  );

-- 2. AUDIT LOGS TABLE
-- ============================================================
-- Logs all access attempts and permission checks for security auditing

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  permission_required TEXT,
  role_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'denied', 'error')),
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit_logs (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Composite index for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_status_created
  ON audit_logs(user_id, status, created_at DESC);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins and company admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = auth.uid()
      AND ura.role_name IN ('super_admin', 'company_admin')
      AND ura.is_active = true
    )
  );

-- Service role can insert audit logs (API middleware)
-- This is handled by service role key, no RLS policy needed for INSERT

-- 3. PERMISSION CACHE TABLE (Optional - for performance)
-- ============================================================
-- Caches computed permissions to reduce database queries

CREATE TABLE IF NOT EXISTS permission_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),

  CONSTRAINT unique_user_cache UNIQUE (user_id)
);

-- Index for permission_cache
CREATE INDEX IF NOT EXISTS idx_permission_cache_user_id ON permission_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires_at ON permission_cache(expires_at);

-- RLS for permission_cache
ALTER TABLE permission_cache ENABLE ROW LEVEL SECURITY;

-- Users can view their own cached permissions
CREATE POLICY "Users can view own permission cache" ON permission_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. TRIGGERS
-- ============================================================

-- Update updated_at timestamp on user_role_assignments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_role_assignments_updated_at
  BEFORE UPDATE ON user_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-expire permission cache
CREATE OR REPLACE FUNCTION cleanup_expired_permission_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM permission_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. HELPER FUNCTIONS
-- ============================================================

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT role_name
  FROM user_role_assignments
  WHERE user_id = p_user_id
  AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Check if user has permission (placeholder - actual permission logic in app)
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_role_assignments
    WHERE user_id = p_user_id
    AND role_name = p_role_name
    AND is_active = true
  );
$$ LANGUAGE sql STABLE;

-- 6. INITIAL DATA MIGRATION
-- ============================================================
-- Migrate existing users to have roles based on user_metadata

DO $$
DECLARE
  user_record RECORD;
  detected_role TEXT;
BEGIN
  -- Loop through all users
  FOR user_record IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
  LOOP
    -- Check if user already has a role
    IF NOT EXISTS (
      SELECT 1 FROM user_role_assignments
      WHERE user_id = user_record.id AND is_active = true
    ) THEN
      -- Detect role from email or metadata
      detected_role := 'artist'; -- default

      IF user_record.raw_user_meta_data->>'role' IS NOT NULL THEN
        detected_role := user_record.raw_user_meta_data->>'role';
      ELSIF user_record.email LIKE '%superadmin%' THEN
        detected_role := 'super_admin';
      ELSIF user_record.email LIKE '%companyadmin%' THEN
        detected_role := 'company_admin';
      ELSIF user_record.email LIKE '%labeladmin%' THEN
        detected_role := 'label_admin';
      ELSIF user_record.email LIKE '%distribution%' OR user_record.email LIKE '%codegroup%' THEN
        detected_role := 'distribution_partner';
      END IF;

      -- Insert role assignment
      INSERT INTO user_role_assignments (user_id, role_name, assigned_by, assigned_at, is_active)
      VALUES (user_record.id, detected_role, user_record.id, NOW(), true)
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Assigned role % to user %', detected_role, user_record.email;
    END IF;
  END LOOP;
END $$;

-- 7. GRANTS
-- ============================================================
-- Grant necessary permissions to authenticated users

GRANT SELECT ON user_role_assignments TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON permission_cache TO authenticated;

-- Service role has full access (already has SUPERUSER)

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check role distribution
SELECT role_name, COUNT(*) as user_count, COUNT(*) FILTER (WHERE is_active) as active_count
FROM user_role_assignments
GROUP BY role_name
ORDER BY user_count DESC;

-- Check recent audit logs
SELECT
  al.created_at,
  al.email,
  al.action,
  al.status,
  al.permission_required,
  al.role_name
FROM audit_logs al
ORDER BY al.created_at DESC
LIMIT 10;

-- Check users without roles
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
WHERE ura.id IS NULL
LIMIT 10;

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- Uncomment to rollback all changes:
/*
DROP TRIGGER IF EXISTS update_user_role_assignments_updated_at ON user_role_assignments;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS cleanup_expired_permission_cache();
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS user_has_role(UUID, TEXT);
DROP TABLE IF EXISTS permission_cache;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_role_assignments;
*/
