-- ===========================================
-- Fix registration_enabled value to boolean
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Ensure registration_enabled is stored as boolean true/false, not string
-- ===========================================

-- Update the value to boolean true if it exists as string 'true'
-- Use to_jsonb() to properly convert boolean to JSONB
UPDATE platform_settings
SET value = to_jsonb(true)
WHERE key = 'registration_enabled' 
  AND (value::text = '"true"' OR value::text = '''true''' OR value::text != 'true');

-- If no setting exists, create it with boolean true
INSERT INTO platform_settings (key, value, description)
VALUES (
  'registration_enabled',
  to_jsonb(true),
  'Controls whether new user registration is enabled'
)
ON CONFLICT (key) DO NOTHING;

-- Verify the value is correct
SELECT key, value, value::text as value_text, pg_typeof(value) as value_type 
FROM platform_settings 
WHERE key = 'registration_enabled';

