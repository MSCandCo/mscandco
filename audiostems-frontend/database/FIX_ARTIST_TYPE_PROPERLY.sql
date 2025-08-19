-- Properly fix the artist_type enum issue by handling existing data
-- This handles the existing empty string values that are causing the conversion to fail

-- Step 1: First, let's see what values currently exist
SELECT DISTINCT artist_type, COUNT(*) as count 
FROM public.user_profiles 
GROUP BY artist_type;

-- Step 2: Update all empty or NULL values to a valid default
UPDATE public.user_profiles 
SET artist_type = 'Solo Artist' 
WHERE artist_type = '' OR artist_type IS NULL OR artist_type NOT IN (
    'Solo Artist', 'Band Group', 'DJ', 'Duo', 'Orchestra', 
    'Ensemble', 'Collective', 'Producer', 'Composer', 'Singer-Songwriter'
);

-- Step 3: Drop the enum if it exists
DROP TYPE IF EXISTS artist_type_enum CASCADE;

-- Step 4: Create the enum with correct values
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

-- Step 5: Now safely alter the column type
ALTER TABLE public.user_profiles 
ALTER COLUMN artist_type TYPE artist_type_enum 
USING CASE 
    WHEN artist_type IN ('Solo Artist', 'Band Group', 'DJ', 'Duo', 'Orchestra', 'Ensemble', 'Collective', 'Producer', 'Composer', 'Singer-Songwriter') 
    THEN artist_type::artist_type_enum 
    ELSE 'Solo Artist'::artist_type_enum 
END;

-- Step 6: Set default value
ALTER TABLE public.user_profiles 
ALTER COLUMN artist_type SET DEFAULT 'Solo Artist';

-- Step 7: Verify the fix worked
SELECT 'Artist type enum fixed successfully' as status;
SELECT DISTINCT artist_type FROM public.user_profiles;
