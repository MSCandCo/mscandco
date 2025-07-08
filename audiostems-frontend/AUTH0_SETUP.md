# Auth0 Multi-Step Registration Setup

This guide will help you set up Auth0 with a comprehensive multi-step registration flow for AudioStems.

## Overview

The registration flow includes:
1. **Basic Info Collection** - Name, stage name, email, password
2. **Email Verification** - 6-digit code with 36-second resend timer
3. **SMS Verification** - Phone number verification
4. **Backup Codes** - 10 recovery codes for account security
5. **Artist Profile** - Bio, website, genre, social media links
6. **Dashboard Access** - Role-based access selection

## Prerequisites

- Auth0 account
- Strapi backend running
- Email service (SendGrid, AWS SES, etc.)
- SMS service (Twilio, AWS SNS, etc.) - optional
- File storage (AWS S3, etc.) - optional

## Step 1: Auth0 Configuration

### 1.1 Create Auth0 Application

1. Go to your Auth0 Dashboard
2. Navigate to **Applications** → **Applications**
3. Click **Create Application**
4. Choose **Single Page Application**
5. Name it "AudioStems Frontend"

### 1.2 Configure Application Settings

**Allowed Callback URLs:**
```
http://localhost:3001, http://localhost:3001/callback
```

**Allowed Logout URLs:**
```
http://localhost:3001, http://localhost:3001/
```

**Allowed Web Origins:**
```
http://localhost:3001
```

### 1.3 Create API

1. Go to **Applications** → **APIs**
2. Click **Create API**
3. Name: "AudioStems API"
4. Identifier: `https://api.audiostems.com`
5. Signing Algorithm: RS256

### 1.4 Create Management API Token

1. Go to **Applications** → **APIs** → **Auth0 Management API**
2. Click **Machine to Machine Applications**
3. Authorize your application
4. Grant the following scopes:
   - `read:users`
   - `update:users`
   - `create:users`
   - `delete:users`
   - `read:user_idp_tokens`

## Step 2: Environment Variables

Copy the `env.example` file to `.env.local` and fill in your values:

```bash
# Auth0 Configuration
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.audiostems.com
AUTH0_SECRET=your-auth0-secret-key
AUTH0_MANAGEMENT_TOKEN=your-management-api-token

# Strapi Configuration
NEXT_PUBLIC_STRAPI=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

## Step 3: Auth0 Actions Setup

### 3.1 Pre-Registration Action

1. Go to **Actions** → **Flows** → **Login**
2. Click **Add Action** → **Build Custom**
3. Name: "Collect Basic Info"
4. Add this code:

```javascript
exports.onExecutePreUserRegistration = async (event, api) => {
  const { firstName, lastName, stageName, password } = event.request.body;
  
  // Store basic info in user metadata
  api.user.setUserMetadata({
    firstName,
    lastName,
    stageName,
    registrationStep: 'basic_info_completed'
  });
  
  // Set custom claims
  api.idToken.setCustomClaim('registration_step', 'basic_info_completed');
  api.accessToken.setCustomClaim('registration_step', 'basic_info_completed');
};
```

### 3.2 Post-Registration Action

1. Go to **Actions** → **Flows** → **Login**
2. Click **Add Action** → **Build Custom**
3. Name: "Email Verification Flow"
4. Add this code:

```javascript
exports.onExecutePostUserRegistration = async (event, api) => {
  // Update user metadata
  api.user.setUserMetadata({
    registrationStep: 'email_verification_pending',
    emailVerified: false,
    mobileVerified: false,
    profileComplete: false,
    backupCodesGenerated: false
  });
};
```

## Step 4: Database Schema Updates

### 4.1 Strapi User Schema

Update your Strapi user schema to include Auth0 fields:

```json
{
  "kind": "collectionType",
  "collectionName": "users",
  "info": {
    "name": "user",
    "description": ""
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "auth0Id": {
      "type": "string",
      "unique": true
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "stageName": {
      "type": "string"
    },
    "email": {
      "type": "email",
      "unique": true
    },
    "phoneNumber": {
      "type": "string"
    },
    "bio": {
      "type": "text"
    },
    "website": {
      "type": "string"
    },
    "genre": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "socialMedia": {
      "type": "json"
    },
    "profileImage": {
      "type": "string"
    },
    "role": {
      "type": "enumeration",
      "enum": ["artist", "admin", "manager"]
    },
    "emailVerified": {
      "type": "boolean",
      "default": false
    },
    "mobileVerified": {
      "type": "boolean",
      "default": false
    },
    "profileComplete": {
      "type": "boolean",
      "default": false
    },
    "backupCodesGenerated": {
      "type": "boolean",
      "default": false
    },
    "backupCodes": {
      "type": "json"
    },
    "registrationComplete": {
      "type": "boolean",
      "default": false
    }
  }
}
```

## Step 5: Email Service Setup

### 5.1 SendGrid Configuration

1. Create a SendGrid account
2. Create an API key
3. Add to environment variables:

```bash
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@audiostems.com
```

### 5.2 Auth0 Email Templates

1. Go to **Branding** → **Universal Login**
2. Click **Email Templates**
3. Customize the verification email template

## Step 6: SMS Service Setup (Optional)

### 6.1 Twilio Configuration

1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Add to environment variables:

```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 7: File Upload Setup (Optional)

### 7.1 AWS S3 Configuration

1. Create an AWS S3 bucket
2. Create IAM user with S3 access
3. Add to environment variables:

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

## Step 8: Testing the Setup

### 8.1 Start the Application

```bash
# Start the frontend
npm run dev

# Start the backend (in another terminal)
cd ../audiostems-backend
npm run develop
```

### 8.2 Test Registration Flow

1. Navigate to `http://localhost:3001/register-auth0`
2. Click "Start Registration"
3. Complete each step of the registration process
4. Verify that data is properly stored in both Auth0 and Strapi

## Step 9: Production Deployment

### 9.1 Update Environment Variables

For production, update your environment variables with production URLs:

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-production-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-production-client-id
NEXT_PUBLIC_STRAPI=https://your-production-strapi.com
```

### 9.2 Update Auth0 Settings

1. Update **Allowed Callback URLs** with your production domain
2. Update **Allowed Logout URLs** with your production domain
3. Update **Allowed Web Origins** with your production domain

### 9.3 Security Considerations

1. Use HTTPS in production
2. Implement rate limiting for verification endpoints
3. Store verification codes securely (Redis recommended)
4. Implement proper error handling
5. Add logging for security events

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Auth0 settings include your domain
2. **Token Issues**: Verify AUTH0_MANAGEMENT_TOKEN is valid
3. **Email Not Sending**: Check SendGrid API key and configuration
4. **SMS Not Sending**: Verify Twilio credentials and phone number format

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=auth0:*
```

## API Endpoints

The following API endpoints are created:

- `POST /api/auth/complete-registration` - Complete registration process
- `POST /api/auth/send-verification-email` - Send email verification
- `POST /api/auth/verify-email` - Verify email code
- `POST /api/auth/send-sms-verification` - Send SMS verification
- `POST /api/auth/verify-sms` - Verify SMS code
- `POST /api/auth/generate-backup-codes` - Generate backup codes
- `POST /api/auth/upload-profile-image` - Upload profile image

## Security Best Practices

1. **Rate Limiting**: Implement rate limiting on verification endpoints
2. **Code Expiration**: Verification codes expire after 10 minutes
3. **Secure Storage**: Store sensitive data encrypted
4. **Audit Logging**: Log all authentication events
5. **Input Validation**: Validate all user inputs
6. **HTTPS Only**: Use HTTPS in production

## Support

For issues or questions:
1. Check the Auth0 documentation
2. Review the console logs for errors
3. Verify all environment variables are set correctly
4. Test each step of the registration flow individually 