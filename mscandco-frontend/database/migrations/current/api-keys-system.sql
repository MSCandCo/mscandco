-- API Keys System for MSC & Co Public API
-- Enables developers and MCP to authenticate with the platform

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Key details
  name TEXT NOT NULL, -- e.g., "Production App", "MCP Server", "Testing"
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "msc_live_")
  
  -- Permissions & Limits
  scopes JSONB DEFAULT '["read"]'::jsonb, -- ["read", "write", "admin"]
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_requests INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_ip TEXT,
  last_used_ip TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- API key usage logs (for rate limiting and analytics)
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rate limiting queries (last hour)
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_time ON api_key_usage(api_key_id, created_at DESC);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys (revoke, rename, etc.)
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- API key usage: users can view their own usage logs
CREATE POLICY "Users can view own API key usage" ON api_key_usage
  FOR SELECT
  USING (
    api_key_id IN (
      SELECT id FROM api_keys WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_key_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_api_key_updated_at_trigger ON api_keys;
CREATE TRIGGER update_api_key_updated_at_trigger
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_updated_at();

-- Function to clean up old usage logs (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage_logs()
RETURNS void AS $$
BEGIN
  -- Keep only last 30 days of logs
  DELETE FROM api_key_usage
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Helper function to validate API key and get user
CREATE OR REPLACE FUNCTION validate_api_key(key_hash_input TEXT)
RETURNS TABLE (
  user_id UUID,
  key_id UUID,
  scopes JSONB,
  rate_limit INTEGER,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.user_id,
    ak.id AS key_id,
    ak.scopes,
    ak.rate_limit_per_hour AS rate_limit,
    (
      ak.is_active = TRUE AND
      (ak.expires_at IS NULL OR ak.expires_at > NOW())
    ) AS is_valid
  FROM api_keys ak
  WHERE ak.key_hash = key_hash_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit (returns remaining requests)
CREATE OR REPLACE FUNCTION check_rate_limit(key_id_input UUID, limit_per_hour INTEGER)
RETURNS INTEGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Count requests in the last hour
  SELECT COUNT(*) INTO request_count
  FROM api_key_usage
  WHERE api_key_id = key_id_input
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return remaining requests (negative if exceeded)
  RETURN limit_per_hour - request_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample API key for testing (you'll generate real ones via the dashboard)
-- This is just for development/testing
-- IMPORTANT: In production, keys are generated via the API endpoint

COMMENT ON TABLE api_keys IS 'API keys for authenticating with MSC & Co Public API';
COMMENT ON TABLE api_key_usage IS 'Usage logs for API keys - rate limiting and analytics';

