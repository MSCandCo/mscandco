-- Fix artists table constraint issue
-- The error "no unique or exclusion constraint matching the ON CONFLICT specification" 
-- means the table doesn't have the right constraints for upsert operations

-- First, let's see what constraints exist and add the missing ones
ALTER TABLE artists ADD CONSTRAINT IF NOT EXISTS artists_user_id_unique UNIQUE (user_id);

-- Also ensure the table has proper structure
ALTER TABLE artists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stage_name VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Grant permissions
GRANT ALL ON artists TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;
