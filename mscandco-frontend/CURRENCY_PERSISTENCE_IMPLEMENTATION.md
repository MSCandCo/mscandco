# Currency Persistence Implementation

## Overview
Implemented a comprehensive currency persistence system that syncs user's preferred currency across the entire platform and persists it to the database.

## Changes Made

### 1. Database Schema (`database/add-preferred-currency.sql`)
Added `preferred_currency` column to `user_profiles` table:
- **Column**: `preferred_currency VARCHAR(3) DEFAULT 'GBP'`
- **Constraint**: Only allows valid currency codes (USD, EUR, GBP, CAD, NGN, GHS, KES, ZAR, ZMW)
- **Index**: Created for faster lookups
- **Default**: All existing users default to GBP

**To apply this migration:**
```bash
# Run this SQL in your Supabase SQL Editor
psql -h your-supabase-host -U postgres -d postgres -f database/add-preferred-currency.sql
```

### 2. API Endpoint (`pages/api/user/currency-preference.js`)
Created new API endpoint to handle currency preferences:
- **GET**: Retrieves user's preferred currency from database
- **POST**: Saves user's preferred currency to database
- **Validation**: Ensures only valid currency codes are accepted
- **Authentication**: Requires valid session

### 3. Currency Sync Hook (`components/shared/CurrencySelector.js`)
Updated `useCurrencySync` hook to:
- **Load** currency preference from database on mount
- **Fallback** to localStorage if database fetch fails
- **Save** currency changes to both localStorage and database
- **Sync** across all components using custom events
- **Return** `[selectedCurrency, updateCurrency, isLoaded]` - added `isLoaded` state

## How It Works

### On Login/Page Load:
1. Hook calls `/api/user/currency-preference` (GET)
2. Database returns user's saved `preferred_currency`
3. Currency is set in component state and localStorage
4. All components using `useCurrencySync` update automatically

### When User Changes Currency:
1. User selects new currency in earnings page (or any component)
2. `updateCurrency()` is called
3. **Immediate**: localStorage updated + event dispatched
4. **Background**: API call saves to database
5. All components listening to `currencyChange` event update

### On Logout/Re-login:
1. User logs back in
2. Currency preference loads from database
3. User sees their previously selected currency

## Components Affected

### Already Using `useCurrencySync`:
✅ **Header** (`components/header.js`)
- Wallet balance display updates automatically

✅ **RoleBasedNavigation** (`components/auth/RoleBasedNavigation-clean.js`)
- Wallet balance display updates automatically

✅ **PermissionBasedNavigation** (`components/auth/PermissionBasedNavigation.js`)
- Wallet balance display updates automatically

### Using Currency Selection:
✅ **EarningsClient** (`app/artist/earnings/EarningsClient.js`)
- Has its own currency selector
- Changes sync to header and database

## Benefits

1. **Persistence**: Currency preference survives logout/login
2. **Sync**: All components show same currency in real-time
3. **Fallback**: Works even if database is unavailable (uses localStorage)
4. **Performance**: Database save happens in background (non-blocking)
5. **User Experience**: Instant feedback, no loading delays

## Testing Checklist

- [ ] Run SQL migration to add `preferred_currency` column
- [ ] Log in as an artist
- [ ] Go to Earnings page
- [ ] Change currency (e.g., from GBP to USD)
- [ ] Check header wallet balance updates to USD
- [ ] Refresh page - currency should stay USD
- [ ] Log out and log back in - currency should still be USD
- [ ] Test with different currencies (EUR, NGN, etc.)
- [ ] Test with multiple browser tabs - all should sync

## Database Migration Required

**IMPORTANT**: You must run the SQL migration before this feature will work:

```sql
-- In Supabase SQL Editor or psql:
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'GBP';

ALTER TABLE user_profiles 
ADD CONSTRAINT preferred_currency_check 
CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_currency 
ON user_profiles(preferred_currency);

UPDATE user_profiles 
SET preferred_currency = 'GBP' 
WHERE preferred_currency IS NULL;
```

## Supported Currencies

- 🇺🇸 USD - US Dollar ($)
- 🇪🇺 EUR - Euro (€)
- 🇬🇧 GBP - British Pound (£)
- 🇨🇦 CAD - Canadian Dollar (C$)
- 🇳🇬 NGN - Nigerian Naira (₦)
- 🇬🇭 GHS - Ghanaian Cedi (₵)
- 🇰🇪 KES - Kenyan Shilling (KSh)
- 🇿🇦 ZAR - South African Rand (R)
- 🇿🇲 ZMW - Zambian Kwacha (ZK)

## Notes

- All amounts are stored in GBP in the database
- Conversion happens on the frontend using live exchange rates
- Exchange rates update every 10 minutes automatically
- Currency preference is user-specific (not role-specific)

