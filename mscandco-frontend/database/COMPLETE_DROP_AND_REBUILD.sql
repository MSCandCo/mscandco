-- COMPLETE DROP AND REBUILD - NO PATCHING
-- MSC & Co Platform - Fresh Start
-- WARNING: This WILL delete all existing data!

-- ================================
-- STEP 1: DROP EVERYTHING (Clean Slate)
-- ================================

-- Drop all custom tables completely
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS revenue_reports CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS artist_requests CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_releases_updated_at() CASCADE;

-- ================================
-- STEP 2: CREATE USER_PROFILES FROM SCRATCH
-- ================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  artist_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL,
  subscription_tier TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  chartmetric_data JSONB,
  earnings_data JSONB,
  label_admin_id UUID,
  company_admin_id UUID,
  default_label_admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 3: CREATE ARTIST_REQUESTS TABLE
-- ================================

CREATE TABLE artist_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_label_id UUID NOT NULL,
  to_artist_id UUID NOT NULL,
  artist_first_name TEXT NOT NULL,
  artist_last_name TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  label_admin_name TEXT NOT NULL,
  label_admin_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- ================================
-- STEP 4: CREATE RELEASES TABLE
-- ================================

CREATE TABLE releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  label_admin_id UUID,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'draft',
  submission_date TIMESTAMP WITH TIME ZONE,
  approval_date TIMESTAMP WITH TIME ZONE,
  go_live_date TIMESTAMP WITH TIME ZONE,
  revenue_split JSONB,
  platform_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 5: CREATE REVENUE_REPORTS TABLE
-- ================================

CREATE TABLE revenue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  release_id UUID,
  reported_by_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  platform TEXT NOT NULL,
  territory TEXT,
  period_start DATE,
  period_end DATE,
  period_description TEXT,
  streams BIGINT DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 6: CREATE SUBSCRIPTIONS TABLE
-- ================================

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  billing_cycle TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  revolut_payment_id TEXT,
  external_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 7: CREATE WALLET_TRANSACTIONS TABLE
-- ================================

CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- STEP 8: ADD ALL CONSTRAINTS
-- ================================

-- User profiles constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'pro', 'label_starter', 'label_pro'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- Artist requests constraints
ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'declined'));

-- Releases constraints
ALTER TABLE releases ADD CONSTRAINT releases_release_type_check 
CHECK (release_type IN ('single', 'ep', 'album', 'compilation'));

ALTER TABLE releases ADD CONSTRAINT releases_status_check 
CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'live', 'rejected'));

-- Revenue reports constraints
ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'paid'));

-- Subscriptions constraints
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN ('artist_starter', 'artist_pro', 'label_starter', 'label_pro'));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'past_due'));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_cycle_check 
CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Wallet transactions constraints
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check 
CHECK (type IN ('credit', 'debit', 'payout', 'subscription', 'revenue'));

ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- ================================
-- STEP 9: ADD FOREIGN KEY REFERENCES
-- ================================

-- User profiles self-references
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_label_admin_fkey 
FOREIGN KEY (label_admin_id) REFERENCES user_profiles(id);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_company_admin_fkey 
FOREIGN KEY (company_admin_id) REFERENCES user_profiles(id);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_default_label_admin_fkey 
FOREIGN KEY (default_label_admin_id) REFERENCES user_profiles(id);

-- Artist requests references
ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_from_label_fkey 
FOREIGN KEY (from_label_id) REFERENCES user_profiles(id);

ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_to_artist_fkey 
FOREIGN KEY (to_artist_id) REFERENCES user_profiles(id);

-- Releases references
ALTER TABLE releases ADD CONSTRAINT releases_artist_fkey 
FOREIGN KEY (artist_id) REFERENCES user_profiles(id);

ALTER TABLE releases ADD CONSTRAINT releases_label_admin_fkey 
FOREIGN KEY (label_admin_id) REFERENCES user_profiles(id);

-- Revenue reports references
ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_artist_fkey 
FOREIGN KEY (artist_id) REFERENCES user_profiles(id);

ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_release_fkey 
FOREIGN KEY (release_id) REFERENCES releases(id);

ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_reported_by_fkey 
FOREIGN KEY (reported_by_id) REFERENCES user_profiles(id);

-- Subscriptions references
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- Wallet transactions references
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- ================================
-- STEP 10: CREATE PERFORMANCE INDEXES
-- ================================

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX idx_artist_requests_from_label ON artist_requests(from_label_id);
CREATE INDEX idx_artist_requests_to_artist ON artist_requests(to_artist_id);
CREATE INDEX idx_artist_requests_status ON artist_requests(status);
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_releases_release_date ON releases(release_date);
CREATE INDEX idx_revenue_reports_artist_id ON revenue_reports(artist_id);
CREATE INDEX idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- ================================
-- STEP 11: ENABLE ROW LEVEL SECURITY
-- ================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ================================
-- STEP 12: CREATE ESSENTIAL USERS
-- ================================

-- Insert essential users for testing
INSERT INTO user_profiles (id, email, first_name, last_name, artist_name, role, subscription_status) VALUES
('0a060de5-1c94-4060-a1c2-860224fc348d', 'info@htay.co.uk', 'Henry', 'Taylor', 'Henry Taylor', 'artist', 'active'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'companyadmin@mscandco.com', 'Company', 'Admin', NULL, 'company_admin', 'active'),
('f9e8d7c6-b5a4-9382-7160-fedcba987654', 'superadmin@mscandco.com', 'Super', 'Admin', NULL, 'super_admin', 'active'),
('12345678-1234-5678-9012-123456789012', 'labeladmin@mscandco.com', 'Label', 'Admin', NULL, 'label_admin', 'active'),
('87654321-4321-8765-2109-876543210987', 'codegroup@mscandco.com', 'Code', 'Group', NULL, 'distribution_partner', 'active')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  artist_name = EXCLUDED.artist_name,
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status;

-- ================================
-- STEP 13: CREATE UPDATE TRIGGERS
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
