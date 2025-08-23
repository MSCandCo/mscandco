-- 🚨 FINAL SIMPLE FIX - No ON CONFLICT issues
-- This avoids all constraint problems

-- Create the artists table if it doesn't exist
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    stage_name VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'artists_user_id_unique'
    ) THEN
        ALTER TABLE artists ADD CONSTRAINT artists_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON artists TO authenticated;

-- Create missing artist profiles for existing users (without ON CONFLICT)
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
);

-- ✅ This should work without any constraint errors!
