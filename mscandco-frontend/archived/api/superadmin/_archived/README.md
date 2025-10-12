# Super Admin API Routes Archive

**Date Archived:** October 6, 2025
**Reason:** Systematic rebuild alongside frontend pages
**Parent Directory:** `/pages/api/superadmin/`

---

## 📦 Archived API Routes (4 files)

### 1. create-user.js (5.7KB)
**Endpoint:** `POST /api/superadmin/create-user`

**Purpose:** Create new user accounts with specified roles

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "artist|label_admin|company_admin|distribution_partner",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

**Features:**
- User creation with role assignment
- Password hashing
- Email validation
- Profile setup

**Dependencies:**
- Supabase Auth
- RBAC middleware

---

### 2. revenue-reports.js (3.5KB)
**Endpoint:** `GET /api/superadmin/revenue-reports`

**Purpose:** Generate revenue and financial reports

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-12-31&format=json
```

**Features:**
- Date range filtering
- Multiple format support (JSON, CSV)
- Aggregated revenue data
- Per-user breakdown

**Dependencies:**
- Financial data tables
- Aggregation functions

---

### 3. subscriptions.js (1.9KB)
**Endpoint:** `GET /api/superadmin/subscriptions`

**Purpose:** List and manage all user subscriptions

**Features:**
- List all subscriptions
- Filter by status (active/inactive)
- Subscription details
- Plan information

**Dependencies:**
- Subscription tables
- Plan definitions

---

### 4. update-subscription.js (1.3KB)
**Endpoint:** `PUT /api/superadmin/update-subscription`

**Purpose:** Update user subscription details

**Request Body:**
```json
{
  "userId": "uuid",
  "subscriptionId": "uuid",
  "status": "active|cancelled|paused",
  "planId": "uuid"
}
```

**Features:**
- Subscription status updates
- Plan changes
- Admin override capabilities

**Dependencies:**
- Subscription tables
- Billing system

---

## 🔄 Restoration

### Restore All API Routes:
```bash
mv pages/api/superadmin/_archived/*.js pages/api/superadmin/
```

### Restore Single Route:
```bash
# Example: Restore create-user
mv pages/api/superadmin/_archived/create-user.js pages/api/superadmin/
```

### After Restoration:
1. Test API endpoint with Postman/curl
2. Verify middleware protection
3. Update frontend to consume the endpoint
4. Document any changes needed

---

## 🧪 Testing Archived Routes

### Testing create-user:
```bash
curl -X POST http://localhost:3013/api/superadmin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "artist",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Testing revenue-reports:
```bash
curl -X GET "http://localhost:3013/api/superadmin/revenue-reports?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔒 Security Considerations

All archived routes include:
- ✅ RBAC middleware protection
- ✅ Authentication required
- ✅ Super Admin role verification
- ✅ Input validation
- ✅ Error handling

**Middleware Used:**
```javascript
import { requirePermission } from '@/lib/rbac/middleware';
export default requirePermission('permission:name')(handler);
```

---

## 📊 Archive Statistics

| Metric | Value |
|--------|-------|
| Total Routes | 4 |
| Combined Size | ~12KB |
| POST Endpoints | 2 |
| GET Endpoints | 1 |
| PUT Endpoints | 1 |

---

## 🔗 Related Files

**Frontend Pages (also archived):**
- `/pages/superadmin/_archived/dashboard.js`
- `/pages/superadmin/_archived/users.js`
- `/pages/superadmin/_archived/subscriptions.js`

**Active Ghost Login:**
- `/pages/api/admin/ghost-login.js` (NOT archived)

**Documentation:**
- `/pages/superadmin/_archived/MANIFEST.md`
- `/PROFILE_CHANGE_REQUEST_AUDIT.md`

---

**Archive Status:** ✅ COMPLETE
**Last Updated:** October 6, 2025
