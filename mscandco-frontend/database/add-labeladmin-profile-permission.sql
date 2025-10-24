-- Add labeladmin:profile:access permission for Label Admin role
-- This permission governs access to the Label Admin Profile page

-- First, check if the permission already exists
SELECT id, name, description 
FROM permissions 
WHERE name = 'labeladmin:profile:access';

-- If it doesn't exist, create it
INSERT INTO permissions (name, description, resource, action, scope)
VALUES ('labeladmin:profile:access', 'Access to Label Admin profile page', 'profile', 'access', 'labeladmin')
ON CONFLICT (name) DO NOTHING;

-- Get the permission ID
DO $$
DECLARE
  v_permission_id UUID;
  v_role_id UUID;
BEGIN
  -- Get the permission ID
  SELECT id INTO v_permission_id 
  FROM permissions 
  WHERE name = 'labeladmin:profile:access';

  -- Get the label_admin role ID
  SELECT id INTO v_role_id 
  FROM roles 
  WHERE name = 'label_admin';

  -- Assign permission to label_admin role
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES (v_role_id, v_permission_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  RAISE NOTICE 'Permission labeladmin:profile:access assigned to label_admin role';
END $$;

-- Verify the permission was added
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin' 
  AND p.name = 'labeladmin:profile:access';

