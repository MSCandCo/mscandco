# Wallet Balance Consistency Fix

## Issue
Wallet balances were inconsistent between:
- **Admin Wallet Management**: Showed £70.02
- **Artist Earnings Page**: Showed £0.00

The admin side was correct (£70.02), but the artist side was showing the wrong balance.

## Root Cause
The two pages were querying **different data sources**:

### Admin Wallet Management
- **Source**: `user_profiles.wallet_balance` column
- **Query**: Direct read from the wallet_balance field
- **Result**: £70.02 ✅ (Correct)

### Artist Earnings Page (Before Fix)
- **Source**: `earnings_log` table
- **Query**: Calculated balance by summing up earnings with `status = 'paid'`
- **Result**: £0.00 ❌ (Incorrect - no entries with status='paid')

## Problem
The artist wallet API was **calculating** the balance from `earnings_log` instead of reading the **single source of truth** from `user_profiles.wallet_balance`. This caused discrepancies when:
1. The wallet_balance field was updated directly
2. Earnings entries had different statuses than expected
3. The earnings_log table was incomplete or out of sync

## Solution Applied

### Updated `/pages/api/artist/wallet-simple.js`

**Changed from:**
```javascript
// Calculate wallet summary directly from earnings_log table
const { data: allEarnings } = await supabase
  .from('earnings_log')
  .select('*')
  .eq('artist_id', artist_id);

const walletSummary = {
  available_balance: allEarnings?.filter(e => e.status === 'paid' && e.amount > 0)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
  // ... other calculations
};
```

**Changed to:**
```javascript
// Fetch wallet balance from user_profiles (single source of truth)
const { data: profile } = await supabase
  .from('user_profiles')
  .select('wallet_balance, wallet_currency')
  .eq('id', artist_id)
  .single();

const walletBalance = parseFloat(profile?.wallet_balance) || 0;
const walletCurrency = profile?.wallet_currency || 'GBP';

// Fetch earnings_log for transaction history and breakdown (display only)
const { data: allEarnings } = await supabase
  .from('earnings_log')
  .select('*')
  .eq('artist_id', artist_id);

// Calculate breakdown from earnings_log (for display purposes only)
const pending_balance = allEarnings?.filter(e => e.status === 'pending' && e.amount > 0)
  .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

const wallet = {
  artist_id,
  available_balance: walletBalance, // ✅ Single source of truth
  pending_balance: pending_balance,
  held_balance: held_balance,
  total_earned: total_earned,
  currency: walletCurrency,
  minimum_payout: 50,
  last_updated: new Date().toISOString()
};
```

## Key Changes
1. **Primary Balance Source**: Now reads `user_profiles.wallet_balance` as the single source of truth
2. **Currency Support**: Also reads `user_profiles.wallet_currency` for proper currency display
3. **Earnings Log**: Still fetches `earnings_log` for transaction history and breakdown (pending, held, total earned)
4. **Graceful Fallback**: If `earnings_log` fails, the API still returns the wallet balance
5. **Consistency**: Both admin and artist pages now use the same data source

## Data Flow
```
┌─────────────────────────────────────┐
│     user_profiles.wallet_balance    │ ← Single Source of Truth
│           (£70.02)                  │
└─────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐         ┌──────────┐
    │  Admin   │         │  Artist  │
    │  Wallet  │         │ Earnings │
    │   Mgmt   │         │   Page   │
    └──────────┘         └──────────┘
         ✅                   ✅
      £70.02               £70.02
```

## Testing
After these changes:
1. Refresh the browser
2. Navigate to `/artist/earnings` as an artist
3. The available balance should now show £70.02 (matching admin side)
4. Navigate to `/admin/walletmanagement` as admin
5. The balance should still show £70.02
6. **Both pages now show consistent balances** ✅

## Additional Notes
- The `earnings_log` table is still used for displaying transaction history and breakdowns (pending, held, total earned)
- This is correct behavior - `wallet_balance` is the authoritative balance, while `earnings_log` provides the detailed transaction history
- Any future updates to wallet balances should update `user_profiles.wallet_balance` to maintain consistency

## Status
✅ **COMPLETE** - Wallet balances are now consistent across admin and artist pages

## Related Files
- `/pages/api/artist/wallet-simple.js` - Updated to use wallet_balance from user_profiles
- `/app/api/admin/walletmanagement/route.js` - Already using wallet_balance (no changes needed)
- `/app/artist/earnings/EarningsClient.js` - Client component (no changes needed)
- `/app/admin/walletmanagement/WalletManagementClient.js` - Client component (no changes needed)

