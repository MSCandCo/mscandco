# 🔧 Auth0 Native Email Verification Setup Guide

## Overview
This guide will help you configure Auth0 to use its built-in "Verification Email (Code)" template that sends 6-digit verification codes instead of verification links.

## Step 1: Configure Email Templates in Auth0 Dashboard

### 1.1 Access Email Templates
1. Go to your Auth0 Dashboard: `https://manage.auth0.com/dashboard`
2. Navigate to **Branding** → **Email Templates**
3. Find the **Verification Email** template

### 1.2 Enable Code-Based Verification
1. Click on **Verification Email**
2. In the template settings, look for **Verification Method**
3. **Change from "Link" to "Code"**
4. This will automatically switch to sending 6-digit codes instead of verification links

### 1.3 Customize the Email Template (Optional)
You can customize the email template to match your brand:

```html
<!-- Example customization -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">AudioStems</h1>
  <p>Your verification code is: <strong>{{code}}</strong></p>
  <p>This code will expire in 10 minutes.</p>
</div>
```

## Step 2: Configure Database Connection Settings

### 2.1 Disable Built-in Email Verification
1. Go to **Authentication** → **Database**
2. Click on your **Username-Password-Authentication** connection
3. In the **Settings** tab, find **Email Verification**
4. **Enable** the following options:
   - ✅ **Requires Email Verification**
   - ✅ **Disable Sign Ups** (optional, for admin-only signups)

### 2.2 Configure Email Provider
1. Go to **Authentication** → **Email**
2. Configure your email provider (SendGrid, Mailgun, etc.)
3. Test the email configuration

## Step 3: Update Your Application Code

### 3.1 User Creation
The updated `create-account.js` API now:
- Sets `verify_email: true` to enable Auth0's native email verification
- Removes all custom SendGrid code
- Uses Auth0's built-in 6-digit code system

### 3.2 Email Verification Flow
1. User registers → Auth0 automatically sends 6-digit code
2. User enters code → Auth0 verifies the code
3. User is marked as verified → Can proceed with registration

## Step 4: Handle Email Verification in Frontend

### 4.1 Verification Code Input
Create a verification code input component:

```javascript
// Example verification component
const [verificationCode, setVerificationCode] = useState('');
const [isVerifying, setIsVerifying] = useState(false);

const handleVerification = async () => {
  setIsVerifying(true);
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verificationCode })
    });
    
    if (response.ok) {
      // Email verified successfully
      router.push('/dashboard');
    } else {
      // Handle verification error
    }
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    setIsVerifying(false);
  }
};
```

### 4.2 Resend Functionality
Auth0 provides built-in resend functionality. You can trigger a resend using the Auth0 Management API:

```javascript
// Resend verification email
const resendVerification = async () => {
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    
    if (response.ok) {
      // Resend successful
      setResendTimer(36); // Start 36-second timer
    }
  } catch (error) {
    console.error('Resend error:', error);
  }
};
```

## Step 5: Environment Variables

Update your `.env.local` file:

```bash
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Auth0 Management API
AUTH0_DOMAIN='your-domain.auth0.com'
AUTH0_MGMT_CLIENT_ID='your-management-client-id'
AUTH0_MGMT_CLIENT_SECRET='your-management-client-secret'

# Remove SendGrid variables (no longer needed)
# SENDGRID_API_KEY=...
# SENDGRID_FROM_EMAIL=...
```

## Benefits of This Approach

✅ **Reliability**: Auth0's built-in system is more reliable than custom implementations
✅ **Security**: Auth0 handles code generation, expiration, and verification securely
✅ **Simplicity**: No need to manage custom email sending infrastructure
✅ **Maintenance**: Auth0 handles email delivery, retries, and error handling
✅ **Compliance**: Built-in features for email verification best practices

## Testing

1. **Create a test user** through your registration form
2. **Check email** for the 6-digit verification code
3. **Enter the code** in your verification form
4. **Verify** that the user is marked as verified in Auth0

## Troubleshooting

### Issue: Users still receive verification links instead of codes
**Solution**: Make sure you've changed the Verification Email template from "Link" to "Code" in the Auth0 dashboard.

### Issue: Email not sending
**Solution**: Check your email provider configuration in Auth0 → Authentication → Email.

### Issue: Verification codes not working
**Solution**: Ensure your Auth0 Management API has the correct permissions and credentials.

## Next Steps

1. Test the new email verification flow
2. Update your frontend to handle the 6-digit code input
3. Implement the resend functionality with the 36-second timer
4. Remove any remaining SendGrid references from your codebase 