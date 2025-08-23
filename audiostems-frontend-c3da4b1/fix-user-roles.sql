-- Fix user roles for the 3 users that were assigned wrong roles
-- Based on their emails, let's assign proper roles

-- First, let's see current user roles
SELECT email, role, first_name, last_name FROM user_profiles ORDER BY email;

-- Update roles based on email patterns and likely intended roles
-- You can modify these based on what roles each user should actually have

-- Option 1: If you know the specific roles for each user
UPDATE user_profiles 
SET role = 'label_admin' 
WHERE email = 'enquiries@htay.co.uk';

UPDATE user_profiles 
SET role = 'distribution_partner' 
WHERE email = 'htayenterprise@gmail.com';

-- Keep info@htay.co.uk as 'artist' (or change as needed)
-- UPDATE user_profiles 
-- SET role = 'artist' 
-- WHERE email = 'info@htay.co.uk';

-- Option 2: If you want to set them all to specific roles, uncomment below:
-- UPDATE user_profiles SET role = 'label_admin' WHERE email = 'enquiries@htay.co.uk';
-- UPDATE user_profiles SET role = 'distribution_partner' WHERE email = 'htayenterprise@gmail.com';
-- UPDATE user_profiles SET role = 'artist' WHERE email = 'info@htay.co.uk';

-- Verify the changes
SELECT 
  email,
  first_name,
  last_name,
  role,
  subscription_status,
  updated_at
FROM user_profiles 
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'company_admin' THEN 2
    WHEN 'label_admin' THEN 3
    WHEN 'distribution_partner' THEN 4
    WHEN 'artist' THEN 5
  END;
