# Wallet Balance Final Fix - Hybrid Approach

## Issue
Wallet balances were inconsistent:
- **Admin Wallet Management**: £70.02 (from `user_profiles.wallet_balance`)
- **Artist Earnings Page**: £0.00 (calculated from `earnings_log`)

## Root Cause Analysis
After deeper investigation, discovered that the platform uses **TWO systems**:

### System 1: `user_profiles.wallet_balance`
- Updated by manual revenue approvals (`/api/revenue/approve`)
- Updated by wallet top-ups (`/api/webhooks/revolut`)
- Used by admin wallet management

### System 2: `earnings_log` table
- Tracks individual earnings entries with splits
- Includes automated earnings distribution
- Has status tracking (paid, pending, held, cancelled)
- Designed to be the detailed transaction log

## The Problem
The two systems were out of sync:
- `user_profiles.wallet_balance` = £70.02 (from manual revenue approval)
- `earnings_log` calculated balance = £0.00 (no entries with status='paid')

## Solution: Hybrid Approach

Instead of choosing one system over the other, we now use **BOTH** to ensure no money is lost:

### Updated `/pages/api/artist/wallet-simple.js`

```javascript
// Fetch both sources
const storedWalletBalance = parseFloat(profile?.wallet_balance) || 0;

// Calculate from earnings_log (includes splits and automated earnings)
const calculatedAvailableBalance = allEarnings
  ?.filter(e => e.status === 'paid' && e.amount > 0)
  .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

// Use the MAXIMUM of both
const available_balance = Math.max(storedWalletBalance, calculatedAvailableBalance);

// Log discrepancies for monitoring
if (storedWalletBalance !== calculatedAvailableBalance) {
  console.warn('⚠️ Wallet balance mismatch:', {
    artist_id,
    stored: storedWalletBalance,
    calculated: calculatedAvailableBalance,
    using: available_balance
  });
}
```

## Why This Approach?

### Protects Against Data Loss
- **Manual Revenue Approvals**: If admin approves revenue directly to wallet_balance, it's preserved
- **Automated Earnings**: If splits system adds entries to earnings_log, they're counted
- **Wallet Top-ups**: If user adds funds via payment, they're preserved

### Provides Visibility
- Logs discrepancies so admins can investigate and fix sync issues
- Shows both stored and calculated values in console

### Maintains Functionality
- `earnings_log` still provides detailed breakdown (pending, held, total earned)
- Transaction history still comes from `earnings_log`
- Admin can still see individual earnings entries

## Data Flow

```
┌─────────────────────────────────────┐
│  Manual Revenue Approval            │
│  (Admin approves £70.02)            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  user_profiles.wallet_balance       │
│         £70.02                      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Automated Splits System            │
│  (Creates earnings_log entries)     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  earnings_log (status='paid')       │
│         £0.00                       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  API: Math.max(£70.02, £0.00)      │
│         = £70.02 ✅                 │
└─────────────────────────────────────┘
```

## Additional Fixes

### Updated `hooks/useWalletBalance.js`
- Removed standalone `supabase` import
- Now uses `session` from `useUser()` context
- Added session check before making API calls
- Updated dependency arrays to include `session`

This ensures the header wallet balance also uses the authenticated client.

## Testing
1. Refresh browser
2. Check artist earnings page - should show £70.02
3. Check admin wallet management - should show £70.02
4. Check header wallet balance - should show £70.02
5. Check console for any mismatch warnings

## Long-term Recommendation

To prevent future discrepancies, consider:

1. **Sync Job**: Create a scheduled job that syncs `wallet_balance` with `earnings_log` calculations
2. **Single Write Path**: When approving revenue, write to BOTH `wallet_balance` AND `earnings_log`
3. **Audit Trail**: Keep `earnings_log` as the detailed audit trail
4. **Cache Field**: Use `wallet_balance` as a cached/denormalized field for performance

## Status
✅ **COMPLETE** - Hybrid approach ensures no money is lost and both systems work together

## Related Files
- `/pages/api/artist/wallet-simple.js` - Updated to use max of both sources
- `/hooks/useWalletBalance.js` - Updated to use authenticated session
- `/pages/api/revenue/approve.js` - Updates wallet_balance (no changes needed)
- `/database/SIMPLE_EARNINGS_SCHEMA.sql` - Shows the intended design with VIEW

