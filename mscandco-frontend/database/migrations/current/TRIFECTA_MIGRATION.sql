-- ============================================
-- TRIFECTA LAUNCH - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- PART 1: API KEYS SYSTEM
-- ============================================

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Key details
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  
  -- Permissions & Limits
  scopes JSONB DEFAULT '["read"]'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- API key usage logs
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_time ON api_key_usage(api_key_id, created_at DESC);

-- RLS Policies for API Keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API keys" ON api_keys;
CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own API key usage" ON api_key_usage;
CREATE POLICY "Users can view own API key usage" ON api_key_usage
  FOR SELECT USING (api_key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid()));

-- Functions for API Keys
CREATE OR REPLACE FUNCTION update_api_key_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_api_key_updated_at_trigger ON api_keys;
CREATE TRIGGER update_api_key_updated_at_trigger
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_updated_at();

CREATE OR REPLACE FUNCTION check_rate_limit(key_id_input UUID, limit_per_hour INTEGER)
RETURNS INTEGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM api_key_usage
  WHERE api_key_id = key_id_input
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN limit_per_hour - request_count;
END;
$$ LANGUAGE plpgsql;

-- PART 2: AFFILIATE PROGRAM
-- ============================================

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Affiliate Program
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_link ON affiliate_conversions(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_referred ON affiliate_conversions(referred_user_id);

-- RLS Policies for Affiliate Program
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own affiliate link" ON affiliate_links;
CREATE POLICY "Users can view own affiliate link" ON affiliate_links
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own conversions" ON affiliate_conversions;
CREATE POLICY "Users can view own conversions" ON affiliate_conversions
  FOR SELECT USING (
    affiliate_link_id IN (SELECT id FROM affiliate_links WHERE user_id = auth.uid())
  );

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  first_name TEXT;
  code TEXT;
  is_unique BOOLEAN;
BEGIN
  SELECT up.first_name INTO first_name
  FROM user_profiles up
  WHERE up.id = user_uuid;
  
  LOOP
    code := UPPER(COALESCE(first_name, 'USER')) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT NOT EXISTS(
      SELECT 1 FROM affiliate_links WHERE affiliate_code = code
    ) INTO is_unique;
    
    EXIT WHEN is_unique;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to track referral
CREATE OR REPLACE FUNCTION track_affiliate_referral(
  referred_user_uuid UUID,
  referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  affiliate_id UUID;
BEGIN
  SELECT id INTO affiliate_id
  FROM affiliate_links
  WHERE affiliate_code = referral_code
    AND is_active = TRUE;
  
  IF affiliate_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE affiliate_links
  SET total_referrals = total_referrals + 1,
      updated_at = NOW()
  WHERE id = affiliate_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 'API Keys System' AS system, COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('api_keys', 'api_key_usage')
UNION ALL
SELECT 'Affiliate Program' AS system, COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('affiliate_links', 'affiliate_conversions');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ TRIFECTA DATABASE SETUP COMPLETE!';
  RAISE NOTICE '📊 API Keys System: READY';
  RAISE NOTICE '🤝 Affiliate Program: READY';
  RAISE NOTICE '🚀 You can now deploy the frontend!';
END $$;

