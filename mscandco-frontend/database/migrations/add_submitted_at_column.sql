-- Add submitted_at column to profile_change_requests
-- This makes it clearer when a request was submitted vs general created_at timestamp

ALTER TABLE profile_change_requests
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing records with created_at value
UPDATE profile_change_requests
SET submitted_at = created_at
WHERE submitted_at IS NULL;

-- Add index for performance (requests are often filtered by submission date)
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_submitted_at
ON profile_change_requests(submitted_at DESC);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profile_change_requests'
AND column_name = 'submitted_at';
