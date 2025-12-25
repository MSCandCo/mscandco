-- FINAL COMPLETE REBUILD - 6 ROLES + PERMISSIONS SYSTEM
-- MSC & Co Platform - Complete Database Recreation
-- WARNING: This drops EVERYTHING and rebuilds from scratch

-- ================================
-- STEP 1: COMPLETE CLEAN SLATE
-- ================================

-- Drop ALL custom tables
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS permission_definitions CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS revenue_reports CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS artist_requests CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_releases_updated_at() CASCADE;

-- ================================
-- STEP 2: PERMISSION DEFINITIONS TABLE
-- ================================

CREATE TABLE permission_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_key TEXT UNIQUE NOT NULL,
  permission_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all available permissions
INSERT INTO permission_definitions (permission_key, permission_name, description, category) VALUES
-- User Management
('users.view', 'View Users', 'Can view user profiles and information', 'user_management'),
('users.edit', 'Edit Users', 'Can modify user profiles and settings', 'user_management'),
('users.delete', 'Delete Users', 'Can delete user accounts', 'user_management'),
('users.create', 'Create Users', 'Can create new user accounts', 'user_management'),

-- Analytics Management
('analytics.view', 'View Analytics', 'Can view analytics data and reports', 'analytics'),
('analytics.edit', 'Edit Analytics', 'Can modify analytics data and settings', 'analytics'),
('analytics.manage_all', 'Manage All Analytics', 'Can manage analytics for all artists', 'analytics'),

-- Earnings Management
('earnings.view', 'View Earnings', 'Can view earnings data and reports', 'earnings'),
('earnings.edit', 'Edit Earnings', 'Can modify earnings data', 'earnings'),
('earnings.manage_all', 'Manage All Earnings', 'Can manage earnings for all artists', 'earnings'),

-- Release Management
('releases.view', 'View Releases', 'Can view release information', 'releases'),
('releases.edit', 'Edit Releases', 'Can modify release information', 'releases'),
('releases.approve', 'Approve Releases', 'Can approve releases for distribution', 'releases'),
('releases.manage_all', 'Manage All Releases', 'Can manage all platform releases', 'releases'),

-- Request Management
('requests.view', 'View Requests', 'Can view artist and change requests', 'requests'),
('requests.manage', 'Manage Requests', 'Can approve/reject requests', 'requests'),
('requests.monitor_all', 'Monitor All Requests', 'Can see all platform requests', 'requests'),

-- Financial Management
('finance.view', 'View Financial Data', 'Can view financial reports and data', 'finance'),
('finance.manage', 'Manage Finances', 'Can manage platform finances', 'finance'),
('revenue.report', 'Report Revenue', 'Can report revenue from platforms', 'finance'),
('revenue.approve', 'Approve Revenue', 'Can approve revenue reports', 'finance'),

-- System Administration
('admin.settings', 'System Settings', 'Can modify system settings', 'administration'),
('admin.permissions', 'Manage Permissions', 'Can assign permissions to users', 'administration'),
('admin.full_access', 'Full System Access', 'Complete system access', 'administration');

-- ================================
-- STEP 3: USER_PROFILES TABLE (6 ROLES)
-- ================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  artist_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL,
  custom_admin_title TEXT, -- For custom admins: "Analytics Manager", "Request Manager", etc.
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

-- Add role constraint with 6 roles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner', 'custom_admin'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'pro', 'label_starter', 'label_pro'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- ================================
-- STEP 4: USER_PERMISSIONS TABLE
-- ================================

CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_key TEXT NOT NULL,
  granted_by_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Add foreign key constraints
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_permission_fkey 
FOREIGN KEY (permission_key) REFERENCES permission_definitions(permission_key);

ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_granted_by_fkey 
FOREIGN KEY (granted_by_id) REFERENCES user_profiles(id);

-- Unique constraint to prevent duplicate permissions
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_unique 
UNIQUE (user_id, permission_key);

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

-- ================================
-- STEP 6: ADD ALL FOREIGN KEYS
-- ================================

-- User profiles self-references
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_label_admin_fkey 
FOREIGN KEY (label_admin_id) REFERENCES user_profiles(id);

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_company_admin_fkey 
FOREIGN KEY (company_admin_id) REFERENCES user_profiles(id);

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

-- Subscriptions
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- Wallet transactions
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_user_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- ================================
-- STEP 7: CREATE INDEXES
-- ================================

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_key ON user_permissions(permission_key);
CREATE INDEX idx_artist_requests_status ON artist_requests(status);
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_revenue_reports_artist_id ON revenue_reports(artist_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- ================================
-- STEP 8: ENABLE RLS
-- ================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ================================
-- STEP 9: INSERT TEST USERS (6 ROLES)
-- ================================

INSERT INTO user_profiles (id, email, first_name, last_name, artist_name, role, subscription_status) VALUES
-- Artist
('0a060de5-1c94-4060-a1c2-860224fc348d', 'info@htay.co.uk', 'Henry', 'Taylor', 'Henry Taylor', 'artist', 'active'),

-- Label Admin  
('12345678-1234-5678-9012-123456789012', 'labeladmin@mscandco.com', 'Label', 'Admin', NULL, 'label_admin', 'active'),

-- Company Admin
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'companyadmin@mscandco.com', 'Company', 'Admin', NULL, 'company_admin', 'active'),

-- Super Admin
('f9e8d7c6-b5a4-9382-7160-fedcba987654', 'superadmin@mscandco.com', 'Super', 'Admin', NULL, 'super_admin', 'active'),

-- Distribution Partner
('87654321-4321-8765-2109-876543210987', 'codegroup@mscandco.com', 'Code', 'Group', NULL, 'distribution_partner', 'active'),

-- Custom Admin Examples
('11111111-2222-3333-4444-555555555555', 'analytics@mscandco.com', 'Analytics', 'Manager', NULL, 'custom_admin', 'active'),
('22222222-3333-4444-5555-666666666666', 'requests@mscandco.com', 'Request', 'Manager', NULL, 'custom_admin', 'active');

-- Update custom admin titles
UPDATE user_profiles SET custom_admin_title = 'Analytics Manager' WHERE email = 'analytics@mscandco.com';
UPDATE user_profiles SET custom_admin_title = 'Request Manager' WHERE email = 'requests@mscandco.com';

-- ================================
-- STEP 10: ASSIGN PERMISSIONS TO ROLES
-- ================================

-- Super Admin gets ALL permissions
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
SELECT 
  'f9e8d7c6-b5a4-9382-7160-fedcba987654',
  permission_key,
  'f9e8d7c6-b5a4-9382-7160-fedcba987654'
FROM permission_definitions;

-- Company Admin gets most permissions
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
SELECT 
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  permission_key,
  'f9e8d7c6-b5a4-9382-7160-fedcba987654'
FROM permission_definitions 
WHERE permission_key NOT IN ('admin.full_access', 'admin.permissions');

-- Distribution Partner gets revenue and release permissions
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
VALUES 
('87654321-4321-8765-2109-876543210987', 'revenue.report', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('87654321-4321-8765-2109-876543210987', 'releases.view', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('87654321-4321-8765-2109-876543210987', 'releases.manage_all', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('87654321-4321-8765-2109-876543210987', 'finance.view', 'f9e8d7c6-b5a4-9382-7160-fedcba987654');

-- Analytics Manager (Custom Admin) gets only analytics permissions
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
VALUES 
('11111111-2222-3333-4444-555555555555', 'analytics.view', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('11111111-2222-3333-4444-555555555555', 'analytics.edit', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('11111111-2222-3333-4444-555555555555', 'analytics.manage_all', 'f9e8d7c6-b5a4-9382-7160-fedcba987654');

-- Request Manager (Custom Admin) gets only request permissions
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
VALUES 
('22222222-3333-4444-5555-666666666666', 'requests.view', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('22222222-3333-4444-5555-666666666666', 'requests.manage', 'f9e8d7c6-b5a4-9382-7160-fedcba987654'),
('22222222-3333-4444-5555-666666666666', 'requests.monitor_all', 'f9e8d7c6-b5a4-9382-7160-fedcba987654');

-- ================================
-- STEP 11: CREATE UPDATE TRIGGERS
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
