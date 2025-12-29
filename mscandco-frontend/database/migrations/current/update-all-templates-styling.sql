-- ===========================================
-- UPDATE ALL MARKETING EMAIL TEMPLATES - STYLING
-- Apply improved font sizes and spacing to match enhanced templates
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update font sizes and styling for consistency across all templates
-- Total Templates: 129
-- ===========================================
-- 
-- STYLING CHANGES:
-- - Header h1: font-size 28px → 22px, padding 30px → 24px, add line-height: 1.3
-- - Body paragraphs: font-size 16px → 14px
-- - Signature: font-size 16px → 14px
-- - Buttons: font-size 16px → 14px
-- ===========================================

-- Step 1: Update header h1 font size (28px → 22px) and add line-height: 1.3
-- Replace font-size: 28px with font-size: 22px; line-height: 1.3 in h1 tags
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  'font-size:\s*28px',
  'font-size: 22px; line-height: 1.3',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*28px';

-- Update header div padding from 30px to 24px (in gradient headers)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<div([^>]*background[^>]*gradient[^>]*padding:\s*)30px\s+20px',
  '<div\124px 20px',
  'gi'
)
WHERE body_html_template ~* 'gradient.*padding:\s*30px';

-- Step 2: Update body paragraph font sizes (16px → 14px)
-- Update greeting/opening paragraphs
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<p([^>]*style="[^"]*font-size:\s*)16px([^"]*margin-bottom:\s*20px[^"]*color:\s*#2d3748[^"]*")',
  '<p\114px\2',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*16px.*margin-bottom:\s*20px.*color:\s*#2d3748';

-- Update main body paragraphs
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<p([^>]*style="[^"]*font-size:\s*)16px([^"]*margin-bottom:\s*24px[^"]*color:\s*#4a5568[^"]*")',
  '<p\114px\2',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*16px.*margin-bottom:\s*24px.*color:\s*#4a5568';

-- Update any remaining paragraphs with font-size: 16px (general catch-all)
-- This should be done last to catch any that weren't matched by more specific patterns
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  'font-size:\s*16px',
  'font-size: 14px',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*16px';

-- Step 3: Update signature font size (16px → 14px)
-- Update signature paragraphs (Best regards, The MSC & Co Team)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<p([^>]*style="[^"]*font-size:\s*)16px([^"]*margin-top:\s*40px[^"]*color:\s*#2d3748[^"]*")',
  '<p\114px\2',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*16px.*margin-top:\s*40px.*color:\s*#2d3748';

-- Also update signature with #4a5568 color (as per our enhanced templates)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<p([^>]*style="[^"]*font-size:\s*)16px([^"]*margin-top:\s*40px[^"]*color:\s*#4a5568[^"]*")',
  '<p\114px\2',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*16px.*margin-top:\s*40px.*color:\s*#4a5568';

-- Step 4: Update button font sizes (16px → 14px)
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<a([^>]*style="[^"]*font-size:\s*)16px([^"]*box-shadow[^"]*")',
  '<a\114px\2',
  'gi'
)
WHERE body_html_template ~* 'box-shadow.*font-size:\s*16px';

-- Also update buttons more generally
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  'style="[^"]*background:[^"]*padding:\s*14px[^"]*font-size:\s*16px',
  'style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px',
  'gi'
)
WHERE body_html_template ~* 'padding:\s*14px.*font-size:\s*16px.*box-shadow';

-- Step 5: Update signature color to match enhanced templates (#2d3748 → #4a5568 for paragraph, keep #2d3748 for strong)
-- This is more specific, so we'll handle it carefully
UPDATE marketing_email_templates
SET body_html_template = REGEXP_REPLACE(
  body_html_template,
  '<p([^>]*style="[^"]*font-size:\s*14px[^"]*margin-top:\s*40px[^"]*color:\s*)#2d3748([^"]*")',
  '<p\1#4a5568\2',
  'gi'
)
WHERE body_html_template ~* 'font-size:\s*14px.*margin-top:\s*40px.*color:\s*#2d3748';

-- ===========================================
-- UPDATE COMPLETE
-- ===========================================
-- Note: Some templates may have unique styling that requires manual review
-- The enhanced templates (Welcome - New User, Billing - Annual Renewal Reminder,
-- Billing - Grace Period Ending, Billing - Subscription Cancelled) serve as
-- the reference standard for styling.
-- ===========================================

