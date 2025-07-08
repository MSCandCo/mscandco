# Auth0 Credentials Setup Guide

Follow these steps to get all the credentials needed for your `.env.local` file.

## Step 1: Get Auth0 Application Credentials

1. **Go to Auth0 Dashboard**
   - Visit: https://manage.auth0.com/
   - Sign in to your Auth0 account

2. **Navigate to Applications**
   - Click on "Applications" in the left sidebar
   - Find your "AudioStems Frontend" application or create a new one

3. **Get Client Credentials**
   - Click on your application
   - Go to the "Settings" tab
   - Copy these values:
     - **Domain**: `dev-x2t2bdk6z050yxkr.uk.auth0.com`
     - **Client ID**: `XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb`
     - **Client Secret**: (click "Show" to reveal)

4. **Configure Application Settings**
   - **Allowed Callback URLs**: `http://localhost:3001, http://localhost:3001/callback`
   - **Allowed Logout URLs**: `http://localhost:3001, http://localhost:3001/login-auth0`
   - **Allowed Web Origins**: `http://localhost:3001`
   - **Application Type**: Single Page Application

## Step 2: Get Auth0 Management API Token

1. **Go to APIs Section**
   - Click on "APIs" in the left sidebar
   - Click on "Auth0 Management API"

2. **Get Management Token**
   - Go to the "Machine to Machine Applications" tab
   - Find your application in the list
   - Enable the following scopes:
     - `read:users`
     - `update:users`
     - `create:users`
     - `delete:users`

3. **Generate Token**
   - Go to "Test" tab
   - Click "Generate Token"
   - Copy the generated token (it expires in 24 hours)

## Step 3: Create Auth0 API

1. **Create New API**
   - Go to "APIs" → "Create API"
   - **Name**: `AudioStems API`
   - **Identifier**: `https://api.audiostems.com`
   - **Signing Algorithm**: `RS256`

2. **Configure Scopes**
   - Add custom scope: `phone`
   - Keep default scopes: `openid`, `profile`, `email`

## Step 4: Set Up Auth0 Actions (Optional for Testing)

1. **Go to Actions**
   - Click on "Actions" in the left sidebar
   - Click on "Flows"

2. **Create Pre-Registration Action**
   - Go to "Login" flow
   - Click "Add Action" → "Build Custom"
   - Name: `Pre-Registration Validation`
   - Add the code from the setup guide

3. **Create Post-Registration Action**
   - Go to "Login" flow
   - Click "Add Action" → "Build Custom"
   - Name: `Post-Registration Setup`
   - Add the code from the setup guide

## Step 5: Complete Your .env.local File

Create a `.env.local` file in your project root with this content:

```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-x2t2bdk6z050yxkr.uk.auth0.com
AUTH0_CLIENT_ID=XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb
AUTH0_SECRET=your-auth0-secret-key-here
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=https://dev-x2t2bdk6z050yxkr.uk.auth0.com
AUTH0_CLIENT_SECRET=your-client-secret-here
AUTH0_MANAGEMENT_TOKEN=your-management-api-token-here

# Strapi Configuration (for backend integration)
NEXT_PUBLIC_STRAPI=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token-here

# Email Service (for email verification)
SENDGRID_API_KEY=your-sendgrid-api-key-here
EMAIL_FROM=noreply@audiostems.com

# SMS Service (for SMS verification)
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890

# File Upload (for profile images)
AWS_ACCESS_KEY_ID=your-aws-access-key-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name-here

# NextAuth Configuration (for compatibility with existing setup)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## Step 6: Replace Placeholder Values

Replace the placeholder values with your actual credentials:

### Required for Basic Testing:
- `AUTH0_CLIENT_SECRET` - From your Auth0 application settings
- `AUTH0_SECRET` - Generate a random string (32+ characters)
- `AUTH0_MANAGEMENT_TOKEN` - From Auth0 Management API
- `NEXTAUTH_SECRET` - Generate a random string (32+ characters)

### Optional for Full Testing:
- `SENDGRID_API_KEY` - For email verification (get from SendGrid)
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` - For SMS verification (get from Twilio)
- `AWS_*` - For file uploads (get from AWS)
- `STRAPI_API_TOKEN` - For backend integration (get from Strapi)

## Step 7: Generate Random Secrets

For the secret values, you can generate them using:

```bash
# Generate AUTH0_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

## Step 8: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the registration page**:
   ```
   http://localhost:3001/register-auth0
   ```

3. **Test the login page**:
   ```
   http://localhost:3001/login-auth0
   ```

## Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"**
   - Make sure your callback URLs are correctly set in Auth0
   - Check that `AUTH0_BASE_URL` matches your local development URL

2. **"Invalid client"**
   - Verify your `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET`
   - Make sure the application type is "Single Page Application"

3. **"Management API errors"**
   - Ensure your Management API token has the correct scopes
   - Check that the token hasn't expired (regenerate if needed)

4. **"CORS errors"**
   - Add `http://localhost:3001` to "Allowed Web Origins" in Auth0
   - Make sure your application type is "Single Page Application"

### For Testing Without Email/SMS:

If you want to test without setting up email and SMS services, you can:

1. **Skip email verification** by commenting out the email verification step
2. **Skip SMS verification** by commenting out the SMS verification step
3. **Use mock data** for testing the flow

The registration will still work for basic testing without these services configured. 