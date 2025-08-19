-- Assign artist role to the current user
-- Replace 'your-user-id' with your actual Supabase user ID

-- First, let's see what users exist
SELECT id, email FROM auth.users;

-- Assign artist role to your user (update the user_id)
INSERT INTO user_role_assignments (user_id, role_name) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'),
  'artist'
) ON CONFLICT (user_id, role_name) DO NOTHING;

-- Verify the assignment
SELECT 
  u.email,
  ura.role_name
FROM auth.users u
JOIN user_role_assignments ura ON u.id = ura.user_id
WHERE u.email = 'info@htay.co.uk';
