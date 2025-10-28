-- Check recent wallet activity for debugging

-- 1. Check current wallet balance from earnings_log
SELECT 
  artist_id,
  SUM(amount) as total_balance,
  COUNT(*) as transaction_count
FROM earnings_log
WHERE artist_id = (SELECT id FROM auth.users WHERE email = 'info@htay.co.uk')
GROUP BY artist_id;

-- 2. Check all recent transactions
SELECT 
  id,
  artist_id,
  amount,
  currency,
  earning_type,
  platform,
  status,
  payment_date,
  notes,
  created_at
FROM earnings_log
WHERE artist_id = (SELECT id FROM auth.users WHERE email = 'info@htay.co.uk')
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check for any negative transactions (withdrawals/payments)
SELECT 
  id,
  amount,
  earning_type,
  platform,
  status,
  notes,
  created_at
FROM earnings_log
WHERE artist_id = (SELECT id FROM auth.users WHERE email = 'info@htay.co.uk')
  AND amount < 0
ORDER BY created_at DESC;

-- 4. Check user_profiles wallet_balance (old system - should be deprecated)
SELECT 
  id,
  email,
  wallet_balance,
  wallet_currency
FROM user_profiles
WHERE email = 'info@htay.co.uk';

