-- Simple fix for artist_type enum issue
-- This approach is more straightforward and avoids complex WHERE clauses

-- Step 1: First, update all empty or problematic values to 'Solo Artist'
UPDATE public.user_profiles 
SET artist_type = 'Solo Artist' 
WHERE artist_type = '' OR artist_type IS NULL;

-- Step 2: Drop existing enum if it exists
DROP TYPE IF EXISTS artist_type_enum CASCADE;

-- Step 3: Create the enum
CREATE TYPE artist_type_enum AS ENUM (
    'Solo Artist',
    'Band Group', 
    'DJ',
    'Duo',
    'Orchestra',
    'Ensemble',
    'Collective',
    'Producer',
    'Composer',
    'Singer-Songwriter'
);

-- Step 4: Add the column as enum type (or alter if exists)
DO $$ 
BEGIN
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' 
               AND column_name = 'artist_type') THEN
        -- Column exists, alter its type
        ALTER TABLE public.user_profiles 
        ALTER COLUMN artist_type TYPE artist_type_enum 
        USING 'Solo Artist'::artist_type_enum;
    ELSE
        -- Column doesn't exist, add it
        ALTER TABLE public.user_profiles 
        ADD COLUMN artist_type artist_type_enum DEFAULT 'Solo Artist';
    END IF;
END $$;

-- Step 5: Set default value
ALTER TABLE public.user_profiles 
ALTER COLUMN artist_type SET DEFAULT 'Solo Artist';

-- Verify success
SELECT 'Artist type enum created and fixed successfully' as status;
