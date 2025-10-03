# RBAC Deployment Checklist

**Version:** 1.0
**Last Updated:** 2025-10-03
**System:** MSC & Co Music Distribution Platform

---

## Table of Contents

1. [Pre-Deployment Verification](#pre-deployment-verification)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Testing Procedures](#testing-procedures)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Plan](#rollback-plan)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Verification

### ✅ Code Review Checklist

- [ ] **All 115 API routes protected** with appropriate RBAC middleware
  - [ ] Upload routes (4) → `requireAuth()`
  - [ ] Notification routes (4) → `requireAuth()`
  - [ ] Payment routes (10) → `requireAuth()`
  - [ ] Profile routes (6) → `profile:view:own` | `profile:edit:own`
  - [ ] Analytics routes (10) → Various analytics permissions
  - [ ] Label admin routes (12) → Label-specific permissions
  - [ ] Artist routes (12) → Artist-specific permissions
  - [ ] Company admin routes (6) → Company admin permissions
  - [ ] Admin routes (17) → Admin permissions
  - [ ] Superadmin routes (5) → `requireRole('super_admin')`
  - [ ] Distribution partner routes (4) → `requireRole('distribution_partner')`
  - [ ] Release routes (11) → Release management permissions
  - [ ] Wallet routes (4) → Wallet permissions
  - [ ] Miscellaneous (15) → Various permissions

- [ ] **Public routes verified** (21 routes)
  - [ ] Auth/registration routes (8) - No protection needed
  - [ ] Webhook routes (3) - Signature verification only
  - [ ] Health/test routes (3) - Public access
  - [ ] Debug routes (2) - Public (disable in production)
  - [ ] Public viewing routes (3) - No sensitive data exposed

- [ ] **Legacy files removed**
  - [ ] `pages/api/artist/profile-old.js` ✅ DELETED
  - [ ] `pages/api/wallet/add-funds-old.js` ✅ DELETED

- [ ] **Webhook security implemented**
  - [ ] Revolut webhook signature verification ✅ IMPLEMENTED
  - [ ] `REVOLUT_WEBHOOK_SECRET` environment variable set

### ✅ RBAC System Components

- [ ] **Core RBAC files exist and are complete:**
  - [ ] `lib/rbac/roles.js` - 78 permissions, 5 roles
  - [ ] `lib/rbac/middleware.js` - requirePermission, requireRole, requireAuth
  - [ ] `hooks/usePermissions.js` - React permission hooks
  - [ ] `components/rbac/PermissionGate.js` - UI permission gates

- [ ] **Documentation complete:**
  - [ ] `docs/RBAC_IMPLEMENTATION.md` ✅
  - [ ] `docs/RBAC_DEPLOYMENT_CHECKLIST.md` ✅ (this file)

---

## Environment Variables

### Required Environment Variables

Add these to your production environment (`.env.production` or hosting platform):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Revolut Payment Configuration
REVOLUT_API_SECRET=your-revolut-api-secret
REVOLUT_WEBHOOK_SECRET=your-revolut-webhook-secret
REVOLUT_BASE_URL=https://merchant.revolut.com  # or sandbox for testing

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NODE_ENV=production
```

### ✅ Environment Variable Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set and verified
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set and verified
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set and verified (KEEP SECRET!)
- [ ] `REVOLUT_API_SECRET` - Set if using Revolut payments
- [ ] `REVOLUT_WEBHOOK_SECRET` - Set if using Revolut webhooks
- [ ] `REVOLUT_BASE_URL` - Set to production URL
- [ ] `NEXT_PUBLIC_BASE_URL` - Set to production domain
- [ ] `NODE_ENV=production` - Set for production deployment

---

## Database Migration

### Step 1: Backup Existing Database

```bash
# Using Supabase CLI
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using pg_dump directly
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Step 2: Run RBAC Tables Migration

Execute the RBAC tables migration SQL file:

```sql
-- File: database/RBAC_TABLES.sql
-- This creates:
-- 1. user_role_assignments table
-- 2. audit_logs table
-- 3. permission_cache table (optional)
-- 4. All necessary indexes
-- 5. RLS policies
-- 6. Helper functions
-- 7. Auto-migration of existing users to roles
```

**To execute:**

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Paste contents of `database/RBAC_TABLES.sql`
   - Click "Run"

2. **Via Supabase CLI:**
   ```bash
   supabase db push --db-url postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres < database/RBAC_TABLES.sql
   ```

3. **Via psql:**
   ```bash
   psql -h db.your-project.supabase.co -U postgres -d postgres -f database/RBAC_TABLES.sql
   ```

### Step 3: Verify Database Migration

Run the verification script:

```bash
node scripts/verify-rbac-db.js
```

**Expected output:**
- ✅ `user_role_assignments` table exists
- ✅ `audit_logs` table exists
- ✅ All users have active role assignments
- ✅ Indexes created successfully
- ✅ RLS policies enabled

### ✅ Database Migration Checklist

- [ ] Database backup created
- [ ] RBAC_TABLES.sql migration executed successfully
- [ ] Verification script confirms all tables exist
- [ ] All users have role assignments
- [ ] Indexes created (7 on user_role_assignments, 6 on audit_logs)
- [ ] RLS policies enabled on all RBAC tables
- [ ] Test queries return expected results

---

## Testing Procedures

### Test Each User Role

#### 1. Artist Role Testing

**Test User:** Artist account
**Expected Permissions:** Own data only

- [ ] **Profile Access:**
  - [ ] ✅ Can view own profile (`profile:view:own`)
  - [ ] ✅ Can edit own profile (`profile:edit:own`)
  - [ ] ❌ Cannot view other users' profiles

- [ ] **Release Management:**
  - [ ] ✅ Can view own releases (`release:view:own`)
  - [ ] ✅ Can create releases (`release:create:own`)
  - [ ] ✅ Can edit own releases (`release:edit:own`)
  - [ ] ❌ Cannot view other artists' releases

- [ ] **Analytics:**
  - [ ] ✅ Can view own analytics (`analytics:view:own`)
  - [ ] ❌ Cannot view other users' analytics

- [ ] **Wallet:**
  - [ ] ✅ Can view own wallet balance
  - [ ] ✅ Can add funds to wallet
  - [ ] ✅ Can request payout

- [ ] **Uploads:**
  - [ ] ✅ Can upload audio files
  - [ ] ✅ Can upload artwork
  - [ ] ✅ Can upload profile picture

#### 2. Label Admin Role Testing

**Test User:** Label admin account
**Expected Permissions:** Own data + managed artists

- [ ] **Artist Management:**
  - [ ] ✅ Can invite artists (`artist:invite`)
  - [ ] ✅ Can view managed artists (`artist:view:label`)
  - [ ] ✅ Can remove artists from label (`artist:remove:label`)

- [ ] **Analytics:**
  - [ ] ✅ Can view label analytics (`analytics:view:label`)
  - [ ] ✅ Can view individual artist analytics
  - [ ] ✅ Can view combined analytics for all artists

- [ ] **Releases:**
  - [ ] ✅ Can view managed artists' releases
  - [ ] ❌ Cannot edit artists' releases directly

- [ ] **Earnings:**
  - [ ] ✅ Can view label earnings
  - [ ] ✅ Can view artist revenue splits

#### 3. Company Admin Role Testing

**Test User:** Company admin account
**Expected Permissions:** Platform-wide read, limited write

- [ ] **User Management:**
  - [ ] ✅ Can view all users (`user:view:any`)
  - [ ] ✅ Can view user profiles
  - [ ] ❌ Cannot edit user profiles (unless `profile:edit:any`)

- [ ] **Analytics:**
  - [ ] ✅ Can view all analytics (`analytics:view:any`)
  - [ ] ✅ Can view platform-wide stats

- [ ] **Earnings:**
  - [ ] ✅ Can view all earnings (`earnings:view:any`)
  - [ ] ✅ Can approve payouts
  - [ ] ✅ Can manage revenue splits (`earnings:edit:any`)

- [ ] **Artist Requests:**
  - [ ] ✅ Can view all artist requests
  - [ ] ✅ Can approve/reject requests

#### 4. Super Admin Role Testing

**Test User:** Super admin account
**Expected Permissions:** Full system access

- [ ] **All Permissions:**
  - [ ] ✅ Can access all admin routes
  - [ ] ✅ Can manage user roles
  - [ ] ✅ Can create new users
  - [ ] ✅ Can view audit logs
  - [ ] ✅ Can manage subscriptions
  - [ ] ✅ Can access revenue reports

- [ ] **System Management:**
  - [ ] ✅ Can view system health
  - [ ] ✅ Can access debug endpoints (if enabled)
  - [ ] ✅ Can manage platform settings

#### 5. Distribution Partner Role Testing

**Test User:** Distribution partner account
**Expected Permissions:** Content management and finance

- [ ] **Content Management:**
  - [ ] ✅ Can manage distribution content
  - [ ] ✅ Can view content dashboard

- [ ] **Finance:**
  - [ ] ✅ Can view financial reports
  - [ ] ✅ Can manage distribution earnings

### ✅ Testing Checklist

- [ ] All artist permissions tested and working
- [ ] All label admin permissions tested and working
- [ ] All company admin permissions tested and working
- [ ] All super admin permissions tested and working
- [ ] All distribution partner permissions tested and working
- [ ] Permission denials are logged in audit_logs
- [ ] Failed access attempts return 403 with proper error message
- [ ] Users without roles are denied access appropriately

---

## Deployment Steps

### Step 1: Pre-Deployment

1. **Code Freeze:**
   - [ ] All RBAC changes merged to main branch
   - [ ] All tests passing
   - [ ] Code review completed

2. **Environment Preparation:**
   - [ ] Production environment variables set
   - [ ] Database backup created
   - [ ] Deployment plan reviewed with team

### Step 2: Database Migration

1. **Execute Migration:**
   - [ ] Run `database/RBAC_TABLES.sql` on production database
   - [ ] Verify migration success
   - [ ] Run verification script

2. **Verify User Roles:**
   ```sql
   -- Check all users have roles
   SELECT COUNT(*) as users_without_roles
   FROM auth.users u
   LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
   WHERE ura.id IS NULL;
   -- Should return 0
   ```

### Step 3: Application Deployment

1. **Deploy Backend Changes:**
   - [ ] Deploy API routes with RBAC middleware
   - [ ] Verify all routes are accessible
   - [ ] Check error logs for issues

2. **Deploy Frontend Changes:**
   - [ ] Deploy UI permission gates
   - [ ] Deploy permission hooks
   - [ ] Verify UI shows/hides based on permissions

### Step 4: Monitoring Setup

1. **Enable Monitoring:**
   - [ ] Set up audit log monitoring
   - [ ] Configure alerts for failed permission checks
   - [ ] Monitor API response times

2. **Enable Logging:**
   - [ ] Ensure audit_logs are being written
   - [ ] Check permission denial logging
   - [ ] Monitor error rates

### ✅ Deployment Checklist

- [ ] Database migration executed successfully
- [ ] All users have role assignments
- [ ] Application deployed to production
- [ ] Environment variables configured
- [ ] Monitoring and logging enabled
- [ ] No critical errors in logs
- [ ] Performance metrics within acceptable range

---

## Post-Deployment Verification

### Immediate Checks (First 15 minutes)

- [ ] **Health Check:**
  ```bash
  curl https://your-domain.com/api/health
  ```

- [ ] **RBAC Test Endpoint:**
  ```bash
  curl https://your-domain.com/api/test-rbac
  ```

- [ ] **Login Test:**
  - [ ] Artist can log in
  - [ ] Label admin can log in
  - [ ] Company admin can log in
  - [ ] Super admin can log in

- [ ] **Permission Test:**
  - [ ] Artist sees only artist features
  - [ ] Label admin sees label management features
  - [ ] Admins see admin panel

### First Hour Checks

- [ ] **Audit Logs:**
  ```sql
  -- Check recent audit logs
  SELECT * FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC
  LIMIT 20;
  ```

- [ ] **Error Monitoring:**
  - [ ] No 500 errors in logs
  - [ ] No unexpected 403 errors
  - [ ] No database connection errors

- [ ] **Performance:**
  - [ ] API response times < 500ms
  - [ ] Database query times acceptable
  - [ ] No memory leaks

### First Day Checks

- [ ] **User Feedback:**
  - [ ] No reports of access issues
  - [ ] No reports of permission errors
  - [ ] All features working as expected

- [ ] **Data Integrity:**
  - [ ] Role assignments stable
  - [ ] Audit logs accumulating properly
  - [ ] No data corruption

### ✅ Post-Deployment Checklist

- [ ] All immediate checks passed
- [ ] First hour checks completed
- [ ] No critical issues reported
- [ ] Monitoring systems operational
- [ ] Team notified of successful deployment

---

## Rollback Plan

### When to Rollback

Rollback immediately if:
- [ ] Critical security vulnerability discovered
- [ ] More than 10% of users cannot access system
- [ ] Data corruption detected
- [ ] Unrecoverable errors in production

### Rollback Procedure

#### Step 1: Immediate Response

1. **Stop Incoming Traffic:**
   ```bash
   # Set maintenance mode
   # OR redirect traffic to old version
   ```

2. **Notify Team:**
   - Alert development team
   - Inform stakeholders
   - Document the issue

#### Step 2: Code Rollback

1. **Revert to Previous Version:**
   ```bash
   # Via Git
   git revert <commit-hash>
   git push origin main

   # Via Deployment Platform
   # Rollback to previous deployment
   ```

2. **Redeploy Previous Version:**
   - [ ] Deploy previous stable version
   - [ ] Verify deployment successful

#### Step 3: Database Rollback (if needed)

**⚠️ WARNING: Only if database migration caused issues**

```sql
-- Rollback RBAC tables (only if necessary)
-- This will remove ALL RBAC functionality

DROP TRIGGER IF EXISTS update_user_role_assignments_updated_at ON user_role_assignments;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS cleanup_expired_permission_cache();
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS user_has_role(UUID, TEXT);

DROP TABLE IF EXISTS permission_cache;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_role_assignments;

-- Restore from backup
-- psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

#### Step 4: Verification After Rollback

- [ ] Application accessible
- [ ] All users can log in
- [ ] All features working
- [ ] No data loss
- [ ] Restore backup if needed

### ✅ Rollback Checklist

- [ ] Issue identified and documented
- [ ] Team notified
- [ ] Code rolled back
- [ ] Database restored (if needed)
- [ ] Application verified working
- [ ] Post-mortem scheduled

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Permission Denied" for Valid User

**Symptoms:**
- User should have access but receives 403
- Audit logs show permission denied

**Solution:**
```sql
-- Check user role assignment
SELECT * FROM user_role_assignments
WHERE user_id = '<user-id>' AND is_active = true;

-- Check if role exists
SELECT * FROM user_role_assignments WHERE user_id = '<user-id>';

-- Assign role if missing
INSERT INTO user_role_assignments (user_id, role_name, assigned_by, is_active)
VALUES ('<user-id>', 'artist', '<admin-id>', true);
```

#### Issue 2: User Has No Role

**Symptoms:**
- User can log in but has no permissions
- `user_role_assignments` empty for user

**Solution:**
```sql
-- Assign default role
INSERT INTO user_role_assignments (user_id, role_name, assigned_by, is_active)
VALUES ('<user-id>', 'artist', '<user-id>', true);
```

#### Issue 3: Middleware Not Executing

**Symptoms:**
- Routes accessible without authentication
- No audit logs being created

**Solution:**
- Check route has RBAC middleware export
- Verify middleware import path
- Check Next.js API route config

```javascript
// Verify route has middleware
export default requirePermission('permission:name')(handler);
// or
export default requireAuth()(handler);
```

#### Issue 4: Database Connection Issues

**Symptoms:**
- 500 errors on protected routes
- Cannot query user_role_assignments

**Solution:**
```bash
# Verify environment variables
echo $SUPABASE_SERVICE_ROLE_KEY
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
node scripts/verify-rbac-db.js
```

#### Issue 5: Audit Logs Not Writing

**Symptoms:**
- No entries in audit_logs table
- Permission checks not logged

**Solution:**
```sql
-- Check table exists
SELECT * FROM audit_logs LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'audit_logs';

-- Manually insert test log (as service role)
INSERT INTO audit_logs (user_id, action, status)
VALUES ('<user-id>', 'test', 'success');
```

### ✅ Troubleshooting Checklist

- [ ] Common issues documented
- [ ] Solutions tested and verified
- [ ] Escalation path defined
- [ ] Support team trained on common issues

---

## Support Contacts

**Development Team:**
- Lead Developer: [contact]
- DevOps Engineer: [contact]

**Emergency Contacts:**
- On-call Engineer: [contact]
- Technical Lead: [contact]

**External Support:**
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support

---

## Deployment Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | | | |
| QA Lead | | | |
| DevOps | | | |
| Technical Lead | | | |
| Product Owner | | | |

---

**Deployment Completed:** ___/___/______
**Rollback Required:** ☐ Yes ☐ No
**Post-Deployment Status:** ☐ Success ☐ Partial ☐ Failed
**Notes:**

---

## Appendix

### A. SQL Queries for Verification

```sql
-- Check role distribution
SELECT role_name, COUNT(*) as count
FROM user_role_assignments
WHERE is_active = true
GROUP BY role_name;

-- Recent audit logs
SELECT created_at, email, action, status
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- Users without roles
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id AND ura.is_active = true
WHERE ura.id IS NULL;

-- Failed permission checks (last hour)
SELECT created_at, email, action, permission_required, error_message
FROM audit_logs
WHERE status = 'denied'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### B. Monitoring Queries

```sql
-- Permission denial rate
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE status = 'denied') as denials,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'denied') / COUNT(*), 2) as denial_rate
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Most denied permissions
SELECT permission_required, COUNT(*) as denial_count
FROM audit_logs
WHERE status = 'denied'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY permission_required
ORDER BY denial_count DESC
LIMIT 10;
```

---

**End of Deployment Checklist**
