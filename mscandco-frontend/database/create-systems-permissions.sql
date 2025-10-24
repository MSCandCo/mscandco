-- =====================================================
-- SYSTEMS MANAGEMENT PERMISSIONS
-- =====================================================
-- Creates comprehensive permissions for the Systems Management section
-- All systems pages under /admin/systems/*
-- =====================================================

-- Step 1: Create Systems Management Permissions
INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Main Systems Access
('systems:access', 'Access to Systems Management section', 'systems', 'access', 'admin'),

-- Error Tracking & Monitoring
('systems:errors:view', 'View error tracking and monitoring dashboard', 'systems', 'view', 'errors'),
('systems:errors:manage', 'Manage error tracking settings and integrations', 'systems', 'manage', 'errors'),

-- Rate Limiting
('systems:ratelimit:view', 'View rate limiting configuration', 'systems', 'view', 'ratelimit'),
('systems:ratelimit:manage', 'Manage rate limiting rules and settings', 'systems', 'manage', 'ratelimit'),

-- Logging & Observability
('systems:logs:view', 'View system logs and observability data', 'systems', 'view', 'logs'),
('systems:logs:manage', 'Manage logging configuration and retention', 'systems', 'manage', 'logs'),

-- Backup & Recovery
('systems:backups:view', 'View backup status and history', 'systems', 'view', 'backups'),
('systems:backups:manage', 'Manage backups and perform recovery operations', 'systems', 'manage', 'backups'),
('systems:backups:restore', 'Restore from backups (critical operation)', 'systems', 'restore', 'backups'),

-- Uptime Monitoring
('systems:uptime:view', 'View uptime monitoring and status', 'systems', 'view', 'uptime'),
('systems:uptime:manage', 'Manage uptime monitoring configuration', 'systems', 'manage', 'uptime'),

-- Security Management
('systems:security:view', 'View security settings and audit logs', 'systems', 'view', 'security'),
('systems:security:manage', 'Manage security policies and configurations', 'systems', 'manage', 'security'),

-- Performance Monitoring
('systems:performance:view', 'View performance metrics and monitoring', 'systems', 'view', 'performance'),
('systems:performance:manage', 'Manage performance monitoring settings', 'systems', 'manage', 'performance'),

-- Analytics
('systems:analytics:view', 'View user analytics and business metrics', 'systems', 'view', 'analytics'),
('systems:analytics:manage', 'Manage analytics configuration', 'systems', 'manage', 'analytics'),

-- Email System
('systems:email:view', 'View email system status and logs', 'systems', 'view', 'email'),
('systems:email:manage', 'Manage email templates and configuration', 'systems', 'manage', 'email'),
('systems:email:send', 'Send test emails and broadcasts', 'systems', 'send', 'email'),

-- Documentation
('systems:docs:view', 'View system documentation', 'systems', 'view', 'docs'),
('systems:docs:manage', 'Manage and edit system documentation', 'systems', 'manage', 'docs')

ON CONFLICT (name) DO NOTHING;

-- Step 2: Assign all Systems permissions to super_admin role
DO $$
DECLARE
  v_super_admin_role_id UUID;
  v_permission_record RECORD;
BEGIN
  -- Get super_admin role ID
  SELECT id INTO v_super_admin_role_id
  FROM roles
  WHERE name = 'super_admin';

  -- Assign all systems permissions to super_admin
  FOR v_permission_record IN 
    SELECT id FROM permissions WHERE name LIKE 'systems:%'
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (v_super_admin_role_id, v_permission_record.id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'All systems permissions assigned to super_admin role';
END $$;

-- Step 3: Create default Systems Admin role (optional - for dedicated systems admins)
INSERT INTO roles (name, description, is_system_role)
VALUES (
  'systems_admin',
  'Systems Administrator - Full access to all systems management features',
  false
)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Assign view permissions to company_admin role (if exists)
DO $$
DECLARE
  v_company_admin_role_id UUID;
  v_permission_record RECORD;
BEGIN
  -- Get company_admin role ID
  SELECT id INTO v_company_admin_role_id
  FROM roles
  WHERE name = 'company_admin';

  IF v_company_admin_role_id IS NOT NULL THEN
    -- Assign view-only systems permissions to company_admin
    FOR v_permission_record IN 
      SELECT id FROM permissions 
      WHERE name LIKE 'systems:%' 
      AND (name LIKE '%:view' OR name = 'systems:access')
    LOOP
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (v_company_admin_role_id, v_permission_record.id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'View-only systems permissions assigned to company_admin role';
  END IF;
END $$;

-- Step 5: Verify permissions were created
SELECT 
  p.name,
  p.description,
  p.resource,
  p.action,
  p.scope,
  COUNT(rp.role_id) as assigned_to_roles
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
WHERE p.name LIKE 'systems:%'
GROUP BY p.id, p.name, p.description, p.resource, p.action, p.scope
ORDER BY p.name;

-- Step 6: Show which roles have systems access
SELECT 
  r.name as role_name,
  COUNT(p.id) as systems_permissions_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as permissions
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.name LIKE 'systems:%'
GROUP BY r.name
ORDER BY systems_permissions_count DESC;

