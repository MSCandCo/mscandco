-- MSC & Co - COMPLETE MASTER SUPABASE SCHEMA
-- Links ALL user roles: Artist, Label Admin, Company Admin, Distribution Partner, Super Admin
-- Every profile feeds from this unified system

-- =============================================================================
-- CORE TYPES AND ENUMS
-- =============================================================================

-- Create comprehensive enums
CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'distributed', 'live');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'mixtape', 'compilation', 'remix', 'live_album', 'soundtrack');
CREATE TYPE product_type AS ENUM ('audio', 'video', 'bundle');
CREATE TYPE format_type AS ENUM ('digital', 'vinyl', 'cd', 'cassette', 'streaming_only');
CREATE TYPE publishing_type AS ENUM ('exclusive', 'co_publishing', 'administration', 'sub_publishing');
CREATE TYPE business_type AS ENUM ('individual', 'company', 'label', 'partnership', 'corporation');

-- =============================================================================
-- MASTER USER PROFILES TABLE (ALL ROLES)
-- =============================================================================

-- Enhanced User Profiles Table - Master for ALL user types
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'artist',
  plan subscription_plan,
  
  -- Basic Personal Information (All Roles)
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  display_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
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
  
  -- Banking Information (Label Admin, Company Admin)
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(255),
  bank_routing_number VARCHAR(255),
  bank_name VARCHAR(255),
  bank_swift_code VARCHAR(50),
  bank_iban VARCHAR(50),
  
  -- Professional Network
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  manager_phone VARCHAR(50),
  booking_agent VARCHAR(255),
  publicist VARCHAR(255),
  
  -- Music Information (Artist, Label Admin)
  primary_genre VARCHAR(100),
  secondary_genres JSONB DEFAULT '[]',
  
  -- Hierarchical Relationships
  label_id UUID REFERENCES public.user_profiles(id), -- Artist -> Label Admin
  company_id UUID REFERENCES public.user_profiles(id), -- Label Admin -> Company Admin
  distribution_partner_id UUID REFERENCES public.user_profiles(id), -- Company Admin -> Distribution Partner
  
  -- Brand and Business
  brand VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'active',
  approval_status approval_status DEFAULT 'pending',
  
  -- Social Media & Online Presence (All Roles)
  social_media JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  
  -- Profile Status Tracking
  profile_completed BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  company_info_locked BOOLEAN DEFAULT false, -- For Label Admin after first setup
  
  -- System Fields
  permissions JSONB DEFAULT '[]', -- For Company Admin, Super Admin
  join_date DATE DEFAULT CURRENT_DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROLE-SPECIFIC EXTENDED PROFILES
-- =============================================================================

-- Artists Extended Profile (inherits from user_profiles)
CREATE TABLE public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Artist-Specific Information
  stage_name VARCHAR(255) NOT NULL,
  real_name VARCHAR(255),
  artist_type VARCHAR(50), -- solo_artist, band_group, dj, duo, etc.
  bio TEXT,
  image_url TEXT,
  
  -- Detailed Music Information
  instruments JSONB DEFAULT '[]',
  vocal_type VARCHAR(50),
  years_active VARCHAR(50),
  record_label VARCHAR(255),
  publisher VARCHAR(255),
  
  -- Professional Team
  email VARCHAR(255),
  phone_number VARCHAR(50),
  
  -- Detailed Social Media & Platforms
  social_links JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  website VARCHAR(500),
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
  
  -- Press & Recognition
  press_coverage JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  recognition JSONB DEFAULT '[]',
  
  -- Relationships
  label_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Label Admin Extended Profile
CREATE TABLE public.label_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Label Business Information
  label_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  position VARCHAR(255),
  department VARCHAR(255),
  
  -- Address & Legal
  office_address TEXT,
  business_type VARCHAR(100),
  tax_id VARCHAR(100),
  vat_number VARCHAR(100),
  registration_number VARCHAR(100),
  founded_year VARCHAR(4),
  
  -- Banking Details
  bank_info JSONB DEFAULT '{}',
  
  -- Professional Status
  profile_completion INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_company_info_locked BOOLEAN DEFAULT false,
  registration_date TIMESTAMP WITH TIME ZONE,
  
  -- Relationships
  company_id UUID REFERENCES public.user_profiles(id),
  managed_artists JSONB DEFAULT '[]', -- Array of artist IDs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Admin Extended Profile
CREATE TABLE public.company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Company Role Information
  company_role VARCHAR(100) DEFAULT 'Company Admin',
  department VARCHAR(100) DEFAULT 'Business Operations',
  position VARCHAR(100) DEFAULT 'Company Administrator',
  
  -- Access & Permissions
  permissions JSONB DEFAULT '[]',
  access_level INTEGER DEFAULT 5, -- 1-10 scale
  
  -- Management Scope
  managed_labels JSONB DEFAULT '[]', -- Array of label IDs
  managed_regions JSONB DEFAULT '[]', -- Geographic regions
  
  -- Professional Details
  join_date DATE DEFAULT CURRENT_DATE,
  reporting_to UUID REFERENCES public.user_profiles(id), -- Super Admin
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distribution Partner Extended Profile  
CREATE TABLE public.distribution_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Distribution Business
  company_name VARCHAR(255),
  partner_type VARCHAR(100), -- 'distribution', 'aggregator', 'platform'
  service_regions JSONB DEFAULT '[]',
  supported_platforms JSONB DEFAULT '[]',
  
  -- Technical Capabilities
  api_access_level INTEGER DEFAULT 3,
  bulk_processing BOOLEAN DEFAULT true,
  automated_workflows BOOLEAN DEFAULT true,
  
  -- Business Terms
  commission_rate DECIMAL(5,2),
  minimum_payout DECIMAL(8,2),
  payment_schedule VARCHAR(50), -- 'monthly', 'quarterly'
  
  -- Management Scope
  managed_companies JSONB DEFAULT '[]', -- Array of company IDs
  processed_releases INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- COMPREHENSIVE RELEASES/ASSETS TABLE (Distribution Partner Master Template)
-- =============================================================================

-- Master Releases Table (captures ALL distribution partner form fields)
CREATE TABLE public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Release Information
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id),
  artist_name VARCHAR(255),
  label_id UUID REFERENCES public.user_profiles(id),
  company_id UUID REFERENCES public.user_profiles(id),
  distribution_partner_id UUID REFERENCES public.user_profiles(id),
  release_type release_type DEFAULT 'single',
  status release_status DEFAULT 'draft',
  
  -- Product Information (Distribution Partner Form)
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
  
  -- Label and Distribution
  release_label VARCHAR(255),
  distribution_company VARCHAR(255),
  platforms JSONB DEFAULT '[]',
  
  -- Copyright and Legal
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
  
  -- Workflow and Approval Chain
  submitted_by UUID REFERENCES public.user_profiles(id), -- Who submitted
  reviewed_by UUID REFERENCES public.user_profiles(id), -- Label Admin review
  approved_by UUID REFERENCES public.user_profiles(id), -- Company Admin approval
  distributed_by UUID REFERENCES public.user_profiles(id), -- Distribution Partner
  
  -- System Fields
  metadata JSONB DEFAULT '{}',
  file_urls JSONB DEFAULT '{}',
  workflow_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SUPPORTING TABLES WITH PROPER LINKING
-- =============================================================================

-- Projects table (for grouping releases)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.user_profiles(id),
  company_id UUID REFERENCES public.user_profiles(id),
  description TEXT,
  genre VARCHAR(100),
  status release_status DEFAULT 'draft',
  release_date DATE,
  artwork_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table (individual tracks)
CREATE TABLE public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration INTEGER, -- in seconds
  file_url TEXT,
  waveform_data JSONB,
  lyrics TEXT,
  track_number INTEGER,
  isrc VARCHAR(50),
  bpm INTEGER,
  song_key VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table (cross-role access)
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  artist_id UUID REFERENCES public.artists(id),
  label_id UUID REFERENCES public.user_profiles(id),
  company_id UUID REFERENCES public.user_profiles(id),
  song_id UUID REFERENCES public.songs(id),
  release_id UUID REFERENCES public.releases(id),
  event_type VARCHAR(100), -- 'play', 'download', 'stream', etc.
  platform VARCHAR(100),
  location VARCHAR(100),
  revenue DECIMAL(10,4) DEFAULT 0.00,
  streams INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Distribution table (Company Admin manages)
CREATE TABLE public.revenue_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id),
  artist_id UUID REFERENCES public.artists(id),
  label_id UUID REFERENCES public.user_profiles(id),
  company_id UUID REFERENCES public.user_profiles(id),
  distribution_partner_id UUID REFERENCES public.user_profiles(id),
  
  -- Revenue Breakdown
  total_revenue DECIMAL(12,4),
  artist_share DECIMAL(12,4),
  label_share DECIMAL(12,4),
  company_share DECIMAL(12,4),
  distribution_share DECIMAL(12,4),
  
  -- Percentages
  artist_percentage DECIMAL(5,2),
  label_percentage DECIMAL(5,2),
  company_percentage DECIMAL(5,2),
  distribution_percentage DECIMAL(5,2),
  
  period_start DATE,
  period_end DATE,
  processed_by UUID REFERENCES public.user_profiles(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - COMPREHENSIVE ACCESS CONTROL
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - ROLE-BASED ACCESS
-- =============================================================================

-- User profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artists: Can manage own profile + Label Admins can view their artists
CREATE POLICY "Artists can manage own profile" ON public.artists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Label Admins can view their artists" ON public.artists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'label_admin'
      AND artists.label_id = up.id
    )
  );

-- Releases: Hierarchical access based on workflow
CREATE POLICY "Artists can manage own releases" ON public.releases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.artists a
      WHERE a.id = releases.artist_id 
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Label Admins can manage label releases" ON public.releases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role = 'label_admin'
      AND releases.label_id = up.id
    )
  );

CREATE POLICY "Company Admins can view all company releases" ON public.releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role = 'company_admin'
      AND releases.company_id = up.id
    )
  );

CREATE POLICY "Distribution Partners can view all releases" ON public.releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role = 'distribution_partner'
    )
  );

-- Revenue: Company Admin and above can manage
CREATE POLICY "Company Admins can manage revenue" ON public.revenue_distributions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND up.role IN ('company_admin', 'super_admin')
    )
  );

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core indexes
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_label_id ON public.user_profiles(label_id);
CREATE INDEX idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX idx_user_profiles_distribution_partner_id ON public.user_profiles(distribution_partner_id);

CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_artists_label_id ON public.artists(label_id);
CREATE INDEX idx_label_profiles_user_id ON public.label_profiles(user_id);
CREATE INDEX idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX idx_distribution_profiles_user_id ON public.distribution_profiles(user_id);

CREATE INDEX idx_releases_artist_id ON public.releases(artist_id);
CREATE INDEX idx_releases_label_id ON public.releases(label_id);
CREATE INDEX idx_releases_company_id ON public.releases(company_id);
CREATE INDEX idx_releases_distribution_partner_id ON public.releases(distribution_partner_id);
CREATE INDEX idx_releases_status ON public.releases(status);
CREATE INDEX idx_releases_release_date ON public.releases(release_date);

CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_artist_id ON public.analytics(artist_id);
CREATE INDEX idx_analytics_label_id ON public.analytics(label_id);
CREATE INDEX idx_analytics_company_id ON public.analytics(company_id);

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
CREATE TRIGGER handle_label_profiles_updated_at BEFORE UPDATE ON public.label_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_distribution_profiles_updated_at BEFORE UPDATE ON public.distribution_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_releases_updated_at BEFORE UPDATE ON public.releases FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- HELPER FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to get user's role hierarchy
CREATE OR REPLACE FUNCTION public.get_user_hierarchy(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  role user_role,
  label_id UUID,
  company_id UUID,
  distribution_partner_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.role,
    up.label_id,
    up.company_id,
    up.distribution_partner_id
  FROM public.user_profiles up
  WHERE up.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.user_profiles IS 'Master user profiles table for ALL roles - Artist, Label Admin, Company Admin, Distribution Partner, Super Admin';
COMMENT ON TABLE public.releases IS 'Master releases table capturing all distribution partner form fields - the comprehensive template for asset management';
COMMENT ON TABLE public.revenue_distributions IS 'Revenue breakdown and distribution across the user hierarchy';

COMMENT ON COLUMN public.user_profiles.label_id IS 'Artist -> Label Admin relationship';
COMMENT ON COLUMN public.user_profiles.company_id IS 'Label Admin -> Company Admin relationship';  
COMMENT ON COLUMN public.user_profiles.distribution_partner_id IS 'Company Admin -> Distribution Partner relationship';

COMMENT ON COLUMN public.releases.isrc IS 'International Standard Recording Code';
COMMENT ON COLUMN public.releases.upc IS 'Universal Product Code';
COMMENT ON COLUMN public.releases.pro IS 'Performance Rights Organization (BMI, ASCAP, etc.)';
COMMENT ON COLUMN public.releases.territory IS 'Geographic territories for publishing rights';
