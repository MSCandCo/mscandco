-- ============================================================================
-- WALLET SYSTEM MIGRATION: wallet_balance → earnings_log (SAFE VERSION)
-- ============================================================================
-- This script migrates the legacy wallet_balance system to earnings_log
-- WITHOUT triggering any automatic splits or triggers
-- Run this in Supabase SQL Editor BEFORE deploying code changes
-- ============================================================================

-- IMPORTANT: Disable triggers temporarily to avoid splits system conflicts
ALTER TABLE earnings_log DISABLE TRIGGER ALL;

-- Step 1: Migrate existing wallet balances to earnings_log
-- Only migrate users with balance > 0
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

-- Re-enable triggers after migration
ALTER TABLE earnings_log ENABLE TRIGGER ALL;

-- Step 2: Verify migration
-- This should show all migrated balances
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

-- Step 3: Create view for quick balance lookups (optional but recommended)
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

-- Check total balance before migration (from wallet_balance)
SELECT 
  COUNT(*) as user_count,
  SUM(wallet_balance) as total_balance,
  AVG(wallet_balance) as avg_balance,
  MAX(wallet_balance) as max_balance
FROM user_profiles
WHERE wallet_balance > 0
  AND role IN ('artist', 'label_admin');

-- Check total balance after migration (from earnings_log)
SELECT 
  COUNT(DISTINCT artist_id) as user_count,
  SUM(amount) as total_balance,
  AVG(amount) as avg_balance,
  MAX(amount) as max_balance
FROM earnings_log
WHERE earning_type = 'migration_balance';

-- Detailed comparison per user
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

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- Uncomment and run ONLY if you need to rollback the migration

-- DELETE FROM earnings_log WHERE earning_type = 'migration_balance';
-- DROP VIEW IF EXISTS user_wallet_balances;

-- ============================================================================
-- POST-MIGRATION CLEANUP (run AFTER code deployment and testing)
-- ============================================================================
-- DO NOT RUN THIS UNTIL:
-- 1. Code changes are deployed
-- 2. All wallet operations are tested
-- 3. You've verified earnings_log is working correctly
-- 4. You've backed up the database

-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS wallet_balance;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS wallet_currency;

-- ============================================================================
-- NOTES
-- ============================================================================
-- Migration creates entries with:
-- - earning_type: 'migration_balance'
-- - status: 'paid' (immediately available)
-- - platform: 'System Migration'
-- - payment_date: Current date
-- - notes: Includes migration timestamp
--
-- Triggers are temporarily disabled during migration to avoid conflicts
-- with any automatic splits or earnings distribution systems.
--
-- New earning types to use going forward:
-- - 'wallet_topup' - For Revolut/payment top-ups
-- - 'revenue_approval' - For manual revenue approvals
-- - 'subscription_payment' - For subscription deductions (negative amount)
-- - 'general_non_track' - For other manual adjustments
-- ============================================================================

