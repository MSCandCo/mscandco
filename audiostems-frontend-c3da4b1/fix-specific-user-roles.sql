-- Fix specific user roles as requested
-- enquiries@htay.co.uk → company_admin
-- htayenterprise@gmail.com → distribution_partner  
-- info@htay.co.uk → artist (already correct)

-- Update the roles
UPDATE user_profiles SET role = 'company_admin' WHERE email = 'enquiries@htay.co.uk';
UPDATE user_profiles SET role = 'distribution_partner' WHERE email = 'htayenterprise@gmail.com';
-- info@htay.co.uk is already 'artist' so no change needed

-- Verify the changes
SELECT 
  email,
  first_name,
  last_name,
  role,
  subscription_status
FROM user_profiles 
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'company_admin' THEN 2
    WHEN 'label_admin' THEN 3
    WHEN 'distribution_partner' THEN 4
    WHEN 'artist' THEN 5
  END;

-- Show role distribution summary
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(email, ', ') as users
FROM user_profiles 
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'company_admin' THEN 2
    WHEN 'label_admin' THEN 3
    WHEN 'distribution_partner' THEN 4
    WHEN 'artist' THEN 5
  END;
