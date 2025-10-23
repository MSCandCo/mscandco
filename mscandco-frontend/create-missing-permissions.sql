-- Create missing AdminHeader permissions
-- Run this in your Supabase SQL Editor

-- 1. user:impersonate (Ghost Login)
INSERT INTO permissions (name, description, category)
VALUES ('user:impersonate', 'Ability to impersonate other users (Ghost Login)', 'user')
ON CONFLICT (name) DO NOTHING;

-- 2. distribution:read:any (Distribution Hub)
INSERT INTO permissions (name, description, category)
VALUES ('distribution:read:any', 'View distribution hub and manage distributions', 'distribution')
ON CONFLICT (name) DO NOTHING;

-- 3. revenue:read (Revenue Reporting)
INSERT INTO permissions (name, description, category)
VALUES ('revenue:read', 'View revenue reports and analytics', 'revenue')
ON CONFLICT (name) DO NOTHING;

-- 4. messages:read (Messages in user dropdown)
INSERT INTO permissions (name, description, category)
VALUES ('messages:read', 'View and read messages', 'messages')
ON CONFLICT (name) DO NOTHING;

-- 5. notifications:read (Notification Bell)
INSERT INTO permissions (name, description, category)
VALUES ('notifications:read', 'View notifications', 'notifications')
ON CONFLICT (name) DO NOTHING;

-- Verify the permissions were created
SELECT name, description, category, created_at 
FROM permissions 
WHERE name IN (
  'user:impersonate',
  'distribution:read:any',
  'revenue:read',
  'messages:read',
  'notifications:read'
)
ORDER BY name;

