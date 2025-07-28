# 🎵 MSC & Co Music Platform Role Management

## 🎯 OBJECTIVE
Create a clean, music industry-specific role structure for the MSC & Co platform by:
- Creating 5 music platform roles
- Removing unnecessary default Strapi roles
- Setting up proper permissions for each role

## 📋 FINAL ROLE STRUCTURE

### ✅ ROLES TO CREATE (5 total):

#### 1. **Super Admin**
- **Purpose:** Full platform management and administration
- **Type:** super-admin
- **Permissions:** Full access to everything
- **Users:** Platform administrators

#### 2. **Company Admin**
- **Purpose:** Manages YHWH MSC or Audio MSC brand operations
- **Type:** company-admin
- **Permissions:** Full brand management, content creation, analytics
- **Users:** Brand managers, company executives

#### 3. **Artist**
- **Purpose:** Creates and manages songs, projects, collaborations
- **Type:** artist
- **Permissions:** Content creation, limited analytics, collaboration tools
- **Users:** Musicians, producers, content creators

#### 4. **Distribution Partner Admin**
- **Purpose:** Manages distribution partnerships and operations
- **Type:** distribution-admin
- **Permissions:** Distribution management, export tools, partnership analytics
- **Users:** Distribution partners, label managers

#### 5. **Distributor**
- **Purpose:** Handles distribution operations and logistics
- **Type:** distributor
- **Permissions:** Distribution operations, export tools, limited analytics
- **Users:** Distribution staff, logistics coordinators

### ❌ ROLES TO REMOVE:
- **Author** (not needed for music platform)
- **Editor** (not needed for music platform)

## 🔧 MANUAL SETUP INSTRUCTIONS

### STEP 1: Access Strapi Admin
1. Go to **http://localhost:1337/admin**
2. Log in with your admin credentials

### STEP 2: Navigate to Roles
1. Click **"Settings"** in the left sidebar
2. Under **"USERS & PERMISSIONS"**, click **"Roles"**

### STEP 3: Create New Roles

#### Create "Company Admin" Role:
1. Click **"Create new role"**
2. Fill in:
   - **Name:** Company Admin
   - **Description:** Manages YHWH MSC or Audio MSC brand operations
   - **Type:** company-admin
3. Click **"Save"**

#### Create "Artist" Role:
1. Click **"Create new role"**
2. Fill in:
   - **Name:** Artist
   - **Description:** Creates and manages songs, projects, collaborations
   - **Type:** artist
3. Click **"Save"**

#### Create "Distribution Partner Admin" Role:
1. Click **"Create new role"**
2. Fill in:
   - **Name:** Distribution Partner Admin
   - **Description:** Manages distribution partnerships and operations
   - **Type:** distribution-admin
3. Click **"Save"**

#### Create "Distributor" Role:
1. Click **"Create new role"**
2. Fill in:
   - **Name:** Distributor
   - **Description:** Handles distribution operations and logistics
   - **Type:** distributor
3. Click **"Save"**

### STEP 4: Set Up Permissions

For each role, click on it and configure permissions:

#### Company Admin Permissions:
- ✅ **Song:** Create, Find, FindOne, Update, Delete
- ✅ **Project:** Create, Find, FindOne, Update, Delete
- ✅ **Artist:** Create, Find, FindOne, Update, Delete
- ✅ **Creation:** Create, Find, FindOne, Update, Delete
- ✅ **Playlist:** Create, Find, FindOne, Update, Delete
- ✅ **Lyric:** Create, Find, FindOne, Update, Delete
- ✅ **Stem:** Create, Find, FindOne, Update, Delete
- ✅ **Export:** Create, Find, FindOne, Update, Delete
- ✅ **Download History:** Create, Find, FindOne, Update, Delete
- ✅ **Monthly Statement:** Create, Find, FindOne, Update, Delete
- ✅ **AI Insight:** Create, Find, FindOne, Update, Delete
- ✅ **Artist Performance:** Create, Find, FindOne, Update, Delete
- ✅ **Artist Journey:** Create, Find, FindOne, Update, Delete
- ✅ **Collaboration:** Create, Find, FindOne, Update, Delete
- ✅ **Communication:** Create, Find, FindOne, Update, Delete
- ✅ **Referral Network:** Create, Find, FindOne, Update, Delete
- ✅ **Workflow Trigger:** Create, Find, FindOne, Update, Delete
- ✅ **Code Group Integration:** Create, Find, FindOne, Update, Delete

#### Artist Permissions:
- ✅ **Song:** Create, Find, FindOne, Update
- ❌ **Song:** Delete
- ✅ **Project:** Create, Find, FindOne, Update
- ❌ **Project:** Delete
- ✅ **Creation:** Create, Find, FindOne, Update
- ❌ **Creation:** Delete
- ✅ **Playlist:** Create, Find, FindOne, Update
- ❌ **Playlist:** Delete
- ✅ **Lyric:** Create, Find, FindOne, Update
- ❌ **Lyric:** Delete
- ✅ **Stem:** Create, Find, FindOne, Update
- ❌ **Stem:** Delete
- ✅ **Download History:** Create, Find, FindOne
- ❌ **Download History:** Update, Delete
- ❌ **Monthly Statement:** Create, Update, Delete
- ✅ **Monthly Statement:** Find, FindOne
- ❌ **AI Insight:** Create, Update, Delete
- ✅ **AI Insight:** Find, FindOne
- ❌ **Artist Performance:** Create, Update, Delete
- ✅ **Artist Performance:** Find, FindOne
- ✅ **Artist Journey:** Create, Find, FindOne, Update
- ❌ **Artist Journey:** Delete
- ✅ **Collaboration:** Create, Find, FindOne, Update
- ❌ **Collaboration:** Delete
- ✅ **Communication:** Create, Find, FindOne, Update
- ❌ **Communication:** Delete

#### Distribution Partner Admin Permissions:
- ❌ **Project:** Create, Delete
- ✅ **Project:** Find, FindOne, Update
- ❌ **Creation:** Create, Delete
- ✅ **Creation:** Find, FindOne, Update
- ✅ **Export:** Create, Find, FindOne, Update, Delete
- ✅ **Download History:** Create, Find, FindOne, Update, Delete
- ✅ **Monthly Statement:** Create, Find, FindOne, Update, Delete
- ✅ **Referral Network:** Create, Find, FindOne, Update, Delete
- ✅ **Workflow Trigger:** Create, Find, FindOne, Update, Delete
- ✅ **Code Group Integration:** Create, Find, FindOne, Update, Delete

#### Distributor Permissions:
- ❌ **Project:** Create, Update, Delete
- ✅ **Project:** Find, FindOne
- ❌ **Creation:** Create, Update, Delete
- ✅ **Creation:** Find, FindOne
- ✅ **Export:** Create, Find, FindOne, Update
- ❌ **Export:** Delete
- ✅ **Download History:** Create, Find, FindOne, Update
- ❌ **Download History:** Delete
- ❌ **Monthly Statement:** Create, Update, Delete
- ✅ **Monthly Statement:** Find, FindOne
- ✅ **Referral Network:** Create, Find, FindOne, Update
- ❌ **Referral Network:** Delete

### STEP 5: Remove Unnecessary Roles

#### Delete "Author" Role:
1. Find the **"Author"** role in the list
2. Click the **trash icon** next to it
3. Confirm deletion

#### Delete "Editor" Role:
1. Find the **"Editor"** role in the list
2. Click the **trash icon** next to it
3. Confirm deletion

## ✅ VERIFICATION CHECKLIST

After completing the role setup:

- [ ] All 5 music platform roles created
- [ ] Super Admin role exists and has full permissions
- [ ] Company Admin role has brand management permissions
- [ ] Artist role has content creation permissions (no delete)
- [ ] Distribution Partner Admin role has distribution permissions
- [ ] Distributor role has operations permissions
- [ ] Author role deleted
- [ ] Editor role deleted
- [ ] No users assigned to deleted roles
- [ ] Role permissions properly configured

## 🎯 NEXT STEPS

After role setup is complete:

1. **Create test users** with each role
2. **Test role-based access** at http://localhost:3000
3. **Verify brand switching** works for different roles
4. **Test content creation** with appropriate permissions
5. **Verify analytics access** based on role permissions

## 🚨 TROUBLESHOOTING

### If Role Creation Fails:
- Check if you have Super Admin permissions
- Verify Strapi admin is accessible
- Try refreshing the admin panel

### If Permissions Don't Work:
- Double-check permission settings for each role
- Verify API endpoints match the permissions
- Test with different user accounts

### If Users Can't Access Features:
- Check user role assignment
- Verify brand associations
- Test with different browsers/incognito mode

## 🎉 COMPLETION

Once all roles are created and configured:

1. **Test the platform** with different user types
2. **Verify brand-specific access** (YHWH MSC vs Audio MSC)
3. **Test content creation** and management
4. **Verify analytics and reporting** access
5. **Test distribution features** and export tools

The platform will now have a clean, music industry-specific role structure ready for comprehensive testing! 