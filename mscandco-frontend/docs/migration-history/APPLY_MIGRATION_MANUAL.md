# Manual Migration: Add Permission Denial Mechanism

Since the automated migration failed due to API permissions, please run this SQL manually in the Supabase SQL Editor:

## Steps:

1. Go to: https://supabase.com/dashboard/project/vzyhwmvmkkmhyxjmmlnf/sql/new
2. Paste the following SQL:

```sql
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
```

3. Click "Run" to execute the migration

## What This Does:

- Adds a `denied` boolean column to the `user_permissions` table
- When `denied = true`, that permission is explicitly revoked for the user, even if their role grants it
- When `denied = false` (default), the permission behaves normally (granted if in table, not granted if not in table)
- This allows us to **override/revoke** role-based permissions for individual users

## After Running the Migration:

The system will automatically start using the denial mechanism. No code changes needed beyond updating:
1. `/lib/permissions.js` - Filter out denied permissions
2. `/pages/api/admin/users/[userId]/toggle-permission.js` - Insert with `denied: true` instead of deleting

Once you confirm the migration is complete, I'll update the code to use the denial mechanism.
