-- Add earnings_data column to user_profiles table for manual earnings system
-- Same concept as analytics_data column

-- Add the earnings_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'earnings_data'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN earnings_data JSONB;
        RAISE NOTICE 'Added earnings_data column to user_profiles table';
    ELSE
        RAISE NOTICE 'earnings_data column already exists in user_profiles table';
    END IF;
END $$;

-- Update RLS policies to include earnings_data column
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;  
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to access all profiles (for admin operations)
DROP POLICY IF EXISTS "Service role can access all profiles" ON user_profiles;
CREATE POLICY "Service role can access all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

COMMIT;
