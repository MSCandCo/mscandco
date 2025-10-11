-- =====================================================
-- Verify Test User Emails in Supabase
-- Run this in Supabase SQL Editor to confirm test emails
-- =====================================================

-- This script updates the auth.users table to mark emails as confirmed
-- IMPORTANT: This should ONLY be run in development/testing environments

-- Verify all test user emails
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email IN (
  'superadmin@mscandco.com',
  'companyadmin@mscandco.com',
  'codegroup@mscandco.com',
  'artist@test.com',
  'labeladmin@test.com',
  'test@test.com'
)
AND email_confirmed_at IS NULL;

-- Check the results
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'superadmin@mscandco.com',
  'companyadmin@mscandco.com',
  'codegroup@mscandco.com',
  'artist@test.com',
  'labeladmin@test.com',
  'test@test.com'
)
ORDER BY email;

