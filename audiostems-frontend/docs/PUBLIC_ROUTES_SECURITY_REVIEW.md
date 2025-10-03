# Public Routes Security Review

**Date:** 2025-10-03
**Reviewed By:** RBAC Security Audit
**Status:** Action Required

---

## Executive Summary

This document identifies security concerns in the 21 public routes (routes without RBAC authentication). While some routes are intentionally public, several pose **HIGH** and **CRITICAL** security risks that require immediate attention.

**Risk Summary:**
- 🔴 **CRITICAL** (2 routes): Immediate action required
- 🟠 **HIGH** (3 routes): Action required within 24 hours
- 🟡 **MEDIUM** (5 routes): Action required within 1 week
- 🟢 **LOW** (11 routes): Acceptable for public access

---

## Critical Security Issues (Immediate Action Required)

### 🔴 CRITICAL #1: Platform Stats POST Method Unprotected

**Route:** `pages/api/platform-stats/[releaseId].js`

**Issue:** POST method allows ANYONE to delete and create platform statistics without authentication.

**Current Code:**
```javascript
if (req.method === 'POST') {
  // Delete existing stats for this release
  await supabase
    .from('platform_stats')
    .delete()
    .eq('release_id', releaseId);

  // Insert new stats (NO AUTHENTICATION CHECK)
  const { data: stats, error } = await supabase
    .from('platform_stats')
    .insert(platforms.map(...))
}
```

**Risk:**
- Malicious actors can modify platform statistics
- Data integrity compromised
- Financial implications if stats affect revenue

**Recommended Fix:**
```javascript
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Public GET is fine
    const { data: stats } = await supabase...
    return res.json({ success: true, data: stats });
  }

  if (req.method === 'POST') {
    // This should NEVER be public
    return res.status(403).json({ error: 'POST method disabled on public endpoint' });
  }
}

export default handler; // GET stays public
// OR protect entire route: export default requirePermission('release:edit:any')(handler);
```

**Action Items:**
- [ ] Remove POST method from public endpoint OR
- [ ] Split into two routes: public GET and protected POST
- [ ] Add authentication to POST method
- [ ] Audit database for unauthorized modifications

---

### 🔴 CRITICAL #2: Latest Release Exposes All Release Data

**Route:** `pages/api/releases/latest/[artistId].js`

**Issue:** Returns ALL fields from releases table including potentially sensitive data.

**Current Code:**
```javascript
const { data: release, error } = await supabase
  .from('releases')
  .select('*')  // ⚠️ RETURNS ALL COLUMNS
  .eq('artist_id', artistId)
  .eq('is_live', true)
  .single();

return res.json({
  success: true,
  data: release || null  // ⚠️ ALL DATA EXPOSED
});
```

**Sensitive Fields That May Be Exposed:**
- `artist_id` (UUIDs can be used for enumeration)
- `label_admin_id` (reveals label relationships)
- Internal metadata
- Private notes/comments
- Revenue splits
- Contract terms
- Unpublished information

**Recommended Fix:**
```javascript
const { data: release, error } = await supabase
  .from('releases')
  .select(`
    id,
    title,
    artist,
    featuring,
    release_date,
    release_type,
    cover_image_url,
    audio_file_url,
    platforms,
    created_at
  `)  // ONLY PUBLIC FIELDS
  .eq('artist_id', artistId)
  .eq('is_live', true)
  .single();

return res.json({
  success: true,
  data: release || null
});
```

**Action Items:**
- [ ] Audit releases table schema for sensitive fields
- [ ] Update query to select only public fields
- [ ] Add data sanitization layer
- [ ] Review other endpoints using `select('*')`

---

## High Risk Issues (Action Required Within 24 Hours)

### 🟠 HIGH #1: Debug Routes Enabled in Production

**Routes:**
- `pages/api/debug/affiliation-requests.js`
- `pages/api/debug/check-user-columns.js`

**Issue:** Debug endpoints accessible without authentication.

**Risk:**
- Information disclosure
- Database schema exposure
- Enumeration of user data
- Potential DoS via expensive queries

**Recommended Fix:**
```javascript
// Option 1: Disable in production
export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  // Debug logic...
}

// Option 2: Protect with super admin
import { requireRole } from '@/lib/rbac/middleware';
export default requireRole('super_admin')(handler);
```

**Action Items:**
- [ ] Add environment check to disable in production
- [ ] OR protect with super_admin role
- [ ] OR delete debug routes entirely
- [ ] Audit for other debug/test endpoints

---

### 🟠 HIGH #2: Test Routes Accessible

**Routes:**
- `pages/api/test-rbac.js`
- `pages/api/test-upload.js`

**Issue:** Test endpoints provide information about system internals.

**Risk:**
- System configuration disclosure
- RBAC implementation details exposed
- Potential attack surface for testing edge cases

**Recommended Fix:**
```javascript
export default async function handler(req, res) {
  // Disable in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Test logic for development only
}
```

**Action Items:**
- [ ] Disable test routes in production
- [ ] Move to separate development-only directory
- [ ] Add explicit warnings in code

---

### 🟠 HIGH #3: Milestones Expose All Data

**Route:** `pages/api/milestones/[artistId].js`

**Issue:** Returns all milestone fields without filtering sensitive data.

**Current Code:**
```javascript
const { data: milestones, error } = await query
  .select('*')  // ⚠️ ALL FIELDS
  .order('milestone_date', { ascending: false });

return res.json({
  success: true,
  data: milestonesWithDates  // ⚠️ ALL DATA
});
```

**Recommended Fix:**
```javascript
const { data: milestones, error } = await query
  .select(`
    id,
    milestone_date,
    title,
    description,
    milestone_type,
    analytics_type,
    relative_date
  `)  // ONLY PUBLIC FIELDS
  .order('milestone_date', { ascending: false });
```

**Action Items:**
- [ ] Review milestones table for sensitive fields
- [ ] Whitelist public fields only
- [ ] Add data sanitization

---

## Medium Risk Issues (Action Required Within 1 Week)

### 🟡 MEDIUM #1: Artist ID Enumeration

**Routes:**
- `pages/api/releases/latest/[artistId].js`
- `pages/api/milestones/[artistId].js`

**Issue:** Routes accept any UUID and return data, allowing enumeration of all artists.

**Risk:**
- Attackers can discover all artist IDs
- Privacy concerns for unlisted artists
- Competitive intelligence gathering

**Recommended Fix:**
```javascript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// OR check if artist profile is public
const { data: artist } = await supabase
  .from('user_profiles')
  .select('is_public')
  .eq('id', artistId)
  .single();

if (!artist || !artist.is_public) {
  return res.status(404).json({ error: 'Not found' });
}
```

**Action Items:**
- [ ] Add rate limiting to prevent enumeration
- [ ] Add `is_public` flag to user_profiles
- [ ] Only return data for public artists
- [ ] Log access attempts for monitoring

---

### 🟡 MEDIUM #2: Error Messages Leak Information

**Multiple Routes**

**Issue:** Error messages expose database structure and internal details.

**Example:**
```javascript
return res.status(500).json({
  error: 'Database error',
  details: error.message  // ⚠️ LEAKS DB STRUCTURE
});
```

**Recommended Fix:**
```javascript
// Development
if (process.env.NODE_ENV === 'development') {
  return res.status(500).json({ error: 'Database error', details: error.message });
}

// Production
return res.status(500).json({ error: 'An error occurred. Please try again later.' });
```

**Action Items:**
- [ ] Remove detailed error messages in production
- [ ] Log errors server-side only
- [ ] Return generic error messages to clients

---

### 🟡 MEDIUM #3: No CORS Configuration

**All Public Routes**

**Issue:** No explicit CORS policy defined for public routes.

**Risk:**
- Cross-origin attacks
- Unauthorized API consumption
- CSRF vulnerabilities

**Recommended Fix:**
```javascript
// In next.config.js or middleware
export async function middleware(req) {
  const res = NextResponse.next();

  // Set CORS headers
  res.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return res;
}
```

**Action Items:**
- [ ] Configure CORS for public routes
- [ ] Whitelist allowed origins
- [ ] Set appropriate methods per route

---

### 🟡 MEDIUM #4: No Request Size Limits

**Public Routes Accepting POST**

**Issue:** No explicit limits on request body size.

**Risk:**
- DoS via large payloads
- Resource exhaustion
- Bandwidth abuse

**Recommended Fix:**
```javascript
// In next.config.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limit request body size
    },
  },
};
```

**Action Items:**
- [ ] Set body size limits on all routes
- [ ] Configure per-route limits based on use case
- [ ] Monitor for abuse

---

### 🟡 MEDIUM #5: No Input Validation

**All Public Routes**

**Issue:** UUIDs and other inputs not validated before use.

**Risk:**
- SQL injection (mitigated by Supabase but still risk)
- Malformed data causing errors
- Potential for crafted attacks

**Recommended Fix:**
```javascript
import { validate as isUUID } from 'uuid';

export default async function handler(req, res) {
  const { artistId } = req.query;

  // Validate UUID format
  if (!isUUID(artistId)) {
    return res.status(400).json({ error: 'Invalid artist ID format' });
  }

  // Continue...
}
```

**Action Items:**
- [ ] Add UUID validation to all routes accepting IDs
- [ ] Validate all input parameters
- [ ] Use schema validation library (Zod, Yup)

---

## Low Risk (Acceptable for Public Access)

### 🟢 Auth & Registration Routes (8 routes)

**Routes:**
- `pages/api/auth/check-email.js`
- `pages/api/auth/check-verification.js`
- `pages/api/auth/complete-registration.js`
- `pages/api/auth/create-profile.js`
- `pages/api/auth/send-verification-code.js`
- `pages/api/auth/simple-register.js`
- `pages/api/auth/verify-email-code.js`

**Status:** ✅ Acceptable
**Reason:** These MUST be public for user registration flow.

**Recommendations:**
- [x] Rate limiting already recommended (add if missing)
- [x] Input validation in place
- [x] Email verification required
- [ ] Add CAPTCHA for bot prevention

---

### 🟢 Webhook Routes (3 routes)

**Routes:**
- `pages/api/payments/revolut/webhook.js`
- `pages/api/revolut/webhook.js`
- `pages/api/webhooks/revolut.js`

**Status:** ✅ Acceptable with signature verification
**Reason:** Webhooks must be publicly accessible.

**Security Measures:**
- ✅ Signature verification implemented
- ✅ HMAC-SHA256 validation
- ✅ Timing-safe comparison
- ✅ Webhook secret required

**Recommendations:**
- [x] IP whitelisting (optional but recommended)
- [x] Webhook logging enabled
- [x] Failed signature attempts monitored

---

### 🟢 Health Check (1 route)

**Route:** `pages/api/health.js`

**Status:** ✅ Acceptable
**Reason:** Required for monitoring and load balancers.

**Recommendations:**
- [ ] Return minimal information (status code only)
- [ ] No sensitive system information
- [ ] Rate limit to prevent abuse

---

## Summary of Action Items

### Immediate (Within 24 Hours)

- [ ] **CRITICAL:** Remove or protect POST method on `platform-stats/[releaseId].js`
- [ ] **CRITICAL:** Whitelist public fields only on `releases/latest/[artistId].js`
- [ ] **HIGH:** Disable debug routes in production
- [ ] **HIGH:** Disable test routes in production
- [ ] **HIGH:** Whitelist public fields on `milestones/[artistId].js`

### Short Term (Within 1 Week)

- [ ] Add rate limiting to all public routes
- [ ] Add UUID validation to all ID parameters
- [ ] Configure CORS policies
- [ ] Set request size limits
- [ ] Add `is_public` flag to user_profiles
- [ ] Sanitize error messages in production

### Long Term (Within 1 Month)

- [ ] Implement comprehensive input validation (Zod/Yup)
- [ ] Add monitoring for public route abuse
- [ ] Set up alerts for unusual access patterns
- [ ] Regular security audits of public endpoints
- [ ] Add CAPTCHA to registration routes
- [ ] IP whitelisting for webhooks

---

## Monitoring Recommendations

### Metrics to Track

1. **Public Route Access Patterns:**
   - Requests per minute/hour
   - Unique IPs accessing public routes
   - Failed validation attempts

2. **Enumeration Attempts:**
   - Sequential ID access patterns
   - High volume requests from single IP
   - 404 rates by route

3. **Error Rates:**
   - 500 errors on public routes
   - Validation failures
   - Malformed request attempts

### Alerts to Configure

- ⚠️ Alert if single IP makes >100 requests/minute to public routes
- ⚠️ Alert if error rate exceeds 5% on public routes
- ⚠️ Alert if sequential ID enumeration detected
- ⚠️ Alert if POST method called on platform-stats (after fix)

---

## Compliance Considerations

### GDPR Implications

Public routes may expose personal data:
- Artist names and profiles
- Release information
- Platform statistics

**Recommendations:**
- Add privacy policy link in API responses
- Implement data minimization (only return necessary fields)
- Add opt-out mechanism for artist profiles
- Log data access for audit trail

### Data Protection

- Ensure public data is truly meant to be public
- Add `is_public` flags to control visibility
- Regular audits of exposed data
- Data retention policies for logs

---

## Testing Checklist

Before deploying fixes:

- [ ] Test all public routes with invalid inputs
- [ ] Verify rate limiting works
- [ ] Confirm sensitive fields are not exposed
- [ ] Test POST method protection
- [ ] Verify debug routes disabled in production
- [ ] Test CORS configuration
- [ ] Validate error messages don't leak info
- [ ] Test enumeration protection

---

## Sign-Off

**Reviewed By:** _________________
**Date:** _________________
**Approved By:** _________________
**Date:** _________________

**Next Review Date:** _________________

---

## Appendix: Full List of Public Routes

### Critical Risk (2)
1. 🔴 `pages/api/platform-stats/[releaseId].js` (POST unprotected)
2. 🔴 `pages/api/releases/latest/[artistId].js` (All fields exposed)

### High Risk (3)
3. 🟠 `pages/api/debug/affiliation-requests.js`
4. 🟠 `pages/api/debug/check-user-columns.js`
5. 🟠 `pages/api/test-rbac.js`
6. 🟠 `pages/api/test-upload.js`
7. 🟠 `pages/api/milestones/[artistId].js` (All fields exposed)

### Medium Risk (5)
8. 🟡 Artist enumeration on public routes
9. 🟡 Error message information disclosure
10. 🟡 No CORS configuration
11. 🟡 No request size limits
12. 🟡 No input validation

### Low Risk (11)
13-20. 🟢 Auth routes (acceptable for public)
21-23. 🟢 Webhook routes (signature verified)
24. 🟢 Health check (acceptable)

---

**END OF SECURITY REVIEW**
