-- ============================================================================
-- WALLET SYSTEM MIGRATION: Final version - Drop function and trigger
-- ============================================================================
-- This drops both the trigger AND the function that's causing issues
-- ============================================================================

-- Step 1: Drop the trigger (if it exists)
DROP TRIGGER IF EXISTS split_earnings_trigger ON earnings_log;
DROP TRIGGER IF EXISTS earnings_split_trigger ON earnings_log;
DROP TRIGGER IF EXISTS auto_split_earnings ON earnings_log;

-- Step 2: Drop the function that's causing the error
DROP FUNCTION IF EXISTS split_earnings_for_affiliations() CASCADE;

-- Step 3: Now migrate the wallet balances
INSERT INTO earnings_log (
  artist_id,
  amount,
  currency,
  earning_type,
  platform,
  status,
  payment_date,
  notes,
  created_at,
  created_by
)
SELECT 
  id as artist_id,
  wallet_balance as amount,
  COALESCE(wallet_currency, 'GBP') as currency,
  'migration_balance' as earning_type,
  'System Migration' as platform,
  'paid' as status,
  CURRENT_DATE as payment_date,
  'Migrated from legacy wallet_balance field on ' || CURRENT_TIMESTAMP::text as notes,
  CURRENT_TIMESTAMP as created_at,
  id as created_by
FROM user_profiles
WHERE wallet_balance > 0
  AND role IN ('artist', 'label_admin')
  -- Only migrate if not already migrated
  AND NOT EXISTS (
    SELECT 1 FROM earnings_log 
    WHERE artist_id = user_profiles.id 
    AND earning_type = 'migration_balance'
  );

-- Step 4: Verify migration
SELECT 
  'Migration Complete!' as status,
  COUNT(*) as users_migrated,
  SUM(amount) as total_amount,
  MAX(amount) as largest_balance
FROM earnings_log
WHERE earning_type = 'migration_balance';

-- Step 5: Show migrated users
SELECT 
  up.email,
  up.artist_name,
  up.wallet_balance as old_balance,
  el.amount as migrated_amount,
  el.created_at as migration_date
FROM user_profiles up
JOIN earnings_log el ON el.artist_id = up.id
WHERE el.earning_type = 'migration_balance'
ORDER BY el.amount DESC;

-- Step 6: Create view for quick balance lookups
CREATE OR REPLACE VIEW user_wallet_balances AS
SELECT 
  artist_id as user_id,
  SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END) as balance,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as available_balance,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_balance,
  SUM(CASE WHEN status = 'held' THEN amount ELSE 0 END) as held_balance,
  COUNT(*) as transaction_count,
  MAX(created_at) as last_transaction_date
FROM earnings_log
GROUP BY artist_id;

-- Grant access
GRANT SELECT ON user_wallet_balances TO authenticated;
GRANT SELECT ON user_wallet_balances TO service_role;

-- Step 7: Add indexes
CREATE INDEX IF NOT EXISTS idx_earnings_log_artist_status 
ON earnings_log(artist_id, status);

CREATE INDEX IF NOT EXISTS idx_earnings_log_earning_type 
ON earnings_log(earning_type);

CREATE INDEX IF NOT EXISTS idx_earnings_log_created_at 
ON earnings_log(created_at DESC);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 
  '✅ Migration Complete!' as message,
  'The split_earnings_for_affiliations function has been dropped.' as note,
  'You can recreate it later when you set up the shared_earnings table.' as next_steps;

