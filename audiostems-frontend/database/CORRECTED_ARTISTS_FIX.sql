-- 🚨 CORRECTED ARTISTS TABLE FIX
-- Fixed syntax error - PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT

-- First, try to drop the constraint if it exists (ignore errors)
DO $$ 
BEGIN
    ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_user_id_unique;
EXCEPTION 
    WHEN undefined_object THEN NULL;
END $$;

-- Add the unique constraint
ALTER TABLE artists ADD CONSTRAINT artists_user_id_unique UNIQUE (user_id);

-- Ensure artists table has proper columns (safe with IF NOT EXISTS)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stage_name VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Grant permissions
GRANT ALL ON artists TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;

-- Create missing artist profiles for existing users
INSERT INTO artists (user_id, stage_name, created_at, updated_at)
SELECT 
  up.id,
  up.display_name,
  NOW(),
  NOW()
FROM user_profiles up
WHERE up.role = 'artist' 
AND NOT EXISTS (
  SELECT 1 FROM artists a WHERE a.user_id = up.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ✅ This should fix the login issue!
