-- ===========================================
-- ADD LOGOS TO ALL EMAIL TEMPLATES
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Add MSC & Co logo to all email templates that don't have it yet
-- Note: This uses SQL string replacement to add logo to template HTML
-- ===========================================

-- Update all templates: Add logo image before h1 tag in gradient headers
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<div style="[^"]*background[^"]*gradient[^"]*padding[^"]*text-align: center[^"]*border-radius[^"]*">)\s*(<h1)',
    E'\\1\n    <img src="{{logo_url}}" alt="MSC & Co" style="max-width: 180px; height: auto; margin-bottom: 20px;" />\n    \\2',
    'g'
  )
WHERE 
  body_html_template LIKE '%gradient%' 
  AND body_html_template NOT LIKE '%<img src="{{logo_url}}"%';

-- Also standardize padding from 40px to 30px for consistency
UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    'padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;',
    'padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;'
  )
WHERE body_html_template LIKE '%padding: 40px 20px; text-align: center%';

-- Also standardize padding from 50px to 30px
UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    'padding: 50px 20px; text-align: center; border-radius: 8px 8px 0 0;',
    'padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;'
  )
WHERE body_html_template LIKE '%padding: 50px 20px; text-align: center%';

-- Add font-weight: 600 to h1 tags that don't have it
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<h1 style="[^"]*font-size: 28px)([^"]*">)',
    E'\\1; font-weight: 600\\2',
    'g'
  )
WHERE 
  body_html_template LIKE '%<h1%' 
  AND body_html_template NOT LIKE '%font-weight: 600%';

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- All templates should now have:
-- 1. MSC & Co logo in header
-- 2. Consistent 30px padding
-- 3. Enhanced h1 styling with font-weight
-- ===========================================

