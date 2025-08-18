-- 🚨 SIMPLE ARTISTS TABLE FIX
-- Fixed to not assume sequences exist

-- First, let's create the artists table if it doesn't exist
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id),
    stage_name VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions (only if table exists)
GRANT ALL ON artists TO authenticated;

-- Grant sequence permissions only if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'artists_id_seq') THEN
        GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;
    END IF;
END $$;

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

-- ✅ This should work without sequence errors!
