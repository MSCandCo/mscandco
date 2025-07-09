# 🎵 YHWH MSC ARTIST USER SETUP GUIDE

## 📋 Overview
This guide will help you create YHWH MSC artist users with proper role assignments and brand association through the Strapi admin interface.

## 🎯 YHWH MSC Artist Users to Create

### Artist 1
- **Username**: yhwh_artist1
- **Email**: artist1@yhwhmsc.com
- **Password**: Test@2025
- **Role**: Artist
- **Brand**: YHWH MSC
- **Stage Name**: YHWH Artist 1
- **First Name**: YHWH
- **Last Name**: Artist1

### Artist 2
- **Username**: yhwh_artist2
- **Email**: artist2@yhwhmsc.com
- **Password**: Test@2025
- **Role**: Artist
- **Brand**: YHWH MSC
- **Stage Name**: YHWH Artist 2
- **First Name**: YHWH
- **Last Name**: Artist2

## 🔐 STEP 1: ACCESS STRAPI ADMIN

### Open Strapi Admin
1. **Go to**: http://localhost:1337/admin
2. **Login** with existing admin credentials (if you have them)
3. **Or create initial admin** if this is your first time

## 👥 STEP 2: CREATE YHWH MSC ARTIST USERS

### Method 1: Through Strapi Admin Interface

#### 1. YHWH Artist 1
1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry"
3. **Fill in the form**:
   - **Username**: yhwh_artist1
   - **Email**: artist1@yhwhmsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: artist
   - **Brand**: YHWH MSC
   - **Stage Name**: YHWH Artist 1
   - **First Name**: YHWH
   - **Last Name**: Artist1
4. **Click**: "Save"

#### 2. YHWH Artist 2
1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry"
3. **Fill in the form**:
   - **Username**: yhwh_artist2
   - **Email**: artist2@yhwhmsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: artist
   - **Brand**: YHWH MSC
   - **Stage Name**: YHWH Artist 2
   - **First Name**: YHWH
   - **Last Name**: Artist2
4. **Click**: "Save"

### Method 2: Direct Database Insert (Alternative)

If the admin interface doesn't work, you can create users directly in the database:

```sql
-- Connect to the database
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_dev

-- Create YHWH Artist 1
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('yhwh_artist1', 'artist1@yhwhmsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'artist', 'YHWH MSC', 'YHWH Artist 1', 'YHWH', 'Artist1', NOW(), NOW());

-- Create YHWH Artist 2
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('yhwh_artist2', 'artist2@yhwhmsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'artist', 'YHWH MSC', 'YHWH Artist 2', 'YHWH', 'Artist2', NOW(), NOW());
```

## 🧪 STEP 3: TEST ARTIST CREATION

### Test Login
1. **Go to**: http://localhost:3000
2. **Click**: "Login"
3. **Test each artist**:
   - **YHWH Artist 1**: artist1@yhwhmsc.com / Test@2025
   - **YHWH Artist 2**: artist2@yhwhmsc.com / Test@2025

### Verify Brand Association
1. **Login as YHWH Artist 1**
2. **Check brand switching**: Should see YHWH MSC
3. **Login as YHWH Artist 2**
4. **Check brand switching**: Should see YHWH MSC

### Verify Artist Permissions
1. **Login as an artist**
2. **Check access to**:
   - Songs management
   - Projects creation
   - Stems upload
   - Artist profile
   - Analytics dashboard

## 🔧 STEP 4: TROUBLESHOOTING

### If Artists Don't Appear
1. **Check Strapi logs**:
   ```bash
   docker logs msc-co-backend --tail 20
   ```

2. **Check database**:
   ```bash
   docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username, role, brand FROM up_users WHERE brand = 'YHWH MSC';"
   ```

3. **Restart Strapi**:
   ```bash
   docker restart msc-co-backend
   ```

### If Login Fails
1. **Check password**: Ensure it's exactly "Test@2025"
2. **Check email**: Ensure no typos
3. **Check user status**: Ensure user is confirmed and not blocked
4. **Check role assignment**: Ensure artist role exists in Strapi

### If Brand Association Fails
1. **Check brand field**: Ensure "YHWH MSC" is exactly as specified
2. **Check role permissions**: Ensure artist role has access to brand-specific features
3. **Check frontend logic**: Ensure brand switching works correctly

## 📋 YHWH MSC ARTIST SUMMARY

### Created Artists
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| artist1@yhwhmsc.com | yhwh_artist1 | Artist | YHWH MSC | Test@2025 |
| artist2@yhwhmsc.com | yhwh_artist2 | Artist | YHWH MSC | Test@2025 |

### Access Information
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Database**: PostgreSQL (msc-co-postgres)

## 🎯 ARTIST-SPECIFIC FEATURES TO TEST

### Core Artist Features
1. **Song Management**
   - Upload songs
   - Edit song metadata
   - View song analytics

2. **Project Creation**
   - Create new projects
   - Manage project collaborators
   - Track project progress

3. **Stem Management**
   - Upload stems
   - Organize stem collections
   - Share stems with collaborators

4. **Analytics Dashboard**
   - View streaming statistics
   - Track revenue
   - Monitor performance metrics

5. **Profile Management**
   - Update artist profile
   - Manage social media links
   - Upload artist photos

### Brand-Specific Features
1. **YHWH MSC Branding**
   - Verify brand logo appears
   - Check brand-specific styling
   - Confirm brand messaging

2. **Role-Based Access**
   - Verify artist permissions
   - Test feature restrictions
   - Check admin vs artist views

## 🎯 NEXT STEPS

After creating the YHWH MSC artist users:

1. **Test all artist logins**
2. **Verify brand association (YHWH MSC)**
3. **Check artist role permissions**
4. **Test artist-specific features**
5. **Add sample artist data through Strapi admin**
6. **Test the full artist workflow**

## 🔗 QUICK COMMANDS

### Check Artist Status
```bash
# Check if artists exist in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username, role, brand FROM up_users WHERE brand = 'YHWH MSC';"

# Check Strapi status
curl -s http://localhost:1337/admin | head -5

# Check frontend status
curl -s http://localhost:3000 | head -5
```

### Restart Services
```bash
# Restart backend
docker restart msc-co-backend

# Restart frontend
docker restart msc-co-frontend

# Check all containers
docker ps
```

---

**🎵 Your YHWH MSC artist users are ready for revolutionary music creation!** 