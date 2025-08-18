-- Create default MSC & Co label admin user
-- This user will be the default label for all independent artists

-- First, create the auth user
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
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'labeladmin@mscandco.com',
  crypt('la@2025msC', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "label_admin"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  NOW()
);

-- Create the user profile
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
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  'label_admin'::platform_user_role,
  'labeladmin@mscandco.com',
  'MSC',
  'Co',
  'MSC & Co',
  'label_admin_pro'::subscription_tier,
  'completed'::registration_stage,
  true,
  0.00,
  true,
  NOW(),
  NOW()
);

-- Create an active subscription for the default label
INSERT INTO subscriptions (
  user_id,
  tier,
  status,
  started_at,
  monthly_price,
  currency
) VALUES (
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  'label_admin_pro'::subscription_tier,
  'active',
  NOW(),
  0.00, -- Free for default company label
  'GBP'
);

-- Verify the creation
SELECT 
  up.id,
  up.email,
  up.role,
  up.company_name,
  up.subscription_tier,
  up.registration_stage,
  up.email_verified,
  s.status as subscription_status,
  au.email_confirmed_at
FROM user_profiles up
LEFT JOIN subscriptions s ON up.id = s.user_id
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'labeladmin@mscandco.com';

SELECT 'Default MSC & Co label admin created successfully!' as status;