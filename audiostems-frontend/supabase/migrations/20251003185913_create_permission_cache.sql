-- Create permission_cache table (missing from existing RBAC setup)
-- ============================================================

CREATE TABLE IF NOT EXISTS permission_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),

  CONSTRAINT unique_user_cache UNIQUE (user_id)
);

-- Indexes for permission_cache
CREATE INDEX IF NOT EXISTS idx_permission_cache_user_id ON permission_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires_at ON permission_cache(expires_at);

-- RLS for permission_cache
ALTER TABLE permission_cache ENABLE ROW LEVEL SECURITY;

-- Users can view their own cached permissions
CREATE POLICY "Users can view own permission cache" ON permission_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Cleanup function for expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_permission_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM permission_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
