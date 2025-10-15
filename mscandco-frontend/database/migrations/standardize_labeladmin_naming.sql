-- ===========================================
-- Standardize label_admin to labeladmin
-- ===========================================
-- Date: October 14, 2025
-- Purpose: Remove underscore from label_admin for consistency
-- Changes: label_admin → labeladmin everywhere
-- Display: "Label Admin" in UI
-- ===========================================

-- Step 1: Update the role name
UPDATE roles
SET name = 'labeladmin',
    display_name = 'Label Admin'
WHERE name = 'label_admin';

-- Step 2: Update all permission names (change label_admin: to labeladmin:)
UPDATE permissions
SET name = REPLACE(name, 'label_admin:', 'labeladmin:'),
    scope = 'labeladmin'
WHERE scope = 'label_admin';

-- Step 3: Verify the changes
SELECT name, display_name FROM roles WHERE name LIKE '%label%';
SELECT name, description, scope FROM permissions WHERE scope = 'labeladmin';

-- ===========================================
-- Migration Complete
-- ===========================================
-- Changed role: label_admin → labeladmin
-- Changed permissions: label_admin:* → labeladmin:*
-- Display name: "Label Admin"
-- ===========================================
