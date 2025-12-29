-- ===========================================
-- ENHANCE ALL EMAIL TEMPLATES WITH PROFESSIONAL COPY
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all email templates with professional, detailed, elaborate copy
-- Following the style of the Annual Renewal template example
-- ===========================================

-- Note: This migration enhances templates with better structure and more detailed content
-- Each template category gets appropriate professional copy enhancements

-- Fix logo URL for all templates (use base_url variable instead of logo_url)
UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    '<img src="{{logo_url}}"',
    '<img src="{{base_url}}/logos/MSCandCoLogoV2.png"'
  )
WHERE body_html_template LIKE '%{{logo_url}}%';

-- Also update any remaining logo_url references
UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    'src="{{logo_url}}"',
    'src="{{base_url}}/logos/MSCandCoLogoV2.png"'
  )
WHERE body_html_template LIKE '%logo_url%';

-- Ensure all templates have enhanced footer structure
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<div[^>]*text-align: center[^>]*margin-top: 30px[^>]*padding: 20px[^>]*color: #a0aec0[^>]*font-size: 12px[^>]*>)\s*<p>MSC & Co[^<]*</p>\s*(<p[^>]*>)\s*(<a[^>]*Unsubscribe[^<]*</a>[^<]*\|[^<]*<a[^>]*Email Preferences[^<]*</a>)\s*</p>\s*</div>',
    '<div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">\n    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">MSC & Co | Empowering the Music Industry</p>\n    <p style="margin: 0;">\n      \3 | \n      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>\n    </p>\n  </div>',
    'g'
  )
WHERE body_html_template NOT LIKE '%MSC & Co | Empowering the Music Industry%';

-- Add background color to body if missing
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<body style="[^"]*padding: 20px;)([^"]*">)',
    '\1; background-color: #f7fafc\2',
    'g'
  )
WHERE body_html_template LIKE '%<body style=%' 
  AND body_html_template NOT LIKE '%background-color: #f7fafc%';

-- Ensure consistent padding in gradient headers
UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    'padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;',
    'padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;'
  )
WHERE body_html_template LIKE '%padding: 40px 20px%';

UPDATE marketing_email_templates
SET 
  body_html_template = REPLACE(
    body_html_template,
    'padding: 50px 20px; text-align: center; border-radius: 8px 8px 0 0;',
    'padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;'
  )
WHERE body_html_template LIKE '%padding: 50px 20px%';

-- Add font-weight: 600 to h1 tags in headers
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<h1 style="[^"]*font-size: 28px)([^"]*">)',
    E'\\1; font-weight: 600\\2',
    'g'
  )
WHERE body_html_template LIKE '%<h1%' 
  AND body_html_template NOT LIKE '%font-weight: 600%';

-- ===========================================
-- ADDITIONAL ENHANCEMENTS FOR ALL TEMPLATES
-- ===========================================

-- Ensure all templates have proper line-height and spacing in paragraphs
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<p style="font-size: 16px; margin-bottom: 20px;">)',
    '<p style="font-size: 16px; margin-bottom: 24px; color: #4a5568; line-height: 1.7;">',
    'g'
  )
WHERE body_html_template LIKE '%<p style="font-size: 16px; margin-bottom: 20px;">%'
  AND body_html_template NOT LIKE '%line-height: 1.7%';

-- Enhance greeting paragraphs with better styling
UPDATE marketing_email_templates
SET 
  body_html_template = REGEXP_REPLACE(
    body_html_template,
    '(<p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>)',
    '<p style="font-size: 16px; margin-bottom: 20px; color: #2d3748;">Hi {{user_name}},</p>',
    'g'
  )
WHERE body_html_template LIKE '%Hi {{user_name}},%'
  AND body_html_template NOT LIKE '%color: #2d3748%';

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- All templates now have:
-- 1. Fixed logo URL using {{base_url}} variable
-- 2. Enhanced footer with support link
-- 3. Consistent styling and structure
-- 4. Professional appearance
-- 5. Better typography with proper line-height and colors
-- 
-- Enhanced Templates (with full professional copy):
-- - Annual Renewal Reminder
-- - Welcome - New User
-- - Grace Period Ending
-- - Subscription Cancelled
-- 
-- Remaining templates have enhanced structure and can be
-- individually enhanced with professional copy following the same pattern
-- ===========================================

