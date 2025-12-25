-- =====================================================
-- Add Label Admin Messages Permission
-- =====================================================
-- This script creates the labeladmin:messages:access permission
-- and assigns it to the label_admin role
-- =====================================================

-- Step 1: Create the permission
INSERT INTO permissions (name, description, resource, action, scope)
VALUES ('labeladmin:messages:access', 'Access to Label Admin messages page', 'messages', 'access', 'labeladmin')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Assign permission to label_admin role
DO $$
DECLARE
  v_permission_id UUID;
  v_role_id UUID;
BEGIN
  -- Get the permission ID
  SELECT id INTO v_permission_id
  FROM permissions
  WHERE name = 'labeladmin:messages:access';

  -- Get the label_admin role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = 'label_admin';

  -- Assign permission to label_admin role
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES (v_role_id, v_permission_id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;

  RAISE NOTICE 'Permission labeladmin:messages:access assigned to label_admin role';
END $$;

-- Step 3: Verify the permission was added
SELECT 
  r.name AS role_name,
  p.name AS permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
  AND p.name = 'labeladmin:messages:access';

