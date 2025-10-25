-- DEBUG INVITATION ISSUE
-- Check if affiliation_requests table structure is correct

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'affiliation_requests'
ORDER BY ordinal_position;

-- 2. Check RLS policies on affiliation_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'affiliation_requests';

-- 3. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'affiliation_requests';

-- 4. Try to manually insert a test record (as postgres/service role)
-- This will tell us if there's a constraint issue
INSERT INTO affiliation_requests (
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_name,
    label_percentage,
    message,
    status,
    created_at
) VALUES (
    (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
    (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
    'Henry',
    'Taylor',
    'Moses Bliss',
    70,
    'Test invitation from SQL',
    'pending',
    NOW()
) RETURNING *;

