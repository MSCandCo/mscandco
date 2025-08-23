-- MSC & Co Music Platform Database Schema for Supabase
-- This file contains the complete database structure for the music distribution platform

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('artist', 'label_admin', 'company_admin', 'super_admin', 'distribution_partner');
CREATE TYPE subscription_plan AS ENUM ('Artist Starter', 'Artist Pro', 'Label Admin Starter', 'Label Admin Pro', 'Company Admin', 'Distribution Partner');
CREATE TYPE release_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'distributed');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'artist',
  plan subscription_plan,
  brand VARCHAR(255),
  display_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  bio TEXT,
  primary_genre VARCHAR(100),
  label_id UUID REFERENCES public.user_profiles(id),
  subscription_status VARCHAR(50) DEFAULT 'active',
  approval_status approval_status DEFAULT 'pending',
  social_media JSONB DEFAULT '{}',
  music_platforms JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists table
CREATE TABLE public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  stage_name VARCHAR(255) NOT NULL,
  real_name VARCHAR(255),
  genre VARCHAR(100),
  bio TEXT,
  image_url TEXT,
  social_links JSONB DEFAULT '{}',
  label_id UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
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

-- Songs table
CREATE TABLE public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration INTEGER, -- in seconds
  file_url TEXT,
  waveform_data JSONB,
  lyrics TEXT,
  track_number INTEGER,
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

-- Releases table
CREATE TABLE public.releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES public.artists(id),
  release_type VARCHAR(50), -- 'single', 'ep', 'album'
  status release_status DEFAULT 'draft',
  release_date DATE,
  distribution_date DATE,
  platforms JSONB DEFAULT '[]', -- Array of platform names
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Analytics table
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  song_id UUID REFERENCES public.songs(id),
  event_type VARCHAR(100), -- 'play', 'download', 'stream', etc.
  platform VARCHAR(100),
  location VARCHAR(100),
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
  file_type VARCHAR(50),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration table
CREATE TABLE public.collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES public.user_profiles(id),
  role VARCHAR(100), -- 'producer', 'songwriter', 'vocalist', etc.
  percentage DECIMAL(5,2), -- Revenue split percentage
  status approval_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

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

-- Projects: Users can manage their own projects
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.artists 
      WHERE artists.id = projects.artist_id 
      AND artists.user_id = auth.uid()
    )
  );

-- Songs: Users can manage songs in their projects
CREATE POLICY "Users can manage songs in own projects" ON public.songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      JOIN public.artists ON artists.id = projects.artist_id
      WHERE projects.id = songs.project_id 
      AND artists.user_id = auth.uid()
    )
  );

-- Stems: Users can manage stems for their songs
CREATE POLICY "Users can manage stems for own songs" ON public.stems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.songs 
      JOIN public.projects ON projects.id = songs.project_id
      JOIN public.artists ON artists.id = projects.artist_id
      WHERE songs.id = stems.song_id 
      AND artists.user_id = auth.uid()
    )
  );

-- Add more policies as needed...

-- Create functions for updated_at timestamps
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

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_label_id ON public.user_profiles(label_id);
CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_projects_artist_id ON public.projects(artist_id);
CREATE INDEX idx_songs_project_id ON public.songs(project_id);
CREATE INDEX idx_stems_song_id ON public.stems(song_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);

-- Insert some initial data
INSERT INTO public.user_profiles (id, role, plan, brand, display_name, first_name, last_name, subscription_status, approval_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'artist', 'Artist Pro', 'YHWH MSC', 'YHWH MSC', 'Demo', 'Artist', 'active', 'approved'),
  ('00000000-0000-0000-0000-000000000002', 'label_admin', 'Label Admin Pro', 'MSC & Co', 'MSC Admin', 'Label', 'Admin', 'active', 'approved'),
  ('00000000-0000-0000-0000-000000000003', 'company_admin', 'Company Admin', 'MSC & Co', 'Company Admin', 'Company', 'Admin', 'active', 'approved');