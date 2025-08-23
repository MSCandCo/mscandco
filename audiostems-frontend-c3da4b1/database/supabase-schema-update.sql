-- MSC & Co Music Platform - Schema Updates for Profile Forms
-- Add missing fields to support all form data

-- Add missing fields to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add missing fields to artists table
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS artist_type VARCHAR(50);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS vocal_type VARCHAR(50);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS years_active VARCHAR(50);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS record_label VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS publisher VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instruments JSONB DEFAULT '[]';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS secondary_genres JSONB DEFAULT '[]';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS music_platforms JSONB DEFAULT '{}';

-- Add additional profile fields that forms expect
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Update artists table with additional social media fields  
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS youtube VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS tiktok VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS threads VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS apple_music VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS soundcloud VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS bandcamp VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS deezer VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS amazon_music VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS youtube_music VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS tidal VARCHAR(255);

-- Add press and recognition fields
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS press_coverage JSONB DEFAULT '[]';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS recognition JSONB DEFAULT '[]';

-- Add professional info fields
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_email VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_phone VARCHAR(50);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS booking_agent VARCHAR(255);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS publicist VARCHAR(255);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_artists_artist_type ON public.artists(artist_type);
CREATE INDEX IF NOT EXISTS idx_artists_record_label ON public.artists(record_label);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON public.user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON public.user_profiles(city);

-- Add comments for clarity
COMMENT ON COLUMN public.artists.artist_type IS 'Type of artist: Solo Artist, Band, DJ, etc.';
COMMENT ON COLUMN public.artists.vocal_type IS 'Vocal range: Soprano, Alto, Tenor, Baritone, Bass';
COMMENT ON COLUMN public.artists.years_active IS 'Number of years active in music';
COMMENT ON COLUMN public.artists.instruments IS 'Array of instruments the artist plays';
COMMENT ON COLUMN public.artists.secondary_genres IS 'Array of secondary music genres';
