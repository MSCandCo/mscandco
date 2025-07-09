# 🎵 REMAINING USER ACCOUNTS SETUP GUIDE

## 📋 Overview
This guide will help you create the remaining user accounts for Audio MSC artists and distribution partners with proper role assignments and brand associations through the Strapi admin interface.

## 🎯 Remaining Users to Create

### AUDIO MSC ARTISTS

#### Audio Artist 1
- **Username**: audio_artist1
- **Email**: artist1@audiomsc.com
- **Password**: Test@2025
- **Role**: Artist
- **Brand**: Audio MSC
- **Stage Name**: Audio Artist 1
- **First Name**: Audio
- **Last Name**: Artist1

#### Audio Artist 2
- **Username**: audio_artist2
- **Email**: artist2@audiomsc.com
- **Password**: Test@2025
- **Role**: Artist
- **Brand**: Audio MSC
- **Stage Name**: Audio Artist 2
- **First Name**: Audio
- **Last Name**: Artist2

### DISTRIBUTION PARTNERS

#### Distribution Admin
- **Username**: dist_admin
- **Email**: distadmin@mscandco.com
- **Password**: Test@2025
- **Role**: Distribution Partner Admin
- **Brand**: MSC & Co
- **Stage Name**: Distribution Admin
- **First Name**: Distribution
- **Last Name**: Admin

#### Distributor 1
- **Username**: distributor1
- **Email**: distributor1@mscandco.com
- **Password**: Test@2025
- **Role**: Distributor
- **Brand**: MSC & Co
- **Stage Name**: Distributor 1
- **First Name**: Distributor
- **Last Name**: One

## 🔐 STEP 1: ACCESS STRAPI ADMIN

### Open Strapi Admin
1. **Go to**: http://localhost:1337/admin
2. **Login** with existing admin credentials
3. **Navigate to**: Content Manager → Users

## 👥 STEP 2: CREATE REMAINING USERS

### Method 1: Through Strapi Admin Interface

#### 1. Audio Artist 1
1. **Click**: "Create new entry"
2. **Fill in the form**:
   - **Username**: audio_artist1
   - **Email**: artist1@audiomsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: artist
   - **Brand**: Audio MSC
   - **Stage Name**: Audio Artist 1
   - **First Name**: Audio
   - **Last Name**: Artist1
3. **Click**: "Save"

#### 2. Audio Artist 2
1. **Click**: "Create new entry"
2. **Fill in the form**:
   - **Username**: audio_artist2
   - **Email**: artist2@audiomsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: artist
   - **Brand**: Audio MSC
   - **Stage Name**: Audio Artist 2
   - **First Name**: Audio
   - **Last Name**: Artist2
3. **Click**: "Save"

#### 3. Distribution Admin
1. **Click**: "Create new entry"
2. **Fill in the form**:
   - **Username**: dist_admin
   - **Email**: distadmin@mscandco.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: distribution_partner_admin
   - **Brand**: MSC & Co
   - **Stage Name**: Distribution Admin
   - **First Name**: Distribution
   - **Last Name**: Admin
3. **Click**: "Save"

#### 4. Distributor 1
1. **Click**: "Create new entry"
2. **Fill in the form**:
   - **Username**: distributor1
   - **Email**: distributor1@mscandco.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: distributor
   - **Brand**: MSC & Co
   - **Stage Name**: Distributor 1
   - **First Name**: Distributor
   - **Last Name**: One
3. **Click**: "Save"

### Method 2: Direct Database Insert (Alternative)

If the admin interface doesn't work, you can create users directly in the database:

```sql
-- Connect to the database
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_dev

-- Create Audio Artist 1
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('audio_artist1', 'artist1@audiomsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'artist', 'Audio MSC', 'Audio Artist 1', 'Audio', 'Artist1', NOW(), NOW());

-- Create Audio Artist 2
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('audio_artist2', 'artist2@audiomsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'artist', 'Audio MSC', 'Audio Artist 2', 'Audio', 'Artist2', NOW(), NOW());

-- Create Distribution Admin
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('dist_admin', 'distadmin@mscandco.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'distribution_partner_admin', 'MSC & Co', 'Distribution Admin', 'Distribution', 'Admin', NOW(), NOW());

-- Create Distributor 1
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('distributor1', 'distributor1@mscandco.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'distributor', 'MSC & Co', 'Distributor 1', 'Distributor', 'One', NOW(), NOW());
```

## 🧪 STEP 3: TEST USER CREATION

### Test Login
1. **Go to**: http://localhost:3000
2. **Click**: "Login"
3. **Test each user**:

#### Audio MSC Artists
- **Audio Artist 1**: artist1@audiomsc.com / Test@2025
- **Audio Artist 2**: artist2@audiomsc.com / Test@2025

#### Distribution Partners
- **Distribution Admin**: distadmin@mscandco.com / Test@2025
- **Distributor 1**: distributor1@mscandco.com / Test@2025

### Verify Brand Association
1. **Login as Audio Artist 1/2**
   - **Check brand switching**: Should see Audio MSC
2. **Login as Distribution Admin/Distributor 1**
   - **Check brand switching**: Should see MSC & Co

### Verify Role Permissions

#### Artist Permissions
- Songs management
- Projects creation
- Stems upload
- Artist profile
- Analytics dashboard

#### Distribution Partner Permissions
- Distribution management
- Partner analytics
- Revenue tracking
- Partner profile
- Distribution reports

## 🔧 STEP 4: TROUBLESHOOTING

### If Users Don't Appear
1. **Check Strapi logs**:
   ```bash
   docker logs msc-co-backend --tail 20
   ```

2. **Check database**:
   ```bash
   docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username, role, brand FROM up_users ORDER BY created_at DESC LIMIT 10;"
   ```

3. **Restart Strapi**:
   ```bash
   docker restart msc-co-backend
   ```

### If Login Fails
1. **Check password**: Ensure it's exactly "Test@2025"
2. **Check email**: Ensure no typos
3. **Check user status**: Ensure user is confirmed and not blocked
4. **Check role assignment**: Ensure roles exist in Strapi

### If Brand Association Fails
1. **Check brand field**: Ensure brand names are exactly as specified
2. **Check role permissions**: Ensure roles have access to brand-specific features
3. **Check frontend logic**: Ensure brand switching works correctly

## 📋 COMPLETE USER SUMMARY

### All Created Users
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| superadmin@mscandco.com | superadmin | Super Admin | MSC & Co | Test@2025 |
| admin@yhwhmsc.com | yhwh_admin | Company Admin | YHWH MSC | Test@2025 |
| admin@audiomsc.com | audio_admin | Company Admin | Audio MSC | Test@2025 |
| artist1@yhwhmsc.com | yhwh_artist1 | Artist | YHWH MSC | Test@2025 |
| artist2@yhwhmsc.com | yhwh_artist2 | Artist | YHWH MSC | Test@2025 |
| artist1@audiomsc.com | audio_artist1 | Artist | Audio MSC | Test@2025 |
| artist2@audiomsc.com | audio_artist2 | Artist | Audio MSC | Test@2025 |
| distadmin@mscandco.com | dist_admin | Distribution Partner Admin | MSC & Co | Test@2025 |
| distributor1@mscandco.com | distributor1 | Distributor | MSC & Co | Test@2025 |

### Access Information
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Database**: PostgreSQL (msc-co-postgres)

## 🎯 ROLE-SPECIFIC FEATURES TO TEST

### Artist Features
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

### Distribution Partner Features
1. **Distribution Management**
   - Manage distribution channels
   - Track distribution metrics
   - Monitor partner performance

2. **Partner Analytics**
   - View partner statistics
   - Track distribution revenue
   - Monitor partner activities

3. **Distribution Reports**
   - Generate distribution reports
   - View partner analytics
   - Track distribution performance

## 🎯 NEXT STEPS

After creating all remaining users:

1. **Test all user logins**
2. **Verify brand associations**
3. **Check role-based permissions**
4. **Test role-specific features**
5. **Add sample data through Strapi admin**
6. **Test the complete platform workflow**

## 🔗 QUICK COMMANDS

### Check User Status
```bash
# Check all users in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username, role, brand FROM up_users ORDER BY created_at DESC;"

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

**🎵 Your complete MSC & Co user ecosystem is ready for revolutionary music distribution!** 