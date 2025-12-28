# Marketing System - SQL Migration Execution Order

## Complete SQL Execution Guide

Run these SQL files in the following order to set up the complete marketing email campaign system:

### 1. Base Marketing Tables (if not already created)
**File:** `create-marketing-email-campaigns.sql`
- Creates base tables: `email_campaigns`, `email_campaign_recipients`, `marketing_email_templates`
- **Run this FIRST** if the base tables don't exist

### 2. Advanced Marketing Features
**File:** `add-marketing-advanced-features.sql`
- Adds A/B testing columns to campaigns
- Creates `audience_segments` table (saved filter segments)
- Creates `automation_workflows` table (email sequences)
- Creates `email_client_tracking` table (detailed tracking)
- Adds tracking columns to recipients
- Creates triggers and RLS policies
- **Note:** This file is idempotent and includes base table creation, so it can be run independently

### 3. Marketing Permissions
**File:** `add-marketing-permissions.sql`
- Adds 24 marketing-related permissions to the `permissions` table
- Grants permissions to `marketing_admin`, `super_admin`, and `company_admin` roles
- **Important:** Run this to enable marketing admin access

### 4. Email Templates Library
**File:** `create-marketing-email-templates.sql`
- Inserts 23+ comprehensive pre-built email templates
- Templates organized by category: onboarding, holidays, promotions, engagement, billing, support, educational, security, admin
- All templates are production-ready with HTML and plain text versions

## Quick Start (Recommended Order)

If you're setting up from scratch, run in this exact order:

```sql
-- Step 1: Advanced Features (includes base tables if needed)
-- Run: add-marketing-advanced-features.sql

-- Step 2: Permissions
-- Run: add-marketing-permissions.sql

-- Step 3: Templates
-- Run: create-marketing-email-templates.sql
```

## Verification

After running all migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'email_campaigns',
  'email_campaign_recipients',
  'marketing_email_templates',
  'audience_segments',
  'automation_workflows',
  'email_client_tracking'
);

-- Check permissions
SELECT COUNT(*) FROM permissions WHERE name LIKE 'marketing:%';

-- Check templates
SELECT COUNT(*), category FROM marketing_email_templates GROUP BY category;

-- Check marketing_admin permissions
SELECT p.name FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'marketing_admin' AND p.name LIKE 'marketing:%';
```

## Notes

- All migration files use `ON CONFLICT DO NOTHING` where appropriate, making them idempotent
- The `add-marketing-advanced-features.sql` file is designed to be run multiple times safely
- Templates can be activated/deactivated via the `is_active` column
- All templates support merge tags (e.g., `{{user_name}}`, `{{dashboard_url}}`)

## System Status After Migration

✅ Marketing campaign management system fully operational
✅ 23+ professional email templates ready to use
✅ Advanced filtering and segmentation capabilities
✅ A/B testing support
✅ Automation workflows support
✅ Comprehensive tracking and analytics support
✅ Marketing admin role with proper permissions
✅ Integration with admin navigation menu

