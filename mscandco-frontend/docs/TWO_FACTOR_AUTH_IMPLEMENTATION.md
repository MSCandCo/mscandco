# Two-Factor Authentication (2FA) Implementation

## Overview

This platform implements **TOTP-based Two-Factor Authentication** using Supabase's built-in MFA feature, which is **FREE** on all Supabase tiers.

## Implementation Date

Implemented: 2025-01-02

## What is TOTP?

Time-based One-Time Password (TOTP) is an algorithm that generates a one-time password using the current time as a source of uniqueness. Users scan a QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.) to set up 2FA.

## Key Features

### 1. **Self-Service Enrollment**
- Users can enable 2FA from their settings page
- QR code generation for easy setup
- Manual secret key option for apps that don't support QR codes
- Verification required before enabling

### 2. **Authenticator App Support**
Compatible with all standard TOTP authenticator apps:
- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- 1Password (Cross-platform)
- Microsoft Authenticator (iOS/Android)
- Any RFC 6238 compliant app

### 3. **Security**
- 6-digit verification codes
- Time-based, expires every 30 seconds
- Server-side verification via Supabase Auth
- Cannot be disabled without user authentication

### 4. **User Experience**
- Clean, intuitive interface
- Copy-to-clipboard for manual entry
- Real-time validation
- Clear status indicators
- Inline error handling

## Architecture

### Component Structure

```
components/settings/TwoFactorAuth.js
├── State Management
│   ├── MFA enrollment status
│   ├── QR code generation
│   ├── Verification flow
│   └── Enable/disable operations
├── UI Components
│   ├── Status badge
│   ├── QR code display
│   ├── Secret key with copy
│   ├── Verification code input
│   └── Action buttons
└── Supabase Auth Integration
    ├── supabase.auth.mfa.listFactors()
    ├── supabase.auth.mfa.enroll()
    ├── supabase.auth.mfa.challengeAndVerify()
    └── supabase.auth.mfa.unenroll()
```

### Integration Points

**Settings Pages:**
- `app/artist/settings/SettingsClient.js`
- `app/labeladmin/settings/SettingsClient.js`

**API Routes:**
- No custom API routes needed - uses Supabase Auth directly

**Dependencies:**
- `qrcode` - QR code generation library
- `@supabase/ssr` - Supabase client library
- `lucide-react` - Icons

## User Flow

### Enabling 2FA

1. User clicks "Enable 2FA" button
2. System calls `supabase.auth.mfa.enroll({ factorType: 'totp' })`
3. Supabase returns:
   - TOTP secret
   - QR code URI
   - Factor ID
4. Component generates QR code from URI
5. User scans QR code with authenticator app
6. User enters 6-digit code from app
7. System verifies code with `supabase.auth.mfa.challengeAndVerify()`
8. If valid, 2FA is enabled
9. Factor ID is stored in Supabase Auth

### Login with 2FA (Next Step)

When a user with 2FA enabled tries to log in:

1. User enters email/password
2. If 2FA is enabled, Supabase returns `AuthMFARequiredError`
3. System prompts for 6-digit code
4. User enters code from authenticator app
5. System verifies with `supabase.auth.mfa.challengeAndVerify()`
6. If valid, user is logged in

**Note:** Login flow with MFA challenge is NOT YET IMPLEMENTED. The enrollment works, but users won't be prompted for 2FA codes during login until we add the challenge step to the auth pages.

### Disabling 2FA

1. User must be authenticated
2. User clicks "Disable 2FA" button
3. Confirmation dialog appears
4. User confirms
5. System calls `supabase.auth.mfa.unenroll({ factorId })`
6. 2FA is disabled

## Database Schema

**No custom database changes needed!** Supabase Auth handles all MFA data internally.

Supabase stores MFA factors in the `auth.mfa_factors` table (managed by Supabase):
```sql
-- Managed by Supabase, not our responsibility
auth.mfa_factors
├── id (UUID)
├── user_id (UUID)
├── friendly_name (TEXT)
├── factor_type (TEXT) -- 'totp'
├── status (TEXT) -- 'verified' or 'unverified'
├── created_at
└── updated_at
```

## Security Considerations

### ✅ What We Have

1. **Server-Side Verification**: All MFA operations go through Supabase Auth API
2. **Time-Based Codes**: TOTP codes expire every 30 seconds
3. **No Secret Storage**: TOTP secrets are stored securely by Supabase
4. **Factor ID Protection**: Factor IDs are only accessible to authenticated users
5. **Confirmation Required**: Disabling 2FA requires explicit user confirmation

### ⚠️ What's Missing (Future Enhancements)

1. **Login Challenge Flow**: Need to implement MFA challenge during login
2. **Recovery Codes**: Supabase doesn't provide recovery codes - consider adding
3. **Device Trust**: No "remember this device" option yet
4. **SMS Fallback**: Phone-based MFA available but costs $75/month
5. **Audit Logging**: Consider logging 2FA enable/disable events

## Cost Analysis

### Current Implementation: **$0/month**

- **TOTP MFA**: FREE (unlimited)
- **Users with 2FA**: FREE (unlimited)
- **MFA Challenges**: FREE (unlimited)
- **QR Code Generation**: FREE (client-side library)

### If We Need Phone-Based MFA: **$75/month**

- SMS-based 2FA: $75/month
- Not currently needed
- TOTP is more secure anyway

## Testing Checklist

### Enrollment Flow
- [ ] Click "Enable 2FA" button
- [ ] QR code displays correctly
- [ ] Secret key can be copied
- [ ] Invalid code shows error
- [ ] Valid code enables 2FA
- [ ] Status updates to "Enabled"
- [ ] Cancel button works

### Disable Flow
- [ ] "Disable 2FA" button appears when enabled
- [ ] Confirmation dialog shows
- [ ] Cancel works
- [ ] Confirm disables 2FA
- [ ] Status updates to "Disabled"

### Error Handling
- [ ] Network errors show message
- [ ] Invalid codes show message
- [ ] Unauthenticated users can't access
- [ ] Already enrolled users see correct state

### Browser Compatibility
- [ ] Chrome/Edge (QR code rendering)
- [ ] Firefox (QR code rendering)
- [ ] Safari (QR code rendering)
- [ ] Mobile browsers (responsive layout)

## Known Issues

### 1. Login Challenge Not Implemented
**Impact:** HIGH
**Description:** Users can enable 2FA, but the login page doesn't prompt for TOTP codes yet.
**Workaround:** Don't enable 2FA until login flow is implemented.
**Fix Required:** Add MFA challenge to `app/auth/login/page.js`

### 2. No Recovery Codes
**Impact:** MEDIUM
**Description:** If user loses authenticator app, they can't log in.
**Workaround:** Admins can disable 2FA via database.
**Fix Required:** Generate and display recovery codes during enrollment.

### 3. No Session Persistence Preferences
**Impact:** LOW
**Description:** Users must enter 2FA code every login, even on trusted devices.
**Workaround:** None - security by design.
**Fix Required:** Optional "trust this device" feature.

## Implementation Code

### Component Import
```javascript
import TwoFactorAuth from '@/components/settings/TwoFactorAuth';
```

### Component Usage
```jsx
<TwoFactorAuth />
```

### Supabase MFA API Examples

**Check MFA Status:**
```javascript
const { data: factors } = await supabase.auth.mfa.listFactors()
const hasMfa = factors?.totp?.length > 0
```

**Enroll Factor:**
```javascript
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
})
// Returns: { id, totp: { qr_code, secret, uri } }
```

**Verify and Enable:**
```javascript
const { data, error } = await supabase.auth.mfa.challengeAndVerify({
  factorId: 'factor-id',
  code: '123456'
})
```

**Unenroll (Disable):**
```javascript
const { error } = await supabase.auth.mfa.unenroll({
  factorId: 'factor-id'
})
```

## Next Steps

1. **CRITICAL:** Implement MFA challenge in login flow
   - Add challenge step after successful email/password auth
   - Show 6-digit code input
   - Verify with `challengeAndVerify()`
   - Handle errors gracefully

2. **HIGH:** Add recovery codes
   - Generate 10 single-use recovery codes
   - Store in encrypted format
   - Display once during enrollment
   - Allow users to regenerate

3. **MEDIUM:** Add audit logging
   - Log when 2FA is enabled
   - Log when 2FA is disabled
   - Log failed verification attempts
   - Store in `user_activity_log` table

4. **LOW:** Add device trust
   - "Remember this device for 30 days" checkbox
   - Store trusted device tokens
   - Skip 2FA for trusted devices

## Support

**For Users:**
- Recommend Google Authenticator or Authy for best experience
- If QR code doesn't work, use manual secret key entry
- Contact support if locked out (we can disable via database)

**For Developers:**
- Supabase MFA docs: https://supabase.com/docs/guides/auth/auth-mfa
- TOTP RFC: https://tools.ietf.org/html/rfc6238
- QR Code library: https://github.com/soldair/node-qrcode

## Compliance

This implementation helps meet:
- ✅ **GDPR**: User control over security features
- ✅ **PCI DSS**: Multi-factor authentication for financial accounts (if applicable)
- ✅ **SOC 2**: Strong authentication controls
- ⚠️ **NIST 800-63B**: Partially compliant (missing recovery options)

## Changelog

### 2025-01-02
- ✅ Initial implementation with TOTP enrollment
- ✅ QR code generation
- ✅ Enable/disable functionality
- ✅ Integration with artist and label admin settings
- ⏳ Login challenge flow (pending)
- ⏳ Recovery codes (pending)

---

**Implementation Status:** ✅ Enrollment Complete | ⚠️ Login Challenge Pending

**Cost:** $0/month (FREE)

**User Impact:** Users can enable 2FA but login challenge needs implementation before it's fully functional.
