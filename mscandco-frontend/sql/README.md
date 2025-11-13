# SQL Scripts and Database Schema

This directory contains all SQL scripts for the MSC & Co platform database management, organized by purpose.

## Directory Structure

```
sql/
├── migrations/        # Database migration scripts
├── schema/            # Table creation and schema changes
├── rls-policies/      # Row Level Security policies
└── checks/            # Verification and check scripts
```

## Quick Navigation

### 🔄 Migrations (`/migrations/`)
Scripts that add columns, update data, or modify existing structures:
- `ADD_ALL_MISSING_COLUMNS.sql` - Comprehensive column additions
- `ADD_MISSING_COLUMNS.sql` - Additional missing columns
- `ADD_WALLET_COLUMNS.sql` - Wallet feature columns
- `add-user-profile-fields.sql` - User profile enhancements
- `create-missing-permissions.sql` - Permission system setup
- `fix-permissions-url.sql` - Permission URL corrections
- `fix-rbac-permissions.sql` - RBAC permission fixes
- `remove-dashboard-permission.sql` - Dashboard permission cleanup
- `insert_navigation_data.sql` - Navigation data initialization

**Usage**: Apply these in chronological order or as needed for specific features.

### 🏗️ Schema (`/schema/`)
Scripts that create tables or make major structural changes:
- `CREATE_WALLET_TRANSACTIONS_TABLE.sql` - Wallet transactions table
- `WALLET_TRANSACTIONS_TABLE.sql` - Alternative wallet table definition
- `create-ghost-sessions-table.sql` - Ghost login sessions
- `create_navigation_table.sql` - Navigation configuration table
- `FIX_SUBSCRIPTIONS_TABLE.sql` - Subscriptions table corrections

**Usage**: Run these to initialize new tables or fix table structures.

### 🔒 RLS Policies (`/rls-policies/`)
Row Level Security policy definitions:
- `FIXED_RLS_POLICY.sql` - General RLS policy fixes
- `fix-releases-rls.sql` - Releases table RLS (v1)
- `fix-releases-rls-v2.sql` - Releases table RLS (v2)
- `update-change-requests-rls.sql` - Change requests RLS

**Usage**: Apply to enforce row-level security for multi-tenant data access.

### ✅ Checks (`/checks/`)
Verification and diagnostic scripts:
- `CHECK_DATABASE_STRUCTURE.sql` - Verify database structure
- `CHECK_WALLET_TRANSACTIONS_TABLE.sql` - Verify wallet table
- `check_constraints.sql` - Check constraint definitions

**Usage**: Run these to diagnose issues or verify database state.

## Database Connection

The platform uses Supabase PostgreSQL with the following configuration:
- Connection details in `.env.local`
- Service role key for admin operations
- Connection pooling via `lib/db/postgres.js`

## Best Practices

1. **Always backup before running migrations**
2. **Test in development first**
3. **Check for existing data before ALTER TABLE**
4. **Use transactions for complex operations**
5. **Document any manual steps required**

## Running SQL Scripts

### Via Supabase Dashboard
1. Go to SQL Editor in Supabase dashboard
2. Copy script contents
3. Execute and verify results

### Via psql
```bash
psql $DATABASE_URL -f sql/migrations/script-name.sql
```

### Via Node.js
```javascript
import { query } from './lib/db/postgres.js'
const result = await query(sqlScript)
```

## Common Tasks

### Add a new column
1. Create migration in `/migrations/`
2. Test in development
3. Apply to production
4. Update TypeScript types if needed

### Create a new table
1. Create schema script in `/schema/`
2. Add RLS policies in `/rls-policies/`
3. Test with service role and user role
4. Update API routes if needed

### Fix RLS issue
1. Identify the table and policy issue
2. Create fix script in `/rls-policies/`
3. Test with affected user roles
4. Verify access patterns work correctly

## Migration History

All applied migrations are tracked in Supabase migrations table. Check before re-running scripts to avoid duplicate operations.

---

For database-related questions, see:
- [Technical Documentation](../docs/architecture/ULTIMATE_TECHNICAL_DOCUMENTATION.md)
- [Deployment Guide](../docs/deployment/DEPLOYMENT_VERIFICATION_COMPLETE.md)
