# 📋 **INSTRUCTIONS FOR CLAUDE CODE**

Copy and paste this to Claude Code when restoring pages:

---

## 🎯 **CONTEXT**

I have a Next.js 15 App Router project with:
- ✅ All 40 pages created with basic structure
- ✅ 13 admin pages with FULL functionality (use as templates)
- ✅ 27 pages with skeleton structure (need restoration)
- ✅ All original implementations in `_migrating_pages/` directory
- ✅ Complete component library (86+ components)
- ✅ Full styling system ready

---

## 🔧 **YOUR TASK**

Restore full functionality to skeleton pages one by one.

### **Example: Restoring Artist Dashboard**

**Step 1: Read the original implementation**
```
File: _migrating_pages/artist-dashboard.js
```

**Step 2: Create Client Component**
```
File: app/artist/dashboard/ArtistDashboardClient.js
```

**Step 3: Copy this template:**
```javascript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// Import any components you need from components/

export default function ArtistDashboardClient({ user }) {
  const supabase = createClient()

  // Copy state from original page
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Copy useEffect logic from original
  useEffect(() => {
    loadData()
  }, [])

  // Replace API calls with direct Supabase queries
  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
      
      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Copy all the JSX/UI from original page
  return (
    <div>
      {/* Copy HTML structure from original */}
    </div>
  )
}
```

**Step 4: Update the page.js**
```javascript
// app/artist/dashboard/page.js
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ArtistDashboardClient from './ArtistDashboardClient'

export default async function ArtistDashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ArtistDashboardClient user={session.user} />
    </div>
  )
}
```

---

## 🎨 **USE THESE FULLY FUNCTIONAL EXAMPLES**

Look at these for reference:
1. `app/admin/walletmanagement/WalletManagementClient.js` - Best example!
2. `app/admin/usermanagement/UserManagementClient.js`
3. `app/admin/earningsmanagement/EarningsManagementClient.js`

---

## 🔄 **KEY CHANGES TO MAKE**

### **1. Replace API Calls**
❌ **OLD (Pages Router):**
```javascript
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const data = await response.json()
```

✅ **NEW (App Router):**
```javascript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
```

### **2. Update Router Imports**
❌ **OLD:**
```javascript
import { useRouter } from 'next/router'
```

✅ **NEW:**
```javascript
import { useRouter } from 'next/navigation'
```

### **3. Add 'use client' Directive**
Always add at the top of Client Components:
```javascript
'use client'
```

### **4. Add Real-time Subscriptions (Optional but Nice)**
```javascript
useEffect(() => {
  const channel = supabase
    .channel('table_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'table_name' },
      () => loadData()
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

---

## 📋 **RESTORATION ORDER**

Do them in this order (most important first):

### **Priority 1: Artist Pages**
1. `/artist/dashboard`
2. `/artist/releases`
3. `/artist/earnings`
4. `/artist/analytics`
5. `/artist/roster`
6. `/artist/messages`
7. `/artist/settings`
8. `/artist/profile`

### **Priority 2: Label Admin Pages**
1. `/labeladmin/dashboard`
2. `/labeladmin/artists`
3. `/labeladmin/releases`
4. `/labeladmin/roster`
5. `/labeladmin/analytics`
6. `/labeladmin/earnings`
7. `/labeladmin/messages`
8. `/labeladmin/settings`

### **Priority 3: Distribution & Superadmin**
- Distribution pages (4)
- Superadmin pages (4)

### **Priority 4: Core**
- `/dashboard` (main)

---

## ✅ **TESTING CHECKLIST**

For each page you restore:
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] All buttons work
- [ ] Forms submit properly
- [ ] Modals open/close
- [ ] Search/filter works
- [ ] Styling looks good
- [ ] Mobile responsive

---

## 💡 **TIPS**

1. **Copy UI exactly** - Don't redesign, just copy the HTML/JSX
2. **Use existing components** - They're all in `components/` directory
3. **Keep it simple** - Direct Supabase queries, no API routes
4. **Test as you go** - Restore one page, test it, move to next
5. **Use Tailwind classes** - They're already configured

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue: "cookies() should be awaited"**
This is just a warning in development. Pages still work. You can ignore it.

### **Issue: Component not found**
Make sure to import from the correct path:
```javascript
import { Button } from '@/components/ui/button'
```

### **Issue: Supabase query fails**
Check:
1. Table name is correct
2. Column names match database
3. User has permission (RLS policies)

---

## 📝 **EXAMPLE PROMPT FOR EACH PAGE**

Use this template when asking me to restore a page:

```
Restore the [PAGE NAME] page:

1. Read the original from: _migrating_pages/[original-file].js
2. Create: app/[section]/[page]/[PageName]Client.js
3. Copy all UI and functionality
4. Replace API calls with direct Supabase queries
5. Update the page.js to use the Client component
6. Test that it works

Follow the pattern from app/admin/walletmanagement/WalletManagementClient.js
```

---

## 🎯 **READY TO START?**

Just tell me: **"Restore the artist dashboard page"** and I'll do it!

Then we'll go through all pages one by one until they're all complete.

---

**The foundation is perfect. Now it's just copying and adapting! 🚀**






