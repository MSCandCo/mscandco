-- Add all missing columns that the API is trying to use
-- Run this in Supabase SQL Editor

-- Add missing columns one by one
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Let's also check what columns we actually have vs what we need
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
