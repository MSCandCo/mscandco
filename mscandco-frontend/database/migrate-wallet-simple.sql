-- ============================================================================
-- WALLET SYSTEM MIGRATION: wallet_balance → earnings_log (SIMPLE VERSION)
-- ============================================================================
-- This script migrates wallet_balance to earnings_log
-- Works around trigger issues by just inserting data normally
-- ============================================================================

-- Step 1: Migrate existing wallet balances to earnings_log
-- The trigger will fire but that's okay - it will fail gracefully if shared_earnings doesn't exist
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

-- Step 2: Verify migration
SELECT 
  up.email,
  up.artist_name,
  up.wallet_balance as old_balance,
  el.amount as migrated_amount,
  el.created_at as migration_date
FROM user_profiles up
JOIN earnings_log el ON el.artist_id = up.id
WHERE el.earning_type = 'migration_balance'
ORDER BY el.created_at DESC;

-- Step 3: Create view for quick balance lookups
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

-- Grant access to the view
GRANT SELECT ON user_wallet_balances TO authenticated;
GRANT SELECT ON user_wallet_balances TO service_role;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_earnings_log_artist_status 
ON earnings_log(artist_id, status);

CREATE INDEX IF NOT EXISTS idx_earnings_log_earning_type 
ON earnings_log(earning_type);

CREATE INDEX IF NOT EXISTS idx_earnings_log_created_at 
ON earnings_log(created_at DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check migrated balances
SELECT 
  COUNT(DISTINCT artist_id) as user_count,
  SUM(amount) as total_migrated,
  AVG(amount) as avg_amount,
  MAX(amount) as max_amount
FROM earnings_log
WHERE earning_type = 'migration_balance';

-- Compare old vs new
SELECT 
  up.email,
  up.artist_name,
  up.wallet_balance as old_balance,
  COALESCE(el.amount, 0) as new_balance,
  CASE 
    WHEN up.wallet_balance = COALESCE(el.amount, 0) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM user_profiles up
LEFT JOIN earnings_log el ON el.artist_id = up.id AND el.earning_type = 'migration_balance'
WHERE up.wallet_balance > 0
  AND up.role IN ('artist', 'label_admin')
ORDER BY up.wallet_balance DESC;

