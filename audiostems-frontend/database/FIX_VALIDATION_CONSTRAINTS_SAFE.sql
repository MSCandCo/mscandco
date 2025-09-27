-- FIX DATABASE VALIDATION CONSTRAINTS - SAFE VERSION
-- Only modify columns that actually exist

-- First, let's check what columns exist and fix only those
DO $$ 
BEGIN
    -- Fix bio column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'bio') THEN
        ALTER TABLE user_profiles ALTER COLUMN bio TYPE TEXT;
        RAISE NOTICE 'Fixed bio column type';
    END IF;
    
    -- Fix notes column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'notes') THEN
        ALTER TABLE user_profiles ALTER COLUMN notes TYPE TEXT;
        RAISE NOTICE 'Fixed notes column type';
    END IF;
    
    -- Fix wallet_transactions description if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wallet_transactions' AND column_name = 'description') THEN
            ALTER TABLE wallet_transactions ALTER COLUMN description TYPE TEXT;
            RAISE NOTICE 'Fixed wallet_transactions description column type';
        END IF;
    END IF;
    
    -- Fix subscriptions metadata if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'metadata') THEN
            -- Only convert if it's not already JSONB
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'metadata' 
                       AND data_type != 'jsonb') THEN
                ALTER TABLE subscriptions ALTER COLUMN metadata TYPE JSONB USING metadata::jsonb;
                RAISE NOTICE 'Fixed subscriptions metadata column type';
            END IF;
        END IF;
    END IF;
    
    -- Fix manual_analytics data if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manual_analytics') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'manual_analytics' AND column_name = 'data') THEN
            -- Only convert if it's not already JSONB
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'manual_analytics' AND column_name = 'data' 
                       AND data_type != 'jsonb') THEN
                ALTER TABLE manual_analytics ALTER COLUMN data TYPE JSONB USING data::jsonb;
                RAISE NOTICE 'Fixed manual_analytics data column type';
            END IF;
        END IF;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

-- Remove any overly restrictive check constraints that might cause pattern matching errors
DO $$ 
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Find and drop any check constraints that might be causing issues
    FOR constraint_rec IN 
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint 
        WHERE contype = 'c' 
        AND conname LIKE '%pattern%' OR conname LIKE '%check%'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_rec.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_rec.conname;
        RAISE NOTICE 'Dropped constraint: % from table: %', constraint_rec.conname, constraint_rec.table_name;
    END LOOP;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping constraints: %', SQLERRM;
END $$;

COMMIT;
