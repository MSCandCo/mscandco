-- Check the actual wallet_transactions table structure

-- 1. Check if wallet_transactions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'wallet_transactions';

-- 2. If it exists, show all columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show any existing data
SELECT * FROM wallet_transactions LIMIT 5;
