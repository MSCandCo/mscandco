-- Check what tables exist and their structure
-- Run this in Supabase SQL Editor to see what we're working with

-- 1. Check if subscriptions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'subscriptions'
);

-- 2. If subscriptions table exists, show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check what tables DO exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Check RLS policies on subscriptions table (if it exists)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'subscriptions';
