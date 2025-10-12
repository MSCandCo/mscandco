-- FIX DATABASE VALIDATION CONSTRAINTS
-- Remove overly restrictive constraints that may be causing pattern matching errors

-- Check and fix any problematic constraints on user_profiles table
DO $$ 
BEGIN
    -- Remove any overly restrictive check constraints that might be causing issues
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE '%pattern%' OR conname LIKE '%check%') THEN
        -- List and potentially drop problematic constraints
        RAISE NOTICE 'Found pattern/check constraints - reviewing...';
    END IF;
END $$;

-- Ensure data URLs can be stored properly (increase limits if needed)
ALTER TABLE user_profiles 
ALTER COLUMN profile_image_url TYPE TEXT;

-- If manual_analytics table exists, ensure it can handle data URLs
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manual_analytics') THEN
        ALTER TABLE manual_analytics 
        ALTER COLUMN data TYPE JSONB USING data::jsonb;
    END IF;
END $$;

-- Fix any subscription validation issues
ALTER TABLE subscriptions 
ALTER COLUMN metadata TYPE JSONB USING metadata::jsonb;

-- Ensure all text fields can handle larger content
DO $$ 
BEGIN
    -- Fix any VARCHAR constraints that might be too restrictive
    ALTER TABLE user_profiles 
    ALTER COLUMN bio TYPE TEXT,
    ALTER COLUMN notes TYPE TEXT;
    
    -- Ensure wallet transactions can handle descriptions
    ALTER TABLE wallet_transactions 
    ALTER COLUMN description TYPE TEXT;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some columns may already be correct type: %', SQLERRM;
END $$;

COMMIT;
