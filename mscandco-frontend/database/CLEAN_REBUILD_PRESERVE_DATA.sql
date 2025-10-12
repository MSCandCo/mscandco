-- CLEAN REBUILD - PRESERVE EXISTING USER DATA
-- MSC & Co Platform - Proper Database Rebuild
-- This preserves existing user_profiles data while adding missing columns

-- ================================
-- STEP 1: CLEAN UP DEPENDENT TABLES FIRST
-- ================================

DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS revenue_reports CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS artist_requests CASCADE;

-- ================================
-- STEP 2: ADD MISSING COLUMNS TO EXISTING USER_PROFILES
-- ================================

-- Add missing columns if they don't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_data JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS earnings_data JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_admin_id UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_admin_id UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_label_admin_id UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users with roles if they don't have them
UPDATE user_profiles SET role = 'artist' WHERE role IS NULL AND email = 'info@htay.co.uk';
UPDATE user_profiles SET role = 'company_admin' WHERE role IS NULL AND email = 'companyadmin@mscandco.com';
UPDATE user_profiles SET role = 'super_admin' WHERE role IS NULL AND email = 'superadmin@mscandco.com';
UPDATE user_profiles SET role = 'distribution_partner' WHERE role IS NULL AND email LIKE '%codegroup%';
UPDATE user_profiles SET role = 'label_admin' WHERE role IS NULL AND email = 'labeladmin@mscandco.com';

-- Set default role for any remaining null roles
UPDATE user_profiles SET role = 'artist' WHERE role IS NULL;

-- ================================
-- STEP 3: ADD CONSTRAINTS TO USER_PROFILES
-- ================================

-- Drop existing constraints if they exist
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;

-- Add new constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'pro', 'label_starter', 'label_pro') OR subscription_tier IS NULL);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- ================================
-- STEP 4: CREATE ARTIST REQUESTS TABLE
-- ================================

CREATE TABLE artist_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_label_id UUID NOT NULL REFERENCES user_profiles(id),
  to_artist_id UUID NOT NULL REFERENCES user_profiles(id),
  artist_first_name TEXT NOT NULL,
  artist_last_name TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  label_admin_name TEXT NOT NULL,
  label_admin_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- ================================
-- STEP 5: CREATE RELEASES TABLE
-- ================================

CREATE TABLE releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  label_admin_id UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('single', 'ep', 'album', 'compilation')),
  genre TEXT,
  subgenre TEXT,
  release_date DATE,
  artwork_url TEXT,
  audio_file_url TEXT,
  audio_file_name TEXT,
  duration_seconds INTEGER,
  explicit_content BOOLEAN DEFAULT FALSE,
  isrc TEXT,
  upc TEXT,
  catalog_number TEXT,
  copyright_holder TEXT,
  publishing_info TEXT,
  territories TEXT[],
  distribution_territories JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'live', 'rejected')),
  submission_date TIMESTAMP WITH TIME ZONE,
  approval_date TIMESTAMP WITH TIME ZONE,
  go_live_date TIMESTAMP WITH TIME ZONE,
  revenue_split JSONB,
  platform_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 6: CREATE REVENUE REPORTS TABLE
-- ================================

CREATE TABLE revenue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  release_id UUID REFERENCES releases(id),
  reported_by_id UUID NOT NULL REFERENCES user_profiles(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  platform TEXT NOT NULL,
  territory TEXT,
  period_start DATE,
  period_end DATE,
  period_description TEXT,
  streams BIGINT DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by_id UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 7: CREATE SUBSCRIPTIONS TABLE
-- ================================

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  tier TEXT NOT NULL CHECK (tier IN ('artist_starter', 'artist_pro', 'label_starter', 'label_pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  amount DECIMAL(8,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  revolut_payment_id TEXT,
  external_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 8: CREATE WALLET TRANSACTIONS TABLE
-- ================================

CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payout', 'subscription', 'revenue')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 9: CREATE INDEXES
-- ================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_artist_requests_status ON artist_requests(status);
CREATE INDEX IF NOT EXISTS idx_artist_requests_from_label ON artist_requests(from_label_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_to_artist ON artist_requests(to_artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_artist_id ON revenue_reports(artist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- ================================
-- STEP 10: ENABLE ROW LEVEL SECURITY
-- ================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
