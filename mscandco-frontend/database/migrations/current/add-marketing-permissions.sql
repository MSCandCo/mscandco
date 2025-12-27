-- ===========================================
-- Marketing Permissions
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Add permissions for marketing email campaigns system
-- ===========================================

-- ===========================================
-- 1. INSERT MARKETING PERMISSIONS
-- ===========================================

INSERT INTO permissions (name, description, resource, action, scope)
VALUES 
  -- Campaign Management
  ('marketing:campaigns:read', 'View marketing email campaigns', 'marketing', 'read', 'campaigns'),
  ('marketing:campaigns:create', 'Create new marketing email campaigns', 'marketing', 'create', 'campaigns'),
  ('marketing:campaigns:update', 'Edit existing marketing email campaigns', 'marketing', 'update', 'campaigns'),
  ('marketing:campaigns:delete', 'Delete marketing email campaigns', 'marketing', 'delete', 'campaigns'),
  ('marketing:campaigns:send', 'Send marketing email campaigns', 'marketing', 'send', 'campaigns'),
  ('marketing:campaigns:manage', 'Full management of marketing email campaigns (includes all campaign permissions)', 'marketing', 'manage', 'campaigns'),
  
  -- Template Management
  ('marketing:templates:read', 'View marketing email templates', 'marketing', 'read', 'templates'),
  ('marketing:templates:create', 'Create new marketing email templates', 'marketing', 'create', 'templates'),
  ('marketing:templates:update', 'Edit existing marketing email templates', 'marketing', 'update', 'templates'),
  ('marketing:templates:delete', 'Delete marketing email templates', 'marketing', 'delete', 'templates'),
  ('marketing:templates:manage', 'Full management of marketing email templates (includes all template permissions)', 'marketing', 'manage', 'templates'),
  
  -- Audience Segments
  ('marketing:segments:read', 'View saved audience segments', 'marketing', 'read', 'segments'),
  ('marketing:segments:create', 'Create new audience segments', 'marketing', 'create', 'segments'),
  ('marketing:segments:update', 'Edit existing audience segments', 'marketing', 'update', 'segments'),
  ('marketing:segments:delete', 'Delete audience segments', 'marketing', 'delete', 'segments'),
  ('marketing:segments:manage', 'Full management of audience segments (includes all segment permissions)', 'marketing', 'manage', 'segments'),
  
  -- Analytics
  ('marketing:analytics:read', 'View marketing campaign analytics and reports', 'marketing', 'read', 'analytics'),
  
  -- A/B Testing
  ('marketing:ab_testing:manage', 'Create and manage A/B tests for campaigns', 'marketing', 'manage', 'ab_testing'),
  
  -- Automation
  ('marketing:automation:manage', 'Create and manage campaign automation workflows', 'marketing', 'manage', 'automation'),
  
  -- Full Marketing Access (wildcard-like permission for marketing admin)
  ('marketing:*:*', 'Full access to all marketing features', 'marketing', '*', '*')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 2. GRANT MARKETING PERMISSIONS TO MARKETING_ADMIN ROLE
-- ===========================================

-- Get marketing_admin role ID
DO $$
DECLARE
  marketing_admin_role_id UUID;
  permission_record RECORD;
BEGIN
  -- Find marketing_admin role
  SELECT id INTO marketing_admin_role_id
  FROM roles
  WHERE name = 'marketing_admin'
  LIMIT 1;

  -- If marketing_admin role exists, grant all marketing permissions
  IF marketing_admin_role_id IS NOT NULL THEN
    -- Grant all marketing permissions to marketing_admin
    FOR permission_record IN 
      SELECT id FROM permissions WHERE name LIKE 'marketing:%'
    LOOP
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (marketing_admin_role_id, permission_record.id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Granted marketing permissions to marketing_admin role';
  ELSE
    RAISE NOTICE 'marketing_admin role not found - permissions will be available when role is created';
  END IF;
END $$;

-- ===========================================
-- 3. GRANT MARKETING PERMISSIONS TO SUPER_ADMIN AND COMPANY_ADMIN
-- ===========================================

-- Grant to super_admin (they should have *:*:* already, but just in case)
DO $$
DECLARE
  super_admin_role_id UUID;
  company_admin_role_id UUID;
  permission_record RECORD;
BEGIN
  -- Find super_admin role
  SELECT id INTO super_admin_role_id
  FROM roles
  WHERE name = 'super_admin'
  LIMIT 1;

  -- Find company_admin role
  SELECT id INTO company_admin_role_id
  FROM roles
  WHERE name = 'company_admin'
  LIMIT 1;

  -- Grant all marketing permissions to super_admin (if role exists and doesn't have *:*:*)
  IF super_admin_role_id IS NOT NULL THEN
    FOR permission_record IN 
      SELECT id FROM permissions WHERE name LIKE 'marketing:%'
    LOOP
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (super_admin_role_id, permission_record.id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant all marketing permissions to company_admin (if role exists)
  IF company_admin_role_id IS NOT NULL THEN
    FOR permission_record IN 
      SELECT id FROM permissions WHERE name LIKE 'marketing:%'
    LOOP
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (company_admin_role_id, permission_record.id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Granted marketing permissions to company_admin role';
  END IF;
END $$;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- This migration adds:
-- ✅ Marketing campaign permissions (read, create, update, delete, send, manage)
-- ✅ Marketing template permissions (read, create, update, delete, manage)
-- ✅ Audience segment permissions (read, create, update, delete, manage)
-- ✅ Marketing analytics permission
-- ✅ A/B testing permission
-- ✅ Automation permission
-- ✅ Full marketing access wildcard permission
-- ✅ Grants all marketing permissions to marketing_admin, super_admin, and company_admin roles

