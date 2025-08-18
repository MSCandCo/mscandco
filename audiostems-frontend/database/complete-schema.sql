-- MSC & Co Music Distribution Platform - Complete Database Schema
-- Single comprehensive approach with role-based filtering

-- Step 1: Create ENUM Types
CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin');
CREATE TYPE subscription_tier AS ENUM ('artist_starter', 'artist_pro', 'label_admin_starter', 'label_admin_pro');
CREATE TYPE artist_type AS ENUM ('solo_artist', 'band', 'group', 'dj', 'duo', 'orchestra', 'ensemble', 'collective');
CREATE TYPE contract_status AS ENUM ('pending', 'signed', 'active', 'expired', 'renewal', 'inactive');
CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'approval_pending', 'approved', 'completed', 'live');
CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'compilation', 'mixtape');
CREATE TYPE transaction_type AS ENUM ('subscription_payment', 'streaming_revenue', 'wallet_transfer', 'refund', 'negative_balance');

-- Step 2: Comprehensive User Profiles Table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- BASIC INFO (ALL USERS)
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'artist',
  
  -- SUBSCRIPTION & BILLING (ARTISTS & LABEL ADMINS)
  subscription_tier subscription_tier,
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_start_date DATE,
  subscription_end_date DATE,
  
  -- USAGE LIMITS
  releases_used INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(8,2) DEFAULT 0.00,
  artists_managed INTEGER DEFAULT 0, -- For label admins
  
  -- WALLET SYSTEM
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  negative_balance_allowed BOOLEAN DEFAULT FALSE,
  
  -- ARTIST-LABEL RELATIONSHIP
  managed_by_label_id UUID REFERENCES user_profiles(id),
  
  -- ARTIST PROFILE (ARTISTS ONLY)
  stage_name TEXT,
  artist_type artist_type,
  genre TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  
  -- CONTACT & LOCATION (ALL USERS)
  phone_number TEXT,
  country TEXT,
  country_code TEXT,
  city TEXT,
  postal_code TEXT,
  address TEXT,
  nationality TEXT,
  
  -- CONTRACT INFO (ARTISTS ONLY)
  contract_status contract_status DEFAULT 'pending',
  date_signed DATE,
  
  -- SOCIAL MEDIA (PRO SUBSCRIPTIONS ONLY)
  instagram_handle TEXT,
  twitter_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  spotify_uri TEXT,
  apple_music_id TEXT,
  website TEXT,
  
  -- MANAGEMENT (ARTISTS ONLY)
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  
  -- BANKING & PAYMENTS (ARTISTS ONLY)
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_holder_name TEXT,
  
  -- REVENUE SPLITS (ARTISTS ONLY)
  artist_percentage DECIMAL(5,2) DEFAULT 80.00,
  label_percentage DECIMAL(5,2) DEFAULT 10.00,
  company_percentage DECIMAL(5,2) DEFAULT 10.00,
  
  -- PROFILE CONTROL
  profile_locked BOOLEAN DEFAULT FALSE,
  
  -- AUTH & SECURITY
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  
  -- ADDITIONAL
  further_information TEXT,
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Artist-Label Management Requests
CREATE TABLE artist_label_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  request_message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  reviewed_by UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, label_admin_id)
);

-- Step 4: Projects/Releases Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- BASIC PROJECT INFO
  project_name TEXT NOT NULL,
  release_type release_type,
  status release_status DEFAULT 'draft',
  genre TEXT,
  
  -- WORKFLOW TRACKING
  submitted_at TIMESTAMPTZ,
  review_started_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  live_at TIMESTAMPTZ,
  
  -- DATES
  expected_release_date DATE,
  actual_release_date DATE,
  pre_release_date DATE,
  
  -- DISTRIBUTION INFO
  label TEXT,
  catalogue_no TEXT,
  barcode TEXT,
  upc TEXT,
  
  -- FILES
  artwork_url TEXT,
  digital_assets_folder TEXT,
  
  -- PUBLISHING
  copyright_year INTEGER,
  copyright_owner TEXT,
  p_line TEXT,
  c_line TEXT,
  
  -- WORKFLOW
  marketing_plan TEXT,
  feedback TEXT,
  edit_requests TEXT[],
  
  -- AUTO-SAVE
  last_auto_save TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Assets/Tracks Table (All the detailed distribution fields)
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- BASIC TRACK INFO
  song_title TEXT NOT NULL,
  track_position INTEGER,
  duration INTERVAL,
  explicit BOOLEAN DEFAULT FALSE,
  version TEXT,
  bpm INTEGER,
  song_key TEXT,
  
  -- TECHNICAL
  file_type TEXT DEFAULT 'wav',
  audio_file_name TEXT,
  cover_file_name TEXT,
  
  -- METADATA
  language TEXT,
  vocal_type TEXT,
  mood_description TEXT,
  tags TEXT[],
  lyrics TEXT,
  
  -- ARTIST INFO
  company_name TEXT,
  legal_names TEXT[],
  artist_name TEXT,
  phonetic_pronunciation TEXT,
  stylised TEXT,
  aka_fka TEXT[],
  featuring_artists TEXT[],
  background_vocalists TEXT[],
  
  -- PRODUCT INFO
  product_title TEXT,
  alt_title TEXT,
  
  -- IDENTIFIERS
  isrc TEXT,
  iswc TEXT,
  tunecode TEXT,
  ice_work_key TEXT,
  bowi_previously_released BOOLEAN DEFAULT FALSE,
  previous_release_date DATE,
  
  -- PUBLISHING & RIGHTS
  composers JSONB, -- Flexible structure for multiple composers
  publishers JSONB,
  mechanical_info JSONB,
  
  -- PRODUCTION CREDITS
  producers JSONB,
  engineers JSONB,
  musicians JSONB,
  
  -- RELEASE INFO
  recording_country TEXT,
  pre_release_url TEXT,
  release_url TEXT,
  release_label TEXT,
  distribution_company TEXT,
  
  -- CONTACT & LINKS
  primary_contact_email TEXT,
  artist_email TEXT,
  primary_contact_phone TEXT,
  secondary_contact_phone TEXT,
  social_media_links JSONB,
  
  -- METADATA STATUS
  metadata_approved BOOLEAN DEFAULT FALSE,
  submitted_to_stores BOOLEAN DEFAULT FALSE,
  
  -- NOTES
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Revenue & Wallet System
CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  transaction_type transaction_type,
  description TEXT,
  reference_id UUID,
  
  -- External payment integration
  revolut_transaction_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asset_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Platform & Period
  platform TEXT,
  period_start DATE,
  period_end DATE,
  
  -- Revenue Data
  streams INTEGER,
  gross_revenue DECIMAL(10,2), -- Before distribution partner cut
  net_revenue DECIMAL(10,2),   -- After distribution partner cut (the "100%")
  
  -- Splits
  artist_amount DECIMAL(10,2),
  label_amount DECIMAL(10,2),
  company_amount DECIMAL(10,2),
  
  -- Payment Status
  distributed BOOLEAN DEFAULT FALSE,
  distribution_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_label_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_revenue ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (unless locked)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id AND profile_locked = FALSE);

-- Company/Super admins can see everything
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('company_admin', 'super_admin')
    )
  );

-- Label admins can see their managed artists
CREATE POLICY "Label admins can view managed artists" ON user_profiles
  FOR SELECT USING (
    managed_by_label_id = auth.uid()
    OR auth.uid() = id
  );

-- Similar policies for other tables...
