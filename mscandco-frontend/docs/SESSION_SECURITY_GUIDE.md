# Session Security Implementation Guide

## Overview

This guide documents the comprehensive session security implementation for MSC & Co platform. The system prevents indefinite session persistence and automatically logs out users after inactivity or session expiration.

## Security Features Implemented

### 1. **JWT Token Expiration**
- **Location**: Supabase Dashboard → Authentication → Settings
- **Configuration**:
  - JWT Expiry: **3600 seconds (1 hour)**
  - Refresh Token Lifetime: **604800 seconds (7 days)**
  - Refresh Token Reuse Interval: **10 seconds**

### 2. **PKCE Authentication Flow**
- **File**: `lib/supabase.js:16`
- More secure than implicit flow
- Protects against authorization code interception attacks
- Automatically implemented in client configuration

### 3. **Server-Side Session Validation**
- **File**: `middleware.js`
- Validates sessions on every protected route request
- Automatically refreshes tokens when needed
- Redirects to login when session is invalid or expired

### 4. **Client-Side Session Monitoring**
- **File**: `components/auth/SessionValidator.js`
- Validates session every 5 minutes
- Listens for auth state changes
- Handles token refresh events
- Automatic logout on session expiry

### 5. **Inactivity Timeout**
- **File**: `components/auth/InactivityLogout.js`
- Default: **30 minutes** of inactivity
- Warning shown: **5 minutes** before logout
- Tracks user activity:
  - Mouse movements
  - Keyboard input
  - Scrolling
  - Touch events

## Implementation Details

### Protected Routes

The following routes require authentication and active sessions:

```javascript
- /dashboard
- /admin/*
- /superadmin/*
- /artist/*
- /labeladmin/*
- /distribution/*
- /notifications
```

### Session Validation Flow

```
User Request
    ↓
Middleware (Server)
    ↓
Check Session Validity
    ↓
Valid? → Allow Access
    ↓       ↓
   No      Yes
    ↓       ↓
Redirect  Continue
to Login   ↓
          SessionValidator (Client)
              ↓
          Check Every 5 Minutes
              ↓
          InactivityLogout
              ↓
          Track User Activity
              ↓
          Show Warning (25 mins)
              ↓
          Auto Logout (30 mins)
```

### Role-Based Access Control

The middleware also enforces role-based access:

```javascript
/superadmin/*     → SuperAdmin only
/admin/*          → Admin, SuperAdmin
/labeladmin/*     → LabelAdmin, Admin, SuperAdmin
/artist/*         → Artist, LabelAdmin, Admin, SuperAdmin
/distribution/*   → DistributionPartner, Admin, SuperAdmin
```

## Configuration

### Inactivity Timeout Settings

Edit `app/layout.js:33` to adjust timeouts:

```javascript
<InactivityLogout
  timeoutMinutes={30}    // Total inactivity before logout
  warningMinutes={5}     // Warning shown before logout
/>
```

### Session Validation Interval

Edit `components/auth/SessionValidator.js:36` to change check frequency:

```javascript
const interval = setInterval(checkSession, 5 * 60 * 1000) // 5 minutes
```

## Supabase Dashboard Configuration

### Required Settings

1. Navigate to: **Supabase Dashboard → Your Project → Authentication → Settings**

2. Configure JWT Settings:
   ```
   JWT Expiry: 3600 (1 hour)
   Refresh Token Lifetime: 604800 (7 days)
   Refresh Token Reuse Interval: 10
   ```

3. Enable Security Features:
   - ✅ Secure session cookies
   - ✅ Enable email confirmations
   - ✅ Enable custom access token hook (if needed)

### Manual Configuration Steps

**Step 1**: Go to Supabase Dashboard
```
https://app.supabase.com/project/fzqpoayhdisusgrotyfg/auth/settings
```

**Step 2**: Update JWT Settings
- Set **JWT expiry limit** to `3600` seconds
- Set **Refresh Token Lifetime** to `604800` seconds
- Click **Save**

**Step 3**: Verify Configuration
- Test login → wait 1 hour → session should expire
- Test inactivity → after 30 mins → should auto-logout

## Testing

### Test Session Expiration (1 hour)

1. Login to the platform
2. Wait for 1+ hours without refreshing
3. Try to navigate to a protected page
4. Should redirect to login with message: "Your session has expired"

### Test Inactivity Timeout (30 minutes)

1. Login to the platform
2. Don't interact with the page for 25 minutes
3. Warning modal should appear with countdown
4. Options: "Stay Logged In" or "Logout Now"
5. If no action taken, auto-logout after 30 minutes total

### Test Session Validation

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test session endpoint
curl -i http://localhost:3013/dashboard

# Should redirect to /login if no valid session cookie
```

## Security Best Practices

### For Users

1. **Don't stay logged in on shared computers**
   - Always logout when done
   - Sessions expire automatically after 1 hour

2. **Respond to inactivity warnings**
   - If you see the warning, click "Stay Logged In" if you're still working
   - Otherwise, allow auto-logout

3. **Use strong passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols

### For Developers

1. **Never disable session validation**
   - Keep middleware enabled
   - Don't bypass SessionValidator

2. **Don't extend timeout beyond 30 minutes**
   - Longer timeouts reduce security
   - Users can always click "Stay Logged In"

3. **Monitor session logs**
   - Check for unusual logout patterns
   - Track session expiration rates

4. **Test thoroughly after changes**
   - Run full session flow tests
   - Test on staging before production

## Troubleshooting

### Issue: Users Stay Logged In Forever

**Cause**: Middleware is disabled or JWT expiry not set

**Solution**:
1. Check `middleware.js` exists (not `.DISABLED`)
2. Verify Supabase JWT settings
3. Clear browser cookies and test again

### Issue: Session Expires Too Quickly

**Cause**: JWT expiry set too low

**Solution**:
1. Check Supabase dashboard JWT settings
2. Increase to at least 3600 seconds (1 hour)
3. Verify auto-refresh is working

### Issue: Inactivity Warning Not Showing

**Cause**: Component not mounted or timeouts misconfigured

**Solution**:
1. Check `app/layout.js` includes `<InactivityLogout />`
2. Verify timeoutMinutes and warningMinutes are positive
3. Check browser console for errors

### Issue: Users Logged Out While Active

**Cause**: Activity tracking not working properly

**Solution**:
1. Check browser console for errors
2. Verify event listeners are attached
3. Test different browsers

## Files Modified

```
✅ lib/supabase.js                          - Added PKCE flow
✅ middleware.js                             - Enabled and configured
✅ components/auth/SessionValidator.js       - Created
✅ components/auth/InactivityLogout.js       - Created
✅ app/layout.js                             - Added session components
✅ app/login/page.js                         - Added expiration messages
✅ docs/SESSION_SECURITY_GUIDE.md            - This document
```

## Support

For issues or questions:
- Check this guide first
- Review browser console logs
- Check Supabase dashboard logs
- Contact: info@mscandco.com

## Changelog

### 2025-11-02
- ✅ Initial session security implementation
- ✅ PKCE authentication flow
- ✅ Server-side validation via middleware
- ✅ Client-side session monitoring
- ✅ Inactivity timeout with warning
- ✅ Role-based access control in middleware
- ✅ Documentation created

---

**Last Updated**: 2025-11-02
**Version**: 1.0.0
**Status**: ✅ Deployed to Staging
