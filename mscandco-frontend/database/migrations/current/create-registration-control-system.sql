-- ===========================================
-- Registration Control System
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Enable/disable registration and manage waitlist
-- ===========================================

-- ===========================================
-- 1. CREATE PLATFORM SETTINGS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);

-- Insert default registration setting (enabled by default)
INSERT INTO platform_settings (key, value, description)
VALUES (
  'registration_enabled',
  'true'::jsonb,
  'Controls whether new user registration is enabled'
)
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- 2. CREATE WAITLIST TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS registration_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'artist',
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON registration_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON registration_waitlist(notified);
CREATE INDEX IF NOT EXISTS idx_waitlist_joined_at ON registration_waitlist(joined_at DESC);

-- ===========================================
-- 3. CREATE FUNCTION TO UPDATE SETTINGS UPDATED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_platform_settings_timestamp ON platform_settings;
CREATE TRIGGER update_platform_settings_timestamp
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();

-- ===========================================
-- 4. GRANT PERMISSIONS
-- ===========================================

-- Allow authenticated users to read platform settings
GRANT SELECT ON platform_settings TO authenticated;

-- Only service role can update platform settings
GRANT ALL ON platform_settings TO service_role;

-- Allow authenticated users to insert into waitlist (for public registration page)
GRANT INSERT ON registration_waitlist TO authenticated;

-- Allow service role full access to waitlist
GRANT ALL ON registration_waitlist TO service_role;

-- ===========================================
-- 5. RLS POLICIES
-- ===========================================

-- Platform settings: Only readable by authenticated users
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings"
ON platform_settings
FOR SELECT
TO authenticated
USING (true);

-- Waitlist: Public can add themselves, admins can read
ALTER TABLE registration_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add to waitlist"
ON registration_waitlist
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can read waitlist (checked via service role in API)
-- Service role bypasses RLS

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- This migration creates:
-- ✅ platform_settings table for registration_enabled flag
-- ✅ registration_waitlist table for managing waitlist
-- ✅ Proper indexes for performance
-- ✅ RLS policies for security
-- ✅ Default setting: registration_enabled = true

