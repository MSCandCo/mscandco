-- Fix all user_profiles with NULL role
-- Set role based on email patterns or default to 'artist'

UPDATE user_profiles
SET role = CASE
  WHEN email LIKE '%admin%' THEN 'company_admin'
  WHEN email LIKE '%label%' THEN 'label_admin'
  WHEN email LIKE '%distribution%' THEN 'distribution_partner'
  ELSE 'artist'
END,
updated_at = NOW()
WHERE role IS NULL;

-- Verify the update
SELECT id, email, role, updated_at
FROM user_profiles
WHERE email IN ('codegroup@mscandco.com', 'companyadmin@mscandco.com')
ORDER BY email;
