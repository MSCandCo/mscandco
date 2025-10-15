-- ===========================================
-- Remove dropdown: prefix from permissions
-- ===========================================
-- Date: January 15, 2025
-- Purpose: Remove redundant dropdown: prefix from permissions
-- ===========================================

-- Update permission names to remove dropdown: prefix
UPDATE permissions
SET name = REPLACE(name, 'dropdown:', '')
WHERE name LIKE 'dropdown:%';

-- Verify the changes
SELECT name, description, resource
FROM permissions
WHERE resource IN ('platform_messages', 'settings')
ORDER BY resource, name;
