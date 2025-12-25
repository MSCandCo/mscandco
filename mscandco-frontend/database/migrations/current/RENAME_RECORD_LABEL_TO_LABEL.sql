-- Rename record_label column to label for consistency
-- This updates the existing column name if it exists

-- Check if record_label column exists and rename it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'record_label'
    ) THEN
        ALTER TABLE user_profiles RENAME COLUMN record_label TO label;
        RAISE NOTICE 'Column record_label renamed to label';
    ELSE
        -- If record_label doesn't exist, ensure label column exists
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label TEXT;
        RAISE NOTICE 'Column label created';
    END IF;
END $$;

-- Verify the column exists with correct name
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('label', 'record_label');
