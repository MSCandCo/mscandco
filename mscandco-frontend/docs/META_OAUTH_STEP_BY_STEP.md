# 📸 Meta Platforms OAuth Setup - Literal Step-by-Step Guide

## 🎯 What We're Setting Up

We're creating **ONE Facebook App** that will work for **BOTH Instagram and Facebook** OAuth. This is the most efficient approach since Facebook owns Instagram.

---

## 📋 STEP 1: Create Facebook Developer Account

### Step 1.1: Go to Facebook Developers
1. Open your web browser
2. Go to: **https://developers.facebook.com/**
3. Click the **"Get Started"** button (top right corner, blue button)

### Step 1.2: Log In or Create Account
1. If you have a Facebook account:
   - Click **"Log In"**
   - Enter your Facebook email and password
   - Click **"Log In"**
   
2. If you don't have a Facebook account:
   - Click **"Sign Up"**
   - Follow Facebook's sign-up process
   - Verify your email if required

### Step 1.3: Complete Developer Registration
1. Facebook will ask you to verify your account:
   - Enter your phone number
   - Enter the verification code sent to your phone
   - Click **"Continue"**

2. You may be asked to accept terms:
   - Read the terms (optional)
   - Check the box to accept
   - Click **"Continue"** or **"Get Started"**

**✅ You should now be on the Facebook Developers dashboard**

---

## 📋 STEP 2: Create a Facebook App

### Step 2.1: Navigate to "My Apps"
1. Look at the top navigation bar
2. Click **"My Apps"** (it's a dropdown menu)
3. Click **"Create App"** from the dropdown

**Alternative:** You might see a big **"Create App"** button directly on the dashboard - click that instead.

### Step 2.2: Choose App Type
1. You'll see a modal/popup with app type options
2. **IMPORTANT:** Select **"Business"** (NOT "Consumer" or "None")
   - Look for the option that says **"Business"**
   - It might be labeled as "Manage Business Integrations" or similar
   - This is CRITICAL for Instagram API access
3. Click **"Next"**

### Step 2.3: Fill in App Details
1. **App Display Name:**
   - Enter: `MSC & Co Platform` (or your preferred name)
   - This is what users will see

2. **App Contact Email:**
   - Enter your email address (e.g., `your-email@domain.com`)
   - This must be a valid email you can access

3. **Business Account (Optional):**
   - You can skip this for now
   - Or select an existing business account if you have one

4. Click **"Create App"** button

### Step 2.4: Complete Security Check
1. Facebook may ask you to verify your identity:
   - Enter the code sent to your email or phone
   - Click **"Submit"**

**✅ You should now see your app dashboard**

---

## 📋 STEP 3: Add Instagram Product

### Step 3.1: Find "Add Product"
1. Look at the left sidebar in your app dashboard
2. You should see a section that says **"Products"** or **"Add a Product"**
3. If you see **"Add a Product"** button, click it
4. If you see a list of products, scroll down to find **"Instagram"**

### Step 3.2: Add Instagram Basic Display
1. Look for **"Instagram Basic Display"** in the products list
2. Click the **"Set Up"** button next to it

**Note:** You might also see "Instagram Graph API" - we'll use "Instagram Basic Display" for OAuth.

### Step 3.3: Configure Instagram Basic Display
1. You'll be taken to the Instagram Basic Display setup page
2. You should see sections for:
   - **Valid OAuth Redirect URIs**
   - **Deauthorize Callback URL**
   - **Data Deletion Request URL**

**✅ Instagram product is now added to your app**

---

## 📋 STEP 4: Configure App Settings

### Step 4.1: Go to App Settings
1. Look at the left sidebar
2. Click **"Settings"** → **"Basic"**
   - It's under the "Settings" section

### Step 4.2: Fill in Required Information
1. Scroll down to find these fields:

   **App Domains:**
   - Click in the field
   - Enter: `yourdomain.com` (replace with your actual domain)
   - For development, you can also add: `localhost`

   **Privacy Policy URL:**
   - Click in the field
   - Enter: `https://yourdomain.com/privacy`
   - (You'll need to create this page later, but enter it now)

   **Terms of Service URL:**
   - Click in the field
   - Enter: `https://yourdomain.com/terms`
   - (You'll need to create this page later, but enter it now)

   **User Data Deletion URL (Optional but recommended):**
   - Click in the field
   - Enter: `https://yourdomain.com/delete-data`
   - (You'll need to create this page later, but enter it now)

2. Scroll down and click **"Save Changes"** button

### Step 4.3: Add Platform (Web)
1. Still in Settings → Basic, scroll down
2. Look for **"Platform"** section
3. Click **"Add Platform"** button
4. Select **"Website"** from the dropdown
5. A new field will appear: **"Site URL"**
   - Enter: `https://yourdomain.com`
   - Click **"Save Changes"**

---

## 📋 STEP 5: Configure Instagram OAuth Redirect URIs

### Step 5.1: Go to Instagram Basic Display Settings
1. Look at the left sidebar
2. Click **"Products"** → **"Instagram"** → **"Basic Display"**
   - Or find "Instagram Basic Display" in the left menu

### Step 5.2: Add Redirect URIs
1. Find the section **"Valid OAuth Redirect URIs"**
2. Click the **"Add URI"** button or click in the text field
3. Add these URIs one by one (click "Add URI" for each):

   **For Production:**
   ```
   https://yourdomain.com/api/features/social/oauth/callback?platform=instagram
   ```
   (Replace `yourdomain.com` with your actual domain)

   **For Development:**
   ```
   http://localhost:3000/api/features/social/oauth/callback?platform=instagram
   ```

4. After adding each URI, click **"Save Changes"** (if there's a save button)
5. Or the URIs might save automatically as you add them

### Step 5.3: Add Deauthorize Callback (Optional)
1. Find **"Deauthorize Callback URL"** field
2. Enter: `https://yourdomain.com/api/features/social/oauth/deauthorize?platform=instagram`
3. Click **"Save Changes"**

### Step 5.4: Add Data Deletion Callback (Optional)
1. Find **"Data Deletion Request URL"** field
2. Enter: `https://yourdomain.com/api/features/social/oauth/delete-data?platform=instagram`
3. Click **"Save Changes"**

---

## 📋 STEP 6: Get Your Instagram Credentials

### Step 6.1: Go Back to Basic Settings
1. Click **"Settings"** → **"Basic"** in the left sidebar

### Step 6.2: Find Your App ID
1. Look for **"App ID"** field
2. You'll see a long number (e.g., `1234567890123456`)
3. Click the **"Copy"** button next to it (or manually select and copy)
4. **Save this somewhere safe** - This is your `INSTAGRAM_CLIENT_ID`

### Step 6.3: Find Your App Secret
1. Scroll down to find **"App Secret"** field
2. You'll see **"Show"** button - click it
3. Facebook may ask you to enter your password for security
4. Enter your Facebook password
5. Click **"Confirm"**
6. The App Secret will now be visible
7. Click the **"Copy"** button next to it (or manually select and copy)
8. **Save this somewhere safe** - This is your `INSTAGRAM_CLIENT_SECRET`

**⚠️ IMPORTANT:** Never share your App Secret publicly!

---

## 📋 STEP 7: Add Facebook Login Product

### Step 7.1: Add Facebook Login
1. Go back to **"Products"** in the left sidebar
2. Click **"Add a Product"** (or find it in the products list)
3. Look for **"Facebook Login"**
4. Click **"Set Up"** button next to it

### Step 7.2: Configure Facebook Login
1. Select **"Web"** as your platform
2. Click **"Continue"**

### Step 7.3: Add Facebook Redirect URIs
1. Go to **"Products"** → **"Facebook Login"** → **"Settings"**
2. Find **"Valid OAuth Redirect URIs"** section
3. Click **"Add URI"** and add:

   **For Production:**
   ```
   https://yourdomain.com/api/features/social/oauth/callback?platform=facebook
   ```

   **For Development:**
   ```
   http://localhost:3000/api/features/social/oauth/callback?platform=facebook
   ```

4. Click **"Save Changes"**

**✅ Facebook Login is now configured**

---

## 📋 STEP 8: Add Credentials to Your Project

### Step 8.1: Open Your .env.local File
1. Navigate to your project folder: `mscandco-frontend`
2. Open the file `.env.local` in a text editor
   - If it doesn't exist, create it

### Step 8.2: Add Instagram Credentials
1. Add these lines to your `.env.local` file:

```bash
# Instagram OAuth (via Facebook)
INSTAGRAM_CLIENT_ID=paste_your_app_id_here
INSTAGRAM_CLIENT_SECRET=paste_your_app_secret_here
```

2. Replace `paste_your_app_id_here` with the App ID you copied
3. Replace `paste_your_app_secret_here` with the App Secret you copied

### Step 8.3: Add Facebook Credentials
1. Add these lines to your `.env.local` file:

```bash
# Facebook OAuth
FACEBOOK_APP_ID=paste_your_app_id_here
FACEBOOK_APP_SECRET=paste_your_app_secret_here
```

**Note:** For Facebook, use the SAME App ID and App Secret as Instagram (since it's the same app)

### Step 8.4: Add Base URL
1. Make sure you have this line:

```bash
NEXT_PUBLIC_URL=https://yourdomain.com
```

2. For local development, you can also add:
```bash
NEXT_PUBLIC_URL=http://localhost:3000
```

### Step 8.5: Save the File
1. Save your `.env.local` file
2. **IMPORTANT:** Make sure `.env.local` is in your `.gitignore` file (it should be already)

---

## 📋 STEP 9: Add Test Users (For Development)

### Step 9.1: Go to Roles
1. In your Facebook App dashboard
2. Click **"Roles"** in the left sidebar
3. Click **"Roles"** submenu

### Step 9.2: Add Instagram Test Users
1. Scroll down to **"Instagram Testers"** section
2. Click **"Add Instagram Testers"** button
3. Enter Instagram usernames you want to test with
4. Click **"Submit"**
5. Those users need to accept the invitation on Instagram

### Step 9.3: Add Facebook Test Users
1. Scroll to **"Test Users"** section
2. Click **"Add Test Users"** button
3. Facebook will create test users automatically
4. You can use these for testing

**✅ Test users added**

---

## 📋 STEP 10: Verify Your Setup

### Step 10.1: Check Your .env.local File
Open your `.env.local` and verify it looks like this:

```bash
# Instagram OAuth (via Facebook)
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890

# Facebook OAuth (same app)
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890

# Base URL
NEXT_PUBLIC_URL=https://yourdomain.com
```

### Step 10.2: Restart Your Development Server
1. Stop your current dev server (Ctrl+C or Cmd+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 10.3: Test the OAuth Flow
1. Navigate to your app's social media settings page
2. Click "Connect Instagram" or "Connect Facebook"
3. You should be redirected to Facebook/Instagram login
4. After logging in, you should be redirected back to your app

---

## ⚠️ Important Notes

### App Review (For Production)
- **Development Mode:** Your app works with test users only
- **Production Mode:** Requires App Review from Facebook
- App Review can take 1-2 weeks
- You'll need to provide:
  - Video demonstration
  - Privacy policy URL
  - Terms of service URL
  - Use case explanation

### Redirect URI Matching
- Redirect URIs must match **EXACTLY** (including `http` vs `https`)
- No trailing slashes
- Case-sensitive
- Include the full path with query parameters

### Token Expiration
- Instagram tokens expire after 60 days
- You'll need to implement token refresh
- Facebook tokens can be long-lived

---

## 🆘 Troubleshooting

### "Invalid Redirect URI" Error
- Check that redirect URIs match exactly in both:
  - Facebook App Settings
  - Your `.env.local` file
- Ensure no typos or extra spaces

### "App Not Approved" Error
- Your app is in Development Mode
- Add test users in Roles → Roles
- Test users must accept invitation

### "Invalid Client ID" Error
- Double-check App ID is copied correctly
- No extra spaces before/after
- Ensure you're using the right App ID

### "Invalid Client Secret" Error
- Double-check App Secret is copied correctly
- Regenerate if needed (Settings → Basic → App Secret → Reset)

---

## ✅ Checklist

- [ ] Facebook Developer account created
- [ ] Facebook App created (Business type)
- [ ] Instagram Basic Display product added
- [ ] Facebook Login product added
- [ ] App domains configured
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] Instagram redirect URIs added
- [ ] Facebook redirect URIs added
- [ ] App ID copied
- [ ] App Secret copied
- [ ] Credentials added to `.env.local`
- [ ] Test users added
- [ ] OAuth flow tested

---

**You're all set!** Your Meta platforms (Instagram and Facebook) OAuth is now configured. 🎉

