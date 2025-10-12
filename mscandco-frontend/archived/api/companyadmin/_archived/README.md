# Company Admin API Routes Archive

**Date Archived:** October 6, 2025
**Reason:** Systematic rebuild alongside frontend pages
**Parent Directory:** `/pages/api/companyadmin/`

---

## 📦 Archived API Routes (6 files)

### 1. dashboard-stats.js (12KB)
**Endpoint:** `GET /api/companyadmin/dashboard-stats`

**Purpose:** Fetch real-time statistics for Company Admin dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeArtists": 450,
    "pendingRequests": 15,
    "pendingPayouts": 7,
    "totalRevenue": 125000.50,
    "recentActivity": [...],
    "chartData": {...}
  }
}
```

**Features:**
- User count aggregation
- Pending request counts
- Revenue summaries
- Recent activity feed
- Chart/graph data
- Caching for performance

**Dependencies:**
- User profiles table
- Requests tables
- Financial data
- Activity logs

**Caching:**
- Response cached for 5 minutes
- Invalidated on data changes

---

### 2. artist-requests.js (11KB)
**Endpoint:**
- `GET /api/companyadmin/artist-requests` - List requests
- `PUT /api/companyadmin/artist-requests` - Approve/reject

**Purpose:** Manage artist affiliation requests

**GET Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "uuid",
      "artistId": "uuid",
      "labelId": "uuid",
      "status": "pending|approved|rejected",
      "requestedAt": "2025-10-06T10:00:00Z",
      "artistName": "John Doe",
      "labelName": "Independent Records",
      "reason": "Artist wants to join label"
    }
  ]
}
```

**PUT Request:**
```json
{
  "requestId": "uuid",
  "action": "approve|reject",
  "notes": "Optional admin notes"
}
```

**Features:**
- List pending affiliation requests
- Filter by status, label, date
- Approve/reject with notes
- Notification on status change
- Artist-label relationship creation

**Workflow:**
1. Artist submits affiliation request
2. Company Admin reviews
3. Approve → Create artist-label link + notify both parties
4. Reject → Mark as rejected + notify artist

**Dependencies:**
- artist_label_affiliations table
- user_profiles table
- Notification system

---

### 3. user-management.js (12KB)
**Endpoints:**
- `GET /api/companyadmin/user-management` - List/search users
- `POST /api/companyadmin/user-management` - Create user
- `PUT /api/companyadmin/user-management` - Update user
- `DELETE /api/companyadmin/user-management` - Delete/disable user

**Purpose:** Complete CRUD operations for user management

**GET Query Parameters:**
```
?search=email@example.com
&role=artist|label_admin|distribution_partner
&status=active|inactive
&page=1
&limit=50
```

**GET Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "pages": 25
  }
}
```

**POST Request (Create User):**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "artist|label_admin|distribution_partner",
  "firstName": "John",
  "lastName": "Doe",
  "sendWelcomeEmail": true
}
```

**PUT Request (Update User):**
```json
{
  "userId": "uuid",
  "updates": {
    "email": "updated@example.com",
    "role": "label_admin",
    "status": "active|suspended"
  }
}
```

**Features:**
- User search and filtering
- Pagination
- Role assignment
- Status management (active/suspended)
- Welcome email on creation
- Password reset triggers
- Audit logging

**Permissions Required:**
- `user:create` - Create new users
- `user:edit:any` - Edit any user
- `user:delete:any` - Delete/suspend users

---

### 4. finance.js (15KB - Largest API)
**Endpoints:**
- `GET /api/companyadmin/finance` - Financial reports
- `POST /api/companyadmin/finance/transaction` - Create transaction
- `PUT /api/companyadmin/finance/approve-payout` - Approve payout

**Purpose:** Financial operations and payment processing

**GET Query Parameters:**
```
?startDate=2025-01-01
&endDate=2025-12-31
&type=revenue|expenses|payouts
&format=json|csv
```

**GET Response:**
```json
{
  "success": true,
  "summary": {
    "totalRevenue": 500000.00,
    "totalPayouts": 250000.00,
    "pendingPayouts": 7500.00,
    "netIncome": 250000.00
  },
  "transactions": [...],
  "chartData": {...}
}
```

**POST Transaction:**
```json
{
  "type": "revenue|expense|payout",
  "amount": 1000.00,
  "currency": "GBP",
  "description": "Monthly streaming revenue",
  "userId": "uuid",
  "category": "streaming|licensing|merchandise"
}
```

**PUT Approve Payout:**
```json
{
  "payoutId": "uuid",
  "approvedAmount": 500.00,
  "notes": "Approved",
  "paymentMethod": "bank_transfer|paypal"
}
```

**Features:**
- Revenue tracking and reporting
- Payout approval workflow
- Transaction history
- Financial analytics
- Multi-currency support
- Export to CSV/Excel
- Automated calculations
- Payment processing integration

**Security:**
- Strict RBAC enforcement
- Payment verification
- Audit trail
- Two-factor for large amounts

**Dependencies:**
- Financial transactions table
- Payout requests table
- Payment gateway APIs
- Currency conversion API

---

### 5. revenue-splits.js (4KB)
**Endpoint:**
- `GET /api/companyadmin/revenue-splits` - Calculate splits
- `POST /api/companyadmin/revenue-splits/apply` - Apply splits

**Purpose:** Calculate and apply revenue distribution

**GET Request:**
```json
{
  "releaseId": "uuid",
  "totalRevenue": 10000.00
}
```

**GET Response:**
```json
{
  "success": true,
  "splits": [
    {
      "userId": "artist-uuid",
      "percentage": 60,
      "amount": 6000.00,
      "role": "primary_artist"
    },
    {
      "userId": "label-uuid",
      "percentage": 30,
      "amount": 3000.00,
      "role": "label"
    },
    {
      "userId": "platform-uuid",
      "percentage": 10,
      "amount": 1000.00,
      "role": "platform_fee"
    }
  ],
  "totalAllocated": 10000.00
}
```

**POST Apply Splits:**
```json
{
  "releaseId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "totalRevenue": 10000.00
}
```

**Features:**
- Percentage-based calculations
- Role-based splits (artist, label, platform)
- Multiple contributor support
- Platform fee calculation
- Validation (must total 100%)
- Transaction creation
- Notification on distribution

**Workflow:**
1. Calculate splits based on agreement
2. Validate totals
3. Create financial transactions
4. Update balances
5. Notify recipients

**Dependencies:**
- Revenue split agreements table
- Release contributors table
- Financial transactions table

---

### 6. profile.js (2KB - Smallest API)
**Endpoints:**
- `GET /api/companyadmin/profile` - Fetch profile
- `PUT /api/companyadmin/profile` - Update profile

**Purpose:** Company Admin personal profile management

**GET Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "company_admin",
    "position": "Operations Manager",
    "department": "Finance",
    "profilePictureUrl": "https://...",
    "preferences": {
      "theme": "light",
      "notifications": true
    }
  }
}
```

**PUT Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "position": "Senior Operations Manager",
  "profilePictureUrl": "https://...",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

**Features:**
- Personal information updates
- Profile picture upload
- Preference management
- Theme settings
- Notification preferences

**Note:** Simple CRUD for Company Admin's own profile

---

## 🔒 Security & Permissions

All archived routes include:
- ✅ RBAC middleware protection
- ✅ Authentication required
- ✅ Company Admin role verification
- ✅ Input validation
- ✅ Error handling
- ✅ Audit logging

**Middleware Pattern:**
```javascript
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole automatically attached
  // Handle request
}

export default requirePermission('permission:name')(handler);
```

**Common Permissions:**
- `company_admin:dashboard:view`
- `request:approve`
- `user:create`, `user:edit:any`, `user:delete:any`
- `finance:view`, `finance:approve_payout`
- `revenue:view`, `revenue:calculate`

---

## 🔄 Restoration

### Restore All API Routes:
```bash
mv pages/api/companyadmin/_archived/*.js pages/api/companyadmin/
```

### Restore Single Route:
```bash
# Example: Restore dashboard-stats
mv pages/api/companyadmin/_archived/dashboard-stats.js pages/api/companyadmin/
```

### After Restoration:
1. Test endpoint with Postman/curl
2. Verify middleware protection
3. Update frontend to consume the endpoint
4. Test with real data
5. Document any changes needed

---

## 🧪 Testing Archived Routes

### Example: Testing dashboard-stats
```bash
curl -X GET http://localhost:3013/api/companyadmin/dashboard-stats \
  -H "Authorization: Bearer YOUR_COMPANY_ADMIN_TOKEN"
```

**Expected Response:** JSON with dashboard statistics

---

### Example: Testing artist-requests (approve)
```bash
curl -X PUT http://localhost:3013/api/companyadmin/artist-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COMPANY_ADMIN_TOKEN" \
  -d '{
    "requestId": "uuid-of-request",
    "action": "approve",
    "notes": "Approved by admin"
  }'
```

**Expected Response:** Success message with updated request

---

### Example: Testing user-management (create user)
```bash
curl -X POST http://localhost:3013/api/companyadmin/user-management \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COMPANY_ADMIN_TOKEN" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "artist",
    "firstName": "Test",
    "lastName": "User",
    "sendWelcomeEmail": true
  }'
```

**Expected Response:** Success with new user ID

---

## 📊 Archive Statistics

| Metric | Value |
|--------|-------|
| Total Routes | 6 |
| Combined Size | ~57KB |
| GET Endpoints | 4 |
| POST Endpoints | 3 |
| PUT Endpoints | 4 |
| DELETE Endpoints | 1 |
| Largest Route | finance.js (15KB) |
| Smallest Route | profile.js (2KB) |

---

## 🔗 Related Files

**Frontend Pages (also archived):**
- `/pages/companyadmin/_archived/dashboard.js`
- `/pages/companyadmin/_archived/artist-requests.js`
- `/pages/companyadmin/_archived/users.js`
- `/pages/companyadmin/_archived/payout-requests.js`
- `/pages/companyadmin/_archived/earnings-management.js`

**Documentation:**
- `/pages/companyadmin/_archived/MANIFEST.md`
- `/pages/superadmin/_archived/MANIFEST.md`
- `/PROFILE_CHANGE_REQUEST_AUDIT.md`

---

## 💡 API Design Patterns

### Consistent Response Format:
```javascript
// Success
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message",
  "details": {...}  // Optional
}
```

### Pagination:
```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "pages": 25
  }
}
```

### Approval Pattern:
```javascript
// PUT request
{
  "requestId": "uuid",
  "action": "approve|reject",
  "notes": "Optional notes"
}

// Response
{
  "success": true,
  "message": "Request approved successfully"
}
```

---

## 🎯 Rebuild Recommendations

### 1. Consolidate Endpoints
- Consider merging similar request endpoints
- Unified request management API
- Consistent approval workflow

### 2. Add Versioning
```javascript
// /api/v1/companyadmin/...
// /api/v2/companyadmin/...
```

### 3. Improve Error Handling
- Standardized error codes
- Better error messages
- Client-friendly responses

### 4. Add Rate Limiting
- Protect expensive operations
- Per-user limits
- Throttle repeated requests

### 5. Enhance Caching
- Cache expensive queries
- Redis integration
- Invalidation strategies

### 6. Add Webhooks
- Notify on approval
- Transaction updates
- Real-time events

---

**Archive Status:** ✅ COMPLETE
**Next Action:** Design unified Company Admin API
**Last Updated:** October 6, 2025

---

## 📞 Support

For questions about archived APIs:
1. Review this README
2. Check API endpoint patterns
3. Test in development
4. Reference related documentation
