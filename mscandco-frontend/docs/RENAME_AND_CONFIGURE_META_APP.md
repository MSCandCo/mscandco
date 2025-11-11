# 🔄 Rename Audiostems App & Configure for OAuth - Step-by-Step Guide

## ⚠️ IMPORTANT: App Type Issue

Your current app "Audiostems" is set as **"Consumer"** type, but for Instagram API access, you need a **"Business"** type app.

**You have two options:**

### Option 1: Create New Business App (Recommended)
- Create a new app with "Business" type
- Use it for Instagram/Facebook OAuth
- Keep Audiostems for other purposes

### Option 2: Use Existing App (Limited)
- Rename Audiostems
- Configure Facebook OAuth (works with Consumer)
- Instagram API may not work fully (requires Business)

**I'll guide you through Option 1 (recommended) and also show you how to rename Audiostems if you want to keep it.**

---

## 📋 PART 1: Rename Your Existing Audiostems App

### Step 1.1: Change Display Name
1. You're already on the **Basic Settings** page (I can see it in your screenshot)
2. Find the **"Display name"** field (currently shows "MSC & Co Platform")
3. Click in the field
4. Change it to: `Audiostems` (or whatever you want)
5. Scroll down and click **"Save changes"** button (bottom right)

**✅ App renamed!**

---

## 📋 PART 2: Create NEW Business App for OAuth

Since you need Instagram API access, let's create a proper Business app.

### Step 2.1: Create New App
1. Look at the top navigation bar
2. Click **"My Apps"** dropdown (top right)
3. Click **"Create App"**

### Step 2.2: Choose App Type
1. You'll see app type options
2. **CRITICAL:** Select **"Business"** (NOT Consumer)
   - Look for "Business" or "Manage Business Integrations"
   - This is required for Instagram API
3. Click **"Next"**

### Step 2.3: Fill in App Details
1. **App Display Name:**
   - Enter: `MSC & Co Platform` (or `MSC & Co OAuth`)

2. **App Contact Email:**
   - Enter: `henrytaylors@hotmail.com` (or your preferred email)

3. **Business Account (Optional):**
   - Skip for now or select if you have one

4. Click **"Create App"**

### Step 2.4: Complete Security Check
1. Facebook may ask for verification
2. Enter code sent to your email/phone
3. Click **"Submit"**

**✅ New Business app created!**

---

## 📋 PART 3: Configure Your NEW Business App

### Step 3.1: Go to Basic Settings
1. You should be on the new app's dashboard
2. Click **"Settings"** → **"Basic"** in left sidebar

### Step 3.2: Fill in Required Information
1. **App Domains:**
   - Click in the field
   - Enter: `audiostems.co.uk` (or your actual domain)
   - Also add: `dev.audiostems.co.uk` if you use that

2. **Privacy Policy URL:**
   - Enter: `https://dev.audiostems.co.uk/privacy`
   - (Or create this page if it doesn't exist)

3. **Terms of Service URL:**
   - Click in the field
   - Enter: `https://dev.audiostems.co.uk/terms`
   - (Or create this page if it doesn't exist)

4. **User Data Deletion:**
   - Keep the dropdown as "Data deletion instructions URL"
   - Enter: `https://dev.audiostems.co.uk/delete-data`
   - (Or create this page if it doesn't exist)

5. Scroll down and click **"Save changes"**

### Step 3.3: Add Platform (Web)
1. Still in Settings → Basic
2. Scroll to **"Platform"** section
3. Click **"Add Platform"** button
4. Select **"Website"**
5. In **"Site URL"** field, enter: `https://dev.audiostems.co.uk`
6. Click **"Save changes"**

---

## 📋 PART 4: Add Instagram Product

### Step 4.1: Add Instagram Basic Display
1. Look at left sidebar
2. Click **"Products"** → **"Add a Product"** (or find in products list)
3. Find **"Instagram Basic Display"**
4. Click **"Set Up"** button

### Step 4.2: Configure Instagram Redirect URIs
1. Go to **"Products"** → **"Instagram"** → **"Basic Display"**
2. Find **"Valid OAuth Redirect URIs"** section
3. Click **"Add URI"** button
4. Add these URIs one by one:

   **For Production:**
   ```
   https://dev.audiostems.co.uk/api/features/social/oauth/callback?platform=instagram
   ```

   **For Development:**
   ```
   http://localhost:3000/api/features/social/oauth/callback?platform=instagram
   ```

5. After adding each URI, click **"Save Changes"** (if there's a save button)

### Step 4.3: Add Deauthorize Callback (Optional)
1. Find **"Deauthorize Callback URL"** field
2. Enter: `https://dev.audiostems.co.uk/api/features/social/oauth/deauthorize?platform=instagram`
3. Click **"Save Changes"**

---

## 📋 PART 5: Add Facebook Login Product

### Step 5.1: Add Facebook Login
1. Go to **"Products"** → **"Add a Product"**
2. Find **"Facebook Login"**
3. Click **"Set Up"** button
4. Select **"Web"** as platform
5. Click **"Continue"**

### Step 5.2: Configure Facebook Redirect URIs
1. Go to **"Products"** → **"Facebook Login"** → **"Settings"**
2. Find **"Valid OAuth Redirect URIs"** section
3. Click **"Add URI"** and add:

   **For Production:**
   ```
   https://dev.audiostems.co.uk/api/features/social/oauth/callback?platform=facebook
   ```

   **For Development:**
   ```
   http://localhost:3000/api/features/social/oauth/callback?platform=facebook
   ```

4. Click **"Save Changes"**

---

## 📋 PART 6: Get Your Credentials

### Step 6.1: Go to Basic Settings
1. Click **"Settings"** → **"Basic"** in left sidebar

### Step 6.2: Copy App ID
1. Find **"App ID"** field
2. You'll see a number like `1361615407905839`
3. Click the **"Copy"** button next to it (or select and copy manually)
4. **Save this** - This is your `INSTAGRAM_CLIENT_ID` and `FACEBOOK_APP_ID`

### Step 6.3: Copy App Secret
1. Scroll to **"App Secret"** field
2. Click **"Show"** button
3. Facebook will ask for your password
4. Enter your Facebook password
5. Click **"Confirm"**
6. The secret will be visible
7. Click **"Copy"** button (or select and copy manually)
8. **Save this** - This is your `INSTAGRAM_CLIENT_SECRET` and `FACEBOOK_APP_SECRET`

**⚠️ Keep these credentials secure!**

---

## 📋 PART 7: Add Credentials to Your Project

### Step 7.1: Open .env.local File
1. Navigate to: `mscandco-frontend` folder
2. Open `.env.local` file in a text editor
3. If it doesn't exist, create it

### Step 7.2: Add Instagram Credentials
Add these lines:

```bash
# Instagram OAuth (via Facebook - Business App)
INSTAGRAM_CLIENT_ID=paste_your_app_id_here
INSTAGRAM_CLIENT_SECRET=paste_your_app_secret_here
```

Replace `paste_your_app_id_here` with the App ID you copied
Replace `paste_your_app_secret_here` with the App Secret you copied

### Step 7.3: Add Facebook Credentials
Add these lines:

```bash
# Facebook OAuth (same Business App)
FACEBOOK_APP_ID=paste_your_app_id_here
FACEBOOK_APP_SECRET=paste_your_app_secret_here
```

**Note:** Use the SAME App ID and App Secret as Instagram (same app)

### Step 7.4: Add Base URL
Make sure you have:

```bash
# Base URL for OAuth callbacks
NEXT_PUBLIC_URL=https://dev.audiostems.co.uk
```

For local development, you can also add:
```bash
NEXT_PUBLIC_URL=http://localhost:3000
```

### Step 7.5: Save the File
1. Save `.env.local`
2. Make sure it's in `.gitignore` (should be already)

---

## 📋 PART 8: Add Test Users

### Step 8.1: Go to Roles
1. In your NEW Business app dashboard
2. Click **"Roles"** in left sidebar
3. Click **"Roles"** submenu

### Step 8.2: Add Instagram Test Users
1. Scroll to **"Instagram Testers"** section
2. Click **"Add Instagram Testers"** button
3. Enter Instagram usernames you want to test with
4. Click **"Submit"**
5. Those users need to accept invitation on Instagram

### Step 8.3: Add Facebook Test Users
1. Scroll to **"Test Users"** section
2. Click **"Add Test Users"** button
3. Facebook creates test users automatically
4. You can use these for testing

---

## 📋 PART 9: Verify Your Setup

### Step 9.1: Check Your .env.local File
It should look like this:

```bash
# Instagram OAuth (via Facebook - Business App)
INSTAGRAM_CLIENT_ID=1361615407905839
INSTAGRAM_CLIENT_SECRET=your_secret_here

# Facebook OAuth (same Business App)
FACEBOOK_APP_ID=1361615407905839
FACEBOOK_APP_SECRET=your_secret_here

# Base URL
NEXT_PUBLIC_URL=https://dev.audiostems.co.uk
```

### Step 9.2: Restart Development Server
1. Stop your dev server (Ctrl+C or Cmd+C)
2. Start it again:
   ```bash
   cd mscandco-frontend
   npm run dev
   ```

### Step 9.3: Test OAuth Flow
1. Navigate to your app's social media settings
2. Click "Connect Instagram" or "Connect Facebook"
3. You should be redirected to Facebook/Instagram login
4. After logging in, redirected back to your app

---

## ✅ Complete Checklist

### For Your NEW Business App:
- [ ] Business app created (not Consumer)
- [ ] Display name set to "MSC & Co Platform"
- [ ] App domains configured (`audiostems.co.uk`, `dev.audiostems.co.uk`)
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] Data Deletion URL added
- [ ] Website platform added
- [ ] Instagram Basic Display product added
- [ ] Instagram redirect URIs configured
- [ ] Facebook Login product added
- [ ] Facebook redirect URIs configured
- [ ] App ID copied
- [ ] App Secret copied
- [ ] Credentials added to `.env.local`
- [ ] Test users added
- [ ] OAuth flow tested

### For Your Existing Audiostems App:
- [ ] Display name changed (if you wanted to rename it)
- [ ] App kept for other purposes (if needed)

---

## 🆘 Troubleshooting

### "Invalid Redirect URI" Error
- Check redirect URIs match exactly in:
  - Facebook App Settings
  - Your `.env.local` file
- Ensure `https://` vs `http://` matches
- No trailing slashes
- Include full path with query parameters

### "App Not Approved" Error
- Your app is in Development Mode
- Add test users in Roles → Roles
- Test users must accept invitation

### "Instagram API Not Available"
- Make sure app type is **"Business"** (not Consumer)
- Consumer apps can't use Instagram API
- Create a new Business app if needed

---

## 📝 Summary

**What You Did:**
1. ✅ Renamed existing Audiostems app (optional)
2. ✅ Created NEW Business app for OAuth
3. ✅ Configured Instagram Basic Display
4. ✅ Configured Facebook Login
5. ✅ Added redirect URIs
6. ✅ Got credentials
7. ✅ Added to `.env.local`

**Your Apps:**
- **Audiostems** (Consumer) - Keep for other purposes
- **MSC & Co Platform** (Business) - Use for Instagram/Facebook OAuth

**Next Steps:**
- Test OAuth flow
- Add more test users if needed
- Submit for App Review when ready for production

---

**You're all set!** Your Meta platforms OAuth is configured with a proper Business app. 🎉

