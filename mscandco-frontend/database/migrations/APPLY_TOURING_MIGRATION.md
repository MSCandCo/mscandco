# 🚀 Applying Touring Platform Database Migration

## Overview

This guide will help you apply the touring platform database migration to your Supabase instance.

## Prerequisites

- Access to Supabase Dashboard
- Database admin permissions
- Backup of your database (recommended)

## Migration Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Go to **SQL Editor**

2. **Open the Migration File**
   - Open `database/migrations/create_touring_platform.sql`
   - Copy the entire contents

3. **Execute the Migration**
   - Paste the SQL into the SQL Editor
   - Click **Run** or press `Cmd/Ctrl + Enter`
   - Wait for execution to complete (may take 1-2 minutes)

4. **Verify Migration**
   - Run this query to check if tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'tours', 'tour_dates', 'venues', 'tour_crew', 
     'hotels', 'travel_items', 'guest_lists', 'songs', 
     'setlists', 'organizations', 'tour_analytics'
   )
   ORDER BY table_name;
   ```
   - You should see all 11+ tables listed

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push --file database/migrations/create_touring_platform.sql
```

### Option 3: Via psql

```bash
# Connect to your Supabase database
psql -h db.your-project.supabase.co -U postgres -d postgres

# Execute the migration file
\i database/migrations/create_touring_platform.sql
```

## Verification Checklist

After applying the migration, verify:

- [ ] All tables created successfully
- [ ] Indexes created (check with `\d+ table_name` in psql)
- [ ] RLS policies enabled
- [ ] Triggers created for `updated_at` columns
- [ ] Seed data inserted (10 popular venues)

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist
- The migration uses `CREATE TABLE IF NOT EXISTS`, so this is safe to ignore
- Or manually drop existing tables if you want a fresh start

### Error: "permission denied"
- Ensure you're using the service role key or have admin permissions
- Check RLS policies if you can't access data after migration

### Error: "extension uuid-ossp does not exist"
- Run this first: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- This should be included in the migration file, but if not, run it manually

## Post-Migration Steps

1. **Enable RLS** (if not already enabled):
   ```sql
   ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
   -- Repeat for all tables
   ```

2. **Test API Endpoints**:
   - Try creating a tour via `/api/touring/tours`
   - Verify data is stored correctly

3. **Set Up Permissions**:
   - Users should only see their own tours
   - Admins can see all tours
   - Update RLS policies as needed

## Need Help?

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Review the migration file for syntax errors

## Next Steps

After migration is complete:
- ✅ API routes are ready (`/api/touring/tours`)
- ✅ Dashboard UI is ready (`/touring`)
- 🚧 Build tour creation form
- 🚧 Add venue search and matching
- 🚧 Integrate Apollo AI for tour planning
- 🚧 Build crew management UI
- 🚧 Add guest list management

---

**Migration File**: `database/migrations/create_touring_platform.sql`  
**Created**: 2025-01-XX  
**Status**: Ready to apply ✅

