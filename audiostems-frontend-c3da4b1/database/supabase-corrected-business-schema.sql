-- MSC & Co - CORRECTED BUSINESS WORKFLOW SCHEMA
-- Reflects actual business flow: Registration → Release Creation → Approval Chain → Distribution → Revenue

-- =============================================================================
-- CORE TYPES AND ENUMS (Updated for Business Flow)
-- =============================================================================

-- Create comprehensive enums
CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'completed', 'live', 'change_requested');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'mixtape', 'compilation', 'remix', 'live_album', 'soundtrack');
CREATE TYPE product_type AS ENUM ('audio', 'video', 'bundle');
CREATE TYPE format_type AS ENUM ('digital', 'vinyl', 'cd', 'cassette', 'streaming_only');
CREATE TYPE publishing_type AS ENUM ('exclusive', 'co_publishing', 'administration', 'sub_publishing');
CREATE TYPE business_type AS ENUM ('individual', 'company', 'label', 'partnership', 'corporation');
CREATE TYPE payment_method AS ENUM ('revolut', 'wallet', 'bank_transfer');
CREATE TYPE change_request_type AS ENUM ('metadata', 'artwork', 'audio', 'credits', 'urgent');

-- =============================================================================
-- MASTER USER PROFILES TABLE (ALL ROLES) - Registration Integration
-- =============================================================================

-- Enhanced User Profiles Table - Links to Registration Step 4 (Immutable Data)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'artist',
  plan subscription_plan,
  
  -- IMMUTABLE DATA (From Registration Step 4 - Cannot be changed after initial setup)
  first_name VARCHAR(255), -- Immutable after registration
  last_name VARCHAR(255), -- Immutable after registration  
  date_of_birth DATE, -- Immutable after registration
  nationality VARCHAR(100), -- Immutable after registration
  country VARCHAR(100), -- Immutable after registration
  city VARCHAR(100), -- Immutable after registration
  immutable_data_locked BOOLEAN DEFAULT false, -- Set to true after first save
  
  -- MUTABLE DATA (Can be edited anytime)
  display_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  postal_code VARCHAR(20),
  bio TEXT,
  website VARCHAR(500),
  avatar_url TEXT,
  
  -- Business Information (Label Admin, Company Admin, Distribution Partner)
  company_name VARCHAR(255),
  business_type business_type,
  position VARCHAR(255),
  department VARCHAR(255),
  office_address TEXT,
  tax_id VARCHAR(100),
  vat_number VARCHAR(100),
  registration_number VARCHAR(100),
  founded_year VARCHAR(4),
  timezone VARCHAR(50),
  
  -- Label-Specific Fields (Label Admin)
  label_name VARCHAR(255),
  
  -- Banking Information (For Revolut/Wallet Integration)
  revolut_account_id VARCHAR(255),
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(255),
  bank_routing_number VARCHAR(255),
  bank_name VARCHAR(255),
  bank_swift_code VARCHAR(50),
  bank_iban VARCHAR(50),
  
  -- Music Information (Artist, Label Admin)
  primary_genre VARCHAR(100),
  secondary_genres JSONB DEFAULT '[]',
  
  -- Hierarchical Relationships (Corrected Business Flow)
  has_label_admin BOOLEAN DEFAULT false, -- Does artist have dedicated label admin?
  label_admin_id UUID REFERENCES public.user_profiles(id), -- Artist -> Label Admin (if exists)
  company_admin_id UUID REFERENCES public.user_profiles(id), -- Label Admin -> Company Admin
  default_label_admin_id UUID REFERENCES public.user_profiles(id), -- For artists without dedicated label
  
  -- Brand and Business
  brand VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'active',
  approval_status approval_status DEFAULT 'pending', -- For artists under labels
  
  -- Social Media & Online Presence (Shared across roles)
  social_media JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  
  -- Profile Status Tracking
  profile_completed BOOLEAN DEFAULT false,
  registration_completed BOOLEAN DEFAULT false, -- Step 4 completed
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Wallet System (Revenue from Distribution Partner)
  wallet_balance DECIMAL(12,4) DEFAULT 0.0000,
  wallet_enabled BOOLEAN DEFAULT true,
  negative_balance_allowed BOOLEAN DEFAULT false, -- Special permission for some artists
  wallet_credit_limit DECIMAL(12,4) DEFAULT 0.0000, -- How negative they can go
  
  -- Subscription & Payment (Revolut Integration)
  revolut_subscription_active BOOLEAN DEFAULT false,
  last_subscription_payment DATE,
  next_subscription_due DATE,
  preferred_payment_method payment_method DEFAULT 'revolut',
  auto_pay_from_wallet BOOLEAN DEFAULT false, -- Use wallet for subscriptions
  
  -- System Fields
  permissions JSONB DEFAULT '[]', -- For Company Admin, Super Admin
  join_date DATE DEFAULT CURRENT_DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ARTISTS EXTENDED PROFILE (Auto-populated from user_profiles)
-- =============================================================================

-- Artists Extended Profile (inherits immutable data automatically)
CREATE TABLE public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Artist-Specific Information (Mutable)
  stage_name VARCHAR(255) NOT NULL,
  artist_type VARCHAR(50), -- solo_artist, band_group, dj, duo, etc.
  bio TEXT,
  image_url TEXT,
  
  -- Detailed Music Information (Mutable)
  instruments JSONB DEFAULT '[]',
  vocal_type VARCHAR(50),
  years_active VARCHAR(50),
  record_label VARCHAR(255),
  publisher VARCHAR(255),
  
  -- Professional Team (Mutable)
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  manager_phone VARCHAR(50),
  booking_agent VARCHAR(255),
  publicist VARCHAR(255),
  
  -- Detailed Social Media & Platforms (Mutable)
  social_links JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  youtube VARCHAR(255),
  tiktok VARCHAR(255),
  threads VARCHAR(255),
  apple_music VARCHAR(255),
  spotify VARCHAR(255),
  soundcloud VARCHAR(255),
  bandcamp VARCHAR(255),
  deezer VARCHAR(255),
  amazon_music VARCHAR(255),
  youtube_music VARCHAR(255),
  tidal VARCHAR(255),
  
  -- Press & Recognition (Mutable)
  press_coverage JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  recognition JSONB DEFAULT '[]',
  
  -- Revenue Split Configuration (Flexible per artist)
  artist_revenue_percentage DECIMAL(5,2) DEFAULT 70.00, -- Default 70%
  label_revenue_percentage DECIMAL(5,2) DEFAULT 20.00, -- Default 20% to label
  company_revenue_percentage DECIMAL(5,2) DEFAULT 10.00, -- Default 10% to company
  custom_split_enabled BOOLEAN DEFAULT false,
  
  -- Relationships
  label_admin_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MASTER RELEASES TABLE (Business Workflow Integration)
-- =============================================================================

-- Master Releases Table (Auto-save drafts + Workflow Status)
CREATE TABLE public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Release Information (Auto-populated from artist profile)
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id),
  artist_name VARCHAR(255), -- Auto-populated from artist profile
  
  -- Workflow Routing (Business Logic)
  has_label_admin BOOLEAN DEFAULT false, -- Does this artist have dedicated label admin?
  label_admin_id UUID REFERENCES public.user_profiles(id), -- Route to this label admin
  company_admin_id UUID REFERENCES public.user_profiles(id), -- Always goes to company admin
  distribution_partner_id UUID REFERENCES public.user_profiles(id), -- Distribution partner assigned
  
  -- Release Status (Business Workflow)
  status release_status DEFAULT 'draft',
  workflow_step VARCHAR(50) DEFAULT 'artist_creation', -- artist_creation, label_review, distro_processing, dsp_live
  
  -- Auto-save Tracking
  last_auto_save TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auto_save_enabled BOOLEAN DEFAULT true,
  manual_save_count INTEGER DEFAULT 0,
  
  -- Change Request System (When artist can't edit directly)
  artist_can_edit BOOLEAN DEFAULT true, -- False when status is in_review, completed, live
  pending_change_requests INTEGER DEFAULT 0,
  
  -- Distribution Partner Fields (Complete form from Distribution Partner)
  release_type release_type DEFAULT 'single',
  format format_type,
  product_type product_type,
  catalogue_no VARCHAR(100),
  barcode VARCHAR(50),
  tunecode VARCHAR(50),
  ice_work_key VARCHAR(50),
  iswc VARCHAR(50),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  bowi VARCHAR(50),
  
  -- Release Dates and Geography
  previously_released BOOLEAN DEFAULT false,
  previous_release_date DATE,
  recording_country VARCHAR(100),
  pre_release_date DATE,
  pre_release_url TEXT,
  release_date DATE,
  distribution_date DATE,
  release_url TEXT,
  dsp_sent_date TIMESTAMP WITH TIME ZONE, -- When sent to DSP
  
  -- Label and Distribution
  release_label VARCHAR(255),
  distribution_company VARCHAR(255),
  platforms JSONB DEFAULT '[]',
  
  -- Copyright and Legal (Distribution Partner fills)
  copyright_year INTEGER,
  copyright_owner VARCHAR(255),
  p_line TEXT,
  c_line TEXT,
  
  -- Publishing Information (Complete Distribution Partner Fields)
  composer_author VARCHAR(255),
  role VARCHAR(255),
  pro VARCHAR(255), -- Performance Rights Organization
  cae_ipi VARCHAR(50),
  publishing VARCHAR(255),
  publisher_ipi VARCHAR(50),
  publishing_admin VARCHAR(255),
  publishing_admin_ipi VARCHAR(50),
  mechanical VARCHAR(255),
  bmi_work_number VARCHAR(50),
  ascap_work_number VARCHAR(50),
  isni VARCHAR(50),
  sub_publisher VARCHAR(255),
  publishing_type publishing_type,
  territory JSONB DEFAULT '[]',
  
  -- Production Credits (Complete Distribution Partner Fields)
  executive_producer VARCHAR(255),
  co_producer VARCHAR(255),
  assistant_producer VARCHAR(255),
  engineer VARCHAR(255),
  editing VARCHAR(255),
  mastering_studio VARCHAR(255),
  additional_production TEXT,
  
  -- Instrumentation Credits (Complete Distribution Partner Fields)
  keyboards VARCHAR(255),
  programming VARCHAR(255),
  bass VARCHAR(255),
  drums VARCHAR(255),
  guitars VARCHAR(255),
  organ VARCHAR(255),
  percussion VARCHAR(255),
  strings VARCHAR(255),
  vocals VARCHAR(255),
  lead_vocals VARCHAR(255),
  background_vocalists VARCHAR(255),
  additional_instrumentation TEXT,
  
  -- Audio Information (Complete Distribution Partner Fields)
  duration VARCHAR(20), -- e.g., "3:45"
  bpm INTEGER,
  song_key VARCHAR(10), -- e.g., "C Major"
  version VARCHAR(100),
  explicit BOOLEAN DEFAULT false,
  language VARCHAR(50) DEFAULT 'English',
  vocal_type VARCHAR(50),
  file_type VARCHAR(50),
  audio_file_name VARCHAR(255),
  cover_file_name VARCHAR(255),
  
  -- Creative Information
  mood_description TEXT,
  tags TEXT,
  lyrics TEXT,
  
  -- Professional Contacts (Complete Distribution Partner Fields)
  design_art_direction VARCHAR(255),
  management VARCHAR(255),
  booking_agent VARCHAR(255),
  press_contact VARCHAR(255),
  primary_contact_email VARCHAR(255),
  artist_email VARCHAR(255),
  primary_contact_number VARCHAR(50),
  secondary_contact_number VARCHAR(50),
  
  -- Additional Online Presence (Complete Distribution Partner Fields)
  wikipedia VARCHAR(500),
  social_media_link VARCHAR(500),
  shazam VARCHAR(500),
  genius VARCHAR(500),
  all_music VARCHAR(500),
  discogs VARCHAR(500),
  musicbrainz VARCHAR(500),
  imdb VARCHAR(500),
  jaxsta VARCHAR(500),
  youtube_music VARCHAR(500),
  knowledge_panel VARCHAR(500),
  tour_dates VARCHAR(500),
  spotify_uri VARCHAR(500),
  apple_id VARCHAR(100),
  
  -- Workflow Audit Trail
  submitted_by UUID REFERENCES public.user_profiles(id), -- Who submitted (artist or label admin)
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.user_profiles(id), -- Label admin review (if applicable)
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.user_profiles(id), -- Company admin approval
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.user_profiles(id), -- Distribution partner processing
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.user_profiles(id), -- Distribution partner completion
  completed_at TIMESTAMP WITH TIME ZONE,
  live_at TIMESTAMP WITH TIME ZONE, -- When it went live on DSP
  
  -- Revenue Split (Per Release - Can Override Artist Defaults)
  artist_percentage DECIMAL(5,2), -- Inherits from artist profile
  label_percentage DECIMAL(5,2), -- Inherits from artist profile
  company_percentage DECIMAL(5,2), -- Inherits from artist profile
  distribution_partner_percentage DECIMAL(5,2) DEFAULT 10.00, -- Distribution partner always gets 10%
  use_custom_split BOOLEAN DEFAULT false,
  
  -- System Fields
  metadata JSONB DEFAULT '{}',
  file_urls JSONB DEFAULT '{}',
  workflow_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CHANGE REQUESTS SYSTEM (When Artists Can't Edit Directly)
-- =============================================================================

-- Change Requests Table (When release is in_review, completed, or live)
CREATE TABLE public.change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  
  -- Request Details
  requested_by UUID REFERENCES public.user_profiles(id), -- Artist or Label Admin
  request_type change_request_type,
  field_name VARCHAR(255), -- Which field they want to change
  current_value TEXT, -- Current value
  requested_value TEXT, -- New value they want
  reason TEXT, -- Why they want to change it
  urgency_level INTEGER DEFAULT 1, -- 1-5 scale
  
  -- Approval Chain
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES public.user_profiles(id), -- Distribution partner
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- System tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- WALLET & PAYMENT SYSTEM (Revolut + Wallet Integration)
-- =============================================================================

-- Wallet Transactions (Revenue from Distribution Partner)
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  
  -- Transaction Details
  transaction_type VARCHAR(50), -- 'revenue_deposit', 'subscription_payment', 'withdrawal', 'credit_adjustment'
  amount DECIMAL(12,4),
  balance_before DECIMAL(12,4),
  balance_after DECIMAL(12,4),
  
  -- Source Information
  source_type VARCHAR(50), -- 'streaming_revenue', 'subscription_fee', 'manual_adjustment'
  source_reference_id VARCHAR(255), -- Release ID, payment ID, etc.
  
  -- Revenue Source (if applicable)
  release_id UUID REFERENCES public.releases(id),
  revenue_period_start DATE,
  revenue_period_end DATE,
  platform VARCHAR(100), -- Spotify, Apple Music, etc.
  
  -- Payment Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  external_transaction_id VARCHAR(255), -- Revolut transaction ID
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Payments (Revolut Integration)
CREATE TABLE public.subscription_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  
  -- Payment Details
  amount DECIMAL(8,2),
  payment_method payment_method,
  payment_source VARCHAR(50), -- 'revolut', 'wallet', 'bank'
  
  -- Payment Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  revolut_transaction_id VARCHAR(255),
  wallet_transaction_id UUID REFERENCES public.wallet_transactions(id),
  
  -- Subscription Details
  plan subscription_plan,
  billing_period_start DATE,
  billing_period_end DATE,
  
  -- Failure Handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- REVENUE DISTRIBUTION (Post Distribution Partner 10%)
-- =============================================================================

-- Revenue Distribution (After Distribution Partner takes 10%)
CREATE TABLE public.revenue_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id),
  
  -- Revenue Recipients
  artist_id UUID REFERENCES public.artists(id),
  label_admin_id UUID REFERENCES public.user_profiles(id), -- If artist has label admin
  company_admin_id UUID REFERENCES public.user_profiles(id), -- Always gets company percentage
  
  -- Gross Revenue (Before Distribution Partner Cut)
  gross_revenue DECIMAL(12,4),
  distribution_partner_amount DECIMAL(12,4), -- Always 10% off the top
  
  -- Net Revenue (After Distribution Partner Cut = 100% for splits)
  net_revenue DECIMAL(12,4), -- This is the 100% that gets split
  
  -- Revenue Breakdown (From the net_revenue)
  artist_amount DECIMAL(12,4),
  label_amount DECIMAL(12,4), -- Goes to label admin if exists, otherwise to default label
  company_amount DECIMAL(12,4), -- Always goes to company admin
  
  -- Split Percentages Used
  artist_percentage DECIMAL(5,2),
  label_percentage DECIMAL(5,2),
  company_percentage DECIMAL(5,2),
  
  -- Reporting Period
  period_start DATE,
  period_end DATE,
  platform VARCHAR(100), -- Spotify, Apple Music, etc.
  
  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_by UUID REFERENCES public.user_profiles(id), -- Company Admin processes
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Wallet Integration
  artist_wallet_credited BOOLEAN DEFAULT false,
  label_wallet_credited BOOLEAN DEFAULT false,
  company_wallet_credited BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AUTO-SAVE FUNCTION FOR RELEASES
-- =============================================================================

-- Function to auto-save release drafts
CREATE OR REPLACE FUNCTION public.auto_save_release()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-save if status is draft and auto_save is enabled
  IF NEW.status = 'draft' AND NEW.auto_save_enabled = true THEN
    NEW.last_auto_save = NOW();
  END IF;
  
  -- Update artist_can_edit based on status
  IF NEW.status IN ('in_review', 'completed', 'live') THEN
    NEW.artist_can_edit = false;
  ELSIF NEW.status = 'draft' THEN
    NEW.artist_can_edit = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-save
CREATE TRIGGER trigger_auto_save_release
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_save_release();

-- =============================================================================
-- FUNCTION TO SYNC PROFILE DATA ACROSS TABLES
-- =============================================================================

-- Function to sync immutable data from user_profiles to artists
CREATE OR REPLACE FUNCTION public.sync_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update artists table when user_profiles changes
  UPDATE public.artists 
  SET updated_at = NOW()
  WHERE user_id = NEW.id;
  
  -- Update any releases with updated artist name
  UPDATE public.releases 
  SET artist_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
  WHERE artist_id IN (
    SELECT id FROM public.artists WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile sync
CREATE TRIGGER trigger_sync_profile_data
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_data();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - BUSINESS WORKFLOW PERMISSIONS
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

-- Business Workflow RLS Policies
-- Artists can manage own releases in draft status
CREATE POLICY "Artists can manage own draft releases" ON public.releases
  FOR ALL USING (
    status = 'draft' AND 
    EXISTS (
      SELECT 1 FROM public.artists a
      WHERE a.id = releases.artist_id 
      AND a.user_id = auth.uid()
    )
  );

-- Artists can view own releases in any status
CREATE POLICY "Artists can view own releases" ON public.releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artists a
      WHERE a.id = releases.artist_id 
      AND a.user_id = auth.uid()
    )
  );

-- Label Admins can manage releases from their approved artists
CREATE POLICY "Label Admins can manage label releases" ON public.releases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role = 'label_admin'
      AND releases.label_admin_id = up.id
    )
  );

-- Company Admins can view all releases
CREATE POLICY "Company Admins can view all releases" ON public.releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role IN ('company_admin', 'super_admin')
    )
  );

-- Distribution Partners can edit releases when in_review or processing
CREATE POLICY "Distribution Partners can process releases" ON public.releases
  FOR UPDATE USING (
    status IN ('submitted', 'in_review') AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role = 'distribution_partner'
    )
  );

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core workflow indexes
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_label_admin_id ON public.user_profiles(label_admin_id);
CREATE INDEX idx_user_profiles_company_admin_id ON public.user_profiles(company_admin_id);
CREATE INDEX idx_user_profiles_immutable_locked ON public.user_profiles(immutable_data_locked);

CREATE INDEX idx_releases_status ON public.releases(status);
CREATE INDEX idx_releases_workflow_step ON public.releases(workflow_step);
CREATE INDEX idx_releases_artist_can_edit ON public.releases(artist_can_edit);
CREATE INDEX idx_releases_auto_save ON public.releases(last_auto_save);

CREATE INDEX idx_change_requests_release_id ON public.change_requests(release_id);
CREATE INDEX idx_change_requests_status ON public.change_requests(status);

CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON public.wallet_transactions(transaction_type);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER handle_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_releases_updated_at BEFORE UPDATE ON public.releases FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_change_requests_updated_at BEFORE UPDATE ON public.change_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.user_profiles IS 'Master profiles table - Registration Step 4 immutable data + business relationships';
COMMENT ON TABLE public.releases IS 'Master releases table with auto-save, workflow status, and Distribution Partner comprehensive fields';
COMMENT ON TABLE public.change_requests IS 'Change request system when artists cannot edit releases directly';
COMMENT ON TABLE public.wallet_transactions IS 'Wallet system for revenue from Distribution Partner and subscription payments';
COMMENT ON TABLE public.revenue_distributions IS 'Revenue distribution after Distribution Partner 10% cut';

COMMENT ON COLUMN public.user_profiles.immutable_data_locked IS 'Set to true after Registration Step 4 completion - prevents editing of core identity data';
COMMENT ON COLUMN public.releases.artist_can_edit IS 'Business rule: false when status is in_review, completed, or live';
COMMENT ON COLUMN public.revenue_distributions.net_revenue IS 'The 100% amount for splits after Distribution Partner takes 10%';

-- =============================================================================
-- DEFAULT LABEL ADMIN SETUP
-- =============================================================================

-- Insert default label admin for artists without dedicated labels
-- This should be run after initial setup
-- INSERT INTO public.user_profiles (id, role, first_name, last_name, label_name, company_name)
-- VALUES ('default-label-admin-uuid', 'label_admin', 'Default', 'Label Admin', 'MSC & Co Default Label', 'MSC & Co Ltd');
