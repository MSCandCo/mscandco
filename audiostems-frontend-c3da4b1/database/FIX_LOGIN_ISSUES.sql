-- 🚨 FIX LOGIN ISSUES - Run this in Supabase SQL Editor
-- This fixes the artists table constraint issue that's preventing login

-- Fix artists table constraint issue
ALTER TABLE artists ADD CONSTRAINT IF NOT EXISTS artists_user_id_unique UNIQUE (user_id);

-- Ensure artists table has proper structure
ALTER TABLE artists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stage_name VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Grant permissions
GRANT ALL ON artists TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;

-- Create any missing artist profiles for existing users
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

-- ✅ This should fix the login infinite loading issue!
