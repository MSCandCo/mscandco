-- ===========================================
-- Add Distribution :access Permissions
-- ===========================================
-- Date: October 14, 2025
-- Purpose: Add :access suffix distribution permissions for consistency
-- Per user request: "i need all the :access permission in the distribution permission"
-- ===========================================

-- Create new distribution :access permissions
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('distribution:distribution_hub:access', 'Access Distribution Hub page', 'distribution_hub', 'access', 'distribution'),
('distribution:revenue_reporting:access', 'Access Revenue Reporting page', 'revenue_reporting', 'access', 'distribution'),
('distribution:releases:access', 'Access Distribution Releases', 'releases', 'access', 'distribution'),
('distribution:settings:access', 'Access Distribution Settings', 'settings', 'access', 'distribution')
ON CONFLICT (name) DO NOTHING;

-- Assign new permissions to distribution_partner role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'distribution_partner'
AND p.name IN (
  'distribution:distribution_hub:access',
  'distribution:revenue_reporting:access',
  'distribution:releases:access',
  'distribution:settings:access'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- Migration Complete
-- ===========================================
-- Added 4 new distribution :access permissions
-- Assigned to distribution_partner role
-- ===========================================
