# Label Admin Role - Complete Clarification

## Critical Understanding

### **Label Admin is NOT a Platform Admin!**

Label admins are **content creators** like artists, but they manage multiple artists under their label. They should NEVER have access to platform admin pages.

---

## Role Comparison

### **Artist**
- Manages their own content
- Sees their own releases, analytics, earnings
- Has 4 navigation items: Releases, Analytics, Earnings, Roster

### **Label Admin**
- Manages multiple artists under their label
- Sees aggregated data from all their artists
- Has 5 navigation items: **My Artists**, Releases, Analytics, Earnings, Roster
- **Uses the SAME header as artists** (standard header, not admin header)

### **Platform Admins** (Super Admin, Company Admin, etc.)
- Manage the platform itself
- Have access to admin pages (user management, platform analytics, etc.)
- Use the AdminHeader

---

## Label Admin Pages

### **1. My Artists** (`/labeladmin/artists`)
- **Purpose:** Manage artists they collaborate with
- **Features:**
  - View list of artists in their label
  - Invite new artists to collaborate
  - Manage artist relationships
  - View artist status and activity

### **2. Releases** (`/labeladmin/releases`)
- **Purpose:** View and manage releases from ALL their artists
- **Features:**
  - See releases from multiple artists
  - Filter by artist
  - Manage release status
  - Same interface as artist releases, but aggregated

### **3. Analytics** (`/labeladmin/analytics`)
- **Purpose:** View analytics across all their artists
- **Features:**
  - Each artist has a separate tab
  - System generates a "Combined" tab showing aggregated data
  - Can switch between individual artist analytics and combined view
  - Same analytics interface as artists, but with multi-artist support

### **4. Earnings** (`/labeladmin/earnings`)
- **Purpose:** View earnings from all their artists
- **Features:**
  - Earnings governed by split configuration
  - Label admin earns according to their split percentage
  - Can see breakdown by artist
  - Can see total label earnings
  - Same earnings interface as artists, but with split-based calculations

### **5. Roster** (`/labeladmin/roster`)
- **Purpose:** Manage their label roster
- **Features:**
  - View all artists in the label
  - Manage collaborations
  - View artist performance
  - Same roster interface as artists

---

## Permissions

### **Label Admin Permissions (31 total)**

#### **Page Access (9) - SAME AS ARTIST**
- `analytics:access`
- `earnings:access`
- `releases:access`
- `roster:access`
- `profile:access`
- `platform:access`
- `messages:access`
- `settings:access`
- `dashboard:access`

#### **Message Tabs (4) - SAME AS ARTIST**
- `messages:invitations:view`
- `messages:earnings:view`
- `messages:payouts:view`
- `messages:system:view`

#### **Settings Tabs (7) - SAME AS ARTIST**
- `settings:preferences:edit`
- `settings:security:edit`
- `settings:notifications:edit`
- `settings:billing:view`
- `settings:billing:edit`
- `settings:api_keys:view`
- `settings:api_keys:manage`

#### **Analytics Tabs (2) - SAME AS ARTIST**
- `analytics:basic:view`
- `analytics:advanced:view`

#### **Own User Permissions (4) - SAME AS ARTIST**
- `user:read:own`
- `user:update:own`
- `notification:read:own`
- `message:read:own`

#### **Label-Specific Permissions (6) - UNIQUE TO LABEL ADMIN**
- `label:read:own` - Read own label information
- `label:update:own` - Update own label information
- `label:roster:read:own` - Read own label roster (My Artists)
- `label:roster:manage:own` - Manage own label roster (My Artists)
- `artist:invite:label` - Invite artists to collaborate
- `artist:manage:label` - Manage artists in label

### **What Label Admin CANNOT Access**

❌ **User Management** - No access to platform user management  
❌ **Analytics Management** - No access to admin analytics tools  
❌ **Platform Analytics** - No access to platform-wide analytics  
❌ **Earnings Management** - No access to admin earnings tools  
❌ **Wallet Management** - No access to admin wallet tools  
❌ **Split Configuration** - No access to admin split settings  
❌ **Asset Library** - No access to admin asset management  
❌ **Master Roster** - No access to platform-wide roster  
❌ **Requests** - No access to admin request management  
❌ **Permissions & Roles** - No access to RBAC management  
❌ **Ghost Mode** - No impersonation abilities  
❌ **Distribution Hub** - No access to distribution partner tools  
❌ **Revenue Reporting** - No access to distribution partner tools  

---

## Header Navigation

### **Label Admin Header (Standard Header)**
```
[MSC Logo] | My Artists | Releases | Analytics | Earnings | Roster | [Wallet] [User Dropdown]
```

**5 navigation items - all standalone, no dropdowns**

### **NOT This (Admin Header):**
```
[MSC Logo] | [User & Access ▼] | [Analytics ▼] | [Finance ▼] | ... | [User Dropdown]
```

---

## Database Changes

### **Files Modified:**

1. ✅ `components/header.js`
   - Removed `labeladmin` from `adminRoles` array
   - Label admins now use standard header

2. ✅ `database/migrations/create_rbac_system.sql`
   - Updated label_admin permissions to match artist + label-specific
   - Removed broad "label" and "own" scope assignment

3. ✅ `database/fix-label-admin-permissions-final.sql`
   - Fix script for existing installations
   - Removes all existing permissions
   - Adds only the correct 31 permissions

---

## Migration Instructions

### **For Existing Installations:**

Run this SQL script in Supabase SQL Editor:
```sql
-- File: database/fix-label-admin-permissions-final.sql
```

This will:
1. ✅ Remove all existing label_admin permissions
2. ✅ Add only the correct 31 permissions (artist + label-specific)
3. ✅ Verify no admin permissions are present
4. ✅ Show permission comparison with artist role

### **For Fresh Installations:**

✅ The main RBAC migration file has been updated with the correct defaults.

---

## Testing Checklist

When logged in as label_admin:

### **Header:**
- [ ] Uses standard header (NOT admin header)
- [ ] Shows 5 navigation items: My Artists, Releases, Analytics, Earnings, Roster
- [ ] All items are standalone links (no dropdowns)

### **Access:**
- [ ] Can access `/labeladmin/artists` (My Artists)
- [ ] Can access `/labeladmin/releases`
- [ ] Can access `/labeladmin/analytics`
- [ ] Can access `/labeladmin/earnings`
- [ ] Can access `/labeladmin/roster`
- [ ] Can access profile, messages, settings via dropdown

### **Restrictions:**
- [ ] CANNOT access `/admin/*` pages
- [ ] CANNOT access `/distribution/*` pages
- [ ] CANNOT access user management
- [ ] CANNOT access platform analytics
- [ ] CANNOT see admin navigation dropdowns

---

## Key Differences from Artist

| Feature | Artist | Label Admin |
|---------|--------|-------------|
| **Navigation Items** | 4 | 5 (adds "My Artists") |
| **Releases View** | Own releases only | All label artists' releases |
| **Analytics View** | Own analytics | Tabbed view (per artist + combined) |
| **Earnings View** | Own earnings | Split-based earnings from all artists |
| **Roster View** | Own roster | Label roster |
| **Permissions** | 25 | 31 (adds 6 label-specific) |
| **Header Type** | Standard | Standard (SAME) |
| **Admin Access** | ❌ No | ❌ No |

---

## Summary

**Label Admin = Artist + Multi-Artist Management**

They are NOT platform administrators. They are content creators who happen to manage multiple artists under their label. They should never see or access admin pages.

---

**Status:** ✅ COMPLETE - Label admin role correctly configured as non-admin with standard header and artist-like permissions.

