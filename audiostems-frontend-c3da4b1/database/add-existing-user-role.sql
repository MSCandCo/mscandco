-- Add role for existing user info@htay.co.uk
-- Get the user ID first, then insert the role

INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT 
  auth.users.id,
  'artist',
  NOW(),
  NOW()
FROM auth.users 
WHERE auth.users.email = 'info@htay.co.uk'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the insertion
SELECT ur.*, au.email 
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'info@htay.co.uk';
