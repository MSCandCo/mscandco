-- ===========================================
-- ENHANCE ALL MARKETING EMAIL TEMPLATES
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Update all 129 email templates with:
--   1. Professional, detailed copy with more body
--   2. MSC & Co logo ({{logo_url}} variable)
--   3. Enhanced structure and formatting
--   4. More intentional and professional tone
-- ===========================================
-- 
-- Note: This migration updates existing templates
-- Run after create-marketing-email-templates.sql
-- ===========================================

-- Logo variable: Use {{logo_url}} which should be replaced at send time
-- Recommended: https://yourdomain.com/logos/MSCandCoLogoV2.png

-- We'll update templates using a comprehensive approach
-- Due to the large number of templates, we'll use a pattern-based update

