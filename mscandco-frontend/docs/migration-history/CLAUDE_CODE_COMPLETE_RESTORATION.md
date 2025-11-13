# 🔧 **COMPLETE DATABASE RESTORATION GUIDE FOR CLAUDE CODE**

**SITUATION**: All 13 admin pages load but show no data because they lack proper database connections.

**YOUR TASK**: Restore REAL functionality to all admin pages by copying from originals in `_migrating_pages/`.

---

## 🎯 **RESTORATION PRIORITY ORDER**

### **CRITICAL (Restore First) - 4 Pages**
1. User Management
2. Earnings Management  
3. Wallet Management
4. Analytics Management

### **HIGH PRIORITY - 3 Pages**
5. Settings
6. Profile
7. Messages

### **MEDIUM PRIORITY - 6 Pages**
8. Requests
9. Asset Library
10. Split Configuration
11. Master Roster
12. Permissions
13. Platform Analytics

---

## 📋 **EXACT STEPS FOR EACH PAGE**

### **STEP 1: Read Original Implementation**

Find the original in `_migrating_pages/`:
- `usermanagement.js`
- `earningsmanagement.js`
- `walletmanagement.js`
- `analyticsmanagement.js`
- `settings.js`
- `profile.js` (might be in settings)
- `messages.js`
- `requests.js`
- `assetlibrary.js`
- `splitconfiguration.js`
- `masterroster.js`
- `permissions.js` (might be `permissionsroles.js`)
- `platformanalytics.js`

---

### **STEP 2: Understand Original's Database Calls**

Look for these patterns in original:

```javascript
// OLD PATTERN (API Routes):
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const data = await response.json()

// OR Direct Supabase (rare):
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

---

### **STEP 3: Create Client Component**

For EACH page, create: `app/admin/[pagename]/[PageName]Client.js`

**TEMPLATE:**

```javascript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// Import any components from original

export default function PageNameClient({ user }) {
  const supabase = createClient()

  // 1. COPY ALL STATE from original
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // ... copy ALL state variables

  // 2. LOAD DATA ON MOUNT
  useEffect(() => {
    if (user) loadData()
  }, [user])

  // 3. REPLACE API CALLS WITH DIRECT SUPABASE QUERIES
  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // CONVERT THIS:
      // const response = await fetch('/api/admin/users')
      // const data = await response.json()
      
      // TO THIS:
      const { data, error } = await supabase
        .from('user_profiles')  // Find table name from API route
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. ADD REAL-TIME SUBSCRIPTIONS (Optional but good)
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('data_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => loadData()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  // 5. COPY ALL HANDLER FUNCTIONS
  const handleCreate = async (newData) => {
    try {
      const { error } = await supabase
        .from('table_name')
        .insert(newData)
      
      if (error) throw error
      loadData()
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  const handleUpdate = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('table_name')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      loadData()
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    
    try {
      const { error } = await supabase
        .from('table_name')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      loadData()
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  // 6. COPY ENTIRE JSX/UI FROM ORIGINAL
  return (
    <div>
      {/* Copy ALL HTML/JSX from original page */}
      {/* Keep all styling classes */}
      {/* Keep all components */}
    </div>
  )
}
```

---

### **STEP 4: Update Page.js**

Update `app/admin/[pagename]/page.js`:

```javascript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageNameClient from './PageNameClient'

export default async function PageName() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <PageNameClient user={session.user} />
    </div>
  )
}
```

---

## 🗺️ **TABLE MAPPING GUIDE**

Here's what database tables each page uses:

| Page | Tables | Key Queries |
|------|--------|-------------|
| User Management | `user_profiles`, `roles` | SELECT users with roles, UPDATE role |
| Earnings Management | `earnings`, `user_profiles` | SELECT earnings, INSERT new earnings |
| Wallet Management | `transactions`, `user_profiles`, `payout_requests` | SELECT transactions, INSERT payouts |
| Analytics Management | Various | Uses `AdminAnalyticsInterface` component |
| Settings | `user_profiles` | SELECT user settings, UPDATE preferences |
| Profile | `user_profiles` | SELECT profile, UPDATE profile |
| Messages | `messages` | SELECT messages, INSERT new message |
| Requests | `change_requests`, `artist_requests` | SELECT requests, UPDATE status |
| Asset Library | Supabase Storage `assets` bucket | list(), upload(), remove() |
| Split Configuration | `revenue_splits` or `contracts` | SELECT splits, INSERT/UPDATE/DELETE |
| Master Roster | `user_profiles` | SELECT artists/labels |
| Permissions | `permissions`, `roles` | SELECT all, INSERT/UPDATE/DELETE |
| Platform Analytics | `user_profiles`, `earnings`, `releases` | Aggregate queries |

---

## 🔍 **HOW TO FIND THE RIGHT TABLE**

When you see an API route in original code:

```javascript
fetch('/api/admin/users')
```

1. Look for the API file: `pages/api/admin/users.js` (if it exists)
2. Inside that file, find the Supabase query
3. Copy the table name and query structure
4. Use it directly in your Client component

**If API file doesn't exist**, common table names:
- Users → `user_profiles`
- Earnings → `earnings`
- Messages → `messages`
- Transactions → `transactions`
- Requests → `change_requests` or `artist_requests`
- Settings → `user_profiles` (stored as JSON columns)

---

## 📝 **EXAMPLE: Restoring User Management**

### **1. Read Original**
File: `_migrating_pages/usermanagement.js`

### **2. Find Database Calls**
```javascript
// Lines 87-94 in original:
const [usersRes, rolesRes] = await Promise.all([
  fetch('/api/admin/users/list', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  fetch('/api/admin/roles/list', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
])
```

### **3. Convert to Direct Supabase**
```javascript
const loadData = async () => {
  setLoading(true)
  try {
    const [usersRes, rolesRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*, role:roles(name, display_name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('roles')
        .select('*')
        .order('name')
    ])

    if (usersRes.error) throw usersRes.error
    if (rolesRes.error) throw rolesRes.error

    setUsers(usersRes.data || [])
    setRoles(rolesRes.data || [])
  } catch (err) {
    console.error('Error:', err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

### **4. Copy Update Handler**
```javascript
// Original line 124-146 becomes:
const handleChangeRole = async (userId, newRoleId) => {
  try {
    setSaving(true)
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ role_id: newRoleId })
      .eq('id', userId)

    if (error) throw error
    
    await loadData() // Refresh
  } catch (err) {
    console.error('Error:', err)
    setError(err.message)
  } finally {
    setSaving(false)
  }
}
```

### **5. Copy ALL UI**
Copy the entire `return` block from original (lines 368-881)

---

## ⚡ **QUICK CONVERSION CHEAT SHEET**

### **API Route → Direct Query**

```javascript
// OLD:
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { users } = await response.json()

// NEW:
const { data: users, error } = await supabase
  .from('user_profiles')
  .select('*')
if (error) throw error
```

### **Router Import**
```javascript
// OLD:
import { useRouter } from 'next/router'

// NEW:
import { useRouter } from 'next/navigation'
```

### **Session/Token**
```javascript
// OLD:
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
// Use token in fetch headers

// NEW:
// No token needed! Supabase client handles auth automatically
```

---

## ✅ **TESTING CHECKLIST**

After restoring each page:

```bash
# 1. Page loads without errors
# 2. Data displays from database
# 3. Create/Add works
# 4. Edit/Update works  
# 5. Delete works
# 6. Search/Filter works
# 7. Real-time updates work (if added)
# 8. Error messages show properly
```

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue: "Table doesn't exist"**
- Check table name in Supabase dashboard
- Common names: `user_profiles`, `earnings`, `messages`, `transactions`

### **Issue: "Permission denied" (RLS Error)**
- Table has Row Level Security enabled
- Need to add RLS policy or use service role key for testing
- For testing: Disable RLS temporarily in Supabase dashboard

### **Issue: "Cannot read property 'map' of undefined"**
- Data might be null/undefined
- Add: `const items = data || []`
- Then: `items.map(...)`

### **Issue: "Module not found"**
- Component import path wrong
- Check if component exists in `components/` directory
- Use `@/components/...` for imports

---

## 💡 **PRO TIPS**

1. **Start with simplest page** (Settings or Profile)
2. **Test after each page** - Don't do all at once
3. **Copy UI exactly** - Don't redesign, just adapt
4. **Keep original logic** - If it worked before, keep it
5. **Add console.logs** - Debug data loading issues

---

## 🎯 **YOUR PROMPT FOR EACH PAGE**

Copy this template for Claude Code:

```
Restore the [PAGE NAME] admin page with REAL database connection:

1. Read original: _migrating_pages/[filename].js
2. Create: app/admin/[pagename]/[PageName]Client.js
3. Copy ALL state, functions, and UI from original
4. Convert API calls to direct Supabase queries using:
   - supabase.from('table_name').select('*')
   - supabase.from('table_name').insert(data)
   - supabase.from('table_name').update(data).eq('id', id)
   - supabase.from('table_name').delete().eq('id', id)
5. Add real-time subscription for live updates
6. Update page.js to render the Client component
7. Test that data loads and all CRUD operations work

Follow the pattern in CLAUDE_CODE_COMPLETE_RESTORATION.md
```

---

## 📊 **PROGRESS TRACKER**

Use this to track your progress:

```
Admin Pages Restoration:
[ ] 1. User Management
[ ] 2. Earnings Management
[ ] 3. Wallet Management
[ ] 4. Analytics Management
[ ] 5. Settings
[ ] 6. Profile
[ ] 7. Messages
[ ] 8. Requests
[ ] 9. Asset Library
[ ] 10. Split Configuration
[ ] 11. Master Roster
[ ] 12. Permissions
[ ] 13. Platform Analytics
```

---

**Start with User Management - it's the most critical and will teach you the pattern!**

Then do Earnings, Wallet, Settings, Profile, Messages in that order.

**Good luck! This will save you tons of money vs having me do it!** 💰


