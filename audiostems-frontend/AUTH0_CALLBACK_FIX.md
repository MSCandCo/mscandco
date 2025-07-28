# Auth0 Callback Configuration Fix

## Issue
You're getting "Port 54545 is already in use" OAuth error because Auth0 is trying to use the wrong port for callbacks.

## Root Cause
- Your app runs on `http://localhost:3001`
- Auth0 configuration was set to use `http://localhost:3000`
- Auth0 is trying to use port 54545 (likely a default or cached setting)

## ✅ Fixed in Code
- Updated `lib/auth0-config.js` to use port 3001
- Restarted development server

## 🔧 Auth0 Dashboard Configuration Required

You need to update your Auth0 application settings in the Auth0 dashboard:

### 1. Go to Auth0 Dashboard
- Visit: https://manage.auth0.com/
- Sign in to your account
- Navigate to **Applications** → **Applications**

### 2. Find Your Application
- Look for application: `AudioStems Frontend` or similar
- Click on the application name

### 3. Update Application Settings
Go to the **Settings** tab and update these URLs:

#### Allowed Callback URLs:
```
http://localhost:3001, http://localhost:3001/callback, http://localhost:3001/dashboard
```

#### Allowed Logout URLs:
```
http://localhost:3001, http://localhost:3001/login
```

#### Allowed Web Origins:
```
http://localhost:3001
```

### 4. Save Changes
- Click **Save Changes** at the bottom of the page

## 🧪 Test the Fix

1. **Clear browser cache** and cookies for localhost
2. **Visit**: http://localhost:3001/login
3. **Click "Sign In with Auth0"**
4. **Should redirect to Auth0 login** (not port 54545 error)

## 🔍 If Still Getting Port 54545 Error

The error might be cached. Try these steps:

1. **Clear browser cache completely**
2. **Open incognito/private window**
3. **Test login again**

## 📝 Environment Variables Check

Your `.env.local` should have:
```env
NEXT_PUBLIC_AUTH0_DOMAIN=dev-x2t2bdk6z050yxkr.uk.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=XuGhHG9OAAh2GXfcj7QKDmKdc26Gu1fb
NEXT_PUBLIC_AUTH0_AUDIENCE=https://dev-x2t2bdk6z050yxkr.uk.auth0.com/api/v2/
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🚨 Important Notes

- **Auth0 domain issue**: The domain `dev-x2t2bdk6z050yxkr.uk.auth0.com` is not accessible
- **You may need to**: Create a new Auth0 application or fix the domain configuration
- **Alternative**: Use Auth0's standard domain format (e.g., `your-tenant.auth0.com`)

## 🔄 Next Steps

1. Update Auth0 dashboard settings (above)
2. Test login flow
3. If domain still doesn't work, we'll need to set up a new Auth0 application 