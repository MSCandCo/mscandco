-- 🔐 PROPER RLS SETUP FOR SUPABASE
-- Run this in Supabase SQL Editor to enable proper Row Level Security

-- 1. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can insert own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can update own artist profile" ON artists;

-- 3. Create proper RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Create proper RLS policies for artists
CREATE POLICY "Users can view own artist profile" ON artists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artist profile" ON artists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artist profile" ON artists
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON artists TO authenticated;

-- Grant sequence permissions if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'user_profiles_id_seq') THEN
        GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'artists_id_seq') THEN
        GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;
    END IF;
END $$;

-- 6. Ensure proper table structure
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- 7. Ensure artists table has proper structure and constraint
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    stage_name VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'artists_user_id_unique'
    ) THEN
        ALTER TABLE artists ADD CONSTRAINT artists_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- 8. Create missing artist profiles for existing users (if any)
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

COMMIT;