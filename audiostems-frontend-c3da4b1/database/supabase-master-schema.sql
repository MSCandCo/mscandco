-- MSC & Co - Master Supabase Schema for Music Distribution Platform
-- Based on comprehensive Distribution Partner form fields
-- This schema captures ALL asset/release information across the platform

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

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Enhanced User Profiles Table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'artist',
  plan subscription_plan,
  brand VARCHAR(255),
  display_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
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
  primary_genre VARCHAR(100),
  label_id UUID REFERENCES public.user_profiles(id),
  subscription_status VARCHAR(50) DEFAULT 'active',
  approval_status approval_status DEFAULT 'pending',
  social_media JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive Artists Table
CREATE TABLE public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Basic Artist Info
  stage_name VARCHAR(255) NOT NULL,
  real_name VARCHAR(255),
  artist_type VARCHAR(50), -- solo_artist, band_group, dj, duo, etc.
  bio TEXT,
  image_url TEXT,
  
  -- Music Information
  genre VARCHAR(100),
  secondary_genres JSONB DEFAULT '[]',
  instruments JSONB DEFAULT '[]',
  vocal_type VARCHAR(50),
  years_active VARCHAR(50),
  record_label VARCHAR(255),
  publisher VARCHAR(255),
  
  -- Contact Information
  email VARCHAR(255),
  phone_number VARCHAR(50),
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  manager_phone VARCHAR(50),
  booking_agent VARCHAR(255),
  publicist VARCHAR(255),
  
  -- Social Media & Platforms
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
  
  -- System Fields
  label_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- COMPREHENSIVE RELEASES/ASSETS TABLE
-- =============================================================================

-- Master Releases Table (based on Distribution Partner form)
CREATE TABLE public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Release Information
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id),
  artist_name VARCHAR(255),
  release_type release_type DEFAULT 'single',
  status release_status DEFAULT 'draft',
  
  -- Product Information
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
  
  -- Publishing Information
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
  
  -- Production Credits
  executive_producer VARCHAR(255),
  co_producer VARCHAR(255),
  assistant_producer VARCHAR(255),
  engineer VARCHAR(255),
  editing VARCHAR(255),
  mastering_studio VARCHAR(255),
  additional_production TEXT,
  
  -- Instrumentation Credits
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
  
  -- Audio Information
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
  
  -- Professional Contacts
  design_art_direction VARCHAR(255),
  management VARCHAR(255),
  booking_agent VARCHAR(255),
  press_contact VARCHAR(255),
  primary_contact_email VARCHAR(255),
  artist_email VARCHAR(255),
  primary_contact_number VARCHAR(50),
  secondary_contact_number VARCHAR(50),
  
  -- Additional Online Presence
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
  
  -- System Fields
  metadata JSONB DEFAULT '{}',
  file_urls JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SUPPORTING TABLES
-- =============================================================================

-- Projects table (for grouping releases)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
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

-- Stems table
CREATE TABLE public.stems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  stem_type VARCHAR(100), -- e.g., 'vocals', 'drums', 'bass', 'guitar'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
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

-- Monthly statements table
CREATE TABLE public.monthly_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_streams BIGINT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  statement_data JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Download history table
CREATE TABLE public.download_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id),
  release_id UUID REFERENCES public.releases(id),
  file_type VARCHAR(50),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration table
CREATE TABLE public.collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES public.user_profiles(id),
  role VARCHAR(100), -- 'producer', 'songwriter', 'vocalist', etc.
  percentage DECIMAL(5,2), -- Revenue split percentage
  status approval_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  songs JSONB DEFAULT '[]', -- Array of song IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- User profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artists: Users can manage their own artist profiles
CREATE POLICY "Users can view own artist profile" ON public.artists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own artist profile" ON public.artists
  FOR ALL USING (auth.uid() = user_id);

-- Releases: Users can manage their own releases + Distribution Partners can view all
CREATE POLICY "Artists can manage own releases" ON public.releases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.artists 
      WHERE artists.id = releases.artist_id 
      AND artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Distribution Partners can view all releases" ON public.releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'distribution_partner'
    )
  );

-- Continue with more policies as needed...

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core indexes
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_label_id ON public.user_profiles(label_id);
CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_artists_stage_name ON public.artists(stage_name);
CREATE INDEX idx_releases_artist_id ON public.releases(artist_id);
CREATE INDEX idx_releases_status ON public.releases(status);
CREATE INDEX idx_releases_release_date ON public.releases(release_date);
CREATE INDEX idx_releases_isrc ON public.releases(isrc);
CREATE INDEX idx_releases_upc ON public.releases(upc);
CREATE INDEX idx_projects_artist_id ON public.projects(artist_id);
CREATE INDEX idx_songs_project_id ON public.songs(project_id);
CREATE INDEX idx_songs_release_id ON public.songs(release_id);
CREATE INDEX idx_stems_song_id ON public.stems(song_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_releases_updated_at
  BEFORE UPDATE ON public.releases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.releases IS 'Master releases table capturing all distribution partner form fields for comprehensive asset management';
COMMENT ON COLUMN public.releases.isrc IS 'International Standard Recording Code';
COMMENT ON COLUMN public.releases.upc IS 'Universal Product Code';
COMMENT ON COLUMN public.releases.iswc IS 'International Standard Musical Work Code';
COMMENT ON COLUMN public.releases.pro IS 'Performance Rights Organization (BMI, ASCAP, etc.)';
COMMENT ON COLUMN public.releases.territory IS 'Geographic territories for publishing rights';
COMMENT ON COLUMN public.releases.publishing_type IS 'Type of publishing agreement';
