# Marketing Email Templates - Update Guide

## Overview
This directory contains SQL migration files to update all 129 marketing email templates with:
- Improved styling (font sizes, spacing)
- Removed header logos
- Footer with logo and appropriate slogans based on category

## Update Files (Run in Order)

### 1. `update-4-enhanced-templates.sql`
**Purpose**: Updates the 4 manually enhanced templates (Welcome - New User, Billing - Annual Renewal Reminder, Billing - Grace Period Ending, Billing - Subscription Cancelled) with:
- Professional, detailed copy
- Improved styling (14px body text, 22px headers, 60px footer logo)
- Footer with logo and appropriate slogan

**Status**: ✅ Already applied to 4 templates (reference templates)

---

### 2. `update-all-templates-slogans.sql`
**Purpose**: Updates all 129 templates to:
- Remove logos from headers (various patterns: `{{base_url}}`, `https://staging.mscandco.com`)
- Add footer structure with logo (60px) and appropriate slogans:
  - **Onboarding/Welcome/Milestone**: "Empowering Every Artist. Protecting Our Planet."
  - **All others**: "Empowering Artists. Protecting the Planet."

**When to run**: After templates are created, before or after styling updates

---

### 3. `update-all-templates-styling.sql`
**Purpose**: Updates font sizes and spacing for all templates:
- Header h1: `font-size: 28px` → `22px` + `line-height: 1.3`
- Header div padding: `30px 20px` → `24px 20px`
- Body paragraphs: `font-size: 16px` → `14px`
- Signature: `font-size: 16px` → `14px`
- Buttons: `font-size: 16px` → `14px`
- Signature color: `#2d3748` → `#4a5568` (where applicable)

**When to run**: After `update-all-templates-slogans.sql` or can be combined

---

## Execution Order

**Recommended order:**
1. Run `update-all-templates-slogans.sql` (removes header logos, adds footer logos + slogans)
2. Run `update-all-templates-styling.sql` (updates font sizes and spacing)

**Alternative:** Both can be run independently, but running slogans first ensures logos are removed from headers before styling is applied.

---

## Slogan Guide Reference

See `/docs/brand/MSC_AND_CO_SLOGAN_GUIDE.md` for complete slogan usage guidelines.

**Quick Reference:**
- **Master Brand Slogan**: "Empowering Artists. Protecting the Planet." (default)
- **Artist-Focused**: "Empowering Every Artist. Protecting Our Planet." (onboarding, milestones, welcome emails)
- **Technical/Investor**: "Intelligent Distribution. Independent Artists. Zero Carbon." (not used in email templates)
- **Gospel/YHWH MSC**: "Kingdom Music. Kingdom Impact." (not used in standard marketing templates)
- **Personal**: "Your Music. Your Truth. Your Impact." (not used in email templates)

---

## Template Categories

Templates are organized by category:
- **onboarding** - Welcome emails, profile completion, first release guides (artist-focused slogan)
- **billing** - Subscription renewals, cancellations, payment reminders (master brand slogan)
- **engagement** - Re-engagement, win-back campaigns (master brand slogan)
- **milestone** - Achievement celebrations, milestones (artist-focused slogan)
- **holiday** - Holiday greetings (master brand slogan)
- **promotion** - Sales, special offers (master brand slogan)
- **support** - Help center, FAQ links (master brand slogan)
- **educational** - Tips, guides, tutorials (master brand slogan)
- **security** - Security alerts, password resets (master brand slogan)
- **admin** - Admin notifications (master brand slogan)
- **product** - Feature announcements (master brand slogan)

---

## Notes

- The 4 enhanced templates (`update-4-enhanced-templates.sql`) serve as the reference standard
- Regex patterns in the SQL files are designed to match various HTML formatting styles
- Some templates may have unique structures that require manual review
- All templates should have consistent footer structure with logo and appropriate slogan
- Font sizes are standardized to 14px for body text, 22px for headers

---

## Troubleshooting

If templates don't update correctly:
1. Check that templates exist in `marketing_email_templates` table
2. Verify template HTML structure matches expected patterns
3. Run updates one at a time and verify results
4. Check for any SQL errors in the migration output
5. Some templates may need manual adjustments for unique structures

---

## Last Updated
January 28, 2025

