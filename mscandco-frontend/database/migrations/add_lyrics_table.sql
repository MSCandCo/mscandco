-- Create lyrics table for lyrics analysis feature
CREATE TABLE IF NOT EXISTS public.lyrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL DEFAULT 1,
  track_name TEXT NOT NULL,
  lyrics_text TEXT NOT NULL,
  language TEXT DEFAULT 'en',

  -- AI Analysis Results (stored as JSONB for flexibility)
  sentiment_analysis JSONB,
  themes JSONB,
  readability_score JSONB,
  suggestions JSONB,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT lyrics_track_number_check CHECK (track_number > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lyrics_created_by ON public.lyrics(created_by);
CREATE INDEX IF NOT EXISTS idx_lyrics_release_id ON public.lyrics(release_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_created_at ON public.lyrics(created_at);

-- Enable RLS
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own lyrics
CREATE POLICY "Users can view own lyrics" ON public.lyrics
  FOR SELECT
  USING (auth.uid() = created_by);

-- Users can insert their own lyrics
CREATE POLICY "Users can insert own lyrics" ON public.lyrics
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own lyrics
CREATE POLICY "Users can update own lyrics" ON public.lyrics
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own lyrics
CREATE POLICY "Users can delete own lyrics" ON public.lyrics
  FOR DELETE
  USING (auth.uid() = created_by);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lyrics_updated_at
  BEFORE UPDATE ON public.lyrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
