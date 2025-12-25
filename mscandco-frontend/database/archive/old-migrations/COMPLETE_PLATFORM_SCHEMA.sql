-- COMPLETE PLATFORM SCHEMA REBUILD
-- MSC & Co Platform - All Tables and Relationships
-- Run this in Supabase SQL Editor

-- ================================
-- CORE USER SYSTEM
-- ================================

-- Enhanced user_profiles table with all role fields
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  artist_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner')),
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'pro', 'label_starter', 'label_pro')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics data (JSONB for flexibility)
  chartmetric_data JSONB,
  earnings_data JSONB,
  
  -- Relationships
  label_admin_id UUID REFERENCES user_profiles(id),
  company_admin_id UUID REFERENCES user_profiles(id),
  default_label_admin_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ARTIST REQUEST SYSTEM
-- ================================

CREATE TABLE IF NOT EXISTS artist_requests (
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
-- RELEASES AND ASSETS SYSTEM
-- ================================

CREATE TABLE IF NOT EXISTS releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  label_admin_id UUID REFERENCES user_profiles(id),
  
  -- Release Information
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('single', 'ep', 'album', 'compilation')),
  genre TEXT,
  subgenre TEXT,
  release_date DATE,
  
  -- Asset Details for Distribution
  artwork_url TEXT,
  audio_file_url TEXT,
  audio_file_name TEXT,
  duration_seconds INTEGER,
  explicit_content BOOLEAN DEFAULT FALSE,
  
  -- Distribution Metadata
  isrc TEXT,
  upc TEXT,
  catalog_number TEXT,
  copyright_holder TEXT,
  publishing_info TEXT,
  
  -- Territories and Rights
  territories TEXT[], -- Array of country codes
  distribution_territories JSONB, -- Detailed territory info
  
  -- Workflow Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'live', 'rejected')),
  submission_date TIMESTAMP WITH TIME ZONE,
  approval_date TIMESTAMP WITH TIME ZONE,
  go_live_date TIMESTAMP WITH TIME ZONE,
  
  -- Financial
  revenue_split JSONB, -- Flexible revenue split configuration
  
  -- Platform Performance (from analytics)
  platform_stats JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- REVENUE TRACKING SYSTEM
-- ================================

CREATE TABLE IF NOT EXISTS revenue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  release_id UUID REFERENCES releases(id),
  reported_by_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Financial Data
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  platform TEXT NOT NULL,
  territory TEXT,
  
  -- Period Information
  period_start DATE,
  period_end DATE,
  period_description TEXT,
  
  -- Streams/Performance Data
  streams BIGINT DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  
  -- Approval Workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by_id UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- SUBSCRIPTION TRACKING
-- ================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Subscription Details
  tier TEXT NOT NULL CHECK (tier IN ('artist_starter', 'artist_pro', 'label_starter', 'label_pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- Billing
  amount DECIMAL(8,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment Integration
  revolut_payment_id TEXT,
  external_subscription_id TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- WALLET SYSTEM
-- ================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Transaction Details
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payout', 'subscription', 'revenue')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  description TEXT NOT NULL,
  
  -- References
  reference_id UUID, -- Can reference revenue_reports, subscriptions, etc.
  reference_type TEXT, -- 'revenue_report', 'subscription', 'payout', etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- Artist requests
CREATE INDEX IF NOT EXISTS idx_artist_requests_from_label ON artist_requests(from_label_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_to_artist ON artist_requests(to_artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_status ON artist_requests(status);

-- Releases
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date);
CREATE INDEX IF NOT EXISTS idx_releases_label_admin_id ON releases(label_admin_id);

-- Revenue reports
CREATE INDEX IF NOT EXISTS idx_revenue_reports_artist_id ON revenue_reports(artist_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_platform ON revenue_reports(platform);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_period ON revenue_reports(period_start, period_end);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Wallet transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('company_admin', 'super_admin', 'distribution_partner')
    )
  );

-- Artist requests policies
CREATE POLICY "Label admins can create requests" ON artist_requests
  FOR INSERT WITH CHECK (
    auth.uid() = from_label_id AND 
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'label_admin')
  );

CREATE POLICY "Users can view their requests" ON artist_requests
  FOR SELECT USING (auth.uid() = from_label_id OR auth.uid() = to_artist_id);

CREATE POLICY "Artists can respond to requests" ON artist_requests
  FOR UPDATE USING (auth.uid() = to_artist_id);

-- Releases policies
CREATE POLICY "Artists can manage own releases" ON releases
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Label admins can view their artists releases" ON releases
  FOR SELECT USING (auth.uid() = label_admin_id);

CREATE POLICY "Admins can view all releases" ON releases
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('company_admin', 'super_admin', 'distribution_partner')
    )
  );

-- Revenue reports policies
CREATE POLICY "Users can view own revenue" ON revenue_reports
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Distribution partners can create reports" ON revenue_reports
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'distribution_partner'
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Wallet transactions policies
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ================================
-- TRIGGERS FOR AUTO-UPDATES
-- ================================

-- Update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update releases.updated_at
CREATE OR REPLACE FUNCTION update_releases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION update_releases_updated_at();
