# AudioStems Auth0 Multi-Step Registration Setup

This document provides a complete guide for setting up Auth0 with a multi-step registration flow for AudioStems.

## Overview

The AudioStems registration system includes:
- **5-step registration process** with progress indicator
- **Email verification** with 36-second resend timer
- **SMS verification** for mobile number
- **Backup codes generation** using Auth0 MFA
- **Artist profile completion** with comprehensive fields
- **Role-based access control** for authenticated users

## Registration Flow

### Step 1: Basic Information
- First Name, Last Name, Stage Name
- Email address
- Password (with confirmation)
- Real-time validation

### Step 2: Email Verification
- 6-digit verification code sent to email
- 36-second resend timer
- Automatic verification status update

### Step 3: SMS Verification
- Phone number input with validation
- SMS verification code
- 36-second resend timer for SMS

### Step 4: Backup Codes
- Generate 10 random 8-character backup codes
- Download codes as text file
- Regenerate codes option

### Step 5: Artist Profile
- Pre-filled basic information from registration
- Artist type selection (Solo Artist, Band, Group, DJ, Duo, Orchestra, Ensemble, Collective)
- Comprehensive genre selection (100+ genres)
- Contract status and date signed
- Social media handles (Instagram, Twitter, Facebook, YouTube, TikTok, Spotify)
- Manager information
- Additional information text area
- Profile photo upload

## Auth0 Configuration

### 1. Auth0 Application Setup

1. **Create Application**
   - Go to Auth0 Dashboard → Applications → Create Application
   - Name: `AudioStems Frontend`
   - Type: `Single Page Application`

2. **Configure Settings**
   ```
   Allowed Callback URLs: http://localhost:3001, http://localhost:3001/callback
   Allowed Logout URLs: http://localhost:3001, http://localhost:3001/login-auth0
   Allowed Web Origins: http://localhost:3001
   ```

3. **Get Credentials**
   - Domain: `dev-x2t2bdk6z050yxkr.uk.auth0.com`
   - Client ID: `XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb`
   - Client Secret: (from Auth0 dashboard)

### 2. Auth0 API Setup

1. **Create API**
   - Go to Auth0 Dashboard → APIs → Create API
   - Name: `AudioStems API`
   - Identifier: `https://api.audiostems.com`
   - Signing Algorithm: `RS256`

2. **Configure Scopes**
   - `openid` (default)
   - `profile` (default)
   - `email` (default)
   - `phone` (custom)

### 3. Auth0 Actions Setup

#### Pre-Registration Action
```javascript
exports.onExecutePreUserRegistration = async (event, api) => {
  // Validate email format
  const email = event.user.email;
  if (!email || !email.includes('@')) {
    api.access.denied('Invalid email address');
  }
  
  // Set default user metadata
  api.user.setUserMetadata({
    registrationStep: 'basic_info',
    profileComplete: false
  });
};
```

#### Post-Registration Action
```javascript
exports.onExecutePostUserRegistration = async (event, api) => {
  // Set initial user metadata
  api.user.setUserMetadata({
    registrationStep: 'email_verification',
    profileComplete: false,
    emailVerified: false,
    mobileVerified: false,
    backupCodesGenerated: false
  });
  
  // Send welcome email
  const managementApi = new ManagementApi({
    domain: event.secrets.AUTH0_DOMAIN,
    clientId: event.secrets.CLIENT_ID,
    clientSecret: event.secrets.CLIENT_SECRET,
    scope: 'read:users update:users'
  });
  
  // Update user with initial metadata
  await managementApi.updateUser({ id: event.user.user_id }, {
    user_metadata: {
      registrationStep: 'email_verification',
      profileComplete: false
    }
  });
};
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-x2t2bdk6z050yxkr.uk.auth0.com
AUTH0_CLIENT_ID=XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb
AUTH0_SECRET=your-auth0-secret-key
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=https://dev-x2t2bdk6z050yxkr.uk.auth0.com
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_MANAGEMENT_TOKEN=your-management-api-token

# Strapi Configuration
NEXT_PUBLIC_STRAPI=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token

# Email Service (Optional - for fallback email sending)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@audiostems.com

# SMS Service (Optional - for SMS verification)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload (Optional - for profile images)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

## File Structure

```
audiostems-frontend/
├── components/
│   ├── auth/
│   │   ├── MultiStepRegistration.js
│   │   ├── ProtectedRoute.js
│   │   └── steps/
│   │       ├── BasicInfoStep.js
│   │       ├── EmailVerificationStep.js
│   │       ├── SMSVerificationStep.js
│   │       ├── BackupCodesStep.js
│   │       └── ArtistProfileStep.js
│   └── providers/
│       └── Auth0Provider.js
├── lib/
│   └── auth0-config.js
├── pages/
│   ├── api/auth/
│   │   ├── complete-registration.js
│   │   ├── check-profile.js
│   │   ├── get-profile.js
│   │   ├── update-profile.js
│   │   ├── send-verification-email.js
│   │   ├── verify-email.js
│   │   └── generate-backup-codes.js
│   ├── artist-portal/
│   │   ├── index.js
│   │   └── profile.js
│   ├── login-auth0.js
│   └── register-auth0.js
└── _app.js
```

## API Endpoints

### Registration Flow
- `POST /api/auth/complete-registration` - Complete registration and save to backend
- `POST /api/auth/send-verification-email` - Send email verification code
- `POST /api/auth/verify-email` - Verify email code
- `POST /api/auth/generate-backup-codes` - Generate backup codes

### Profile Management
- `GET /api/auth/check-profile` - Check if profile is complete
- `GET /api/auth/get-profile` - Get user profile data
- `POST /api/auth/update-profile` - Update user profile

## Pages

### Public Pages
- `/login-auth0` - Auth0 login page
- `/register-auth0` - Multi-step registration

### Protected Pages
- `/artist-portal` - Main artist dashboard
- `/artist-portal/profile` - Profile management

## Components

### MultiStepRegistration
Main component managing the 5-step registration flow with:
- Progress indicator
- Step navigation
- Form data persistence
- Validation
- Error handling

### ProtectedRoute
Wrapper component for protected pages that:
- Checks authentication status
- Redirects to login if not authenticated
- Checks profile completion if required
- Provides loading states

### Step Components
Each step component includes:
- Form validation with Yup
- Real-time error display
- Progress tracking
- Data persistence between steps

## Artist Profile Fields

### Basic Information
- First Name, Last Name, Stage Name (pre-filled from registration)
- Email (editable - updates login email)
- Phone Number (editable)

### Artist Information
- Artist Type: Solo Artist, Band, Group, DJ, Duo, Orchestra, Ensemble, Collective
- Genre: Comprehensive list of 100+ music genres
- Contract Status: Pending, Signed, Active, Expired, Renewal, Inactive
- Date Signed

### Social Media
- Instagram, Twitter, Facebook, YouTube, TikTok, Spotify

### Manager Information
- Manager Name, Email, Phone

### Additional Information
- Text area for additional notes

## Security Features

### Authentication
- Auth0 JWT tokens
- Secure session management
- Automatic token refresh
- Protected routes

### Data Protection
- User metadata stored in Auth0
- Profile data encrypted
- Secure API endpoints
- Input validation and sanitization

### MFA Support
- Backup codes generation
- Email verification
- SMS verification
- Account recovery options

## Testing

### Local Development
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001/register-auth0`

3. Test the complete registration flow:
   - Basic information entry
   - Email verification
   - SMS verification
   - Backup codes generation
   - Artist profile completion

### Test Accounts
- Use Auth0 test users for development
- Configure test email and SMS services
- Use mock data for backend integration

## Production Deployment

### Environment Setup
1. Update Auth0 application settings for production domain
2. Configure production callback URLs
3. Set up production email and SMS services
4. Configure AWS S3 for file uploads

### Security Checklist
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up rate limiting
- [ ] Enable Auth0 logs
- [ ] Configure backup and recovery
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **Auth0 Configuration**
   - Verify domain and client ID
   - Check callback URLs
   - Ensure API permissions

2. **Email Verification**
   - Check SendGrid configuration
   - Verify email templates
   - Test email delivery

3. **SMS Verification**
   - Verify Twilio credentials
   - Check phone number format
   - Test SMS delivery

4. **Profile Updates**
   - Check Auth0 Management API permissions
   - Verify user metadata structure
   - Test API endpoints

### Debug Mode
Enable debug logging in Auth0 configuration:
```javascript
{
  debug: true,
  cacheLocation: 'localstorage'
}
```

## Support

For technical support:
1. Check Auth0 logs in dashboard
2. Review browser console for errors
3. Verify environment variables
4. Test API endpoints individually
5. Check network requests in browser dev tools

## Next Steps

1. **Backend Integration**
   - Connect to Strapi backend
   - Implement user data synchronization
   - Set up webhook handlers

2. **Additional Features**
   - Email templates customization
   - Advanced MFA options
   - Social login providers
   - Role-based permissions

3. **Analytics**
   - User registration analytics
   - Conversion tracking
   - Error monitoring

4. **Performance**
   - Code splitting
   - Lazy loading
   - Caching strategies 