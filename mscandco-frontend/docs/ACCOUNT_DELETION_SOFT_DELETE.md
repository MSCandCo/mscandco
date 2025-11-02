# Account Deletion - Soft Delete System

## Critical Issue Identified

The original account deletion implementation had a **CRITICAL FLAW**:
- Hard delete with `ON DELETE CASCADE`
- Destroyed all `earnings_log` records when user deleted account
- Lost financial audit trail
- Made it impossible for admins to handle disputes or claims
- Violated financial record-keeping requirements

## Solution: Soft Delete System

### What is Soft Delete?

Instead of permanently deleting records, we:
1. Mark the user as deleted (`deleted_at` timestamp)
2. Remove auth access (user cannot log in)
3. **Preserve all financial records**
4. Create comprehensive audit trail
5. Allow admins to access deleted user financial data

### Database Changes

#### New Columns in `user_profiles`
```sql
deleted_at TIMESTAMP DEFAULT NULL           -- NULL = active, timestamp = deleted
deletion_reason TEXT DEFAULT NULL           -- Why account was deleted
final_wallet_balance DECIMAL(10,2) DEFAULT 0  -- Balance at deletion time
```

#### New Table: `deleted_users_audit`
Stores complete audit trail:
- Original user_id, email, role
- Final wallet balances (available, pending, held)
- Total earnings
- Deletion timestamp and reason
- Who performed deletion (user or admin)
- Financial snapshot (full earnings history as JSONB)
- Metadata (profile data as JSONB)

#### New Function: `soft_delete_user_account()`
PostgreSQL function that:
1. Calculates current wallet balances
2. Creates financial snapshot
3. Inserts complete record into `deleted_users_audit`
4. Marks `user_profiles` as deleted (NOT physically deleted)
5. Returns deletion summary

### API Endpoint Updated

**`/api/user/delete-account`** now:
1. Verifies password
2. Requires "DELETE MY ACCOUNT" confirmation
3. Calls `soft_delete_user_account()` function
4. Deletes auth account (user can't log in)
5. Logs final wallet balance and pending earnings

### Admin Views

#### `deleted_users_with_earnings`
SQL view for admins to see:
- All deleted user information
- Current earnings calculations (from preserved `earnings_log`)
- Financial snapshot at deletion time
- Reason for deletion
- Who deleted (self or admin)

### What Happens When User Deletes Account

1. **User Experience:**
   - Goes to Settings > Security
   - Clicks "Delete My Account"
   - Enters password + types "DELETE MY ACCOUNT"
   - Confirms deletion
   - Account deleted, signed out, redirected to login

2. **Behind the Scenes:**
   - `soft_delete_user_account()` function executed
   - Record added to `deleted_users_audit`
   - `user_profiles.deleted_at` set to NOW()
   - Auth account removed from `auth.users`
   - User cannot log in again

3. **What is Preserved:**
   - ✅ All `earnings_log` records (WITH artist_id still linking)
   - ✅ Final wallet balance
   - ✅ Pending earnings amount
   - ✅ Complete financial snapshot
   - ✅ User metadata for legal/compliance

4. **What is Deleted:**
   - ❌ Auth credentials (`auth.users` record)
   - ❌ User can no longer log in
   - ❌ Profile hidden from normal queries (RLS policy)

### Financial Claims & Disputes

If a deleted user wants to claim wallet funds:

1. Admin can query `deleted_users_with_earnings` view
2. See complete financial history
3. View `final_wallet_balance` at deletion time
4. Access all `earnings_log` records
5. Verify pending earnings
6. Process payout if legitimate claim

### GDPR Compliance

**Right to be Forgotten:**
- ✅ User cannot log in (identity removed)
- ✅ Profile hidden from platform
- ✅ Personal data marked as deleted

**Legal Exceptions:**
- ✅ Financial records preserved (required for tax, legal, audit)
- ✅ Transaction history maintained (legal requirement)
- ✅ Audit trail for compliance

### Admin Access to Deleted Users

Admins with `earnings:view` permission can:

```sql
-- View all deleted users with current financial status
SELECT * FROM deleted_users_with_earnings;

-- View specific deleted user
SELECT * FROM deleted_users_with_earnings
WHERE user_id = '<user_id>';

-- View all earnings for deleted user
SELECT * FROM earnings_log
WHERE artist_id = '<deleted_user_id>';

-- Check if user had pending wallet balance
SELECT final_wallet_balance, pending_earnings
FROM deleted_users_audit
WHERE user_id = '<user_id>';
```

### Migration Steps

1. Run `database/migrations/implement-soft-delete-system.sql`
2. Deploy updated API endpoint
3. Test soft delete flow
4. Verify admin access to deleted user data

### Two-Factor Authentication Status

**Current Status:** NOT FUNCTIONAL
- Toggle exists in UI
- Stores state in database
- **No actual 2FA implementation** (no TOTP, SMS, or authentication challenge)
- Just a UI placeholder

**Recommendation:**
- Remove the 2FA toggle from settings OR
- Implement proper 2FA using Supabase Auth MFA
- Don't mislead users about security features

## Testing Checklist

- [ ] Apply soft delete migration
- [ ] Test user account deletion flow
- [ ] Verify auth account removed (cannot log in)
- [ ] Verify earnings_log records preserved
- [ ] Verify deleted_users_audit record created
- [ ] Verify admin can access deleted user financial data
- [ ] Test with user who has wallet balance
- [ ] Test with user who has pending earnings
- [ ] Verify GDPR compliance (profile hidden from queries)
- [ ] Verify financial compliance (records preserved)

## Security Considerations

1. **Access Control:**
   - Only user can delete their own account (via password)
   - Only admins with `earnings:view` can see deleted users
   - RLS policies hide deleted users from normal queries

2. **Audit Trail:**
   - Every deletion logged with timestamp
   - Reason for deletion recorded
   - Who performed deletion (self or admin)
   - Cannot be undone or tampered with

3. **Financial Integrity:**
   - Earnings records never deleted
   - Wallet balances preserved
   - Transaction history maintained
   - Claims can be processed years later

## Key Differences: Hard Delete vs Soft Delete

| Aspect | Hard Delete (OLD) | Soft Delete (NEW) |
|--------|------------------|-------------------|
| User can log in | ❌ No | ❌ No |
| Profile visible | ❌ No | ❌ No |
| earnings_log preserved | ❌ DELETED | ✅ PRESERVED |
| Wallet balance tracked | ❌ Lost | ✅ Preserved |
| Admin can see financials | ❌ No | ✅ Yes |
| Claims processable | ❌ No | ✅ Yes |
| Audit trail | ⚠️ Partial | ✅ Complete |
| GDPR compliant | ✅ Yes | ✅ Yes |
| Financial compliant | ❌ NO | ✅ YES |
| Legal risk | ⚠️ HIGH | ✅ LOW |
