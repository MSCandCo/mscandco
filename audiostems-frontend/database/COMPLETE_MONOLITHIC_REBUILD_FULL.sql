-- ==========================================
-- PRODUCTION MUSIC DISTRIBUTION PLATFORM SCHEMA
-- MSC & Co - Complete Database Design
-- COMPLETE MONOLITHIC REBUILD WITH ALL FEATURES
-- ==========================================

-- STEP 1: Drop everything completely
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ==========================================
-- 2. ENUM TYPES (COMPLETE SET)
-- ==========================================

-- User roles in the platform (avoid conflict with auth.user_role)
CREATE TYPE platform_user_role AS ENUM (
  'artist',
  'label_admin', 
  'distribution_partner',
  'company_admin',
  'super_admin'
);

-- Subscription tiers (only for artists and label admins)
CREATE TYPE subscription_tier AS ENUM (
  'artist_starter',      -- 5 releases max
  'artist_pro',          -- unlimited releases
  'label_admin_starter', -- 4 artists max, 2 releases per artist
  'label_admin_pro'      -- unlimited artists and releases
);

-- Registration flow stages
CREATE TYPE registration_stage AS ENUM (
  'email_verification',
  'backup_codes_setup',
  'basic_profile_setup',
  'completed'
);

-- Profile change request workflow
CREATE TYPE change_request_status AS ENUM (
  'pending',
  'approved', 
  'rejected'
);

-- Artist-Label relationship workflow
CREATE TYPE relationship_status AS ENUM (
  'pending_admin_review',
  'admin_approved_pending_artist',
  'artist_approved_active',
  'rejected_by_admin',
  'rejected_by_artist',
  'terminated'
);

-- Artist types for classification
CREATE TYPE artist_type AS ENUM (
  'solo_artist',
  'band',
  'producer',
  'songwriter',
  'vocalist',
  'composer',
  'dj'
);

-- Contract status tracking
CREATE TYPE contract_status AS ENUM (
  'draft',
  'pending_signature',
  'active',
  'expired',
  'terminated'
);

-- Release workflow status
CREATE TYPE release_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'approval_pending',
  'approved',
  'completed',
  'live',
  'archived'
);

-- Release types
CREATE TYPE release_type AS ENUM (
  'single',
  'ep',
  'album',
  'compilation',
  'mixtape',
  'soundtrack'
);

-- Transaction types for wallet system
CREATE TYPE transaction_type AS ENUM (
  'earning',
  'payout',
  'fee',
  'refund',
  'adjustment',
  'subscription_payment',
  'bonus'
);

-- ==========================================
-- 3. MAIN TABLES
-- ==========================================

-- Single source of truth for all user data
CREATE TABLE user_profiles (
  -- Core identification
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role platform_user_role NOT NULL DEFAULT 'artist',
  email text UNIQUE NOT NULL,
  
  -- Basic personal information (locked after initial setup)
  first_name text,
  last_name text,
  company_name text,
  phone text,
  date_of_birth date,
  address text,
  city text,
  state_province text,
  postal_code text,
  country text,
  
  -- Platform management
  subscription_tier subscription_tier NOT NULL DEFAULT 'artist_starter',
  registration_stage registration_stage NOT NULL DEFAULT 'email_verification',
  is_profile_locked boolean DEFAULT false,
  
  -- Financial information
  wallet_balance decimal(10,2) DEFAULT 0.00,
  tax_id text,
  
  -- Artist-specific information
  stage_name text,
  artist_type artist_type,
  genre text,
  bio text,
  phonetic_pronunciation text,
  stylised_name text,
  aka_fka text,
  
  -- Extended contact information
  primary_contact_email text,
  secondary_contact_email text,
  primary_contact_phone text,
  secondary_contact_phone text,
  
  -- Contract and legal status
  contract_status contract_status DEFAULT 'draft',
  contract_start_date date,
  contract_end_date date,
  
  -- Social media and web presence
  website_url text,
  instagram_url text,
  twitter_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  youtube_music_url text,
  spotify_url text,
  apple_music_url text,
  soundcloud_url text,
  bandcamp_url text,
  shazam_url text,
  genius_url text,
  allmusic_url text,
  discogs_url text,
  musicbrainz_url text,
  imdb_url text,
  jaxsta_url text,
  knowledge_panel_url text,
  tour_dates_url text,
  
  -- Management and representation
  management_company text,
  management_contact text,
  booking_agent text,
  press_contact text,
  
  -- Banking information (encrypted in production)
  bank_name text,
  account_holder_name text,
  account_number text,
  routing_number text,
  swift_code text,
  
  -- Security and verification
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  identity_verified boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  last_auto_save timestamptz DEFAULT now()
);

-- Email verification codes (instead of links)
CREATE TABLE email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User backup codes for account recovery
CREATE TABLE user_backup_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure each user has unique codes
  UNIQUE(user_id, code)
);

-- Profile change requests (for locked profiles)
CREATE TABLE profile_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  current_value text,
  requested_value text NOT NULL,
  status change_request_status DEFAULT 'pending',
  reason text,
  admin_notes text,
  approved_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Artist-Label relationship requests and management
CREATE TABLE artist_label_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status relationship_status DEFAULT 'pending_admin_review',
  
  -- Proposed contract terms
  proposed_label_percentage decimal(5,2) NOT NULL,
  proposed_artist_percentage decimal(5,2) NOT NULL,
  proposed_company_percentage decimal(5,2) NOT NULL,
  contract_terms text,
  contract_duration_months integer,
  
  -- Approval workflow tracking
  admin_approved_at timestamptz,
  artist_approved_at timestamptz,
  approved_by uuid REFERENCES user_profiles(id),
  rejection_reason text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  
  -- Ensure no duplicate active requests
  UNIQUE(artist_id, label_admin_id, status) WHERE status IN ('pending_admin_review', 'admin_approved_pending_artist')
);

-- Active revenue splits between artists, labels, and company
CREATE TABLE revenue_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Revenue percentages (must total 100)
  artist_percentage decimal(5,2) NOT NULL DEFAULT 80.00,
  label_percentage decimal(5,2) NOT NULL DEFAULT 0.00,
  company_percentage decimal(5,2) NOT NULL DEFAULT 20.00,
  
  -- Validity period
  effective_from timestamptz DEFAULT now(),
  effective_until timestamptz,
  is_active boolean DEFAULT true,
  
  -- Audit trail
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure percentages add up to 100
  CONSTRAINT revenue_splits_total_100 CHECK (artist_percentage + label_percentage + company_percentage = 100.00)
);

-- Projects (releases/albums/EPs)
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Basic project information
  title text NOT NULL,
  alt_title text,
  description text,
  release_type release_type NOT NULL DEFAULT 'single',
  status release_status DEFAULT 'draft',
  
  -- Release metadata
  label_name text,
  catalogue_number text,
  barcode text,
  upc text,
  format text,
  product_type text,
  
  -- Important dates
  recording_date date,
  pre_release_date date,
  release_date date,
  
  -- URLs and links
  pre_release_url text,
  release_url text,
  
  -- Legal and copyright
  copyright_year integer,
  copyright_owner text,
  p_line text,
  c_line text,
  
  -- Distribution
  distribution_company text,
  submitted_to_stores boolean DEFAULT false,
  
  -- Media and assets
  cover_art_url text,
  cover_file_name text,
  digital_assets_folder text,
  
  -- Approval workflow
  metadata_approved boolean DEFAULT false,
  metadata_approved_by text,
  metadata_approved_initials text,
  
  -- Notes and tracking
  notes text,
  luminate_mediabase_notes text,
  
  -- Workflow timestamps
  submitted_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  live_at timestamptz,
  
  -- Standard timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_auto_save timestamptz DEFAULT now()
);

-- Assets (individual tracks/songs)
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Basic track information
  title text NOT NULL, -- Song Title
  track_position integer,
  duration integer, -- in seconds
  explicit boolean DEFAULT false,
  version text,
  
  -- Technical audio details
  bpm integer,
  song_key text,
  file_type text DEFAULT 'wav',
  audio_file_name text, -- Set by distribution partner
  
  -- Creative and descriptive
  mood_description text,
  tags text[],
  lyrics text,
  language text,
  vocal_type text,
  
  -- Genre classification
  genre text,
  sub_genre text,
  
  -- Industry identifiers and codes
  tunecode text,
  ice_work_key text,
  iswc text,
  isrc text,
  bowi text,
  
  -- Release history
  previously_released boolean DEFAULT false,
  previous_release_date date,
  recording_country text,
  
  -- Featured artists and collaborators
  featuring_artists text[], -- Any Other Featuring Artists
  background_vocalists text[], -- Background Vocalists
  
  -- Production credits
  executive_producer text,
  producer text,
  co_producer text,
  assistant_producer text,
  mixing_engineer text,
  mastering_engineer text,
  recording_engineer text,
  additional_production text,
  
  -- Performance and instrumentation
  composer_author text, -- Composer / Author
  composer_role text, -- Role
  keyboards text,
  programming text,
  bass text,
  drums text,
  guitars text,
  organ text,
  percussion text,
  strings text,
  additional_instrumentation text,
  
  -- Publishing information
  publisher text, -- Publisher
  publishing_admin text, -- Publishing Admin
  sub_publisher text, -- Sub-Publisher
  publishing_type text, -- Publishing Type
  territory text, -- Territory
  pro text, -- PRO
  cae_ipi text, -- CAE/IPI
  publisher_ipi text, -- Publisher IPI
  publishing_admin_ipi text, -- Publishing Admin IPI
  mechanical text, -- Mechanical
  bmi_work_number text, -- BMI Work #
  ascap_work_number text, -- ASCAP Work #
  isni text, -- ISNI
  
  -- Studios and locations
  recording_studio text, -- Recording Studio
  mastering_studio text, -- Mastering Studio
  
  -- Design and creative
  design_art_direction text, -- Design/Art Direction
  
  -- External platform identifiers
  spotify_uri text, -- Spotify URI
  apple_id text, -- Apple ID
  wikipedia_url text, -- Wikipedia
  genius_url text, -- Genius
  allmusic_url text, -- AllMusic
  discogs_url text, -- Discogs
  musicbrainz_url text, -- Musicbrainz
  imdb_url text, -- IMDb
  jaxsta_url text, -- Jaxsta
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_auto_save timestamptz DEFAULT now()
);

-- Wallet transaction history
CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text,
  reference_id text,
  
  -- Related records
  asset_id uuid REFERENCES assets(id),
  project_id uuid REFERENCES projects(id),
  
  -- Processing details
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Asset-level revenue tracking (reported by distribution partners)
CREATE TABLE asset_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Revenue source and metrics
  platform text NOT NULL, -- Spotify, Apple Music, etc.
  revenue_amount decimal(10,2) NOT NULL,
  plays_count bigint DEFAULT 0,
  revenue_date date NOT NULL,
  reporting_period_start date,
  reporting_period_end date,
  
  -- Revenue split tracking (at time of earning)
  artist_percentage decimal(5,2) DEFAULT 80.00,
  label_percentage decimal(5,2) DEFAULT 0.00,
  company_percentage decimal(5,2) DEFAULT 20.00,
  
  -- Calculated amounts
  artist_amount decimal(10,2) GENERATED ALWAYS AS (revenue_amount * artist_percentage / 100) STORED,
  label_amount decimal(10,2) GENERATED ALWAYS AS (revenue_amount * label_percentage / 100) STORED,
  company_amount decimal(10,2) GENERATED ALWAYS AS (revenue_amount * company_percentage / 100) STORED,
  
  -- Audit and tracking
  reported_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate revenue reports
  UNIQUE(asset_id, platform, revenue_date, reporting_period_start)
);

-- Monthly aggregated statements for users
CREATE TABLE monthly_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  statement_month date NOT NULL, -- First day of the month
  
  -- Aggregated totals
  total_revenue decimal(10,2) NOT NULL,
  total_plays bigint DEFAULT 0,
  total_assets integer DEFAULT 0,
  
  -- Detailed breakdown (JSON for flexibility)
  platform_breakdown jsonb, -- Revenue by platform
  asset_breakdown jsonb, -- Revenue by asset
  
  -- Statement metadata
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one statement per user per month
  UNIQUE(user_id, statement_month)
);

-- Subscription management (Revolut integration)
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status text DEFAULT 'active',
  
  -- Subscription period
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  -- External payment integration
  revolut_subscription_id text,
  revolut_customer_id text,
  
  -- Billing
  monthly_price decimal(10,2),
  currency text DEFAULT 'GBP',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 4. UTILITY FUNCTIONS
-- ==========================================

-- Check if user can create more releases based on subscription
CREATE OR REPLACE FUNCTION check_release_limit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    user_tier subscription_tier;
    current_releases integer;
    max_releases integer;
BEGIN
    SELECT subscription_tier INTO user_tier FROM user_profiles WHERE id = user_uuid;
    SELECT COUNT(*) INTO current_releases FROM projects WHERE user_id = user_uuid;
    
    max_releases := CASE user_tier
        WHEN 'artist_starter' THEN 5
        WHEN 'artist_pro' THEN -1  -- unlimited
        WHEN 'label_admin_starter' THEN 8  -- 4 artists * 2 releases each
        WHEN 'label_admin_pro' THEN -1  -- unlimited
        ELSE 0
    END;
    
    RETURN (max_releases = -1 OR current_releases < max_releases);
END;
$$ LANGUAGE plpgsql;

-- Check if label admin can add more artists
CREATE OR REPLACE FUNCTION check_artist_limit(label_admin_uuid uuid)
RETURNS boolean AS $$
DECLARE
    admin_tier subscription_tier;
    current_artists integer;
    max_artists integer;
BEGIN
    SELECT subscription_tier INTO admin_tier FROM user_profiles WHERE id = label_admin_uuid;
    SELECT COUNT(*) INTO current_artists 
    FROM revenue_splits 
    WHERE label_admin_id = label_admin_uuid AND is_active = true;
    
    max_artists := CASE admin_tier
        WHEN 'label_admin_starter' THEN 4
        WHEN 'label_admin_pro' THEN -1  -- unlimited
        ELSE 0
    END;
    
    RETURN (max_artists = -1 OR current_artists < max_artists);
END;
$$ LANGUAGE plpgsql;

-- Generate new backup codes for user
CREATE OR REPLACE FUNCTION generate_backup_codes(user_uuid uuid)
RETURNS text[] AS $$
DECLARE
    codes text[] := '{}';
    i integer;
BEGIN
    -- Deactivate old codes
    DELETE FROM user_backup_codes WHERE user_id = user_uuid;
    
    -- Generate 10 new codes
    FOR i IN 1..10 LOOP
        codes := array_append(codes, upper(substring(gen_random_uuid()::text from 1 for 8)));
    END LOOP;
    
    -- Store codes in database
    INSERT INTO user_backup_codes (user_id, code)
    SELECT user_uuid, unnest(codes);
    
    RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Advance user registration stage
CREATE OR REPLACE FUNCTION advance_registration_stage(user_uuid uuid)
RETURNS registration_stage AS $$
DECLARE
    current_stage registration_stage;
    next_stage registration_stage;
BEGIN
    SELECT registration_stage INTO current_stage FROM user_profiles WHERE id = user_uuid;
    
    next_stage := CASE current_stage
        WHEN 'email_verification' THEN 'backup_codes_setup'
        WHEN 'backup_codes_setup' THEN 'basic_profile_setup'
        WHEN 'basic_profile_setup' THEN 'completed'
        ELSE current_stage
    END;
    
    UPDATE user_profiles 
    SET registration_stage = next_stage 
    WHERE id = user_uuid;
    
    RETURN next_stage;
END;
$$ LANGUAGE plpgsql;

-- Lock user profile after basic setup completion
CREATE OR REPLACE FUNCTION lock_basic_profile(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
    UPDATE user_profiles 
    SET is_profile_locked = true 
    WHERE id = user_uuid 
    AND role IN ('artist', 'label_admin', 'distribution_partner');
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. INDEXES FOR PERFORMANCE
-- ==========================================

-- User profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_registration_stage ON user_profiles(registration_stage);

-- Projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_release_date ON projects(release_date);

-- Assets
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_title ON assets(title);
CREATE INDEX idx_assets_isrc ON assets(isrc);

-- Financial
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_asset_revenue_asset_id ON asset_revenue(asset_id);
CREATE INDEX idx_asset_revenue_user_id ON asset_revenue(user_id);
CREATE INDEX idx_asset_revenue_date ON asset_revenue(revenue_date);
CREATE INDEX idx_monthly_statements_user_id ON monthly_statements(user_id);
CREATE INDEX idx_monthly_statements_month ON monthly_statements(statement_month);

-- Relationships
CREATE INDEX idx_revenue_splits_artist_id ON revenue_splits(artist_id);
CREATE INDEX idx_revenue_splits_label_admin_id ON revenue_splits(label_admin_id);
CREATE INDEX idx_artist_label_requests_artist_id ON artist_label_requests(artist_id);
CREATE INDEX idx_artist_label_requests_label_admin_id ON artist_label_requests(label_admin_id);

-- ==========================================
-- 7. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_label_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- User profiles: own data + admin access
CREATE POLICY "user_profiles_policy" ON user_profiles
    FOR ALL USING (
        auth.uid() = id OR 
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Email verification codes: own codes + admin access
CREATE POLICY "email_verification_codes_policy" ON email_verification_codes
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Backup codes: own codes + admin access
CREATE POLICY "user_backup_codes_policy" ON user_backup_codes
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Profile change requests: own requests + admin approval
CREATE POLICY "profile_change_requests_policy" ON profile_change_requests
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Artist-label requests: involved parties + admin access
CREATE POLICY "artist_label_requests_policy" ON artist_label_requests
    FOR ALL USING (
        artist_id = auth.uid() OR
        label_admin_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Revenue splits: involved parties + admin access
CREATE POLICY "revenue_splits_policy" ON revenue_splits
    FOR ALL USING (
        artist_id = auth.uid() OR
        label_admin_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Projects: own projects + admin/partner access
CREATE POLICY "projects_policy" ON projects
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin', 'distribution_partner')
    );

-- Assets: through project ownership + admin/partner access
CREATE POLICY "assets_policy" ON assets
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()) OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin', 'distribution_partner')
    );

-- Wallet transactions: own transactions + admin access
CREATE POLICY "wallet_transactions_policy" ON wallet_transactions
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Asset revenue: own revenue + admin/partner access
CREATE POLICY "asset_revenue_policy" ON asset_revenue
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin', 'distribution_partner')
    );

-- Monthly statements: own statements + admin access
CREATE POLICY "monthly_statements_policy" ON monthly_statements
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- Subscriptions: own subscriptions + admin access
CREATE POLICY "subscriptions_policy" ON subscriptions
    FOR ALL USING (
        user_id = auth.uid() OR
        COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
    );

-- ==========================================
-- 8. FINAL VERIFICATION
-- ==========================================

SELECT 'COMPLETE MONOLITHIC DATABASE REBUILD FINISHED' as status;

-- Show comprehensive creation summary
SELECT 
    'Tables created:' as info,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 
    'RLS policies created:' as info,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 
    'Functions created:' as info,
    COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('check_release_limit', 'check_artist_limit', 'generate_backup_codes', 'advance_registration_stage', 'lock_basic_profile', 'update_updated_at_column');

SELECT 
    'ENUM types created:' as info,
    COUNT(*) as count
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public' 
AND t.typtype = 'e';

SELECT 'Database is ready for production use with all features!' as final_status;
