-- ============================================
-- FIX DISTRIBUTION PARTNER PERMISSIONS
-- ============================================
-- Distribution Partner should ONLY have access to:
-- 1. Distribution Hub
-- 2. Revenue Reporting
-- Plus basic profile, settings, messages, dashboard
-- ============================================

-- Step 1: Remove ALL existing distribution_partner permissions
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE name = 'distribution_partner');

-- Step 2: Add ONLY the required permissions for distribution_partner
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'distribution_partner'
AND p.name IN (
  -- Core Distribution Access (MAIN FEATURES)
  'distribution:read:any',           -- View Distribution Hub
  'distribution:manage:any',         -- Manage distributions
  'revenue:read',                    -- View Revenue Reporting
  'revenue:create',                  -- Create revenue reports
  'revenue:update',                  -- Update revenue reports
  
  -- Basic User Access (ESSENTIAL)
  'dashboard:access',                -- Access dashboard
  'profile:access',                  -- Access profile
  'messages:access',                 -- Access messages
  'settings:access',                 -- Access settings
  
  -- Message Tabs
  'messages:system:view',            -- View system messages
  
  -- Settings Tabs
  'settings:preferences:edit',       -- Edit preferences
  'settings:security:edit',          -- Edit security settings
  'settings:notifications:edit',     -- Edit notification settings
  
  -- Own User Permissions
  'user:read:own',                   -- Read own profile
  'user:update:own',                 -- Update own profile
  'notification:read:own',           -- Read own notifications
  'message:read:own'                 -- Read own messages
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 3: Verify the changes
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description,
  p.resource,
  p.action,
  p.scope
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'distribution_partner'
ORDER BY p.resource, p.action;

-- Step 4: Count permissions per role for comparison
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('distribution_partner', 'artist', 'label_admin', 'company_admin', 'super_admin')
GROUP BY r.name
ORDER BY permission_count DESC;

