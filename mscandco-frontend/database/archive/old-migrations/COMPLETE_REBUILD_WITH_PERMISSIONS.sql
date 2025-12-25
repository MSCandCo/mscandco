-- COMPLETE PLATFORM REBUILD WITH PERMISSIONS SYSTEM
-- MSC & Co Platform - 6 User Roles + Flexible Permissions
-- WARNING: This DROPS EVERYTHING and rebuilds from scratch!

-- ================================
-- STEP 1: COMPLETE CLEAN SLATE
-- ================================

-- Drop ALL custom tables
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS revenue_reports CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS artist_requests CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS permission_definitions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_releases_updated_at() CASCADE;

-- ================================
-- STEP 2: PERMISSION SYSTEM FOUNDATION
-- ================================

-- Define all possible permissions in the platform
CREATE TABLE permission_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all platform permissions
INSERT INTO permission_definitions (name, category, description) VALUES
-- User Management
('view_all_users', 'users', 'View all platform users'),
('edit_user_profiles', 'users', 'Edit user profiles and settings'),
('delete_users', 'users', 'Delete user accounts'),
('manage_user_subscriptions', 'users', 'Manage user subscription status'),

-- Analytics Management
('view_analytics', 'analytics', 'View analytics dashboards'),
('manage_analytics', 'analytics', 'Edit analytics data for artists'),
('view_all_analytics', 'analytics', 'View analytics for all users'),

-- Earnings Management
('view_earnings', 'earnings', 'View earnings dashboards'),
('manage_earnings', 'earnings', 'Edit earnings data for artists'),
('view_all_earnings', 'earnings', 'View earnings for all users'),
('approve_payouts', 'earnings', 'Approve payout requests'),

-- Release Management
('view_releases', 'releases', 'View releases'),
('create_releases', 'releases', 'Create new releases'),
('edit_releases', 'releases', 'Edit release information'),
('approve_releases', 'releases', 'Approve releases for distribution'),
('view_all_releases', 'releases', 'View all platform releases'),

-- Request Management
('view_requests', 'requests', 'View artist requests'),
('manage_requests', 'requests', 'Handle artist approval requests'),
('send_artist_invitations', 'requests', 'Send invitations to artists'),

-- Financial Management
('view_revenue_reports', 'finance', 'View revenue reports'),
('create_revenue_reports', 'finance', 'Create revenue reports'),
('approve_revenue_reports', 'finance', 'Approve revenue reports'),
('manage_revenue_splits', 'finance', 'Manage revenue split configurations'),

-- Platform Administration
('platform_settings', 'admin', 'Manage platform-wide settings'),
('system_monitoring', 'admin', 'Monitor system health and performance'),
('manage_permissions', 'admin', 'Manage custom admin permissions'),

-- Distribution Management
('view_distribution', 'distribution', 'View distribution dashboard'),
('manage_distribution', 'distribution', 'Manage distribution workflow'),
('distribution_reports', 'distribution', 'Generate distribution reports');

-- ================================
-- STEP 3: USER PROFILES WITH 6 ROLES
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
  
  -- Analytics and Earnings Data
  chartmetric_data JSONB,
  earnings_data JSONB,
  
  -- Hierarchical Relationships
  label_admin_id UUID,
  company_admin_id UUID,
  default_label_admin_id UUID,
  
  -- Custom Admin Settings
  is_custom_admin BOOLEAN DEFAULT FALSE,
  custom_admin_title TEXT,
  custom_admin_description TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role constraint for 6 roles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner', 'custom_admin'));

-- Add other constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'pro', 'label_starter', 'label_pro'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- ================================
-- STEP 4: USER PERMISSIONS MAPPING
-- ================================

-- Link users to their specific permissions (for Custom Admins)
CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_name TEXT NOT NULL,
  granted_by_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Add foreign keys
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_permission_fkey 
FOREIGN KEY (permission_name) REFERENCES permission_definitions(name);

ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_granted_by_fkey 
FOREIGN KEY (granted_by_id) REFERENCES user_profiles(id);

-- ================================
-- STEP 5: ALL OTHER TABLES
-- ================================

-- Artist Requests
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

ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'declined'));

-- Releases
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

ALTER TABLE releases ADD CONSTRAINT releases_release_type_check 
CHECK (release_type IN ('single', 'ep', 'album', 'compilation'));

ALTER TABLE releases ADD CONSTRAINT releases_status_check 
CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'live', 'rejected'));

-- Revenue Reports
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

ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'paid'));

-- Subscriptions
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

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN ('artist_starter', 'artist_pro', 'label_starter', 'label_pro'));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'past_due'));

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_cycle_check 
CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Wallet Transactions
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

ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check 
CHECK (type IN ('credit', 'debit', 'payout', 'subscription', 'revenue'));

ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- ================================
-- STEP 6: ADD ALL FOREIGN KEYS
-- ================================

-- User profiles self-references
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_label_admin_fkey 
FOREIGN KEY (label_admin_id) REFERENCES user_profiles(id);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_company_admin_fkey 
FOREIGN KEY (company_admin_id) REFERENCES user_profiles(id);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_default_label_admin_fkey 
FOREIGN KEY (default_label_admin_id) REFERENCES user_profiles(id);

-- Artist requests
ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_from_label_fkey 
FOREIGN KEY (from_label_id) REFERENCES user_profiles(id);

ALTER TABLE artist_requests ADD CONSTRAINT artist_requests_to_artist_fkey 
FOREIGN KEY (to_artist_id) REFERENCES user_profiles(id);

-- Releases
ALTER TABLE releases ADD CONSTRAINT releases_artist_fkey 
FOREIGN KEY (artist_id) REFERENCES user_profiles(id);

ALTER TABLE releases ADD CONSTRAINT releases_label_admin_fkey 
FOREIGN KEY (label_admin_id) REFERENCES user_profiles(id);

-- Revenue reports
ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_artist_fkey 
FOREIGN KEY (artist_id) REFERENCES user_profiles(id);

ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_release_fkey 
FOREIGN KEY (release_id) REFERENCES releases(id);

ALTER TABLE revenue_reports ADD CONSTRAINT revenue_reports_reported_by_fkey 
FOREIGN KEY (reported_by_id) REFERENCES user_profiles(id);

-- Subscriptions
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- Wallet transactions
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- ================================
-- STEP 7: CREATE PERFORMANCE INDEXES
-- ================================

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_is_custom_admin ON user_profiles(is_custom_admin);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_name ON user_permissions(permission_name);
CREATE INDEX idx_user_permissions_active ON user_permissions(is_active);
CREATE INDEX idx_artist_requests_status ON artist_requests(status);
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_revenue_reports_artist_id ON revenue_reports(artist_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- ================================
-- STEP 8: ROW LEVEL SECURITY
-- ================================

ALTER TABLE permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ================================
-- STEP 9: CREATE ESSENTIAL USERS (6 ROLES)
-- ================================

INSERT INTO user_profiles (id, email, first_name, last_name, artist_name, role, subscription_status, is_custom_admin) VALUES
-- Core users
('0a060de5-1c94-4060-a1c2-860224fc348d', 'info@htay.co.uk', 'Henry', 'Taylor', 'Henry Taylor', 'artist', 'active', FALSE),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'companyadmin@mscandco.com', 'Company', 'Admin', NULL, 'company_admin', 'active', FALSE),
('f9e8d7c6-b5a4-9382-7160-fedcba987654', 'superadmin@mscandco.com', 'Super', 'Admin', NULL, 'super_admin', 'active', FALSE),
('12345678-1234-5678-9012-123456789012', 'labeladmin@mscandco.com', 'Label', 'Admin', NULL, 'label_admin', 'active', FALSE),
('87654321-4321-8765-2109-876543210987', 'codegroup@mscandco.com', 'Code', 'Group', NULL, 'distribution_partner', 'active', FALSE),

-- Custom Admin examples
('11111111-2222-3333-4444-555555555555', 'analytics@mscandco.com', 'Analytics', 'Manager', NULL, 'custom_admin', 'active', TRUE),
('22222222-3333-4444-5555-666666666666', 'requests@mscandco.com', 'Request', 'Handler', NULL, 'custom_admin', 'active', TRUE)

ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  artist_name = EXCLUDED.artist_name,
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status,
  is_custom_admin = EXCLUDED.is_custom_admin;

-- ================================
-- STEP 10: ASSIGN CUSTOM ADMIN PERMISSIONS
-- ================================

-- Analytics Manager - Can only manage analytics
INSERT INTO user_permissions (user_id, permission_name, granted_by_id) VALUES
('11111111-2222-3333-4444-555555555555', 'view_analytics', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('11111111-2222-3333-4444-555555555555', 'manage_analytics', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('11111111-2222-3333-4444-555555555555', 'view_all_analytics', 'f9e8d7c6-b5a4-9382-7160-fedcba987654');

-- Request Handler - Can only handle requests
INSERT INTO user_permissions (user_id, permission_name, granted_by_id) VALUES
('22222222-3333-4444-5555-666666666666', 'view_requests', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('22222222-3333-4444-5555-666666666666', 'manage_requests', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('22222222-3333-4444-5555-666666666666', 'view_all_users', 'f9e8d7c6-b5a4-9382-7160-fedcba987654');

-- ================================
-- STEP 11: UPDATE TRIGGERS
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

CREATE TRIGGER revenue_reports_updated_at
  BEFORE UPDATE ON revenue_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================
-- STEP 12: DEFAULT PERMISSIONS BY ROLE
-- ================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM user_profiles WHERE id = user_uuid;
  
  -- Super Admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Company Admin has most permissions
  IF user_role = 'company_admin' THEN
    RETURN permission_name NOT IN ('platform_settings', 'manage_permissions');
  END IF;
  
  -- Distribution Partner permissions
  IF user_role = 'distribution_partner' THEN
    RETURN permission_name IN ('view_distribution', 'manage_distribution', 'distribution_reports', 'create_revenue_reports', 'view_all_releases');
  END IF;
  
  -- Label Admin permissions
  IF user_role = 'label_admin' THEN
    RETURN permission_name IN ('send_artist_invitations', 'view_releases', 'create_releases', 'view_analytics', 'view_earnings');
  END IF;
  
  -- Artist permissions
  IF user_role = 'artist' THEN
    RETURN permission_name IN ('view_releases', 'create_releases', 'view_analytics', 'view_earnings');
  END IF;
  
  -- Custom Admin - check specific permissions
  IF user_role = 'custom_admin' THEN
    SELECT EXISTS(
      SELECT 1 FROM user_permissions 
      WHERE user_id = user_uuid 
        AND permission_name = permission_name 
        AND is_active = TRUE 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO has_permission;
    RETURN has_permission;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
