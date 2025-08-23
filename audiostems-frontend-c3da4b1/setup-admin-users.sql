-- Setup Admin Users for MSC & Co Platform
-- Run this in your Supabase SQL Editor

-- First, create the admin users in auth.users (this simulates registration)
-- Note: You'll need to do this part manually through Supabase Auth or your registration flow

-- For existing users, just update their profiles:
-- Replace these email addresses with your actual admin emails

-- Set up Super Admin
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  user_role,
  subscription_type,
  subscription_status,
  brand_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID from auth.users
  'superadmin@mscandco.com',               -- Replace with your super admin email
  'Super',
  'Admin',
  'super_admin',
  'enterprise',
  'active',
  'msc_co',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_role = 'super_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  updated_at = NOW();

-- Set up Company Admin
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  user_role,
  subscription_type,
  subscription_status,
  brand_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Replace with actual UUID from auth.users
  'companyadmin@mscandco.com',             -- Replace with your company admin email
  'Company',
  'Admin',
  'company_admin',
  'enterprise',
  'active',
  'msc_co',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_role = 'company_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  updated_at = NOW();

-- Verify the setup
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_role,
  subscription_type,
  subscription_status,
  brand_id
FROM user_profiles 
WHERE user_role IN ('super_admin', 'company_admin')
ORDER BY user_role;
