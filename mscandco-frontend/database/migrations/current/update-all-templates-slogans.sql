-- ===========================================
-- UPDATE ALL MARKETING EMAIL TEMPLATES
-- Remove logos from headers and update footer with logo + appropriate slogans
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Remove header logos and update footer structure for all templates
-- Total Templates: 129
-- ===========================================
-- 
-- SLOGAN MAPPING:
-- - Onboarding/Welcome templates: "Empowering Every Artist. Protecting Our Planet."
-- - Milestone templates: "Empowering Every Artist. Protecting Our Planet."
-- - All others: "Empowering Artists. Protecting the Planet."
-- ===========================================

-- Step 1: Remove logo images from headers (various possible patterns)
-- Remove logos with {{base_url}} pattern (most common in headers)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<img[^>]*\{\{base_url\}\}[^>]*logos[^>]*MSCandCoLogo[^>]*>',
  '',
  'gi'
)
WHERE body_html_template ~* '\{\{base_url\}\}.*logos.*MSCandCoLogo';

-- Remove logos with https://staging.mscandco.com pattern (if any in headers)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<img[^>]*https://staging\.mscandco\.com[^>]*logos[^>]*MSCandCoLogo[^>]*>',
  '',
  'gi'
)
WHERE body_html_template ~* 'https://staging\.mscandco\.com.*logos.*MSCandCoLogo';

-- Remove any remaining logo images in header gradient divs (catch-all)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<img[^>]*MSCandCoLogo[^>]*>',
  '',
  'gi'
)
WHERE body_html_template ~* 'MSCandCoLogo'
  AND body_html_template ~* 'gradient';

-- Step 2: Replace old footer with new footer structure (master brand slogan - default)
-- First, replace old footer text patterns for all templates
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<div style="text-align: center[^>]*margin-top: 30px[^>]*>.*?</div>\s*</body>',
  E'<div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">\n    <div style="text-align: center; margin-bottom: 15px;">\n      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />\n    </div>\n    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Artists. Protecting the Planet.</p>\n    <p style="margin: 0;">\n      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | \n      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | \n      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>\n    </p>\n  </div>\n</body>',
  'gs'
)
WHERE category NOT IN ('onboarding', 'milestone') 
  AND name NOT LIKE 'Welcome%' 
  AND name NOT LIKE '%Milestone%';

-- Step 3: Replace old footer for Onboarding/Welcome/Milestone templates (artist-focused slogan)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<div style="text-align: center[^>]*margin-top: 30px[^>]*>.*?</div>\s*</body>',
  E'<div style="text-align: center; margin-top: 30px; padding: 20px; color: #a0aec0; font-size: 12px; background: #ffffff; border-radius: 8px;">\n    <div style="text-align: center; margin-bottom: 15px;">\n      <img src="https://staging.mscandco.com/logos/MSCandCoLogoV2.png" alt="MSC & Co" style="max-width: 60px; height: auto; display: inline-block;" />\n    </div>\n    <p style="margin: 0 0 10px 0; font-weight: 500; color: #718096;">Empowering Every Artist. Protecting Our Planet.</p>\n    <p style="margin: 0;">\n      <a href="{{unsubscribe_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | \n      <a href="{{preferences_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Email Preferences</a> | \n      <a href="{{support_url}}" style="color: #a0aec0; text-decoration: none; margin: 0 10px;">Support</a>\n    </p>\n  </div>\n</body>',
  'gs'
)
WHERE (category = 'onboarding' OR category = 'milestone' OR name LIKE 'Welcome%' OR name LIKE '%Milestone%');

-- Step 4: Replace old slogan text (fallback for any that weren't caught by regex)
UPDATE marketing_email_templates
SET body_html_template = REPLACE(
  body_html_template,
  'MSC & Co | Empowering the Music Industry',
  'Empowering Artists. Protecting the Planet.'
)
WHERE body_html_template LIKE '%MSC & Co | Empowering the Music Industry%'
  AND category NOT IN ('onboarding', 'milestone') 
  AND name NOT LIKE 'Welcome%' 
  AND name NOT LIKE '%Milestone%';

UPDATE marketing_email_templates
SET body_html_template = REPLACE(
  body_html_template,
  'MSC & Co | Empowering the Music Industry',
  'Empowering Every Artist. Protecting Our Planet.'
)
WHERE body_html_template LIKE '%MSC & Co | Empowering the Music Industry%'
  AND (category = 'onboarding' OR category = 'milestone' OR name LIKE 'Welcome%' OR name LIKE '%Milestone%');

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================

