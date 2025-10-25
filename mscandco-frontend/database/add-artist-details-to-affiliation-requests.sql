-- Add artist detail fields to affiliation_requests table
-- This allows inviting artists who don't exist in the system yet

ALTER TABLE affiliation_requests 
ADD COLUMN IF NOT EXISTS artist_first_name TEXT,
ADD COLUMN IF NOT EXISTS artist_last_name TEXT,
ADD COLUMN IF NOT EXISTS artist_name TEXT;

-- Make artist_id nullable (it can be null if artist doesn't exist yet)
ALTER TABLE affiliation_requests 
ALTER COLUMN artist_id DROP NOT NULL;

-- Add index for searching by artist_name
CREATE INDEX IF NOT EXISTS idx_affiliation_requests_artist_name 
ON affiliation_requests(artist_name);

-- Add comment
COMMENT ON COLUMN affiliation_requests.artist_id IS 'UUID of artist if they exist in system, NULL if inviting new artist';
COMMENT ON COLUMN affiliation_requests.artist_name IS 'Artist stage name for invitation';
COMMENT ON COLUMN affiliation_requests.artist_first_name IS 'Artist first name for invitation';
COMMENT ON COLUMN affiliation_requests.artist_last_name IS 'Artist last name for invitation';

