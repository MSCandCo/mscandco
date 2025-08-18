-- =====================================================
-- MSC & Co - FRESH START SCHEMA
-- Creates everything from scratch after cleanup
-- =====================================================

-- =============================================================================
-- CORE TYPES AND ENUMS
-- =============================================================================

-- Create types (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_status') THEN
        CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'completed', 'live', 'change_requested');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'release_type') THEN
        CREATE TYPE release_type AS ENUM ('single', 'ep', 'album', 'mixtape', 'compilation', 'remix', 'live_album', 'soundtrack');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM ('audio', 'video', 'bundle');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'format_type') THEN
        CREATE TYPE format_type AS ENUM ('digital', 'vinyl', 'cd', 'cassette', 'streaming_only');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publishing_type') THEN
        CREATE TYPE publishing_type AS ENUM ('exclusive', 'co_publishing', 'administration', 'sub_publishing');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
        CREATE TYPE business_type AS ENUM ('individual', 'company', 'label', 'partnership', 'corporation');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('revolut', 'wallet', 'bank_transfer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_type') THEN
        CREATE TYPE change_request_type AS ENUM ('metadata', 'artwork', 'audio', 'credits', 'urgent');
    END IF;
END $$;

-- =============================================================================
-- CREATE USER_PROFILES TABLE FROM SCRATCH
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  
  -- Basic Auth Info
  email VARCHAR(255) UNIQUE,
  role user_role DEFAULT 'artist',
  display_name VARCHAR(255),
  
  -- Personal Information (Immutable after registration)
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  city VARCHAR(255),
  address TEXT,
  postal_code VARCHAR(20),
  
  -- Profile Management
  immutable_data_locked BOOLEAN DEFAULT false,
  profile_completed BOOLEAN DEFAULT false,
  registration_completed BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Business Information
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
  
  -- Label Information
  label_name VARCHAR(255),
  
  -- Banking Information
  revolut_account_id VARCHAR(255),
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
  
  -- Music & Content
  bio TEXT,
  website VARCHAR(255),
  primary_genre VARCHAR(100),
  secondary_genres JSONB DEFAULT '[]',
  social_media JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  
  -- Hierarchical Relationships
  has_label_admin BOOLEAN DEFAULT false,
  label_admin_id UUID,
  company_admin_id UUID,
  default_label_admin_id UUID,
  
  -- Wallet System
  wallet_balance DECIMAL(12,4) DEFAULT 0.0000,
  wallet_enabled BOOLEAN DEFAULT true,
  negative_balance_allowed BOOLEAN DEFAULT false,
  wallet_credit_limit DECIMAL(12,4) DEFAULT 0.0000,
  
  -- Subscription & Payment
  revolut_subscription_active BOOLEAN DEFAULT false,
  last_subscription_payment DATE,
  next_subscription_due DATE,
  preferred_payment_method payment_method DEFAULT 'revolut',
  auto_pay_from_wallet BOOLEAN DEFAULT false,
  
  -- System Fields
  permissions JSONB DEFAULT '[]',
  avatar_url TEXT,
  subscription_status VARCHAR(50) DEFAULT 'active',
  approval_status approval_status DEFAULT 'pending',
  brand VARCHAR(255),
  label_id VARCHAR(255),
  plan subscription_plan DEFAULT 'Artist Starter',
  join_date DATE DEFAULT CURRENT_DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE ARTISTS TABLE FROM SCRATCH
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Artist Identity
  stage_name VARCHAR(255),
  real_name VARCHAR(255),
  artist_type VARCHAR(100),
  bio TEXT,
  
  -- Music Information
  genre VARCHAR(100),
  secondary_genres JSONB DEFAULT '[]',
  instruments JSONB DEFAULT '[]',
  vocal_type VARCHAR(100),
  years_active VARCHAR(50),
  record_label VARCHAR(255),
  publisher VARCHAR(255),
  
  -- Social Media & Platforms
  website VARCHAR(255),
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
  social_links JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  
  -- Professional Network
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  manager_phone VARCHAR(50),
  booking_agent VARCHAR(255),
  publicist VARCHAR(255),
  
  -- Press & Recognition
  press_coverage JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  recognition JSONB DEFAULT '[]',
  
  -- Revenue Split Configuration
  artist_revenue_percentage DECIMAL(5,2) DEFAULT 70.00,
  label_revenue_percentage DECIMAL(5,2) DEFAULT 20.00,
  company_revenue_percentage DECIMAL(5,2) DEFAULT 10.00,
  custom_split_enabled BOOLEAN DEFAULT false,
  
  -- Relationships
  label_admin_id UUID REFERENCES public.user_profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE RELEASES TABLE WITH ALL DISTRIBUTION PARTNER FIELDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Release Information
  title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  release_type release_type DEFAULT 'single',
  genre VARCHAR(100),
  release_date DATE,
  status release_status DEFAULT 'draft',
  
  -- Identifiers
  catalogue_no VARCHAR(100),
  barcode VARCHAR(50),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  
  -- Audio Information
  duration VARCHAR(20),
  explicit BOOLEAN DEFAULT false,
  language VARCHAR(50) DEFAULT 'English',
  
  -- Artwork & Media
  artwork_url TEXT,
  audio_file_url TEXT,
  
  -- Publishing Information
  publishing_type publishing_type,
  copyright_owner VARCHAR(255),
  publishing_company VARCHAR(255),
  mechanical_rights VARCHAR(255),
  
  -- Production Credits
  producer VARCHAR(255),
  executive_producer VARCHAR(255),
  co_producer VARCHAR(255),
  mixer VARCHAR(255),
  mastering_engineer VARCHAR(255),
  recording_engineer VARCHAR(255),
  songwriter JSONB DEFAULT '[]',
  composer JSONB DEFAULT '[]',
  lyricist JSONB DEFAULT '[]',
  
  -- Additional Credits
  featured_artists JSONB DEFAULT '[]',
  additional_credits JSONB DEFAULT '{}',
  
  -- Business & Legal
  record_label VARCHAR(255),
  distribution_partner VARCHAR(255),
  publishing_administrator VARCHAR(255),
  
  -- Technical Information
  audio_format VARCHAR(50),
  sample_rate VARCHAR(20),
  bit_depth VARCHAR(10),
  file_size VARCHAR(50),
  
  -- Marketing & Promotion
  description TEXT,
  marketing_plan TEXT,
  target_audience TEXT,
  promotional_assets JSONB DEFAULT '{}',
  
  -- Digital Distribution
  platforms JSONB DEFAULT '{}',
  territory_restrictions JSONB DEFAULT '[]',
  content_advisory VARCHAR(100),
  
  -- Revenue & Rights
  artist_percentage DECIMAL(5,2),
  label_percentage DECIMAL(5,2),
  company_percentage DECIMAL(5,2),
  distribution_partner_percentage DECIMAL(5,2) DEFAULT 10.00,
  
  -- Workflow Management
  has_label_admin BOOLEAN DEFAULT false,
  label_admin_id UUID REFERENCES public.user_profiles(id),
  company_admin_id UUID REFERENCES public.user_profiles(id),
  distribution_partner_id UUID REFERENCES public.user_profiles(id),
  workflow_step VARCHAR(50) DEFAULT 'artist_creation',
  
  -- Auto-save & Editing
  last_auto_save TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auto_save_enabled BOOLEAN DEFAULT true,
  artist_can_edit BOOLEAN DEFAULT true,
  
  -- Audit Trail
  submitted_by UUID REFERENCES public.user_profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  workflow_history JSONB DEFAULT '[]',
  
  -- User Association
  user_id UUID REFERENCES public.user_profiles(id),
  artist_id UUID REFERENCES public.artists(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE SUPPORTING TABLES
-- =============================================================================

-- Change Requests Table
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  
  -- Request Details
  requested_by UUID REFERENCES public.user_profiles(id),
  request_type change_request_type,
  field_name VARCHAR(255),
  current_value TEXT,
  requested_value TEXT,
  reason TEXT,
  urgency_level INTEGER DEFAULT 1,
  
  -- Approval Chain
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  
  -- Transaction Details
  transaction_type VARCHAR(50),
  amount DECIMAL(12,4),
  balance_before DECIMAL(12,4),
  balance_after DECIMAL(12,4),
  
  -- Source Information
  source_type VARCHAR(50),
  source_reference_id VARCHAR(255),
  
  -- Revenue Source
  release_id UUID REFERENCES public.releases(id),
  revenue_period_start DATE,
  revenue_period_end DATE,
  platform VARCHAR(100),
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Distribution Table
CREATE TABLE IF NOT EXISTS public.revenue_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID REFERENCES public.releases(id),
  
  -- Revenue Recipients
  artist_id UUID REFERENCES public.artists(id),
  label_admin_id UUID REFERENCES public.user_profiles(id),
  company_admin_id UUID REFERENCES public.user_profiles(id),
  
  -- Gross Revenue (Before Distribution Partner Cut)
  gross_revenue DECIMAL(12,4),
  distribution_partner_amount DECIMAL(12,4),
  
  -- Net Revenue (After Distribution Partner Cut = 100% for splits)
  net_revenue DECIMAL(12,4),
  
  -- Revenue Breakdown (From the net_revenue)
  artist_amount DECIMAL(12,4),
  label_amount DECIMAL(12,4),
  company_amount DECIMAL(12,4),
  
  -- Split Percentages Used
  artist_percentage DECIMAL(5,2),
  label_percentage DECIMAL(5,2),
  company_percentage DECIMAL(5,2),
  
  -- Reporting Period
  period_start DATE,
  period_end DATE,
  platform VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ENABLE RLS
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Updated at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-save function for releases
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

-- Create triggers
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_releases_updated_at
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_auto_save_release
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_save_release();

-- =============================================================================
-- CREATE DEFAULT LABEL ADMIN
-- =============================================================================

-- Insert default label admin for artists without dedicated labels
INSERT INTO public.user_profiles (
    id,
    email,
    role, 
    first_name, 
    last_name, 
    label_name, 
    company_name,
    display_name,
    registration_completed,
    profile_completed
) 
SELECT 
    gen_random_uuid(),
    'default@mscandco.com',
    'label_admin', 
    'Default', 
    'Label Admin', 
    'MSC & Co Default Label', 
    'MSC & Co Ltd',
    'MSC & Co Default Label',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE email = 'default@mscandco.com'
);

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

SELECT 'MSC & Co Fresh Start Schema Applied Successfully! 🚀' as status;
