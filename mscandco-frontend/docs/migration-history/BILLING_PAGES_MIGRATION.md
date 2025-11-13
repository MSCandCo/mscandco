# Billing Pages Migration to App Router

## Summary
Migrated billing pages from Pages Router to App Router with proper routing for both artists and label admins, fixing data isolation issues.

## Problem
- Old billing page at `/billing` was showing incorrect data (not user-specific)
- No proper routing separation between artist and label admin billing
- Using Pages Router instead of App Router
- Missing permission checks

## Solution
Created separate, properly routed billing pages:
- **Artists**: `/artist/billing`
- **Label Admins**: `/labeladmin/billing`

## Changes Made

### 1. **Artist Billing Page**
   
   **Created Files**:
   - `app/artist/billing/BillingClient.js` (Client Component)
   - `app/artist/billing/page.js` (Server Component)
   
   **Features**:
   - ✅ Permission check for `billing:access`
   - ✅ User-specific data (only shows artist's subscription and wallet)
   - ✅ Wallet balance in header with "Add Funds" button
   - ✅ Subscription plans filtered for artists (Artist Starter, Artist Pro)
   - ✅ Top-up modal for wallet funding
   - ✅ Auto-renewal notifications
   - ✅ Cookie-based authentication
   
   **Route**: `/artist/billing`

### 2. **Label Admin Billing Page**
   
   **Created Files**:
   - `app/labeladmin/billing/BillingClient.js` (Client Component)
   - `app/labeladmin/billing/page.js` (Server Component)
   
   **Features**:
   - ✅ Permission check for `billing:access`
   - ✅ User-specific data (only shows label admin's subscription and wallet)
   - ✅ Wallet balance in header with "Add Funds" button
   - ✅ Subscription plans filtered for label admins (Label Starter, Label Pro)
   - ✅ Top-up modal for wallet funding
   - ✅ Auto-renewal notifications
   - ✅ Cookie-based authentication
   
   **Route**: `/labeladmin/billing`

### 3. **Code Updates**

   **BillingClient.js Changes**:
   ```javascript
   // Before (Pages Router):
   import { useRouter } from 'next/router';
   import { supabase } from '@/lib/supabase';
   const { payment } = router.query;
   
   // After (App Router):
   'use client'
   import { useRouter } from 'next/navigation';
   const params = new URLSearchParams(window.location.search);
   const payment = params.get('payment');
   ```
   
   **Authentication Updates**:
   ```javascript
   // Before:
   const { data: { session } } = await supabase.auth.getSession();
   const response = await fetch('/api/user/subscription-status', {
     headers: { 'Authorization': `Bearer ${session.access_token}` }
   });
   
   // After:
   const response = await fetch('/api/user/subscription-status', {
     credentials: 'include'
   });
   ```
   
   **Component Export**:
   ```javascript
   // Now accepts userRole prop to filter plans
   export default function BillingClient({ userRole = 'artist' }) {
     // Component filters plans based on userRole
     const filteredPlans = PLANS.filter(plan => plan.target === userRole);
   }
   ```

### 4. **Server Components (page.js)**
   
   Both artist and label admin pages follow the same pattern:
   
   ```javascript
   import { createClient } from '@/lib/supabase/server'
   import { redirect } from 'next/navigation'
   import { userHasPermission } from '@/lib/permissions'
   import BillingClient from './BillingClient'
   
   export default async function BillingPage() {
     const supabase = await createClient()
     const { data: { session } } = await supabase.auth.getSession()
     
     if (!session) {
       redirect('/login')
     }
   
     const hasAccess = await userHasPermission(session.user.id, 'billing:access', true)
     
     if (!hasAccess) {
       redirect('/dashboard')
     }
     
     return <BillingClient userRole="artist" /> // or "label_admin"
   }
   ```

## Data Isolation

### How It Works:
1. **Server-side authentication**: Session verified on server before page renders
2. **Permission checks**: Only users with `billing:access` can view the page
3. **User-specific data**: All API calls use `credentials: 'include'` to send session cookies
4. **Role-based filtering**: Plans are filtered based on `userRole` prop

### API Calls:
All API endpoints now use cookie-based auth instead of Bearer tokens:
- `/api/user/subscription-status` - Gets current user's subscription
- `/api/artist/wallet-simple` - Gets current user's wallet balance
- `/api/wallet/topup` - Processes top-up for current user

## Navigation Updates

### Settings Page:
The "Manage Subscription" button in Settings → Billing tab should now link to:
- Artists: `/artist/billing`
- Label Admins: `/labeladmin/billing`

### Old Route:
The old `/billing` route (Pages Router) should be deprecated or redirected:
```javascript
// pages/billing.js can be moved to _migrating_pages/ or deleted
```

## Testing Checklist

### Artist Billing:
- [x] Navigate to `/artist/billing`
- [x] Page loads with permission check
- [x] Shows only artist plans (Artist Starter, Artist Pro)
- [x] Wallet balance is user-specific
- [x] Can top up wallet
- [x] Can subscribe to plans
- [x] Redirects to login if not authenticated
- [x] Redirects to dashboard if no permission

### Label Admin Billing:
- [x] Navigate to `/labeladmin/billing`
- [x] Page loads with permission check
- [x] Shows only label plans (Label Starter, Label Pro)
- [x] Wallet balance is user-specific
- [x] Can top up wallet
- [x] Can subscribe to plans
- [x] Redirects to login if not authenticated
- [x] Redirects to dashboard if no permission

### Data Isolation:
- [x] Artist A cannot see Artist B's data
- [x] Label Admin cannot see Artist's data
- [x] Each user sees only their own subscription and wallet balance

## Benefits

1. **Proper Routing**: Clear separation between artist and label admin billing
2. **Data Security**: User-specific data with proper authentication
3. **Permission-Based Access**: Only authorized users can access billing
4. **Modern Architecture**: Uses Next.js 13+ App Router patterns
5. **Maintainability**: Separate components for different user roles
6. **Scalability**: Easy to add more user types in the future

## Migration Path

### For Existing Links:
Update all references from `/billing` to:
- `/artist/billing` for artists
- `/labeladmin/billing` for label admins

### For Settings Page:
```javascript
// In Settings → Billing tab
const billingLink = userRole === 'label_admin' ? '/labeladmin/billing' : '/artist/billing';
<button onClick={() => router.push(billingLink)}>Manage Subscription</button>
```

## Success! 🎉

Both artist and label admin billing pages are now properly migrated to the App Router with:
- ✅ Correct routing (`/artist/billing` and `/labeladmin/billing`)
- ✅ User-specific data (no more weird data from other users)
- ✅ Permission-based access control
- ✅ Cookie-based authentication
- ✅ Role-specific plan filtering
- ✅ Maintained all original functionality (wallet top-up, subscriptions, etc.)

