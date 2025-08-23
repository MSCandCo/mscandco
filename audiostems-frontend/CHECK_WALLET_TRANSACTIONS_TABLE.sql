-- Check if wallet_transactions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'wallet_transactions'
);

-- If it exists, show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'wallet_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
