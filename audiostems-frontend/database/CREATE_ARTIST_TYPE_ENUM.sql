-- Create artist_type enum to match the frontend constants
-- This fixes the "invalid input value for enum artist_type" error

-- Drop the enum if it exists (to recreate with correct values)
DROP TYPE IF EXISTS artist_type_enum CASCADE;

-- Create the artist_type enum with all the values from our constants
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

-- Update the user_profiles table to use the enum (if the column exists)
DO $$ 
BEGIN
    -- Check if the column exists before trying to alter it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' 
               AND column_name = 'artist_type') THEN
        
        -- First, update any empty strings to a default value
        UPDATE public.user_profiles 
        SET artist_type = 'Solo Artist' 
        WHERE artist_type = '' OR artist_type IS NULL;
        
        -- Alter the column to use the enum type
        ALTER TABLE public.user_profiles 
        ALTER COLUMN artist_type TYPE artist_type_enum 
        USING artist_type::artist_type_enum;
        
        -- Set a default value
        ALTER TABLE public.user_profiles 
        ALTER COLUMN artist_type SET DEFAULT 'Solo Artist';
        
    ELSE
        -- If column doesn't exist, add it with the enum type
        ALTER TABLE public.user_profiles 
        ADD COLUMN artist_type artist_type_enum DEFAULT 'Solo Artist';
    END IF;
END $$;

-- Verify the enum was created
SELECT 'Artist type enum created successfully' as status;
SELECT enumlabel as artist_types FROM pg_enum WHERE enumtypid = 'artist_type_enum'::regtype ORDER BY enumsortorder;
