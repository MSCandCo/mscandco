-- ============================================================================
-- FIX: shared_earnings table permissions for trigger function
-- ============================================================================
-- The trigger function needs to insert into shared_earnings table
-- but RLS policies are blocking it. We need to either:
-- 1. Grant the function SECURITY DEFINER privileges, OR
-- 2. Add a policy that allows the trigger to insert
-- ============================================================================

-- Option 1: Make the function run with SECURITY DEFINER (runs as creator, bypasses RLS)
CREATE OR REPLACE FUNCTION split_earnings_for_affiliations()
RETURNS TRIGGER 
SECURITY DEFINER  -- This makes the function run with the privileges of the creator
SET search_path = public
AS $$
BEGIN
    -- When new earnings are added, automatically split them for affiliated artists
    IF NEW.amount > 0 THEN
        INSERT INTO shared_earnings (
            affiliation_id,
            original_earning_id, 
            artist_amount,
            label_amount,
            total_amount,
            platform,
            earning_type,
            currency
        )
        SELECT 
            aff.id,
            NEW.id,
            NEW.amount * (100 - aff.label_percentage) / 100,
            NEW.amount * aff.label_percentage / 100,
            NEW.amount,
            NEW.platform,
            NEW.earning_type,
            NEW.currency
        FROM label_artist_affiliations aff
        WHERE aff.artist_id = NEW.artist_id  -- FIXED: Changed from NEW.user_id to NEW.artist_id
        AND aff.status = 'active'
        AND aff.can_manage_earnings = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Option 2: Add RLS policy to allow inserts from the trigger function
-- (This is a backup if SECURITY DEFINER doesn't work)
DO $$
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "shared_earnings_trigger_insert" ON shared_earnings;
    
    -- Create policy that allows the trigger function to insert
    CREATE POLICY "shared_earnings_trigger_insert" ON shared_earnings
    FOR INSERT
    WITH CHECK (true);  -- Allow all inserts (the function will validate)
END $$;

-- Verify the function and trigger
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'split_earnings_for_affiliations'
AND n.nspname = 'public';

-- Verify RLS policies on shared_earnings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'shared_earnings';

-- Success message
SELECT 'Trigger function updated with SECURITY DEFINER and RLS policy added' as status;

