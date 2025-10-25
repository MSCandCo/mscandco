-- DELETE ALL TEST DATA (@test.com, @test.co.uk, @example.com emails)
-- This removes all test users and their related data

-- First, check what will be deleted
SELECT 
    'TEST USERS TO DELETE:' as category,
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role,
    created_at
FROM user_profiles
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@test.co.uk'
   OR email LIKE '%@example.com'
   OR email LIKE '%test%@%'
ORDER BY email;

-- Count how many will be deleted
SELECT 
    'Total test users to delete:' as info,
    COUNT(*) as count
FROM user_profiles
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@test.co.uk'
   OR email LIKE '%@example.com'
   OR email LIKE '%test%@%';

-- Delete all test users
-- This will cascade delete related data due to foreign key constraints
DELETE FROM user_profiles
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@test.co.uk'
   OR email LIKE '%@example.com'
   OR email LIKE '%test%@%';

-- Verify deletion - show remaining users
SELECT 
    'REMAINING USERS:' as category,
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role
FROM user_profiles
ORDER BY role, email;

-- Count remaining users by role
SELECT 
    role,
    COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY role;

