-- ==========================================
-- PRODUCTION MUSIC DISTRIBUTION PLATFORM SCHEMA
-- MSC & Co - Complete Database Design
-- ==========================================

-- ==========================================
-- 1. ENUM TYPES
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

-- Music industry types
CREATE TYPE artist_type AS ENUM (
  'solo_artist',
  'band',
  'group', 
  'dj',
  'duo',
  'orchestra',
  'ensemble',
  'collective'
);

CREATE TYPE contract_status AS ENUM (
  'pending',
  'signed',
  'active',
  'expired',
  'renewal',
  'inactive'
);

-- Release workflow status
CREATE TYPE release_status AS ENUM (
  'draft',              -- Artist working on it
  'submitted',          -- Submitted to distribution partner
  'in_review',          -- Distribution partner reviewing
  'approval_pending',   -- Waiting for artist approval of changes
  'approved',           -- Artist approved, ready for distribution
  'completed',          -- Sent to DSPs
  'live'               -- Live on streaming platforms
);

CREATE TYPE release_type AS ENUM (
  'single',
  'ep', 
  'album',
  'compilation',
  'mixtape'
);

-- Financial transaction types
CREATE TYPE transaction_type AS ENUM (
  'subscription_payment',   -- Revolut subscription payments
  'streaming_revenue',      -- Revenue from DSPs
  'wallet_transfer',        -- Internal transfers
  'payout',                -- Payments to users
  'refund',                -- Refunds
  'negative_balance_charge' -- For users with negative balance permission
);

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- Main user profiles table (comprehensive, role-filtered)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- ============ BASIC IDENTITY (ALL USERS) ============
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role platform_user_role DEFAULT 'artist',
  
  -- ============ REGISTRATION & SECURITY ============
  registration_stage registration_stage DEFAULT 'email_verification',
  registration_completed_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Profile locking (applies to artists, label_admins, distribution_partners)
  basic_profile_locked BOOLEAN DEFAULT FALSE,
  
  -- ============ SUBSCRIPTION SYSTEM ============
  -- Only applies to artists and label_admins
  subscription_tier subscription_tier,
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_start_date DATE,
  subscription_end_date DATE,
  
  -- Usage tracking
  releases_used INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(8,2) DEFAULT 0.00,
  artists_managed INTEGER DEFAULT 0, -- For label admins
  
  -- ============ WALLET & FINANCIAL ============
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  negative_balance_allowed BOOLEAN DEFAULT FALSE,
  
  -- ============ ARTIST PROFILE (ARTISTS ONLY) ============
  stage_name TEXT,
  artist_type artist_type,
  genre TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  
  -- ============ CONTACT INFORMATION ============
  phone_number TEXT,
  country TEXT,
  country_code TEXT,
  city TEXT,
  postal_code TEXT,
  address TEXT,
  nationality TEXT,
  
  -- ============ CONTRACT & BUSINESS ============
  contract_status contract_status DEFAULT 'pending',
  date_signed DATE,
  
  -- ============ SOCIAL MEDIA (PRO SUBSCRIPTIONS) ============
  instagram_handle TEXT,
  twitter_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  spotify_uri TEXT,
  apple_music_id TEXT,
  website TEXT,
  
  -- ============ MANAGEMENT TEAM ============
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  
  -- ============ BANKING & PAYMENTS ============
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_holder_name TEXT,
  
  -- ============ METADATA ============
  further_information TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ============ CONSTRAINTS ============
  CONSTRAINT subscription_required_for_artists_labels CHECK (
    (role IN ('artist', 'label_admin') AND subscription_tier IS NOT NULL) 
    OR role NOT IN ('artist', 'label_admin')
  )
);

-- ==========================================
-- 3. SECURITY & AUTHENTICATION TABLES
-- ==========================================

-- Email verification codes for registration
CREATE TABLE email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup codes system (regeneratable sets)
CREATE TABLE user_backup_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  code_hash TEXT NOT NULL, -- Bcrypt hashed
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  -- Code set management
  code_set_id UUID NOT NULL,
  active BOOLEAN DEFAULT TRUE, -- FALSE when new set generated
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, code_hash)
);

-- ==========================================
-- 4. PROFILE MANAGEMENT SYSTEM
-- ==========================================

-- Profile change requests for locked profiles
CREATE TABLE profile_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Change details
  field_name TEXT NOT NULL,
  current_value TEXT,
  requested_value TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  
  -- Approval workflow
  status change_request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. ARTIST-LABEL RELATIONSHIP SYSTEM
-- ==========================================

-- Artist-Label management requests with flexible revenue splits
CREATE TABLE artist_label_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Request details
  request_message TEXT NOT NULL,
  status relationship_status DEFAULT 'pending_admin_review',
  
  -- Proposed revenue splits (flexible per relationship)
  proposed_artist_percentage DECIMAL(5,2) NOT NULL,
  proposed_label_percentage DECIMAL(5,2) NOT NULL,
  proposed_company_percentage DECIMAL(5,2) NOT NULL,
  
  -- Contract terms
  contract_terms TEXT NOT NULL,
  contract_duration_months INTEGER DEFAULT 12,
  
  -- Admin approval (step 1)
  admin_reviewed_by UUID REFERENCES user_profiles(id),
  admin_review_notes TEXT,
  admin_reviewed_at TIMESTAMPTZ,
  
  -- Artist consent (step 2) - legally binding
  artist_reviewed_at TIMESTAMPTZ,
  artist_consent_signature TEXT, -- Digital signature
  artist_consent_ip_address INET, -- Legal record
  artist_consent_user_agent TEXT, -- Browser info for legal record
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(artist_id, label_admin_id),
  CONSTRAINT valid_revenue_split CHECK (
    proposed_artist_percentage + proposed_label_percentage + proposed_company_percentage = 100
  )
);

-- Active revenue splits (created after full approval)
CREATE TABLE revenue_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id UUID REFERENCES user_profiles(id), -- NULL for independent artists
  
  -- Active revenue percentages
  artist_percentage DECIMAL(5,2) NOT NULL,
  label_percentage DECIMAL(5,2) NOT NULL,
  company_percentage DECIMAL(5,2) NOT NULL,
  
  -- Contract tracking
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE, -- NULL = currently active
  contract_reference UUID REFERENCES artist_label_requests(id),
  approved_by UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_active_split CHECK (
    artist_percentage + label_percentage + company_percentage = 100
  )
);

-- ==========================================
-- 6. MUSIC DISTRIBUTION SYSTEM
-- ==========================================

-- Projects/Releases
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Basic project info
  project_name TEXT NOT NULL, -- Product Title
  release_type release_type,
  status release_status DEFAULT 'draft',
  genre TEXT,
  sub_genre TEXT,
  format TEXT, -- Physical format if applicable
  product_type TEXT,
  
  -- Workflow timestamps
  submitted_at TIMESTAMPTZ,
  review_started_at TIMESTAMPTZ,
  approval_pending_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  live_at TIMESTAMPTZ,
  
  -- Release dates
  expected_release_date DATE,
  actual_release_date DATE,
  pre_release_date DATE,
  pre_release_url TEXT,
  release_date DATE,
  release_url TEXT,
  
  -- Distribution metadata (filled by distribution partner)
  label TEXT,
  release_label TEXT,
  catalogue_no TEXT,
  barcode TEXT,
  upc TEXT,
  distribution_company TEXT,
  
  -- Files and assets
  artwork_url TEXT,
  digital_assets_folder TEXT,
  
  -- Publishing information
  copyright_year INTEGER,
  copyright_owner TEXT,
  p_line TEXT,
  c_line TEXT,
  
  -- Distribution tracking
  submitted_to_stores BOOLEAN DEFAULT FALSE,
  luminate BOOLEAN DEFAULT FALSE,
  mediabase BOOLEAN DEFAULT FALSE,
  
  -- Workflow management
  marketing_plan TEXT,
  feedback TEXT,
  edit_requests JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  initials TEXT, -- Distribution partner initials
  
  -- Auto-save tracking
  last_auto_save TIMESTAMPTZ DEFAULT NOW(),
  auto_save_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual tracks/songs (assets that make up projects)
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- ============ BASIC TRACK INFO ============
  song_title TEXT NOT NULL,
  track_position INTEGER,
  duration INTERVAL,
  explicit BOOLEAN DEFAULT FALSE,
  version TEXT,
  alt_title TEXT,
  
  -- ============ TECHNICAL DETAILS ============
  bpm INTEGER,
  song_key TEXT,
  file_type TEXT DEFAULT 'wav',
  audio_file_name TEXT, -- Set by distribution partner
  cover_file_name TEXT, -- Set by distribution partner
  
  -- ============ METADATA ============
  language TEXT DEFAULT 'English',
  vocal_type TEXT,
  mood_description TEXT,
  tags TEXT[],
  lyrics TEXT,
  
  -- ============ INDUSTRY IDENTIFIERS ============
  isrc TEXT UNIQUE,
  iswc TEXT,
  tunecode TEXT,
  ice_work_key TEXT,
  bowi_previously_released BOOLEAN DEFAULT FALSE,
  previous_release_date DATE,
  
  -- ============ ARTIST INFORMATION ============
  company_name TEXT,
  legal_names TEXT[],
  artist_name TEXT,
  phonetic_pronunciation TEXT,
  stylised_name TEXT,
  aka_fka TEXT,
  featuring_artists TEXT[],
  background_vocalists TEXT[],
  
  -- ============ PUBLISHING & RIGHTS ============
  composers JSONB, -- [{"name": "John Doe", "role": "composer", "pro": "ASCAP", "cae_ipi": "123456789"}]
  producers JSONB,
  musicians JSONB, -- All instrument credits
  engineers JSONB, -- Recording, mixing, mastering engineers
  studios JSONB,   -- Recording and mastering studios
  
  -- Publishing details
  publisher_info JSONB,
  publisher_ipi TEXT,
  publishing_admin TEXT,
  publishing_admin_ipi TEXT,
  mechanical_rights JSONB,
  bmi_work_number TEXT,
  ascap_work_number TEXT,
  isni TEXT,
  sub_publisher TEXT,
  publishing_type TEXT,
  territory TEXT,
  
  -- ============ DISTRIBUTION METADATA ============
  recording_country TEXT,
  pre_release_url TEXT,
  release_url TEXT,
  release_label TEXT,
  distribution_company TEXT,
  
  -- ============ DIGITAL PLATFORM INFO ============
  spotify_uri TEXT,
  apple_music_id TEXT,
  youtube_url TEXT,
  youtube_music_url TEXT,
  genius_url TEXT,
  shazam_url TEXT,
  tiktok_url TEXT,
  instagram_url TEXT,
  wikipedia_url TEXT,
  allmusic_url TEXT,
  discogs_url TEXT,
  musicbrainz_url TEXT,
  imdb_url TEXT,
  jaxsta_url TEXT,
  website_url TEXT,
  knowledge_panel_url TEXT,
  tour_dates_url TEXT,
  
  -- ============ CONTACT INFORMATION ============
  primary_contact_email TEXT,
  artist_email TEXT,
  primary_contact_phone TEXT,
  secondary_contact_phone TEXT,
  
  -- ============ TEAM & MANAGEMENT ============
  management TEXT,
  booking_agent TEXT,
  press_contact TEXT,
  design_art_direction TEXT,
  
  -- ============ WORKFLOW TRACKING ============
  metadata_approved BOOLEAN DEFAULT FALSE,
  submitted_to_stores BOOLEAN DEFAULT FALSE,
  luminate BOOLEAN DEFAULT FALSE,
  mediabase BOOLEAN DEFAULT FALSE,
  distributor_notes TEXT,
  initials TEXT, -- Distribution partner initials
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. FINANCIAL SYSTEM
-- ==========================================

-- Wallet transactions (Revolut integration)
CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount DECIMAL(12,2) NOT NULL, -- Support larger amounts
  transaction_type transaction_type NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- Links to subscriptions, payouts, etc.
  
  -- Revolut integration
  revolut_transaction_id TEXT UNIQUE,
  revolut_status TEXT,
  revolut_metadata JSONB,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue tracking per asset per platform
CREATE TABLE asset_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  
  -- Platform and period
  platform TEXT NOT NULL, -- 'spotify', 'apple_music', 'youtube_music', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Revenue data (before distribution partner cut)
  gross_streams INTEGER DEFAULT 0,
  gross_revenue DECIMAL(10,4) NOT NULL, -- Higher precision for small amounts
  currency TEXT DEFAULT 'USD',
  
  -- After distribution partner cut (10% taken)
  net_revenue DECIMAL(10,4) NOT NULL,
  
  -- Revenue splits (based on active revenue_splits record)
  artist_amount DECIMAL(10,4),
  label_amount DECIMAL(10,4),
  company_amount DECIMAL(10,4),
  
  -- Geographic breakdown
  country_breakdown JSONB, -- {"US": 45.67, "UK": 23.45, "CA": 12.34}
  
  -- Payment tracking
  distributed BOOLEAN DEFAULT FALSE,
  distribution_date DATE,
  
  -- Metadata
  report_source TEXT, -- Which distribution partner reported this
  external_report_id TEXT, -- Reference to external system
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(asset_id, platform, period_start, period_end)
);

-- Monthly statements for artists
CREATE TABLE monthly_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Statement period
  statement_month INTEGER CHECK (statement_month BETWEEN 1 AND 12),
  statement_year INTEGER CHECK (statement_year >= 2024),
  
  -- Summary totals
  total_streams INTEGER DEFAULT 0,
  total_gross_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_net_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_artist_earnings DECIMAL(10,2) DEFAULT 0.00,
  
  -- Platform breakdown
  platform_breakdown JSONB, -- {"spotify": {"streams": 1000, "revenue": 4.50}, ...}
  
  -- Payment info
  paid BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  payment_transaction_id UUID REFERENCES wallet_transactions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, statement_month, statement_year)
);

-- ==========================================
-- 8. SUBSCRIPTION MANAGEMENT
-- ==========================================

-- Revolut subscription tracking
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Subscription details
  tier subscription_tier NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  
  -- Revolut integration
  revolut_subscription_id TEXT UNIQUE,
  revolut_customer_id TEXT,
  
  -- Billing
  amount DECIMAL(8,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. UTILITY FUNCTIONS
-- ==========================================

-- Check subscription limits
CREATE OR REPLACE FUNCTION check_release_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier subscription_tier;
  current_releases INTEGER;
BEGIN
  SELECT subscription_tier, releases_used 
  INTO user_tier, current_releases
  FROM user_profiles 
  WHERE id = user_id;
  
  RETURN CASE
    WHEN user_tier IN ('artist_starter', 'label_admin_starter') THEN current_releases < 5
    WHEN user_tier IN ('artist_pro', 'label_admin_pro') THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Check artist management limits for label admins
CREATE OR REPLACE FUNCTION check_artist_limit(label_admin_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_tier subscription_tier;
  current_artists INTEGER;
BEGIN
  SELECT subscription_tier, artists_managed 
  INTO admin_tier, current_artists
  FROM user_profiles 
  WHERE id = label_admin_id AND role = 'label_admin';
  
  RETURN CASE
    WHEN admin_tier = 'label_admin_starter' THEN current_artists < 4
    WHEN admin_tier = 'label_admin_pro' THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql;

-- Generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  new_set_id UUID := gen_random_uuid();
  codes TEXT[] := ARRAY[]::TEXT[];
  code TEXT;
  i INTEGER;
BEGIN
  -- Deactivate old codes
  UPDATE user_backup_codes SET active = FALSE WHERE user_id = user_id;
  
  -- Generate 10 new codes
  FOR i IN 1..10 LOOP
    code := UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
    codes := array_append(codes, code);
    
    INSERT INTO user_backup_codes (user_id, code_hash, code_set_id)
    VALUES (user_id, crypt(code, gen_salt('bf')), new_set_id);
  END LOOP;
  
  RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 10. ROW LEVEL SECURITY POLICIES
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

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('company_admin', 'super_admin')
    )
  );

-- Label admins can see their managed artists
CREATE POLICY "Label admins can view managed artists" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM revenue_splits rs
      WHERE rs.artist_id = user_profiles.id 
      AND rs.label_admin_id = auth.uid()
      AND rs.effective_until IS NULL
    )
  );

-- Distribution partners can see artist data (limited fields via frontend)
CREATE POLICY "Distribution partners can view artist data" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'distribution_partner'
    ) AND role = 'artist'
  );

-- Projects policies
CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Label admins can view managed artist projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM revenue_splits rs
      WHERE rs.artist_id = projects.user_id 
      AND rs.label_admin_id = auth.uid()
      AND rs.effective_until IS NULL
    )
  );

CREATE POLICY "Distribution partners can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('distribution_partner', 'company_admin', 'super_admin')
    )
  );

-- Assets policies (similar to projects)
CREATE POLICY "Users can manage their project assets" ON assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = assets.project_id 
      AND p.user_id = auth.uid()
    )
  );

-- Revenue and financial policies
CREATE POLICY "Users can view their own financial data" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own revenue" ON asset_revenue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assets a
      JOIN projects p ON p.id = a.project_id
      WHERE a.id = asset_revenue.asset_id 
      AND p.user_id = auth.uid()
    )
  );

-- ==========================================
-- 11. TRIGGERS FOR AUTOMATION
-- ==========================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-save trigger for projects
CREATE OR REPLACE FUNCTION update_auto_save()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_auto_save = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_auto_save_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_auto_save();

-- ==========================================
-- 12. INDEXES FOR PERFORMANCE
-- ==========================================

-- User lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Revenue splits lookups
CREATE INDEX idx_revenue_splits_artist ON revenue_splits(artist_id);
CREATE INDEX idx_revenue_splits_label ON revenue_splits(label_admin_id);
CREATE INDEX idx_revenue_splits_active ON revenue_splits(effective_until) WHERE effective_until IS NULL;

-- Project and asset lookups
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_assets_project ON assets(project_id);
CREATE INDEX idx_assets_isrc ON assets(isrc);

-- Financial data indexes
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_asset_revenue_asset ON asset_revenue(asset_id);
CREATE INDEX idx_asset_revenue_period ON asset_revenue(period_start, period_end);

-- ==========================================
-- END OF SCHEMA
-- ==========================================
