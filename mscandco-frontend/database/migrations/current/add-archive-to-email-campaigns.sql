-- ===========================================
-- Add Archive Functionality to Email Campaigns
-- ===========================================
-- Date: 2026-01-01
-- Purpose: Replace delete with archive functionality for email campaigns
-- ===========================================

-- Add is_archived column to email_campaigns table
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL;

-- Add archived_at timestamp
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create index for archived campaigns filtering
CREATE INDEX IF NOT EXISTS idx_email_campaigns_is_archived ON email_campaigns(is_archived);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status_archived ON email_campaigns(status, is_archived);

-- Add comment to column
COMMENT ON COLUMN email_campaigns.is_archived IS 'Whether the campaign has been archived (soft delete)';
COMMENT ON COLUMN email_campaigns.archived_at IS 'Timestamp when the campaign was archived';

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- This migration adds:
-- ✅ is_archived boolean field (defaults to false)
-- ✅ archived_at timestamp field
-- ✅ Indexes for efficient filtering
-- ✅ Column comments for documentation

