-- ===========================================
-- Standardize label_admin to labeladmin
-- ===========================================
-- Date: October 14, 2025
-- Purpose: Remove underscore from label_admin for consistency
-- Changes: label_admin → labeladmin everywhere
-- Display: "Label Admin" in UI
-- ===========================================

-- Step 1: Update the role name (only if label_admin exists and labeladmin doesn't)
-- Check if label_admin exists, and if labeladmin doesn't exist yet
DO $$
BEGIN
  -- Only update if label_admin exists AND labeladmin doesn't exist
  IF EXISTS (SELECT 1 FROM roles WHERE name = 'label_admin') 
     AND NOT EXISTS (SELECT 1 FROM roles WHERE name = 'labeladmin') THEN
    UPDATE roles
    SET name = 'labeladmin'
    WHERE name = 'label_admin';
    RAISE NOTICE 'Updated label_admin to labeladmin';
  ELSIF EXISTS (SELECT 1 FROM roles WHERE name = 'labeladmin') THEN
    RAISE NOTICE 'labeladmin role already exists, skipping update';
  ELSE
    RAISE NOTICE 'label_admin role not found, nothing to update';
  END IF;
END $$;

-- Step 2: Update all permission names (change label_admin: to labeladmin:)
UPDATE permissions
SET name = REPLACE(name, 'label_admin:', 'labeladmin:'),
    scope = 'labeladmin'
WHERE scope = 'label_admin';

-- Step 3: Verify the changes
SELECT name, description FROM roles WHERE name LIKE '%label%';
SELECT name, description, scope FROM permissions WHERE scope = 'labeladmin';

-- ===========================================
-- Migration Complete
-- ===========================================
-- Changed role: label_admin → labeladmin
-- Changed permissions: label_admin:* → labeladmin:*
-- ===========================================
