# API Documentation

## Overview

MSC & Co platform provides a RESTful API built with Next.js Route Handlers. All API routes are located in the `app/api/` directory and follow REST conventions.

## Base URL

- **Development**: `http://localhost:3013/api`
- **Staging**: `https://staging.mscandco.com/api`
- **Production**: `https://mscandco.com/api`

## Authentication

All protected API endpoints require authentication via Supabase session cookies.

### Authentication Flow

```javascript
// Login request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Returns session cookie automatically set
// Use this cookie for subsequent authenticated requests
```

### Authorization Header (Alternative)

```http
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "success": true
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "artist@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "artist@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**Errors:**
- `400` - Invalid email or password format
- `401` - Invalid credentials
- `429` - Too many login attempts

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "newartist@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "artist_name": "DJ John",
  "brand": "msc"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "newartist@example.com"
  },
  "message": "Registration successful. Please check your email for verification."
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Email already exists
- `422` - Invalid email format or weak password

#### Logout
```http
POST /api/auth/logout
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

#### Password Reset Request
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

### Artist Endpoints

#### Get Artist Profile
```http
GET /api/artist/profile
```

**Required Permission:** `user:read:own`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "artist@example.com",
  "name": "John Doe",
  "artist_name": "DJ John",
  "bio": "Music producer and DJ",
  "profile_picture": "https://...",
  "brand": "msc",
  "social_links": {
    "instagram": "@djjohn",
    "spotify": "spotify:artist:..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Artist Profile
```http
PUT /api/artist/profile
```

**Required Permission:** `user:update:own`

**Request Body:**
```json
{
  "name": "John Doe",
  "artist_name": "DJ John",
  "bio": "Updated bio",
  "social_links": {
    "instagram": "@djjohn",
    "spotify": "spotify:artist:..."
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

#### Upload Profile Picture
```http
POST /api/artist/profile/picture
Content-Type: multipart/form-data
```

**Required Permission:** `user:update:own`

**Request Body:**
```
file: (binary)
```

**Response:** `200 OK`
```json
{
  "url": "https://storage.supabase.co/...",
  "message": "Profile picture updated"
}
```

**Errors:**
- `400` - No file provided or invalid file type
- `413` - File too large (max 5MB)

### Release Management

#### List Releases
```http
GET /api/artist/releases?page=1&limit=20&status=published
```

**Required Permission:** `release:read:own`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page (max 100) | 20 |
| status | string | Filter by status (draft, published, archived) | all |
| sort | string | Sort field | created_at |
| order | string | Sort order (asc, desc) | desc |

**Response:** `200 OK`
```json
{
  "releases": [
    {
      "id": "uuid",
      "title": "My Album",
      "artist_name": "DJ John",
      "release_date": "2024-06-15",
      "status": "published",
      "cover_art": "https://...",
      "tracks_count": 12,
      "platforms": ["Spotify", "Apple Music", "YouTube Music"],
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Release Details
```http
GET /api/artist/releases/:id
```

**Required Permission:** `release:read:own`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "My Album",
  "artist_name": "DJ John",
  "release_date": "2024-06-15",
  "status": "published",
  "cover_art": "https://...",
  "genre": "Electronic",
  "label": "Independent",
  "description": "Album description...",
  "tracks": [
    {
      "id": "uuid",
      "title": "Track 1",
      "duration": 245,
      "isrc": "USRC12345678",
      "track_number": 1
    }
  ],
  "platforms": ["Spotify", "Apple Music"],
  "analytics": {
    "streams": 15420,
    "downloads": 342
  }
}
```

**Errors:**
- `404` - Release not found
- `403` - Not authorized to view this release

#### Create Release
```http
POST /api/artist/releases
```

**Required Permission:** `release:create:own`

**Request Body:**
```json
{
  "title": "New Album",
  "artist_name": "DJ John",
  "release_date": "2024-12-01",
  "genre": "Electronic",
  "label": "Independent",
  "description": "Album description",
  "cover_art_url": "https://...",
  "tracks": [
    {
      "title": "Track 1",
      "duration": 245,
      "audio_file_url": "https://..."
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "message": "Release created successfully",
  "release": { ... }
}
```

**Errors:**
- `400` - Missing required fields or invalid data
- `422` - Invalid release date or track data

#### Update Release
```http
PUT /api/artist/releases/:id
```

**Required Permission:** `release:update:own`

**Request Body:** (partial update supported)
```json
{
  "title": "Updated Album Title",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "message": "Release updated successfully",
  "release": { ... }
}
```

#### Delete Release
```http
DELETE /api/artist/releases/:id
```

**Required Permission:** `release:delete:own`

**Response:** `200 OK`
```json
{
  "message": "Release deleted successfully"
}
```

**Errors:**
- `400` - Cannot delete published release
- `404` - Release not found

### Analytics

#### Get Artist Analytics
```http
GET /api/artist/analytics?start_date=2024-01-01&end_date=2024-12-31
```

**Required Permission:** `analytics:read:own`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| start_date | string | Start date (ISO 8601) | 30 days ago |
| end_date | string | End date (ISO 8601) | today |
| metric | string | Specific metric (streams, downloads, revenue) | all |

**Response:** `200 OK`
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "summary": {
    "total_streams": 1542000,
    "total_downloads": 34200,
    "total_revenue": 12450.50,
    "top_platform": "Spotify"
  },
  "streams_by_platform": {
    "Spotify": 842000,
    "Apple Music": 520000,
    "YouTube Music": 180000
  },
  "daily_streams": [
    {
      "date": "2024-01-01",
      "streams": 5420
    }
  ],
  "top_releases": [
    {
      "id": "uuid",
      "title": "Album Name",
      "streams": 542000
    }
  ]
}
```

### Earnings & Wallet

#### Get Wallet Balance
```http
GET /api/wallet/balance
```

**Required Permission:** `wallet:read:own`

**Response:** `200 OK`
```json
{
  "balance": {
    "available": 1245.50,
    "pending": 320.75,
    "total": 1566.25
  },
  "currency": "USD",
  "last_updated": "2024-10-29T10:30:00Z"
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?page=1&limit=20
```

**Required Permission:** `wallet:read:own`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page (max 100) | 20 |
| type | string | Transaction type (credit, debit, withdrawal) | all |
| start_date | string | Start date filter | 90 days ago |
| end_date | string | End date filter | today |

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 125.50,
      "description": "Royalty payment - October 2024",
      "status": "completed",
      "created_at": "2024-10-15T12:00:00Z"
    },
    {
      "id": "uuid",
      "type": "debit",
      "amount": 50.00,
      "description": "Withdrawal to bank account",
      "status": "processing",
      "created_at": "2024-10-20T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

#### Request Withdrawal
```http
POST /api/wallet/withdraw
```

**Required Permission:** `wallet:withdraw:own`

**Request Body:**
```json
{
  "amount": 100.00,
  "method": "bank_transfer",
  "account_details": {
    "account_number": "****1234",
    "routing_number": "****5678"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "amount": 100.00,
  "status": "processing",
  "estimated_arrival": "2024-11-03",
  "message": "Withdrawal request submitted successfully"
}
```

**Errors:**
- `400` - Insufficient balance or invalid amount
- `422` - Invalid account details

### Admin Endpoints

#### List All Users
```http
GET /api/admin/users?page=1&limit=50&role=Artist
```

**Required Permission:** `user:read:any`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page (max 100) | 50 |
| role | string | Filter by role | all |
| status | string | Filter by status (active, suspended) | all |
| search | string | Search by name or email | - |

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Artist",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-10-28T15:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Update User Role
```http
PUT /api/admin/users/:id/role
```

**Required Permission:** `user:update:any`

**Request Body:**
```json
{
  "role": "LabelAdmin"
}
```

**Response:** `200 OK`
```json
{
  "message": "User role updated successfully",
  "user": { ... }
}
```

#### Suspend User
```http
POST /api/admin/users/:id/suspend
```

**Required Permission:** `user:suspend:any`

**Request Body:**
```json
{
  "reason": "Terms of service violation",
  "duration_days": 30
}
```

**Response:** `200 OK`
```json
{
  "message": "User suspended successfully",
  "suspended_until": "2024-11-28T00:00:00Z"
}
```

#### Get Platform Analytics
```http
GET /api/admin/analytics/platform
```

**Required Permission:** `analytics:read:any`

**Response:** `200 OK`
```json
{
  "overview": {
    "total_users": 5420,
    "active_users": 3210,
    "total_releases": 8942,
    "total_revenue": 542000.50
  },
  "growth": {
    "new_users_this_month": 245,
    "new_releases_this_month": 342,
    "revenue_growth": "12.5%"
  },
  "top_artists": [
    {
      "id": "uuid",
      "name": "Top Artist",
      "total_streams": 1542000
    }
  ]
}
```

### Permission Management

#### List Permissions
```http
GET /api/admin/permissions
```

**Required Permission:** `permission:read:any`

**Response:** `200 OK`
```json
{
  "permissions": [
    {
      "id": "uuid",
      "name": "user:read:own",
      "description": "Read own user data",
      "category": "user"
    }
  ]
}
```

#### Assign Permission to User
```http
POST /api/admin/permissions/assign
```

**Required Permission:** `permission:assign:any`

**Request Body:**
```json
{
  "user_id": "uuid",
  "permission_name": "release:create:any",
  "denied": false
}
```

**Response:** `200 OK`
```json
{
  "message": "Permission assigned successfully"
}
```

#### Revoke Permission from User
```http
DELETE /api/admin/permissions/revoke
```

**Required Permission:** `permission:revoke:any`

**Request Body:**
```json
{
  "user_id": "uuid",
  "permission_name": "release:create:any"
}
```

**Response:** `200 OK`
```json
{
  "message": "Permission revoked successfully"
}
```

## Webhooks

### Webhook Events

The platform sends webhooks for various events to registered endpoints.

#### Webhook Payload Format
```json
{
  "event": "release.published",
  "timestamp": "2024-10-29T10:00:00Z",
  "data": {
    "release_id": "uuid",
    "artist_id": "uuid",
    "title": "New Album"
  },
  "signature": "sha256_signature"
}
```

#### Available Events
- `user.created` - New user registration
- `user.updated` - User profile updated
- `release.created` - New release created
- `release.published` - Release published to platforms
- `payment.completed` - Payment processed
- `payment.failed` - Payment failed

### Verifying Webhook Signatures

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

## Rate Limiting

Rate limits protect the API from abuse.

**Limits:**
- **Authenticated requests**: 1000 requests per hour
- **Authentication endpoints**: 10 requests per 15 minutes
- **File uploads**: 100 per hour

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 943
X-RateLimit-Reset: 1698580800
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 3600
}
```

## Pagination

All list endpoints support pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "email",
    "reason": "Invalid format"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permission
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## API Versioning

The API uses URL versioning for major changes.

**Current Version:** v1 (default, no prefix required)

**Explicit Version:**
```http
GET /api/v1/artist/releases
```

When v2 is released:
```http
GET /api/v2/artist/releases
```

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@example.com","password":"password123"}' \
  -c cookies.txt

# Get profile (with session cookie)
curl -X GET http://localhost:3013/api/artist/profile \
  -b cookies.txt

# Create release
curl -X POST http://localhost:3013/api/artist/releases \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"New Album","artist_name":"DJ John",...}'
```

### Using Postman

1. Import the API collection (TODO: provide collection file)
2. Set environment variables (base_url, auth_token)
3. Use the pre-request script for authentication

### Using JavaScript

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'artist@example.com',
    password: 'password123',
  }),
  credentials: 'include', // Important: include cookies
});

const loginData = await loginResponse.json();

// Subsequent requests automatically include session cookie
const profileResponse = await fetch('/api/artist/profile', {
  credentials: 'include',
});

const profile = await profileResponse.json();
```

## Support

For API support, contact:
- **Email**: developers@mscandco.com
- **Documentation**: https://docs.mscandco.com/api
- **Status Page**: https://status.mscandco.com
