-- =====================================================
-- Check Which Test Users Exist and Create Missing Ones
-- =====================================================

-- STEP 1: Check which test users currently exist
SELECT 
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Verified'
    ELSE '❌ Not Verified'
  END as status
FROM auth.users
WHERE email IN (
  'superadmin@mscandco.com',
  'companyadmin@mscandco.com',
  'codegroup@mscandco.com',
  'artist@test.com',
  'labeladmin@test.com',
  'labeladmin@mscandco.com',
  'test@test.com'
)
ORDER BY email;

-- STEP 2: Check which users DON'T exist
-- These emails should NOT appear in the results:
-- If missing, you need to create them in Supabase Dashboard > Authentication > Users

-- =====================================================
-- RECOMMENDED: Create Missing Users via Supabase Dashboard
-- =====================================================
-- Go to: Authentication > Users > Add User
-- For each missing user, use these details:

-- Artist User:
-- Email: artist@test.com
-- Password: Art1st123
-- ✅ Auto Confirm User: YES
-- User Metadata: {"first_name": "Test", "last_name": "Artist", "role": "artist"}

-- Label Admin User:
-- Email: labeladmin@test.com OR labeladmin@mscandco.com
-- Password: L@b3lAdm1n
-- ✅ Auto Confirm User: YES
-- User Metadata: {"first_name": "Label", "last_name": "Admin", "role": "label_admin"}

-- Test User:
-- Email: test@test.com
-- Password: Test123!
-- ✅ Auto Confirm User: YES
-- User Metadata: {"first_name": "Test", "last_name": "User", "role": "artist"}

-- =====================================================
-- After Creating Users, Insert Them into users Table
-- =====================================================

-- You'll need to get the UUID from auth.users and insert into users table
-- Run this AFTER creating users in Supabase Dashboard:

-- First, check if users exist in users table
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.status
FROM auth.users u
LEFT JOIN users p ON u.id = p.id
WHERE u.email IN (
  'artist@test.com',
  'labeladmin@test.com',
  'labeladmin@mscandco.com',
  'test@test.com'
)
ORDER BY u.email;

-- If they don't exist in users table, insert them:
-- (Replace the UUIDs with actual UUIDs from auth.users)

-- INSERT INTO users (id, email, first_name, last_name, role, status)
-- SELECT 
--   id,
--   email,
--   'Test' as first_name,
--   'Artist' as last_name,
--   'artist' as role,
--   'active' as status
-- FROM auth.users
-- WHERE email = 'artist@test.com'
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO users (id, email, first_name, last_name, role, status)
-- SELECT 
--   id,
--   email,
--   'Label' as first_name,
--   'Admin' as last_name,
--   'label_admin' as role,
--   'active' as status
-- FROM auth.users
-- WHERE email IN ('labeladmin@test.com', 'labeladmin@mscandco.com')
-- ON CONFLICT (id) DO NOTHING;

