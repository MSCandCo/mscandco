# Manual Frontend Permission Testing Guide

Since automated Playwright login is having issues, here's a manual testing guide to verify all permissions work correctly on the frontend.

## Prerequisites

1. Database testing script is working: `node test-permissions-auto.js` ✅
2. Dev server is running on http://localhost:3013
3. You have the artist login credentials: info@htay.co.uk / Haylee.01

## Testing Process

For each of the 8 permissions, follow this process:

### Permission List

1. **artist:dashboard:access** - Dashboard page
2. **artist:release:access** - Releases page
3. **artist:analytics:access** - Analytics page
4. **artist:earnings:access** - Earnings page
5. **artist:messages:access** - Messages page & bell icon
6. **artist:roster:access** - Roster page
7. **artist:settings:access** - Settings page
8. **artist:platform:access** - Platform page

---

## Quick Automated Test

I've created a script that will toggle the permissions in the database. You just need to manually verify the UI changes.

### Step-by-Step Instructions:

1. **Open two terminal windows side by side**

2. **Terminal 1:** Run the permission toggling script
   ```bash
   cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
   node test-permissions-interactive.js
   ```

3. **Terminal 2 / Browser:**
   - Login as artist: http://localhost:3013/login
   - Email: info@htay.co.uk
   - Password: Haylee.01

4. **Follow the prompts:**
   - The script will remove one permission at a time
   - After each removal, refresh the browser (Cmd+R or F5)
   - Check if the corresponding nav link disappeared
   - Try to access the page directly - it should block you
   - Press Enter in the terminal to restore the permission
   - Refresh the browser again
   - Check if the nav link reappeared
   - Try to access the page - it should work
   - Press Enter to move to the next permission

---

## Alternative: One-Permission-At-A-Time Test

Run this simpler script that tests one permission:

```bash
# Test a specific permission
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"

# Remove artist:dashboard:access
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const userId = '0a060de5-1c94-4060-a1c2-860224fc348d';
  const { data: perm } = await supabase.from('permissions').select('id').eq('name', 'artist:dashboard:access').single();
  await supabase.from('user_permissions').delete().eq('user_id', userId).eq('permission_id', perm.id);
  console.log('✅ Removed artist:dashboard:access - refresh browser and check Dashboard link is gone');
})();
"

# Restore artist:dashboard:access
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const userId = '0a060de5-1c94-4060-a1c2-860224fc348d';
  const { data: perm } = await supabase.from('permissions').select('id').eq('name', 'artist:dashboard:access').single();
  await supabase.from('user_permissions').insert({ user_id: userId, permission_id: perm.id });
  console.log('✅ Restored artist:dashboard:access - refresh browser and check Dashboard link is back');
})();
"
```

---

## What to Check

For each permission test:

### ✅ WITH Permission (Initial State)
- [ ] Nav link is VISIBLE in the navigation bar
- [ ] Can access the page directly (no redirect/403)
- [ ] Page content loads correctly

### ❌ WITHOUT Permission (After Removal)
- [ ] Nav link is HIDDEN from the navigation bar
- [ ] Cannot access the page directly (redirects to dashboard or shows 403)

### ✅ WITH Permission (After Restoration)
- [ ] Nav link is VISIBLE again
- [ ] Can access the page again
- [ ] Page content loads correctly

---

## Expected Results

All 8 permissions should:
1. Hide their corresponding nav link when removed
2. Block page access when permission is removed
3. Show nav link again when restored
4. Allow page access when permission is restored

---

## Database Testing Results

The automated database tests already confirmed:
```
✅ Passed: 8/8

All permissions can be:
- Added to the database ✅
- Removed from the database ✅
- Queried correctly ✅
```

Now we just need to confirm the FRONTEND responds to these database changes.
