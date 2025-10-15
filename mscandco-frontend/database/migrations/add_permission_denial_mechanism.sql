-- Migration: Add Permission Denial Mechanism
-- Purpose: Allow revoking role-based permissions for individual users
-- Date: 2025-01-15

-- Add 'denied' column to user_permissions table
ALTER TABLE user_permissions
ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN user_permissions.denied IS 'When true, this permission is explicitly denied for the user, even if granted by their role';

-- Create index for faster queries filtering out denied permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_denied
ON user_permissions(user_id, denied);

-- Update existing records to explicitly set denied = false
UPDATE user_permissions SET denied = false WHERE denied IS NULL;
