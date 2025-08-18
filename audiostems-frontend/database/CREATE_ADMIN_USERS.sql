-- Create Company Admin and Super Admin users
-- These are the main administrative accounts for the platform

-- ==========================================
-- 1. COMPANY ADMIN USER
-- ==========================================

-- Create auth user for company admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'companyadmin@mscandco.com',
  crypt('ca@2025msC', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "company_admin"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  NOW()
);

-- Create company admin profile
INSERT INTO user_profiles (
  id,
  role,
  email,
  first_name,
  last_name,
  company_name,
  subscription_tier,
  registration_stage,
  is_profile_locked,
  wallet_balance,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'company_admin'::platform_user_role,
  'companyadmin@mscandco.com',
  'Company',
  'Admin',
  'MSC & Co',
  'label_admin_pro'::subscription_tier, -- Company admin gets highest tier
  'completed'::registration_stage,
  true,
  0.00,
  true,
  NOW(),
  NOW()
);

-- ==========================================
-- 2. SUPER ADMIN USER
-- ==========================================

-- Create auth user for super admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at
) VALUES (
  'f9e8d7c6-b5a4-9382-7160-fedcba987654'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'superadmin@mscandco.com',
  crypt('Sa@2025!msC', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "super_admin"}'::jsonb,
  true, -- This is the actual super admin flag
  'authenticated',
  'authenticated',
  NOW()
);

-- Create super admin profile
INSERT INTO user_profiles (
  id,
  role,
  email,
  first_name,
  last_name,
  company_name,
  subscription_tier,
  registration_stage,
  is_profile_locked,
  wallet_balance,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'f9e8d7c6-b5a4-9382-7160-fedcba987654'::uuid,
  'super_admin'::platform_user_role,
  'superadmin@mscandco.com',
  'Super',
  'Admin',
  'MSC & Co',
  'label_admin_pro'::subscription_tier, -- Super admin gets highest tier
  'completed'::registration_stage,
  true,
  0.00,
  true,
  NOW(),
  NOW()
);

-- ==========================================
-- 3. CREATE SUBSCRIPTIONS FOR BOTH
-- ==========================================

-- Company admin subscription
INSERT INTO subscriptions (
  user_id,
  tier,
  status,
  started_at,
  monthly_price,
  currency
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'label_admin_pro'::subscription_tier,
  'active',
  NOW(),
  0.00, -- Free for company admin
  'GBP'
);

-- Super admin subscription
INSERT INTO subscriptions (
  user_id,
  tier,
  status,
  started_at,
  monthly_price,
  currency
) VALUES (
  'f9e8d7c6-b5a4-9382-7160-fedcba987654'::uuid,
  'label_admin_pro'::subscription_tier,
  'active',
  NOW(),
  0.00, -- Free for super admin
  'GBP'
);

-- ==========================================
-- 4. VERIFICATION
-- ==========================================

-- Verify all admin users were created
SELECT 
  up.id,
  up.email,
  up.role,
  up.first_name,
  up.last_name,
  up.company_name,
  up.subscription_tier,
  up.registration_stage,
  up.email_verified,
  s.status as subscription_status,
  au.email_confirmed_at,
  au.is_super_admin
FROM user_profiles up
LEFT JOIN subscriptions s ON up.id = s.user_id
JOIN auth.users au ON up.id = au.id
WHERE up.role IN ('label_admin', 'company_admin', 'super_admin')
ORDER BY 
  CASE up.role 
    WHEN 'super_admin' THEN 1
    WHEN 'company_admin' THEN 2
    WHEN 'label_admin' THEN 3
  END;

SELECT 'All admin users created successfully!' as status;
