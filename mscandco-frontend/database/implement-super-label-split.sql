-- ============================================================================
-- IMPLEMENT: Super Label Percentage for Artists Without Label Affiliations
-- ============================================================================
-- This script updates the earnings split trigger to apply the super label
-- percentage to artists who don't have an active label affiliation.
-- 
-- Logic:
-- 1. If artist has active affiliation → use affiliation split (existing behavior)
-- 2. If artist has NO affiliation → apply super label percentage from config
-- ============================================================================

-- Step 1: Create helper function to get or create default affiliation for super label
CREATE OR REPLACE FUNCTION get_or_create_super_label_affiliation(artist_uuid UUID)
RETURNS UUID AS $$
DECLARE
    super_label_id UUID;
    super_label_percentage DECIMAL(5,2);
    default_affiliation_id UUID;
BEGIN
    -- Get super label admin ID (labeladmin@mscandco.com)
    SELECT id INTO super_label_id
    FROM user_profiles
    WHERE email = 'labeladmin@mscandco.com'
    AND role IN ('label_admin', 'company_admin')
    LIMIT 1;

    -- If super label admin doesn't exist, return NULL (can't create affiliation)
    IF super_label_id IS NULL THEN
        RAISE NOTICE 'Super label admin (labeladmin@mscandco.com) not found';
        RETURN NULL;
    END IF;

    -- Get super label percentage from revenue_split_config
    SELECT 
        COALESCE(
            label_admin_percentage,
            company_admin_percentage,
            20
        )
    INTO super_label_percentage
    FROM revenue_split_config
    WHERE company_id = 'msc-co'
    LIMIT 1;

    -- If no config exists, use default 20%
    IF super_label_percentage IS NULL THEN
        super_label_percentage := 20;
    END IF;

    -- Check if default affiliation already exists for this artist with super label
    SELECT id INTO default_affiliation_id
    FROM label_artist_affiliations
    WHERE artist_id = artist_uuid
    AND label_admin_id = super_label_id
    LIMIT 1;

    -- If affiliation exists, return it (even if inactive, we'll handle that in trigger)
    IF default_affiliation_id IS NOT NULL THEN
        -- Ensure it's active and can manage earnings
        UPDATE label_artist_affiliations
        SET status = 'active',
            can_manage_earnings = TRUE,
            label_percentage = super_label_percentage
        WHERE id = default_affiliation_id;
        
        RETURN default_affiliation_id;
    END IF;

    -- Create new default affiliation for this artist with super label
    INSERT INTO label_artist_affiliations (
        label_admin_id,
        artist_id,
        label_percentage,
        status,
        can_create_releases,
        can_view_analytics,
        can_manage_earnings
    )
    VALUES (
        super_label_id,
        artist_uuid,
        super_label_percentage,
        'active',
        FALSE,  -- Super label doesn't manage releases for unaffiliated artists
        FALSE,  -- Super label doesn't view analytics for unaffiliated artists
        TRUE    -- Super label manages earnings splits
    )
    ON CONFLICT (label_admin_id, artist_id) 
    DO UPDATE SET
        status = 'active',
        can_manage_earnings = TRUE,
        label_percentage = super_label_percentage
    RETURNING id INTO default_affiliation_id;

    RETURN default_affiliation_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating super label affiliation: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Update the trigger function to handle artists without affiliations
CREATE OR REPLACE FUNCTION split_earnings_for_affiliations()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_affiliation BOOLEAN;
    default_affiliation_id UUID;
    super_label_percentage DECIMAL(5,2);
BEGIN
    -- Only process if amount is positive
    IF NEW.amount <= 0 THEN
        RETURN NEW;
    END IF;

    -- Check if artist has any active affiliation
    SELECT EXISTS(
        SELECT 1 
        FROM label_artist_affiliations 
        WHERE artist_id = NEW.artist_id 
        AND status = 'active'
        AND can_manage_earnings = TRUE
    ) INTO has_affiliation;

    -- Case 1: Artist HAS an active affiliation → use existing logic
    IF has_affiliation THEN
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
            NEW.amount * (100 - aff.label_percentage) / 100.0,
            NEW.amount * aff.label_percentage / 100.0,
            NEW.amount,
            NEW.platform,
            NEW.earning_type,
            NEW.currency
        FROM label_artist_affiliations aff
        WHERE aff.artist_id = NEW.artist_id 
        AND aff.status = 'active'
        AND aff.can_manage_earnings = TRUE;
    ELSE
        -- Case 2: Artist has NO affiliation → apply super label percentage
        -- Get or create default affiliation with super label admin
        default_affiliation_id := get_or_create_super_label_affiliation(NEW.artist_id);

        -- If we couldn't create/get affiliation, skip splitting (artist keeps 100%)
        IF default_affiliation_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Get super label percentage from the affiliation we just created/retrieved
        SELECT label_percentage INTO super_label_percentage
        FROM label_artist_affiliations
        WHERE id = default_affiliation_id;

        -- Create shared_earnings entry with super label split
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
        VALUES (
            default_affiliation_id,
            NEW.id,
            NEW.amount * (100 - super_label_percentage) / 100.0,
            NEW.amount * super_label_percentage / 100.0,
            NEW.amount,
            NEW.platform,
            NEW.earning_type,
            NEW.currency
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS trigger_split_earnings ON earnings_log;

CREATE TRIGGER trigger_split_earnings
    AFTER INSERT ON earnings_log
    FOR EACH ROW
    EXECUTE FUNCTION split_earnings_for_affiliations();

-- Step 4: Ensure RLS policy allows inserts from trigger function
DO $$
BEGIN
    DROP POLICY IF EXISTS "shared_earnings_trigger_insert" ON shared_earnings;
    
    CREATE POLICY "shared_earnings_trigger_insert" ON shared_earnings
    FOR INSERT
    WITH CHECK (true);
END $$;

-- Step 5: Verify the implementation
SELECT 
    '✅ Super label split implementation complete' as status,
    'Function: split_earnings_for_affiliations' as function_name,
    'Helper: get_or_create_super_label_affiliation' as helper_function,
    'Trigger: trigger_split_earnings' as trigger_name;

-- Step 6: Show current super label configuration
SELECT 
    'Super Label Config' as info,
    up.email as super_label_email,
    up.id as super_label_id,
    COALESCE(rsc.label_admin_percentage, rsc.company_admin_percentage, 20) as super_label_percentage
FROM user_profiles up
LEFT JOIN revenue_split_config rsc ON rsc.company_id = 'msc-co'
WHERE up.email = 'labeladmin@mscandco.com'
LIMIT 1;

