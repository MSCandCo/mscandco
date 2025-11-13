# TODO: Fix SSR Cookie Reading

**Priority**: Medium  
**Required Before**: Production deployment  
**Currently**: Temporary bypass active (all pages accessible)

---

## 🎯 **What Needs To Be Done**

Fix Supabase session cookie reading in `getServerSideProps` so server-side permission checks work properly.

---

## 🔧 **Solution: Add Supabase Middleware**

### Step 1: Create Middleware File

Create `middleware.js` in the root:

```javascript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // This refreshes the session and sets cookies properly for SSR
  await supabase.auth.getSession()
  
  return res
}

// Apply middleware only to protected routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/artist/:path*',
    '/labeladmin/:path*',
    '/distribution/:path*'
  ]
}
```

### Step 2: Remove Temporary Bypass

In `lib/serverSidePermissions.js`, remove lines 40-71 (the temporary bypass) and restore the original permission checking code.

### Step 3: Test

1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Login as superadmin
4. Try accessing `/admin/walletmanagement`
5. Should work WITHOUT the bypass

---

## 📋 **Alternative: Revert to Client-Side Only**

If middleware doesn't work or you prefer client-side:

### Option: Remove Server-Side Checks

1. Remove all `getServerSideProps` from protected pages
2. Keep `usePermissions()` hook checks (client-side)
3. Keep API route protection
4. Keep database RLS policies

This is simpler and was the original architecture.

---

## 🧪 **Testing Checklist**

After implementing the fix:

- [ ] Superadmin can access all admin pages
- [ ] Company admin can access their pages
- [ ] Label admin can access their pages
- [ ] Artist can access their pages
- [ ] Users without permissions get redirected
- [ ] No console errors about sessions

---

## 📞 **If You Need Help**

The temporary bypass is in:
- File: `lib/serverSidePermissions.js`
- Lines: 40-71
- Look for: `// 🚨 TEMPORARY: Bypass ALL permission checks`

To disable bypass temporarily, comment out lines 40-71 and test.

---

**Status**: ✅ Currently working with bypass  
**Next**: Implement middleware solution before production




