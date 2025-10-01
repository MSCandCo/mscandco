-- Add missing file URL columns to releases table
-- These columns are needed to store uploaded file URLs

-- Add artwork URL column
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS artwork_url TEXT;

-- Add audio file URL and name columns  
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS audio_file_url TEXT;

ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS audio_file_name TEXT;

-- Add Apple Lossless URL column
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS apple_lossless_url TEXT;

-- Add indexes for better performance when querying by file URLs
CREATE INDEX IF NOT EXISTS idx_releases_artwork_url ON releases(artwork_url);
CREATE INDEX IF NOT EXISTS idx_releases_audio_file_url ON releases(audio_file_url);
CREATE INDEX IF NOT EXISTS idx_releases_apple_lossless_url ON releases(apple_lossless_url);

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'releases' 
AND column_name IN ('artwork_url', 'audio_file_url', 'audio_file_name', 'apple_lossless_url')
ORDER BY column_name;
