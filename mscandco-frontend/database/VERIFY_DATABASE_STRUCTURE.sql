-- MSC & Co Database Structure Verification
-- Run this in Supabase SQL Editor to verify current state

-- 1. LIST ALL TABLES IN PUBLIC SCHEMA
SELECT 
  table_name,
  table_type,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'earnings_entries',
    'earnings_log',
    'artist_wallet', 
    'payout_history',
    'user_profiles',
    'analytics_data',
    'platform_earnings',
    'revenue_shares',
    'chartmetric_data',
    'subscriptions',
    'releases'
  )
ORDER BY table_name;

-- 2. CHECK USER_PROFILES COLUMNS
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
  AND column_name IN ('analytics_data', 'chartmetric_data', 'earnings_data')
ORDER BY column_name;

-- 3. CHECK EARNINGS_LOG STRUCTURE (our active table)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'earnings_log'
ORDER BY ordinal_position;

-- 4. COUNT DATA IN KEY TABLES
SELECT 'earnings_log' as table_name, COUNT(*) as row_count FROM earnings_log
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as row_count FROM subscriptions;

-- 5. CHECK RLS POLICIES ON EARNINGS_LOG
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'earnings_log';

-- 6. VERIFY EARNINGS_LOG DATA INTEGRITY
SELECT 
  earning_type,
  COUNT(*) as count,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as positive_total,
  SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as negative_total
FROM earnings_log 
GROUP BY earning_type
ORDER BY count DESC;

-- 7. CHECK FOR UNUSED/OLD TABLES THAT COULD BE DROPPED
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' 
   AND table_name = t.table_name) as foreign_key_constraints
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN (
    'earnings_log',
    'user_profiles', 
    'subscriptions',
    'releases',
    'assets',
    'artist_requests',
    'profile_change_requests'
  )
ORDER BY table_name;

-- 8. VERIFY ANALYTICS_DATA COLUMN EXISTS AND HAS DATA
SELECT 
  COUNT(*) as total_users,
  COUNT(analytics_data) as users_with_analytics,
  COUNT(CASE WHEN analytics_data != '{}'::jsonb THEN 1 END) as users_with_analytics_data
FROM user_profiles;

-- Completion message
SELECT 'Database structure verification completed' as message;
