-- ============================================================================
-- FIX: earnings_log trigger function - Replace user_id with artist_id
-- ============================================================================
-- The split_earnings_for_affiliations() function references NEW.user_id
-- but earnings_log table uses artist_id, not user_id
-- ============================================================================

-- Drop and recreate the function with the correct field name
CREATE OR REPLACE FUNCTION split_earnings_for_affiliations()
RETURNS TRIGGER AS $$
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

-- Verify the trigger exists and is attached
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'earnings_log'
AND trigger_name LIKE '%split%';

-- If the trigger doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_split_earnings' 
        AND event_object_table = 'earnings_log'
    ) THEN
        CREATE TRIGGER trigger_split_earnings
            AFTER INSERT ON earnings_log
            FOR EACH ROW
            EXECUTE FUNCTION split_earnings_for_affiliations();
    END IF;
END $$;

-- Success message
SELECT 'Trigger function fixed! Changed NEW.user_id to NEW.artist_id' as status;

