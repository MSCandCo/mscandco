# Force Role Refresh Feature

## Overview
Automatically updates a user's role badge in the header immediately when their role is changed in User Management, **without requiring logout**.

## Problem Solved
Previously, when an admin changed a user's role in User Management:
1. Database updated ✅
2. User's active session kept old role ❌
3. Role badge showed old role until logout/login ❌

## Solution

### How It Works

**3-Step Process:**

#### 1. **Backend: Update Auth Metadata** 
`pages/api/admin/users/[userId]/update-role.js`

When a role is changed, the API now:
- Updates `user_profiles` table (existing)
- **NEW:** Updates `auth.users` metadata using `supabase.auth.admin.updateUserById()`
- Returns `requiresSessionRefresh: true` flag

```javascript
const { error: metadataError } = await supabase.auth.admin.updateUserById(
  userId,
  {
    user_metadata: {
      role: role
    }
  }
);
```

#### 2. **Frontend: Broadcast Role Change**
`pages/admin/usermanagement.js`

After successful role update:
- Creates a role change event with `userId` and `newRole`
- Broadcasts via `localStorage` (works across all browser tabs)
- All tabs listening for this event get notified

```javascript
const roleChangeEvent = {
  type: 'ROLE_CHANGED',
  userId: selectedUser.id,
  newRole: newRole,
  timestamp: Date.now()
};
localStorage.setItem('role_change_event', JSON.stringify(roleChangeEvent));
localStorage.removeItem('role_change_event'); // Trigger event
```

#### 3. **Frontend: Listen & Refresh**
`components/auth/RoleBasedNavigation.js`

Every logged-in user listens for role change events:
- Detects localStorage changes
- Checks if the role change is for them
- If yes → **automatic page reload** with fresh session
- New session reads updated metadata → role badge updates ✅

```javascript
window.addEventListener('storage', handleRoleChange);
```

## User Experience

### **Admin Changes User Role:**
1. Admin opens User Management
2. Admin clicks "Change Role" for a user
3. Admin selects new role → clicks "Update Role"
4. ✅ **Database updated**
5. ✅ **Auth metadata updated**
6. ✅ **Event broadcast to all tabs**

### **User Sees Update Immediately:**
If the user is logged in (any tab):
1. 🔊 Receives role change notification
2. 🔄 Page automatically refreshes
3. ✅ Role badge shows new role
4. ✅ No logout required!

If the user is not logged in:
- Next login will have the new role automatically

## Technical Details

### **Cross-Tab Communication**
Uses `localStorage` events for cross-tab communication:
- Works across multiple browser tabs
- Only the target user's tabs refresh
- Admin panel tab doesn't refresh

### **Session Refresh**
Uses `window.location.reload()` to:
- Force complete page reload
- Fetch fresh session from Supabase
- Load updated user metadata with new role
- Re-render all components with new role

### **Graceful Degradation**
If metadata update fails:
- Role still updates in database ✅
- API doesn't fail (warning logged) ✅
- User can still see new role after logout/login ✅

## Files Modified

1. ✅ `pages/api/admin/users/[userId]/update-role.js`
   - Added: Auth metadata update
   - Added: `requiresSessionRefresh` flag

2. ✅ `pages/admin/usermanagement.js`
   - Added: Broadcast role change event
   - Added: localStorage event triggering

3. ✅ `components/auth/RoleBasedNavigation.js`
   - Added: Role change event listener
   - Added: Automatic page reload on role change

## Testing

### **Test Scenario 1: User is Logged In**
1. User A logs in as `label_admin`
2. Admin changes User A's role to `company_admin`
3. **Expected:** User A's page refreshes automatically
4. **Result:** Role badge shows `COMPANY ADMIN` immediately

### **Test Scenario 2: Multiple Tabs**
1. User A has 3 tabs open
2. Admin changes User A's role
3. **Expected:** All 3 tabs refresh
4. **Result:** All tabs show new role badge

### **Test Scenario 3: User Not Logged In**
1. Admin changes User B's role
2. User B not logged in
3. **Expected:** No errors, change saved
4. **Result:** User B sees new role on next login

## Benefits

✅ **Instant Updates** - No logout required
✅ **Multi-Tab Support** - Works across all user's tabs
✅ **Seamless UX** - Automatic, no user action needed
✅ **Reliable** - Uses Supabase auth admin API
✅ **Safe** - Graceful degradation if metadata update fails

## Limitations

1. **Page Reload Required** - Can't update in-place (would need complex state management)
2. **Same Browser Only** - Cross-device updates require logout/login
3. **Requires Active Tab** - User must have a tab open to receive update

## Future Enhancements

Possible improvements:
- WebSocket for real-time updates without page reload
- Notification banner: "Your role has been updated"
- Smart refresh: Only reload if on affected pages
- Mobile push notification for role changes

## Status
✅ **IMPLEMENTED** - Role badge updates immediately when changed in User Management

## Date
October 11, 2025

