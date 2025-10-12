# Supabase CLI Setup Instructions

## Current Status
- ✅ Supabase CLI installed (v2.33.9)
- ✅ Logged in to Supabase account
- ✅ Project detected: mscandco (fzqpoayhdisusgrotyfg)
- ⚠️ Project not linked (needs database password)

## Steps to Complete Setup

### 1. Get Database Password

1. Open your Supabase Dashboard:
   https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg/settings/database

2. Under "Database Settings", find the "Database Password" section

3. Either:
   - **Option A:** Copy your existing password if you have it
   - **Option B:** Click "Reset Database Password" to generate a new one

### 2. Link the Project

Run this command and enter your database password when prompted:

```bash
cd "/Users/htay/Documents/GitHub Take 2/audiostems-frontend"
supabase link --project-ref fzqpoayhdisusgrotyfg
```

When prompted, paste your database password.

### 3. Execute the Migration SQL

Once linked, run:

```bash
supabase db execute --file database/create_permission_cache.sql
```

This will create the `permission_cache` table with all indexes, RLS policies, and helper functions.

### 4. Verify Migration

Check that all tables exist:

```bash
node scripts/check-schema.js
```

You should see all 3 tables:
- ✅ user_role_assignments
- ✅ audit_logs
- ✅ permission_cache

## Alternative: Manual SQL Execution

If you prefer not to link the CLI, you can execute the SQL manually:

1. Open SQL Editor:
   https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg/sql/new

2. Copy contents from:
   `database/create_permission_cache.sql`

3. Paste and click "Run"

## What Will Be Created

The `permission_cache` table includes:
- **Columns:** id, user_id, role_name, permissions (JSONB), computed_at, expires_at
- **Indexes:** 2 indexes for performance (user_id, expires_at)
- **RLS:** Row Level Security enabled
- **Policies:** Users can view their own cached permissions
- **Functions:** Auto-cleanup for expired cache entries

## Migration Complete Checklist

After execution, you should have:
- [x] user_role_assignments table (EXISTS - has data)
- [x] audit_logs table (EXISTS - has data)
- [ ] permission_cache table (PENDING - needs creation)

---

**Need help?** The SQL file is ready at: `database/create_permission_cache.sql`
