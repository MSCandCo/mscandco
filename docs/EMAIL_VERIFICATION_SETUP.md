# Email Verification Setup Guide

## 🎯 **Overview**

This guide will help you set up email verification for user registration. When users register, they'll receive a verification email and must click the link to verify their account before they can log in.

## 📧 **Email Provider Setup**

### **Option 1: SendGrid (Recommended)**

1. **Create SendGrid Account:**
   - Go to [SendGrid](https://sendgrid.com)
   - Sign up for a free account (100 emails/day)
   - Verify your domain or use a verified sender

2. **Get API Key:**
   - Go to Settings → API Keys
   - Create a new API Key with "Mail Send" permissions
   - Copy the API key

3. **Update Environment Variables:**
   ```bash
   # In audiostems-backend/.env
   SENDGRID_API_KEY=your-sendgrid-api-key-here
   DEFAULT_FROM_EMAIL=noreply@audiostems.com
   DEFAULT_REPLY_TO_EMAIL=support@audiostems.com
   FRONTEND_URL=http://localhost:3000
   ```

### **Option 2: Resend (Alternative)**

1. **Create Resend Account:**
   - Go to [Resend](https://resend.com)
   - Sign up for a free account (100 emails/day)
   - Verify your domain

2. **Install Resend Provider:**
   ```bash
   cd audiostems-backend
   npm install @strapi/provider-email-resend
   ```

3. **Update Configuration:**
   ```javascript
   // In config/plugins.js
   email: {
     config: {
       provider: '@strapi/provider-email-resend',
       providerOptions: {
         apiKey: env('RESEND_API_KEY'),
       },
       settings: {
         defaultFrom: env('DEFAULT_FROM_EMAIL', 'noreply@audiostems.com'),
         defaultReplyTo: env('DEFAULT_REPLY_TO_EMAIL', 'support@audiostems.com'),
       },
     },
   },
   ```

## 🔧 **Backend Configuration**

### **1. Email Plugin Configuration**
The email plugin is already configured in `config/plugins.js`:

```javascript
email: {
  config: {
    provider: '@strapi/provider-email-sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: env('DEFAULT_FROM_EMAIL', 'noreply@audiostems.com'),
      defaultReplyTo: env('DEFAULT_REPLY_TO_EMAIL', 'support@audiostems.com'),
    },
  },
},
```

### **2. Custom Registration Handler**
The registration process has been modified in `src/extensions/users-permissions/strapi-server.js` to:
- Set `confirmed: false` for new users
- Generate a confirmation token
- Send verification email
- Return success message instead of JWT

### **3. Verification API**
A new API endpoint has been created at `/api/verify-email` that:
- Validates the confirmation token
- Checks token expiration (24 hours)
- Updates user to `confirmed: true`
- Returns success/error message

## 🎨 **Frontend Implementation**

### **1. Verification Page**
Created `pages/verify-email.js` with:
- Token validation from URL
- API call to verify email
- Success/error states
- Direct login button after verification

### **2. Updated Registration Flow**
Modified `pages/register.js` to:
- Show verification message instead of redirecting
- Remove automatic login redirect
- Display "check email" message

## 🚀 **Testing the Setup**

### **1. Local Testing (Without Email)**
For development, you can test without sending actual emails:

```bash
# Check the verification token in the database
# Look for the confirmationToken field in the users table
```

### **2. With Email Provider**
1. **Set up SendGrid/Resend** (see above)
2. **Update environment variables**
3. **Restart the backend:**
   ```bash
   cd audiostems-backend
   npm run develop
   ```

### **3. Test Registration Flow**
1. **Register a new user** at http://localhost:3000/register
2. **Check email** for verification link
3. **Click verification link** or visit `/verify-email?token=YOUR_TOKEN`
4. **Verify success** and login button appears

## 📋 **User Flow**

### **Registration Process:**
1. User fills out registration form
2. Backend creates user with `confirmed: false`
3. Verification email is sent with unique token
4. User sees "check email" message
5. User clicks verification link in email
6. Frontend calls verification API
7. User account is marked as confirmed
8. User can now log in

### **Email Template:**
The verification email includes:
- Welcome message
- Verification button
- Fallback link
- Expiration notice (24 hours)
- AudioStems branding

## 🔒 **Security Features**

- **Token Expiration:** 24 hours
- **One-time Use:** Token is cleared after verification
- **Secure Generation:** Uses Strapi's built-in token generation
- **Email Validation:** Prevents duplicate registrations

## 🛠 **Troubleshooting**

### **Common Issues:**

#### **1. Email Not Sending**
- Check API key configuration
- Verify sender email is verified
- Check console logs for errors

#### **2. Verification Link Not Working**
- Ensure `FRONTEND_URL` is set correctly
- Check token expiration
- Verify API endpoint is accessible

#### **3. User Can't Log In After Verification**
- Check if user is marked as `confirmed: true`
- Verify JWT generation is working
- Check login API permissions

### **Debug Commands:**
```bash
# Check user confirmation status
curl -X GET "http://localhost:1337/api/users?filters[email][$eq]=test@example.com"

# Test email sending
curl -X POST "http://localhost:1337/api/email/test" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Test email"}'
```

## 📝 **Environment Variables Reference**

### **Backend (.env):**
```bash
FRONTEND_URL=http://localhost:3000
SENDGRID_API_KEY=your-sendgrid-api-key-here
DEFAULT_FROM_EMAIL=noreply@audiostems.com
DEFAULT_REPLY_TO_EMAIL=support@audiostems.com
```

### **Frontend (.env.local):**
```bash
NEXT_PUBLIC_STRAPI=http://localhost:1337
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 🎯 **Next Steps**

1. **Set up email provider** (SendGrid/Resend)
2. **Configure environment variables**
3. **Test registration flow**
4. **Customize email template** if needed
5. **Deploy to production** with proper email configuration 