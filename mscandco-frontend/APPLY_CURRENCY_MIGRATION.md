# Apply Currency Persistence Migration

## Quick Start

You need to run this SQL in your Supabase SQL Editor to add the `preferred_currency` column:

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL below
5. Click **Run**

### Option 2: Command Line
```bash
# If you have psql installed and configured
psql -h your-supabase-host -U postgres -d postgres -f database/add-preferred-currency.sql
```

## SQL Migration Script

```sql
-- Add preferred_currency column to user_profiles table
-- This stores the user's preferred display currency across the platform

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'GBP';

-- Add a check constraint to ensure only valid currency codes
ALTER TABLE user_profiles 
ADD CONSTRAINT preferred_currency_check 
CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'));

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_currency 
ON user_profiles(preferred_currency);

-- Update existing users to have GBP as default if NULL
UPDATE user_profiles 
SET preferred_currency = 'GBP' 
WHERE preferred_currency IS NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.preferred_currency IS 'User preferred display currency for earnings and wallet balance';
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'preferred_currency';

-- Check existing user preferences
SELECT id, email, preferred_currency 
FROM user_profiles 
LIMIT 10;
```

## Testing

1. Log in to your platform
2. Go to **Earnings** page
3. Change currency (e.g., from GBP to USD)
4. Check that the header wallet balance updates to USD
5. Refresh the page - currency should stay USD
6. Log out and log back in - currency should still be USD

## Rollback (if needed)

If you need to remove the column:

```sql
-- Remove the column (CAUTION: This will delete all currency preferences)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS preferred_currency;
```

## Support

If you encounter any issues:
1. Check that you're running the SQL in the correct database
2. Verify you have the necessary permissions
3. Check the browser console for any API errors
4. Ensure the dev server is running (`npm run dev`)

